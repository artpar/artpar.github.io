+++
author = "Parth Mudgal"
title = "Killing a process started by IntelliJ Using Unlogged SDK"
date = "2023-11-07"
draft = false
description = "How Lombok works"
tags = [
    "bash",
    "kill",
    "awk",
    "xargs"
]
+++

``` bash
ps aux | grep java | grep unlogged-sdk- | grep -v grep | awk '{print $2}' | xargs kill -9
```

This is a command that can be used to identify and terminate Java processes that are using the UnLogged SDK library in
Linux. Here's an explanation of each part of the command:

- `ps aux`: lists all currently running processes on the system, along with their process ID (PID), user
ID, CPU usage, memory usage, and other relevant information.
- `grep java`: filters the output to only show processes that are running Java applications.
- `grep unlogged-sdk-`: filters the output to only show processes that are using the UnLogged SDK
library specifically.
- `grep -v grep`: removes any lines from the output that contain the word "grep" itself (which is used in
several of the commands in this sequence).
- `awk '{print $2}'`: extract the second column from each line of output, which contains the PID of each
process.
- `xargs kill -9`: use the output of the previous command (which is a list of PIDs) to terminate those
processes using signal 9 (also known as SIGKILL).

It's worth noting that this command should only be used if you are certain that you want to terminate all processes
that are using the Unlogged SDK library, and that there are no other processes running on your system that may rely on
those libraries. Terminating a process using signal 9 can cause data loss or other unexpected behavior, so use this
command with caution.
