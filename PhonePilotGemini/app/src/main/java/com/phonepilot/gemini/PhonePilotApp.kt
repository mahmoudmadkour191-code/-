package com.phonepilot.gemini

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.phonepilot.gemini.agent.AgentRuntime

class PhonePilotApp : Application() {
    override fun onCreate() {
        super.onCreate()
        AgentRuntime.appContext = applicationContext
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getSystemService(NotificationManager::class.java).createNotificationChannel(
                NotificationChannel("phone_pilot_agent","Phone Pilot Agent",NotificationManager.IMPORTANCE_LOW)
            )
        }
    }
}
