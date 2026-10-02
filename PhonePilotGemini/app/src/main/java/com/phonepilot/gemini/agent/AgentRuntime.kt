package com.phonepilot.gemini.agent

import android.content.Context
import kotlinx.coroutines.CompletableDeferred

object AgentRuntime {
    lateinit var appContext: Context
    @Volatile var running: Boolean = false
    @Volatile var lastStatus: String = "جاهز"
    @Volatile var lastIntent: String = ""
    @Volatile var confirmation: CompletableDeferred<Boolean>? = null
}
