package com.phonepilot.gemini

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.os.Bundle
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class PhonePilotAccessibilityService : AccessibilityService() {
    companion object {
        @Volatile var instance: PhonePilotAccessibilityService? = null
        @Volatile var lastPackage: String = ""
    }

    override fun onServiceConnected() { instance = this }
    override fun onInterrupt() = Unit
    override fun onDestroy() { instance = null; super.onDestroy() }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        lastPackage = event?.packageName?.toString().orEmpty()
    }

    fun uiTree(): String {
        val root = rootInActiveWindow ?: return "<NO_ACTIVE_WINDOW>"
        val out = StringBuilder()
        val queue = ArrayDeque<AccessibilityNodeInfo>()
        queue.add(root)
        var count = 0
        while (queue.isNotEmpty() && count < 150) {
            val n = queue.removeFirst()
            val text = n.text?.toString()?.replace("\n", " ").orEmpty()
            val desc = n.contentDescription?.toString()?.replace("\n", " ").orEmpty()
            val id = n.viewIdResourceName.orEmpty()
            if (text.isNotBlank() || desc.isNotBlank() || id.isNotBlank() || n.isClickable || n.isEditable) {
                out.append(
                    "#" + count + " text=\"" + text + "\" desc=\"" + desc +
                        "\" id=\"" + id + "\" clickable=" + n.isClickable +
                        " editable=" + n.isEditable + "\n"
                )
                count++
            }
            for (i in 0 until n.childCount) n.getChild(i)?.let(queue::add)
        }
        return out.toString().take(16000)
    }

    fun perform(action: AgentAction): Boolean {
        return when (action.action) {
            "launch_telegram" -> {
                val intent = packageManager.getLaunchIntentForPackage("org.telegram.messenger")
                    ?: packageManager.getLaunchIntentForPackage("org.telegram.messenger.web")
                    ?: return false
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                startActivity(intent)
                true
            }
            "click_text" ->
                findText(action.target)?.performAction(AccessibilityNodeInfo.ACTION_CLICK) == true
            "set_text" -> setFirstEditable(action.text)
            "back" -> performGlobalAction(GLOBAL_ACTION_BACK)
            "home" -> performGlobalAction(GLOBAL_ACTION_HOME)
            "finish", "wait" -> true
            else -> false
        }
    }

    private fun findText(target: String): AccessibilityNodeInfo? {
        val root = rootInActiveWindow ?: return null
        val queue = ArrayDeque<AccessibilityNodeInfo>()
        queue.add(root)
        while (queue.isNotEmpty()) {
            val n = queue.removeFirst()
            if (n.text?.toString()?.contains(target, true) == true) return n
            for (i in 0 until n.childCount) n.getChild(i)?.let(queue::add)
        }
        return null
    }

    private fun setFirstEditable(value: String): Boolean {
        val root = rootInActiveWindow ?: return false
        val queue = ArrayDeque<AccessibilityNodeInfo>()
        queue.add(root)
        while (queue.isNotEmpty()) {
            val n = queue.removeFirst()
            if (n.isEditable && n.isEnabled) {
                val args = Bundle()
                args.putCharSequence(
                    AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE,
                    value
                )
                return n.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args)
            }
            for (i in 0 until n.childCount) n.getChild(i)?.let(queue::add)
        }
        return false
    }
}
