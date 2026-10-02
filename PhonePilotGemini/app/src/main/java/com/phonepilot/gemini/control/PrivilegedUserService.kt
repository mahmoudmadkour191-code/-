package com.phonepilot.gemini.control

import android.os.Binder
import android.os.RemoteException
import com.phonepilot.gemini.control.IPrivilegedService
import rikka.shizuku.Shizuku

class PrivilegedUserService : IPrivilegedService.Stub() {
    override fun exec(command: String): String {
        return runCatching {
            val process = Runtime.getRuntime().exec(arrayOf("sh", "-c", command))
            val stdout = process.inputStream.bufferedReader().readText()
            val stderr = process.errorStream.bufferedReader().readText()
            process.waitFor()
            if (stderr.isBlank()) stdout else stdout + "\n" + stderr
        }.getOrDefault("")
    }

    override fun uid(): Int = Binder.getCallingUid()

    override fun destroy() {
        System.exit(0)
    }
}
