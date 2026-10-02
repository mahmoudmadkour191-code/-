package com.phonepilot.gemini.agent

data class AgentMessage(val role: String, val text: String)
data class AgentUiState(
    val status: String = "جاهز",
    val running: Boolean = false,
    val lastIntent: String = "",
    val messages: List<AgentMessage> = emptyList()
)
