package com.phonepilot.gemini

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.text.method.PasswordTransformationMethod
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var apiKey: EditText
    private lateinit var command: EditText
    private lateinit var logView: TextView
    private lateinit var accessStatus: TextView
    private lateinit var run: Button
    private lateinit var stop: Button
    private lateinit var engine: AgentEngine

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        apiKey = findViewById(R.id.apiKey)
        command = findViewById(R.id.command)
        logView = findViewById(R.id.log)
        accessStatus = findViewById(R.id.accessStatus)
        run = findViewById(R.id.runAgent)
        stop = findViewById(R.id.stopAgent)

        apiKey.transformationMethod = PasswordTransformationMethod.getInstance()
        val prefs = getSharedPreferences("private", Context.MODE_PRIVATE)
        apiKey.setText(prefs.getString("gemini_key", ""))

        engine = AgentEngine({ msg ->
            logView.append(msg + "\n")
        }, { run.isEnabled = true })

        findViewById<Button>(R.id.openAccessibility).setOnClickListener {
            startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
        }

        run.setOnClickListener {
            val key = apiKey.text.toString().trim()
            val goal = command.text.toString().trim()
            if (key.isBlank() || goal.isBlank()) {
                logView.append("اكتب الـAPI key والأمر الأول.\n")
                return@setOnClickListener
            }
            prefs.edit().putString("gemini_key", key).apply()
            logView.text = "Starting agent...\n"
            run.isEnabled = false
            engine.start(key, goal)
        }

        stop.setOnClickListener {
            engine.stop()
            run.isEnabled = true
        }
    }

    override fun onResume() {
        super.onResume()
        accessStatus.text =
            if (isAccessibilityEnabled()) "Accessibility: ON ✓" else "Accessibility: OFF"
    }

    private fun isAccessibilityEnabled(): Boolean {
        val expected =
            ComponentName(this, PhonePilotAccessibilityService::class.java).flattenToString()
        val enabled =
            Settings.Secure.getString(contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES)
                ?: return false
        return enabled.split(':').any { it.equals(expected, ignoreCase = true) }
    }

    override fun onDestroy() {
        engine.shutdown()
        super.onDestroy()
    }
}
