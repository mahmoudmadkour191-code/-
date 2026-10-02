package com.phonepilot.gemini.overlay

import android.app.Notification
import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.provider.Settings
import android.view.Gravity
import android.view.WindowManager
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.NotificationCompat
import com.phonepilot.gemini.R
import com.phonepilot.gemini.agent.AgentController
import com.phonepilot.gemini.agent.AgentRuntime
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class OverlayService : Service() {
    companion object {
        @Volatile var instance: OverlayService? = null
        fun showConfirmation(reason: String) { instance?.requestConfirmation(reason) }
    }

    private lateinit var windowManager: WindowManager
    private lateinit var view: ComposeView
    private lateinit var params: WindowManager.LayoutParams
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    private var expanded by mutableStateOf(true)
    private var input by mutableStateOf("")
    private var status by mutableStateOf("جاهز")
    private var confirmationReason by mutableStateOf<String?>(null)
    private var latestMessage by mutableStateOf("")

    override fun onCreate() {
        super.onCreate()
        instance = this
        if (Build.VERSION.SDK_INT >= 26) startForeground(42, notification())
        createOverlay()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        expanded = true
        return START_STICKY
    }

    override fun onDestroy() {
        scope.coroutineContext[kotlinx.coroutines.Job]?.cancel()
        runCatching { windowManager.removeView(view) }
        instance = null
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun notification(): Notification =
        NotificationCompat.Builder(this, "phone_pilot_agent")
            .setSmallIcon(R.drawable.ic_phone_pilot)
            .setContentTitle("Phone Pilot")
            .setContentText("المساعد العائم جاهز")
            .setOngoing(true)
            .setSilent(true)
            .build()

    private fun createOverlay() {
        if (!Settings.canDrawOverlays(this)) {
            Toast.makeText(this, "فعّل الظهور فوق التطبيقات أولاً", Toast.LENGTH_LONG).show()
            stopSelf()
            return
        }
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        val width = (352 * resources.displayMetrics.density).toInt()
        params = WindowManager.LayoutParams(
            width,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= 26) WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.END
            y = (82 * resources.displayMetrics.density).toInt()
            x = (12 * resources.displayMetrics.density).toInt()
            softInputMode = WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE
        }

        view = ComposeView(this).apply {
            setContent {
                MaterialTheme(
                    colorScheme = MaterialTheme.colorScheme.copy(
                        primary = Color(0xFF2F8CFF),
                        background = Color(0xFF061321),
                        surface = Color(0xFF0B1D30)
                    )
                ) { Panel() }
            }
        }
        windowManager.addView(view, params)
    }

    @androidx.compose.runtime.Composable
    private fun Panel() {
        Surface(
            modifier = Modifier.width(352.dp),
            shape = RoundedCornerShape(22.dp),
            color = Color(0xF20B1D30),
            shadowElevation = 22.dp
        ) {
            if (!expanded) {
                IconButton(onClick = { expanded = true }, modifier = Modifier.size(58.dp).padding(7.dp)) {
                    Icon(Icons.Default.SmartToy, "Phone Pilot", tint = Color(0xFF54B5FF))
                }
            } else {
                Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.SmartToy, null, tint = Color(0xFF54B5FF))
                            Text("  Phone Pilot", color = Color.White, fontSize = 17.sp)
                        }
                        IconButton(onClick = { expanded = false }) {
                            Icon(Icons.Default.Close, "تصغير", tint = Color(0xFF9FB1C8))
                        }
                    }

                    Text(
                        latestMessage.ifBlank { status },
                        color = Color(0xFFD9E7FA),
                        fontSize = 13.sp
                    )

                    confirmationReason?.let { reason ->
                        Surface(shape = RoundedCornerShape(14.dp), color = Color(0xFF241A08)) {
                            Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) {
                                Text("تأكيد مطلوب", color = Color(0xFFFFD166))
                                Text(reason, color = Color.White, fontSize = 13.sp)
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Button(
                                        onClick = {
                                            confirmationReason = null
                                            AgentRuntime.confirmation?.complete(false)
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF243044))
                                    ) { Text("إلغاء") }
                                    Button(
                                        onClick = {
                                            confirmationReason = null
                                            AgentRuntime.confirmation?.complete(true)
                                        }
                                    ) { Text("تأكيد") }
                                }
                            }
                        }
                    } ?: run {
                        Row(
                            Modifier.fillMaxWidth()
                                .background(Color(0x661A3049), RoundedCornerShape(16.dp))
                                .padding(horizontal = 10.dp, vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            BasicTextField(
                                value = input,
                                onValueChange = { input = it },
                                modifier = Modifier.weight(1f),
                                textStyle = TextStyle(color = Color.White, fontSize = 14.sp),
                                decorationBox = { inner ->
                                    if (input.isBlank()) Text("اكتب أمرك هنا…", color = Color(0xFF7890AA))
                                    inner()
                                }
                            )
                            Icon(Icons.Default.Mic, "صوت", tint = Color(0xFF9FB1C8), modifier = Modifier.padding(6.dp))
                            IconButton(onClick = ::sendInput) {
                                Icon(Icons.Default.Send, "إرسال", tint = Color(0xFF54B5FF))
                            }
                        }
                    }
                }
            }
        }
    }

    private fun sendInput() {
        val command = input.trim()
        if (command.isBlank()) return
        input = ""
        latestMessage = "جاري التنفيذ…"
        val model = getSharedPreferences("settings", MODE_PRIVATE)
            .getString("model", "gemini-3.8-flash") ?: "gemini-3.8-flash"
        scope.launch {
            AgentController(
                this@OverlayService,
                onStatus = { status = it },
                onMessage = { latestMessage = it }
            ).run(command, model)
        }
    }

    private fun requestConfirmation(reason: String) {
        confirmationReason = reason.ifBlank { "Gemini طلب موافقتك قبل تنفيذ هذا الإجراء." }
        expanded = true
    }
}
