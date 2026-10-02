package com.phonepilot.gemini.control

import android.os.Binder

class PrivilegedUserService : IPrivilegedService.Stub() {
    override fun exec(command: String): String {
        return runCatching {
            val p = Runtime.getRuntime().exec(arrayOf("sh","-c",command))
            val out = p.inputStream.bufferedReader().readText()
            val err = p.errorStream.bufferedReader().readText()
            p.waitFor()
            if (err.isBlank()) out else (out + "\n" + err).trim()
        }.getOrDefault("")
    }

    override fun uid(): Int = Binder.getCallingUid()

    override fun destroy() { System.exit(0) }
}
