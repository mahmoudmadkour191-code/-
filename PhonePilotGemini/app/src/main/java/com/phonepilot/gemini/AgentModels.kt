package com.phonepilot.gemini

data class UiNode(
    val index: Int,
    val text: String,
    val contentDescription: String,
    val className: String,
    val viewId: String,
    val clickable: Boolean,
    val editable: Boolean,
    val enabled: Boolean,
    val bounds: String
)

data class AgentAction(
    val action: String,
    val text: String = "",
    val target: String = "",
    val x: Int = -1,
    val y: Int = -1,
    val x2: Int = -1,
    val y2: Int = -1,
    val durationMs: Long = 500,
    val reason: String = ""
)
