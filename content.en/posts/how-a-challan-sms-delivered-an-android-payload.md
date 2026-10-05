+++
author = "Parth Mudgal"
title = "How a challan SMS delivered an Android payload"
date = "2026-10-05"
draft = false
description = "Tracing an RTO challan SMS through an APK loader, a payload, payment forms, and infrastructure records"
tags = [
    "android",
    "malware analysis",
    "reverse engineering",
    "smishing"
]
+++

# Introduction

I received a message that claimed to come from the transport ministry:

> Airtel Warning: SPAM | RTO Notice: Your vehicle has an Over Speeding challan BH3969314321 issued on 04-10-2026. Check & Download now: https://echallangovtok.live/app . MoRTH

The sender shown on my phone was `+91 9108627963`. The message supplied a challan number, a date, and a link. I downloaded the response from `/app` with `wget`. It was an Android APK.

I followed the files in that APK. The app downloaded a file from a server, decrypted it into another APK, and asked Android to install it. The second app displayed a challan flow, asked for card data and a UPI PIN, and sent those values to Firebase. It also contained code for reading SMS and receiving commands.

This post follows the bytes, manifests, DEX instructions, and HTML assets. I used file inspection and decryption. The behavior of a phone after installation calls for device evidence.

Here is the path through the sample:

{{< mermaid >}}
flowchart LR
    A[SMS] --> B[Loader APK]
    B --> C[base.enc]
    C --> D[Payload APK]
    D --> E[Forms]
    E --> F[Firebase]
    D --> G[SMS code]
    D --> H[Telegram]
{{< /mermaid >}}

# The APK behind the link

The `/app` response has the package name `com.google.android.gmscore` and the app label `NxtGen mParivahan`. Those names borrow from Google services and India's vehicle portal. The APK has SHA-256 `eaf4d1df42537ff33078508d84c3b60ef6a8dee5f1d56504e35d220e28d30cec`.

The app contacts `http://31.56.19.30/277015/verification.php`. I inspected the response during collection and found two fields:

```text
download_url = http://31.56.19.30/277015/enc/base.enc
package_name = com.veltrix.documents
```

The first field tells the loader where to fetch its payload. The second tells it which package name to expect after decryption. This gives the server control over the file the loader will request. The SMS link uses HTTPS; these two requests use HTTP.

`base.enc` starts with 16 bytes of salt and 16 bytes of IV. The loader derives an AES key with `PBKDF2WithHmacSHA256`, 100,000 iterations, and a password embedded in its code: `e4515e1bfca2093f41116f4e0526d48e`. It decrypts the remainder with `AES/CBC/PKCS5Padding`. I applied that sequence to the downloaded file and obtained an APK with package name `com.veltrix.documents` and SHA-256 `4bcb211d67fee3cefbbc409efbf1403fbd820a0f615002f25a07fd573185ef41`.

Both APKs carry a signer certificate with SHA-256 `465983f7791f2abeb43ea2cbdc7f21a8260b72bc08a55c839fc1a43bc741a81e`. The match links the loader and payload as signed artifacts.

## How Android handles the second install

The loader opens the Android setting for `MANAGE_UNKNOWN_APP_SOURCES`, creates a `PackageInstaller` session, writes the payload APK, and commits the session. Its `InstallReceiver` handles `STATUS_PENDING_USER_ACTION` by opening the intent supplied by Android. That status leads to an install prompt. [Android documents this session flow](https://developer.android.com/reference/android/content/pm/PackageInstaller.Session).

The payload has its own package name and UID. It requests its own permissions after launch. An install grant for the loader leaves the payload to request SMS and phone access through Android's permission flow. [Android's permission guide](https://developer.android.com/training/permissions/requesting) describes that grant process.

The loader also calls `VpnService.prepare`, which asks for VPN consent. Its VPN code adds a route for `0.0.0.0/0`, reads packets from the VPN interface, and leaves its writer thread sleeping. For packets routed through that interface, the implementation acts as a sink. The service names `android-safebrowsing.google.com`, `sb.l.google.com`, and `play.googleapis.com`. I read this as an attempt to interfere with checks, subject to VPN consent and device behavior. [Android's VPN API](https://developer.android.com/reference/android/net/VpnService) places that consent with the user.

# The app after decryption

The payload presents itself as `NxtGen mParivahan`. Its code opens `file:///android_asset/index.html` in a WebView, enables JavaScript, and exposes a Java object named `Android` to the page. The screens sit in the APK as `.enc` assets. The app decodes Base64 and decrypts them with AES-ECB and the key `k9Xm3Lr7Pq2Wn8Tz` from its code.

After decryption, the assets contain pages for vehicle entry, payment choice, card entry, UPI PIN entry, processing, and completion. The entry page asks for a phone number, registration number, and captcha. It claims a ₹1 fee for record verification and a refund.

The payment paths explain the purpose of that claim. On the UPI path, each PIN submission calls:

```js
Android.submitPin(pin, attempt)
```

The processing page then reports a PIN failure, asks for the PIN again, reports a UPI service problem, and sends the user to the card form. On the card path, the first submission produces a failure message. The retry calls:

```js
Android.submitCard(num, name, exp, cvv, cardType)
```

The card path then sends the user through the UPI PIN form. Both routes reach a completion screen after the forms have collected card data and PIN entries. The Java bridge writes fields such as `card_number`, `card_cvv`, `upipin`, and `upipin_<attempt>` under `clients/<deviceId>` in Firebase Realtime Database:

```text
https://sixthaugust26-default-rtdb.asia-southeast1.firebasedatabase.app
```

The completion page draws a name, vehicle type, challan number, violation, place, and date from JavaScript arrays and `Math.random()`. After eight seconds it redirects the WebView to `https://echallan.parivahan.gov.in/`. The page acts as the end of the collection path; the values on it come from the bundled script.

## SMS access and commands

The payload manifest requests `READ_SMS`, `RECEIVE_SMS`, `SEND_SMS`, `CALL_PHONE`, `READ_PHONE_STATE`, and `READ_PHONE_NUMBERS`. The entry activity asks for SMS and phone grants on launch.

With those grants, `SmsReceiver` can read an arriving SMS, join its parts, and write the sender, body, and time under `messages/<deviceId>/<timestamp>` in Firebase. Another path queries `content://sms/` for up to 1,000 messages. The code also contains a forwarding setting that sends arriving SMS text to a number through `SmsManager`.

The service reads commands from Firebase. One command path, `webhookEvent/sendSms`, takes a SIM index, destination, and message and calls `SmsManager.sendTextMessage`. A `callForward` path forms a dial code such as `**21*<number>#` and starts an `ACTION_CALL` intent. That action depends on permissions and the carrier. Boot, alarm, job, foreground service, and watchdog paths try to restore the service after interruptions.

# Where the infrastructure points

I looked up the domain, the IP in the loader, and the certificate records. Each record answers a different question.

The [.live registry record](https://rdap.identitydigital.services/rdap/domain/echallangovtok.live) gives a creation time of **4 October 2026, 16:50 UTC** for `echallangovtok.live`. The SMS prints 4 October as the challan date. The record names Tucows as registrar. [Tucows' RDAP response](https://opensrs.rdap.tucows.com/domain/echallangovtok.live) redacts the registrant's name, organization, phone, and street. It lists `NY` and `US` in address fields and gives [a contact route](https://tieredaccess.com/contact/32b3766b-8871-4854-8069-26394e639bf5). The domain uses `ns1.systemdns.com`, `ns2.systemdns.com`, and `ns3.systemdns.com` for DNS.

A [DNS lookup](https://dns.google/resolve?name=echallangovtok.live&type=A) on 5 October returned `13.248.148.104` and `76.223.20.46`. [ARIN's record for the first address](https://rdap.arin.net/registry/ip/13.248.148.104) and [its record for the second](https://rdap.arin.net/registry/ip/76.223.20.46) place them in Amazon address ranges. A DNS answer from the time of receipt would connect the SMS visit to an address at that time.

The loader's configuration and payload URL point to `31.56.19.30`. [RIPE's record](https://rdap.db.ripe.net/ip/31.56.19.30) places it in `31.56.19.0/24`, names the range `BLATANT-NET`, and associates it with Blatant Technologies, LLC. [RIPE routing data](https://stat.ripe.net/data/prefix-overview/data.json?resource=31.56.19.0%2F24) lists AS403005, `BLATANTHOST`. Gold IP L.L.C-FZ appears as the address administrator, and `abuse@blatant.host` appears as the abuse contact. The RIPE country field contains `SC`, Seychelles; it describes the address allocation. Server location calls for hosting records or network measurements.

I also searched [Certificate Transparency records for the domain](https://api.certspotter.com/v1/issuances?domain=echallangovtok.live&include_subdomains=true&expand=dns_names&expand=issuer). The issuances I found list `echallangovtok.live` and `www.echallangovtok.live`. They share SPKI SHA-256 `a49e1f32dc76b0fb9522eb4557b80ce522eab8e`. A search for that key fingerprint could connect certificates that reuse the key. DNS and scan data can supply hosts absent from certificate name lists.

Two scan records associate [`mparivahan-gov.ddns.net`](https://gridinsoft.com/online-virus-scanner/url/mparivahan_gov-ddns-net) and [`mparivahan.hopto.org`](https://gridinsoft.com/online-virus-scanner/url/mparivahan-hopto-org) with `31.56.19.30`. [Certificate records for the first name](https://api.certspotter.com/v1/issuances?domain=mparivahan-gov.ddns.net&expand=dns_names&expand=issuer) and [the second](https://api.certspotter.com/v1/issuances?domain=mparivahan.hopto.org&expand=dns_names&expand=issuer) place them in September 2026. Those names form search leads. A host can serve clients with different accounts, so the account link needs host records.

# Following the sender and the bot

The number `+91 9108627963` came from the sender field on my phone. A search for the number in several formats yielded unrelated pages. The message, sender field, receipt time, and phone record give the carrier a path to trace the originating SIM or SMS gateway. The [Chakshu reporting guidance](https://sancharsaathi.gov.in/SancharSaathiDocuments/ImportantDocuments/DoT%20combats%20Cyber-frauds%3A%20Central%20system%20to%20stop%20spoofed%20calls%20to%20be%20commissioned%20shortly.pdf) asks for a screenshot and the time of receipt. The [I4C Report Suspect portal](https://cybercrime.gov.in/webform/cyber_suspect.aspx) accepts phone numbers, SMS headers, and URLs.

The payload contains a JSON entry at `META-INF////.` with a Telegram bot token and chat ID `5196490744`. The bot ID is `6751695148`. I compared the token from the APK with the token in [Cyble's October 2025 GhostBat analysis](https://cyble.com/blog/ghostbat-rat-inside-the-resurgence-of-rto-themed-android-malware/). They match. Cyble names the bot `GhostBatRat_bot` and describes its use in RTO malware from that period.

The token appears in Cyble's report, which gives other builders access to it. The match ties this APK to a bot credential; Telegram records would tie use of that credential to an account or person. I use the token's SHA-256, `68bde4c20b7e17a845015fe338fb5cb54ebe04ff87f772c44139e31047dfbd6f`, as a comparison value in this post. [Telegram describes bot tokens as credentials](https://core.telegram.org/bots/tutorial).

The same approach applies to the other services. Investigators can request the domain purchase and payment records from Tucows, the customer and access logs for `31.56.19.30` from the host, and the account records for Firebase project `sixthaugust26` from Google. The APK names Firebase application ID `1:752011164814:android:435839af48e5f17458dddf`. The sender, host customer, Firebase account holder, and bot controller may represent people with different roles.

# What the files establish

The loader fetched configuration, downloaded ciphertext, decrypted an APK, and entered Android's install flow. The payload's WebView collected card fields and UPI PIN entries and wrote them to a Firebase path. Its manifest and code requested SMS and phone access and supplied paths for SMS capture, SMS sending, and call forwarding. The two APKs share a signer.

I reached those findings through file inspection. The APK archives use ZIP entries that imitate manifest and DEX paths, and the payload includes DEX data that caused JADX and baksmali errors. `dexdump` exposed the instructions behind the flows above. The WebView assets supplied the form behavior. Permission grants, network delivery, call forwarding, and outcomes on a phone require device or provider records.

For anyone who installed these packages, the investigation also becomes a response task: remove the packages and VPN profile, contact the card issuer after card entry, reset a UPI PIN after PIN entry, and review SMS, carrier charges, and account recovery activity. India's [cybercrime portal](https://cybercrime.gov.in/) and helpline `1930` accept reports of fraud.

## Indicators

| Item | Value |
|---|---|
| SMS link | `https://echallangovtok.live/app` |
| Sender shown on my phone | `+91 9108627963` |
| Loader package | `com.google.android.gmscore` |
| Loader SHA-256 | `eaf4d1df42537ff33078508d84c3b60ef6a8dee5f1d56504e35d220e28d30cec` |
| Configuration URL | `http://31.56.19.30/277015/verification.php` |
| Payload URL | `http://31.56.19.30/277015/enc/base.enc` |
| Payload package | `com.veltrix.documents` |
| Payload SHA-256 | `4bcb211d67fee3cefbbc409efbf1403fbd820a0f615002f25a07fd573185ef41` |
| Signer certificate SHA-256 | `465983f7791f2abeb43ea2cbdc7f21a8260b72bc08a55c839fc1a43bc741a81e` |
| Firebase database | `sixthaugust26-default-rtdb.asia-southeast1.firebasedatabase.app` |
| Firebase application ID | `1:752011164814:android:435839af48e5f17458dddf` |
| Telegram bot ID | `6751695148` |
| Telegram chat ID | `5196490744` |
| Telegram token SHA-256 | `68bde4c20b7e17a845015fe338fb5cb54ebe04ff87f772c44139e31047dfbd6f` |
