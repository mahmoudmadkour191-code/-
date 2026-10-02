package com.phonepilot.gemini

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class GeminiClient(private val apiKey: String) {
    private val endpoint = "https://generativelanguage.googleapis.com/v1beta/interactions"
    private val model = "gemini-3.8-flash"

    fun plan(userGoal: String, ui: String): AgentAction {
        val system = """
            You are Phone Pilot, an Android UI agent. Return ONLY one JSON object matching:
            {"action":"...","text":"","target":"","x":-1,"y":-1,"x2":-1,"y2":-1,"durationMs":500,"reason":""}
            Allowed actions: launch_telegram, click_text, click_content_desc, click_view_id, set_text, tap_point, swipe, back, home, wait, finish.
            Rules:
            - Use the UI tree provided below as the current screen state.
            - Prefer target selectors over coordinates when possible.
            - For Telegram: opening Telegram is launch_telegram. To search a person/chat, click the search control, set_text into the search field, choose the matching result, then set_text in the message field and click the Send button.
            - Never invent a selector if a visible selector exists.
            - Only perform actions needed for the user's goal. Do not send messages unless the user explicitly asked to send them.
            - One action per response. After each action, the app will send you a fresh UI tree.
            - If the goal is already completed, return action=finish.
        """.trimIndent()

        val input = "USER GOAL:\n$userGoal\n\nCURRENT UI TREE:\n$ui"
        val root = JSONObject().apply {
            put("model", model)
            put("system_instruction", system)
            put("input", input)
            put("response_format", JSONObject().apply {
                put("type", "text")
                put("mime_type", "application/json")
                put("schema", JSONObject().apply {
                    put("type", "OBJECT")
                    put("properties", JSONObject().apply {
                        put("action", JSONObject().put("type", "STRING"))
                        put("text", JSONObject().put("type", "STRING"))
                        put("target", JSONObject().put("type", "STRING"))
                        put("x", JSONObject().put("type", "INTEGER"))
                        put("y", JSONObject().put("type", "INTEGER"))
                        put("x2", JSONObject().put("type", "INTEGER"))
                        put("y2", JSONObject().put("type", "INTEGER"))
                        put("durationMs", JSONObject().put("type", "INTEGER"))
                        put("reason", JSONObject().put("type", "STRING"))
                    })
                    put("required", org.json.JSONArray().apply {
                        listOf("action", "text", "target", "x", "y", "x2", "y2", "durationMs", "reason").forEach(::put)
                    })
                })
            })
        }

        val conn = (URL(endpoint).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 30000
            readTimeout = 60000
            doOutput = true
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("x-goog-api-key", apiKey)
        }

        conn.outputStream.use { it.write(root.toString().toByteArray(Charsets.UTF_8)) }

        val code = conn.responseCode
        val body = (if (code in 200..299) conn.inputStream else conn.errorStream)
            .bufferedReader().use { it.readText() }

        if (code !in 200..299) error("Gemini HTTP $code: $body")

        val response = JSONObject(body)
        val steps = response.optJSONArray("steps")
            ?: error("Gemini response missing steps")

        var textOut: String? = null
        for (i in 0 until steps.length()) {
            val s = steps.optJSONObject(i) ?: continue
            if (s.optString("type") == "model_output") {
                val content = s.optJSONArray("content") ?: continue
                for (j in 0 until content.length()) {
                    val c = content.optJSONObject(j) ?: continue
                    if (c.optString("type") == "text") {
                        textOut = c.optString("text")
                    }
                }
            }
        }

        val actionJson = JSONObject(textOut ?: error("Gemini returned no model output"))
        return AgentAction(
            action = actionJson.optString("action"),
            text = actionJson.optString("text"),
            target = actionJson.optString("target"),
            x = actionJson.optInt("x", -1),
            y = actionJson.optInt("y", -1),
            x2 = actionJson.optInt("x2", -1),
            y2 = actionJson.optInt("y2", -1),
            durationMs = actionJson.optLong("durationMs", 500),
            reason = actionJson.optString("reason")
        )
    }
}
