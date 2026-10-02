package com.phonepilot.gemini

import android.Manifest
import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.filled.Terminal
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.Button
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.phonepilot.gemini.agent.AgentController
import com.phonepilot.gemini.agent.AgentRuntime
import com.phonepilot.gemini.control.PhonePilotAccessibilityService
import com.phonepilot.gemini.control.ShizukuController
import com.phonepilot.gemini.overlay.OverlayService
import com.phonepilot.gemini.storage.SecretStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    private lateinit var secretStore: SecretStore
    private lateinit var shizuku: ShizukuController
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        secretStore = SecretStore(this)
        shizuku = ShizukuController(this)
        if (Build.VERSION.SDK_INT >= 33 &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 900)
        setContent { PhonePilotUi() }
    }

    override fun onDestroy() {
        scope.coroutineContext[kotlinx.coroutines.Job]?.cancel()
        super.onDestroy()
    }

    @OptIn(ExperimentalMaterial3Api::class)
    @Composable
    private fun PhonePilotUi() {
        var tab by remember { mutableStateOf(0) }
        var apiKey by remember { mutableStateOf(secretStore.get()) }
        var model by remember {
            mutableStateOf(getSharedPreferences("settings", MODE_PRIVATE)
                .getString("model", "gemini-3.8-flash") ?: "gemini-3.8-flash")
        }
        var command by remember { mutableStateOf("") }
        var status by remember { mutableStateOf("جاهز") }
        val messages = remember { mutableStateListOf<Pair<Boolean,String>>() }
        val lifecycleOwner = LocalLifecycleOwner.current
        var refresh by remember { mutableStateOf(0) }
        val blue = Color(0xFF2F8CFF)
        val brightBlue = Color(0xFF54B5FF)
        val bg = Color(0xFF061321)
        val muted = Color(0xFF9FB1C8)

        DisposableEffect(lifecycleOwner) {
            val observer = LifecycleEventObserver { _, event ->
                if (event == Lifecycle.Event.ON_RESUME) refresh++
            }
            lifecycleOwner.lifecycle.addObserver(observer)
            onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
        }
        @Suppress("UNUSED_VARIABLE") val ignored = refresh

        MaterialTheme(colorScheme = MaterialTheme.colorScheme.copy(primary = blue, background = bg, surface = Color(0xFF0B1D30))) {
            Scaffold(
                containerColor = bg,
                topBar = {
                    androidx.compose.material3.TopAppBar(
                        title = {
                            Column {
                                Text("Phone Pilot", color = Color.White, fontWeight = FontWeight.Bold)
                                Text("AI Agent • Android Control", color = muted, fontSize = 11.sp)
                            }
                        },
                        navigationIcon = {
                            Icon(Icons.Default.SmartToy, null, tint = brightBlue, modifier = Modifier.padding(start = 12.dp))
                        }
                    )
                },
                bottomBar = {
                    NavigationBar(containerColor = Color(0xFF081A2B)) {
                        listOf(
                            Triple(Icons.Default.Home, "الرئيسية", 0),
                            Triple(Icons.Default.SmartToy, "الشات", 1),
                            Triple(Icons.Default.GridView, "الأدوات", 2),
                            Triple(Icons.Default.Settings, "الإعدادات", 3)
                        ).forEach { item ->
                            NavigationBarItem(
                                selected = tab == item.third,
                                onClick = { tab = item.third },
                                icon = { Icon(item.first, null) },
                                label = { Text(item.second, fontSize = 10.sp) }
                            )
                        }
                    }
                }
            ) { padding ->
                when (tab) {
                    0 -> HomeScreen(
                        Modifier.padding(padding),
                        apiKey.isNotBlank(),
                        accessibilityEnabled(),
                        Settings.canDrawOverlays(this@MainActivity),
                        shizuku.isGranted(),
                        blue, muted,
                        ::openAccessibility, ::openOverlaySettings, ::openShizuku, ::startOverlay
                    )
                    1 -> ChatScreen(
                        Modifier.padding(padding), command, { command = it }, messages, status, blue
                    ) {
                        val text = command.trim()
                        if (text.isNotBlank()) {
                            if (apiKey.isBlank()) {
                                tab = 3
                            } else {
                                messages += true to text
                                command = ""
                                secretStore.save(apiKey)
                                getSharedPreferences("settings", MODE_PRIVATE).edit().putString("model", model).apply()
                                status = "جاري التنفيذ…"
                                scope.launch {
                                    AgentController(
                                        this@MainActivity,
                                        onStatus = { status = it; AgentRuntime.lastStatus = it },
                                        onMessage = { messages += false to it }
                                    ).run(text, model)
                                    status = AgentRuntime.lastStatus
                                }
                            }
                        }
                    }
                    2 -> ToolsScreen(Modifier.padding(padding), blue, muted, shizuku.isGranted(), shizuku.uid())
                    else -> SettingsScreen(
                        Modifier.padding(padding),
                        apiKey, { apiKey = it; secretStore.save(it) },
                        model, { model = it; getSharedPreferences("settings", MODE_PRIVATE).edit().putString("model", it).apply() },
                        blue, muted, shizuku
                    )
                }
            }
        }
    }

    @Composable
    private fun HomeScreen(
        modifier: Modifier,
        apiKeyOk: Boolean,
        accessibilityOk: Boolean,
        overlayOk: Boolean,
        shizukuOk: Boolean,
        blue: Color,
        muted: Color,
        onAccessibility: () -> Unit,
        onOverlay: () -> Unit,
        onShizuku: () -> Unit,
        onStartOverlay: () -> Unit
    ) {
        LazyColumn(modifier.fillMaxSize().padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                Spacer(Modifier.height(8.dp))
                Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF0A2440)), shape = RoundedCornerShape(28.dp)) {
                    Column(Modifier.padding(22.dp), verticalArrangement = Arrangement.spacedBy(11.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.AutoAwesome, null, tint = Color(0xFF65C3FF), modifier = Modifier.size(30.dp))
                            Text("  مساعدك الذكي", color = Color.White, fontSize = 25.sp, fontWeight = FontWeight.Bold)
                        }
                        Text("Gemini Computer Use يشوف شاشة Android وينفذ المهام خطوة بخطوة.", color = muted, fontSize = 14.sp)
                        Button(onClick = onStartOverlay, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(15.dp)) {
                            Icon(Icons.Default.Layers, null)
                            Text("  تشغيل المساعد العائم")
                        }
                    }
                }
            }
            item { Text("حالة النظام", color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.Bold) }
            item { PermissionCard("Gemini API", apiKeyOk, Icons.Default.Key, "مفتاح Gemini محفوظ محليًا", {}) }
            item { PermissionCard("Accessibility", accessibilityOk, Icons.Default.Visibility, "قراءة واجهة التطبيقات والتنفيذ", onAccessibility) }
            item { PermissionCard("الظهور فوق التطبيقات", overlayOk, Icons.Default.Layers, "إظهار Chat عائم فوق التطبيقات", onOverlay) }
            item { PermissionCard("Shizuku", shizukuOk, Icons.Default.Terminal, "صلاحيات ADB/Root عبر UserService", onShizuku) }
            item { Text("أوامر سريعة", color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.Bold) }
            item { ActionCard("افتح تيليجرام", blue) { startOverlay() } }
            item { ActionCard("افتح Chrome وابحث عن آخر أخبار Android", blue) { startOverlay() } }
        }
    }

    @Composable
    private fun ChatScreen(
        modifier: Modifier,
        command: String,
        onCommand: (String) -> Unit,
        messages: List<Pair<Boolean,String>>,
        status: String,
        blue: Color,
        onSend: () -> Unit
    ) {
        Column(modifier.fillMaxSize()) {
            Card(modifier = Modifier.padding(14.dp).fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = Color(0xFF0A2440)), shape = RoundedCornerShape(20.dp)) {
                Row(Modifier.padding(15.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.SmartToy, null, tint = Color(0xFF54B5FF))
                    Column(Modifier.padding(start = 10.dp)) {
                        Text("Phone Pilot Agent", color = Color.White, fontWeight = FontWeight.Bold)
                        Text(status, color = Color(0xFF9FB1C8), fontSize = 12.sp)
                    }
                }
            }
            LazyColumn(
                modifier = Modifier.weight(1f).padding(horizontal = 12.dp),
                verticalArrangement = Arrangement.spacedBy(9.dp)
            ) {
                items(messages) { item ->
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = if (item.first) Arrangement.End else Arrangement.Start) {
                        Surface(
                            modifier = Modifier.fillMaxWidth(0.88f),
                            color = if (item.first) Color(0xFF0E68D5) else Color(0xFF0C2238),
                            shape = RoundedCornerShape(18.dp)
                        ) { Text(item.second, Modifier.padding(14.dp), color = Color.White, fontSize = 14.sp) }
                    }
                }
            }
            Row(Modifier.padding(12.dp).fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(value = command, onValueChange = onCommand, modifier = Modifier.weight(1f), placeholder = { Text("مثال: افتح تيليجرام…") }, singleLine = true, shape = RoundedCornerShape(18.dp))
                IconButton(onClick = onSend) { Icon(Icons.Default.Send, "إرسال", tint = blue, modifier = Modifier.size(30.dp)) }
            }
        }
    }

    @Composable
    private fun ToolsScreen(modifier: Modifier, blue: Color, muted: Color, shizukuOk: Boolean, shizukuUid: Int) {
        LazyColumn(modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            item { Text("مكوّنات التحكم", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold) }
            item { ToolRow("Gemini Computer Use", "mobile environment + screenshot loop + function calls", blue) }
            item { ToolRow("Accessibility", "click / type / long_press / drag_and_drop / back", blue) }
            item { ToolRow("Shizuku UserService", if (shizukuOk) "متصل • UID " + shizukuUid else "غير متصل", if (shizukuOk) Color(0xFF45D483) else muted) }
            item { ToolRow("Overlay Chat", "شات عائم فوق Telegram وChrome أثناء التشغيل", blue) }
            item { ToolRow("Safety Gate", "require_confirmation يوقف التنفيذ حتى تؤكد أنت", Color(0xFFFFD166)) }
        }
    }

    @Composable
    private fun SettingsScreen(
        modifier: Modifier,
        apiKey: String,
        onApiKey: (String) -> Unit,
        model: String,
        onModel: (String) -> Unit,
        blue: Color,
        muted: Color,
        shizuku: ShizukuController
    ) {
        val models = listOf("gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3-flash-preview")
        LazyColumn(modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                Text("Gemini", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                OutlinedTextField(value = apiKey, onValueChange = onApiKey, modifier = Modifier.fillMaxWidth().padding(top = 8.dp), label = { Text("Gemini API Key") }, visualTransformation = PasswordVisualTransformation(), singleLine = true)
            }
            item { Text("الموديل", color = Color.White, fontWeight = FontWeight.Bold) }
            items(models) { item ->
                Card(
                    modifier = Modifier.fillMaxWidth().clickable { onModel(item) },
                    colors = CardDefaults.cardColors(containerColor = if (item == model) Color(0xFF0E68D5) else Color(0xFF0B1D30)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Row(Modifier.padding(15.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.AutoAwesome, null, tint = blue)
                        Column(Modifier.padding(start = 10.dp)) {
                            Text(item, color = Color.White)
                            if (item == "gemini-3.8-flash") Text("موصى به للـComputer Use", color = Color(0xFF54B5FF), fontSize = 11.sp)
                        }
                    }
                }
            }
            item {
                PermissionCard("Shizuku", shizuku.isGranted(), Icons.Default.Terminal, if (shizuku.isGranted()) "متصل • UID " + shizuku.uid() else "يحتاج تشغيل Shizuku", {
                    if (shizuku.isAvailable()) shizuku.requestPermission() else openShizuku()
                })
                Text("المفتاح يُشفّر محليًا باستخدام Android Keystore.", color = muted, fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp))
            }
        }
    }

    @Composable
    private fun PermissionCard(title: String, ok: Boolean, icon: ImageVector, subtitle: String, action: () -> Unit) {
        Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF0B1D30)), shape = RoundedCornerShape(18.dp)) {
            Row(Modifier.fillMaxWidth().padding(15.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, null, tint = if (ok) Color(0xFF45D483) else Color(0xFF54B5FF), modifier = Modifier.size(27.dp))
                Column(Modifier.weight(1f).padding(horizontal = 12.dp)) {
                    Text(title, color = Color.White, fontWeight = FontWeight.Bold)
                    Text(subtitle, color = Color(0xFF9FB1C8), fontSize = 12.sp)
                }
                if (ok) Icon(Icons.Default.CheckCircle, null, tint = Color(0xFF45D483))
                else Button(onClick = action, contentPadding = PaddingValues(horizontal = 10.dp)) { Text("إعداد", fontSize = 11.sp) }
            }
        }
    }

    @Composable
    private fun ActionCard(text: String, blue: Color, action: () -> Unit) {
        Card(modifier = Modifier.fillMaxWidth().clickable { action() }, colors = CardDefaults.cardColors(containerColor = Color(0xFF0B1D30)), shape = RoundedCornerShape(16.dp)) {
            Row(Modifier.padding(15.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.SmartToy, null, tint = blue)
                Text("  $text", color = Color.White)
            }
        }
    }

    @Composable
    private fun ToolRow(title: String, subtitle: String, tint: Color) {
        Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF0B1D30)), shape = RoundedCornerShape(16.dp)) {
            Column(Modifier.fillMaxWidth().padding(15.dp)) {
                Text(title, color = Color.White, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(4.dp))
                Text(subtitle, color = tint, fontSize = 12.sp)
            }
        }
    }

    private fun accessibilityEnabled(): Boolean {
        val expected = ComponentName(this, PhonePilotAccessibilityService::class.java).flattenToString()
        val enabled = Settings.Secure.getString(contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES) ?: return false
        return enabled.split(':').any { it.equals(expected, true) }
    }

    private fun openAccessibility() = startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))

    private fun openOverlaySettings() {
        startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName")))
    }

    private fun openShizuku() {
        packageManager.getLaunchIntentForPackage("moe.shizuku.privileged.api")?.let { startActivity(it) }
            ?: startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://shizuku.rikka.app/download/")))
    }

    private fun startOverlay() {
        if (!Settings.canDrawOverlays(this)) {
            openOverlaySettings()
            return
        }
        startService(Intent(this, OverlayService::class.java))
    }
}
