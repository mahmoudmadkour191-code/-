package com.phonepilot.gemini.control

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Bitmap
import android.graphics.Path
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.view.Display
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import java.io.ByteArrayOutputStream
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.Executor

class PhonePilotAccessibilityService : AccessibilityService() {
    companion object {
        @Volatile var instance: PhonePilotAccessibilityService? = null
        @Volatile var currentPackage: String = ""
        @Volatile var screenWidth: Int = 1080
        @Volatile var screenHeight: Int = 2400
    }

    override fun onServiceConnected() {
        instance = this
        val metrics = resources.displayMetrics
        screenWidth = metrics.widthPixels
        screenHeight = metrics.heightPixels
    }

    override fun onInterrupt() = Unit
    override fun onDestroy() { instance = null; super.onDestroy() }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        currentPackage = event?.packageName?.toString().orEmpty()
    }

    fun uiSummary(): String {
        val root = rootInActiveWindow ?: return "<NO_ACCESSIBILITY_TREE>"
        val sb = StringBuilder()
        val queue = ArrayDeque<AccessibilityNodeInfo>()
        queue.add(root)
        var i = 0
        while (queue.isNotEmpty() && i < 180) {
            val node = queue.removeFirst()
            val text = node.text?.toString()?.replace("\n"," ").orEmpty()
            val desc = node.contentDescription?.toString()?.replace("\n"," ").orEmpty()
            val id = node.viewIdResourceName.orEmpty()
            if (text.isNotBlank() || desc.isNotBlank() || id.isNotBlank() || node.isClickable || node.isEditable) {
                val r = android.graphics.Rect()
                node.getBoundsInScreen(r)
                sb.append("#").append(i)
                    .append(" text=\"").append(text).append("\"")
                    .append(" desc=\"").append(desc).append("\"")
                    .append(" id=\"").append(id).append("\"")
                    .append(" clickable=").append(node.isClickable)
                    .append(" editable=").append(node.isEditable)
                    .append(" enabled=").append(node.isEnabled)
                    .append(" bounds=").append(r.left).append(',').append(r.top).append(',').append(r.right).append(',').append(r.bottom)
                    .append('\n')
                i++
            }
            for (c in 0 until node.childCount) node.getChild(c)?.let(queue::add)
        }
        return sb.toString().take(18000)
    }

    fun openApp(appName: String): Boolean {
        val apps = packageManager.queryIntentActivities(
            android.content.Intent(android.content.Intent.ACTION_MAIN).addCategory(android.content.Intent.CATEGORY_LAUNCHER),
            android.content.pm.PackageManager.MATCH_ALL
        )
        val match = apps.firstOrNull {
            it.loadLabel(packageManager).toString().contains(appName, true) ||
                it.activityInfo.packageName.equals(appName, true)
        } ?: return false
        val intent = android.content.Intent(android.content.Intent.ACTION_MAIN).apply {
            addCategory(android.content.Intent.CATEGORY_LAUNCHER)
            setClassName(match.activityInfo.packageName, match.activityInfo.name)
            addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        startActivity(intent)
        return true
    }

    fun focusedEditable(): AccessibilityNodeInfo? {
        val root = rootInActiveWindow ?: return null
        root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT)?.let { return it }
        return findFirst(root) { it.isEditable && it.isEnabled }
    }

    fun setText(text: String): Boolean {
        val node = focusedEditable() ?: return false
        val bundle = android.os.Bundle().apply {
            putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text)
        }
        return node.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, bundle)
    }

    fun click(x: Float, y: Float): Boolean = gesture(Path().apply { moveTo(x, y) }, 70)

    fun longPress(x: Float, y: Float, seconds: Long): Boolean =
        gesture(Path().apply { moveTo(x, y) }, (seconds.coerceIn(1, 5) * 1000))

    fun drag(x1: Float, y1: Float, x2: Float, y2: Float, duration: Long): Boolean =
        gesture(Path().apply { moveTo(x1, y1); lineTo(x2, y2) }, duration.coerceIn(200, 2000))

    fun back(): Boolean = performGlobalAction(GLOBAL_ACTION_BACK)
    fun home(): Boolean = performGlobalAction(GLOBAL_ACTION_HOME)

    fun pressKey(key: String, shizuku: ShizukuController?): Boolean {
        when (key.uppercase()) {
            "BACK" -> return back()
            "HOME" -> return home()
        }
        if (shizuku == null || !shizuku.isGranted()) return false
        val keyCode = when (key.uppercase()) {
            "ENTER","RETURN" -> "KEYCODE_ENTER"
            "SPACE" -> "KEYCODE_SPACE"
            "DEL","BACKSPACE" -> "KEYCODE_DEL"
            "TAB" -> "KEYCODE_TAB"
            "ESC","ESCAPE" -> "KEYCODE_ESCAPE"
            else -> return false
        }
        return shizuku.exec("input keyevent $keyCode").isNotBlank() || true
    }

    fun takeScreenshot(callback: (ByteArray?) -> Unit) {
        if (Build.VERSION.SDK_INT < 30) {
            callback(null); return
        }
        val executor = Executor { command -> Handler(Looper.getMainLooper()).post(command) }
        takeScreenshot(Display.DEFAULT_DISPLAY, executor, object : TakeScreenshotCallback() {
            override fun onSuccess(result: ScreenshotResult) {
                val bitmap = Bitmap.wrapHardwareBuffer(result.hardwareBuffer, result.colorSpace)
                val bytes = bitmap?.copy(Bitmap.Config.ARGB_8888, false)?.let {
                    val out = ByteArrayOutputStream()
                    it.compress(Bitmap.CompressFormat.PNG, 100, out)
                    it.recycle()
                    out.toByteArray()
                }
                result.hardwareBuffer.close()
                callback(bytes)
            }
            override fun onFailure(errorCode: Int) { callback(null) }
        })
    }

    private fun gesture(path: Path, duration: Long): Boolean {
        val latch = CountDownLatch(1)
        var ok = false
        val description = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, duration))
            .build()
        dispatchGesture(description, object : GestureResultCallback() {
            override fun onCompleted(gestureDescription: GestureDescription?) { ok = true; latch.countDown() }
            override fun onCancelled(gestureDescription: GestureDescription?) { latch.countDown() }
        }, null)
        latch.await(4, TimeUnit.SECONDS)
        return ok
    }

    private fun findFirst(root: AccessibilityNodeInfo, predicate: (AccessibilityNodeInfo) -> Boolean): AccessibilityNodeInfo? {
        val queue = ArrayDeque<AccessibilityNodeInfo>()
        queue.add(root)
        while (queue.isNotEmpty()) {
            val n = queue.removeFirst()
            if (predicate(n)) return n
            for (i in 0 until n.childCount) n.getChild(i)?.let(queue::add)
        }
        return null
    }
}
