package com.phonepilot.gemini.control;

interface IPrivilegedService {
    String exec(String command);
    int uid();
    void destroy();
}
