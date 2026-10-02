package com.phonepilot.gemini

import android.os.Handler
import android.os.Looper
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class AgentEngine(private val onLog: (String) -> Unit, private val onDone: () -> Unit) {
    private val io: ExecutorService = Executors.newSingleThreadExecutor()
    private val main = Handler(Looper.getMainLooper())
    @Volatile private var running = false

    fun start(apiKey: String, goal: String) {
        if (running) return
        running = true
        io.execute {
            try {
                if (apiKey.isBlank()) error("ضع Gemini API Key أولًا")
                val service = PhonePilotAccessibilityService.instance
                    ?: error("فعّل Accessibility Service أولًا")
                val client = GeminiClient(apiKey)
                var step = 0
                while (running && step < 40) {
                    val tree = service.uiTree()
                    log("\n--- Step ${step + 1} ---\nPackage: ${PhonePilotAccessibilityService.lastPackage}\n$tree")
                    val action = client.plan(goal, tree)
                    log("AI → ${action.action} target='${action.target}' text='${action.text}' reason='${action.reason}'")
                    if (action.action == "finish") break
                    val ok = service.perform(action)
                    log(if (ok) "✓ action executed" else "✗ action failed")
                    if (!ok) Thread.sleep(700)
                    Thread.sleep(if (action.action == "wait") 150 else 900)
                    step++
                }
            } catch (t: Throwable) {
                log("ERROR: ${t.message ?: t::class.java.simpleName}")
            } finally {
                running = false
                main.post(onDone)
            }
        }
    }

    fun stop() {
        running = false
        log("Agent stopped")
    }

    fun shutdown() {
        running = false
        io.shutdownNow()
    }

    private fun log(s: String) = main.post { onLog(s) }
}
