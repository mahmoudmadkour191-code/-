package com.phonepilot.gemini.control

import android.content.ComponentName
import android.content.Context
import android.content.pm.PackageManager
import android.os.IBinder
import android.content.ServiceConnection
import rikka.shizuku.Shizuku

class ShizukuController(private val context: Context) {
    companion object { const val PERMISSION_CODE = 4201 }

    @Volatile private var remote: IPrivilegedService? = null

    private val args = Shizuku.UserServiceArgs(
        ComponentName(context, PrivilegedUserService::class.java)
    ).daemon(false).processNameSuffix("privileged").tag("phone_pilot_privileged").version(1)

    private val connection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            remote = IPrivilegedService.Stub.asInterface(service)
        }
        override fun onServiceDisconnected(name: ComponentName?) {
            remote = null
        }
    }

    fun isAvailable(): Boolean = runCatching { Shizuku.pingBinder() }.getOrDefault(false)

    fun isGranted(): Boolean =
        isAvailable() && runCatching {
            Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED
        }.getOrDefault(false)

    fun uid(): Int = runCatching { Shizuku.getUid() }.getOrDefault(-1)

    fun requestPermission() {
        if (isAvailable() && !isGranted()) Shizuku.requestPermission(PERMISSION_CODE)
    }

    fun bind(): Boolean {
        if (!isGranted()) return false
        return runCatching {
            Shizuku.bindUserService(args, connection)
            true
        }.getOrDefault(false)
    }

    fun unbind() {
        runCatching { Shizuku.unbindUserService(args, connection, true) }
        remote = null
    }

    fun exec(command: String): String {
        check(isGranted()) { "Shizuku permission is not granted" }
        if (remote == null) bind()
        return remote?.exec(command) ?: error("Shizuku UserService is not connected")
    }
}
