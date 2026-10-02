package com.phonepilot.gemini.agent

import android.content.Context
import com.phonepilot.gemini.control.PhonePilotAccessibilityService
import com.phonepilot.gemini.control.ShizukuController
import com.phonepilot.gemini.overlay.OverlayService
import com.phonepilot.gemini.storage.SecretStore
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import java.util.Collections

class AgentController(context: Context, private val onStatus: (String) -> Unit, private val onMessage: (String) -> Unit) {
    private val appContext = context.applicationContext
    private val shizuku = ShizukuController(appContext)

    suspend fun run(goal: String, model: String) = withContext(Dispatchers.IO) {
        if (AgentRuntime.running) return@withContext
        AgentRuntime.running = true
        try {
            val key = SecretStore(appContext).get()
            require(key.isNotBlank()) { "أضف Gemini API Key من الإعدادات." }
            val access = PhonePilotAccessibilityService.instance
                ?: error("فعّل خدمة الوصول Accessibility أولاً.")

            onStatus("جاري بدء Gemini Computer Use…")
            val client = GeminiComputerUseClient(key, model)
            val initial = capture(access)
            var interaction = client.start(goal, initial, access.uiSummary())

            for (turn in 1..30) {
                if (!AgentRuntime.running) break
                val calls = client.functionCalls(interaction)
                if (calls.isEmpty()) {
                    val text = client.modelText(interaction)
                    if (text.isNotBlank()) onMessage(text)
                    onStatus("اكتملت المهمة")
                    break
                }

                val responses = mutableListOf<com.google.genai.gaos.models.interactions.Step>()
                for (call in calls) {
                    val name = call.name().orElse("")
                    val args = call.arguments().orElse(Collections.emptyMap())
                    val intent = args["intent"]?.toString().orEmpty()
                    AgentRuntime.lastIntent = intent
                    onStatus(if (intent.isBlank()) "تنفيذ $name" else intent)

                    val safety = args["safety_decision"] as? Map<*, *>
                    val decision = safety?.get("decision")?.toString().orEmpty()
                    if (decision == "blocked") {
                        responses += client.functionResult(name, call.id().orElse(""),
                            "{\"error\":\"blocked_by_gemini_safety\"}", capture(access))
                        AgentRuntime.running = false
                        break
                    }

                    var acknowledged = false
                    if (decision == "require_confirmation") {
                        val reason = safety?.get("explanation")?.toString().orEmpty()
                        acknowledged = requestConfirmation(reason)
                        if (!acknowledged) {
                            responses += client.functionResult(name, call.id().orElse(""),
                                "{\"user_cancelled\":true}", capture(access))
                            AgentRuntime.running = false
                            break
                        }
                    }

                    val result = execute(name, args, access)
                    onMessage((if (result.first) "✓ " else "✕ ") + result.second)
                    delay(if (name == "wait") 150 else 650)
                    val shot = capture(access)
                    var resultJson = "{\"success\":" + result.first
                    if (acknowledged) resultJson += ",\"safety_acknowledgement\":true"
                    resultJson += ",\"detail\":\"" + result.second.replace("\\", "\\\\").replace("\"", "\\\"") + "\"}"
                    responses += client.functionResult(name, call.id().orElse(""), resultJson, shot)
                }

                if (!AgentRuntime.running) break
                interaction = client.continueWith(interaction.id().orElse(""), responses)
            }
        } catch (t: Throwable) {
            onStatus("خطأ: " + (t.message ?: t::class.java.simpleName))
            onMessage("✕ " + (t.message ?: "حدث خطأ"))
        } finally {
            AgentRuntime.running = false
        }
    }

    fun stop() {
        AgentRuntime.running = false
        onStatus("تم إيقاف المهمة")
    }

    private fun execute(name: String, args: Map<String, Any>, access: PhonePilotAccessibilityService): Pair<Boolean,String> =
        runCatching {
            when (name) {
                "open_app" -> {
                    val app = args["app_name"]?.toString().orEmpty()
                    access.openApp(app) to "فتح $app"
                }
                "click" -> access.click(actualX(args["x"]), actualY(args["y"])) to "نقر"
                "type" -> access.setText(args["text"]?.toString().orEmpty()) to "كتابة النص"
                "long_press" -> access.longPress(actualX(args["x"]), actualY(args["y"]), args.longValue("seconds",2)) to "ضغط مطول"
                "drag_and_drop" -> access.drag(
                    actualX(args["start_x"]), actualY(args["start_y"]),
                    actualX(args["end_x"]), actualY(args["end_y"]), 700
                ) to "سحب وإفلات"
                "go_back" -> access.back() to "رجوع"
                "press_key" -> access.pressKey(args["key"]?.toString().orEmpty(), shizuku) to "ضغط زر"
                "take_screenshot" -> true to "التقاط الشاشة"
                "wait" -> {
                    Thread.sleep((args.longValue("seconds",1) * 1000).coerceIn(100,5000))
                    true to "انتظار"
                }
                "list_apps" -> true to access.launcherApps()
                else -> false to "أمر غير مدعوم: $name"
            }
        }.getOrElse { false to (it.message ?: "فشل التنفيذ") }

    private fun actualX(v: Any?): Float =
        (v.intValue(0).coerceIn(0,999) / 1000f) * PhonePilotAccessibilityService.screenWidth

    private fun actualY(v: Any?): Float =
        (v.intValue(0).coerceIn(0,999) / 1000f) * PhonePilotAccessibilityService.screenHeight

    private fun capture(access: PhonePilotAccessibilityService): ByteArray? =
        runBlocking {
            val d = CompletableDeferred<ByteArray?>()
            access.takeScreenshot { d.complete(it) }
            d.await()
        }

    private fun requestConfirmation(reason: String): Boolean {
        val d = CompletableDeferred<Boolean>()
        AgentRuntime.confirmation = d
        OverlayService.showConfirmation(reason)
        return runBlocking { d.await() }.also { AgentRuntime.confirmation = null }
    }
}

private fun Any?.intValue(default: Int): Int = when (this) {
    is Number -> toInt()
    else -> toString().toIntOrNull() ?: default
}
private fun Any?.longValue(default: Long): Long = when (this) {
    is Number -> toLong()
    else -> toString().toLongOrNull() ?: default
}
