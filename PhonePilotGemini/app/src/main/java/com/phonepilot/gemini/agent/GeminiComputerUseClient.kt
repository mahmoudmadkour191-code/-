package com.phonepilot.gemini.agent

import com.google.genai.Client
import com.google.genai.gaos.models.interactions.ComputerUse
import com.google.genai.gaos.models.interactions.Content
import com.google.genai.gaos.models.interactions.CreateModelInteraction
import com.google.genai.gaos.models.interactions.EnvironmentEnum
import com.google.genai.gaos.models.interactions.FunctionCallStep
import com.google.genai.gaos.models.interactions.FunctionResultStep
import com.google.genai.gaos.models.interactions.FunctionResultStepResultUnion
import com.google.genai.gaos.models.interactions.ImageContent
import com.google.genai.gaos.models.interactions.ImageContentMimeType
import com.google.genai.gaos.models.interactions.Interaction
import com.google.genai.gaos.models.interactions.InteractionsInput
import com.google.genai.gaos.models.interactions.ModelOutputStep
import com.google.genai.gaos.models.interactions.Step
import com.google.genai.gaos.models.interactions.TextContent
import com.google.genai.gaos.models.operations.CreateInteractionRequestBody
import java.util.Base64

class GeminiComputerUseClient(
    apiKey: String,
    private val model: String = "gemini-3.8-flash"
) {
    private val client = Client.builder().apiKey(apiKey).build()

    private fun tool() = ComputerUse.builder()
        .environment(EnvironmentEnum.MOBILE)
        .enablePromptInjectionDetection(true)
        .build()

    private fun firstInput(goal: String, screenshot: ByteArray?, uiSummary: String): InteractionsInput {
        val blocks = mutableListOf<Content>()
        blocks += TextContent.builder().text(
            "User task:\n$goal\n\nAccessibility summary:\n$uiSummary\n\n" +
                "Control this Android phone. Use the mobile computer_use actions. " +
                "Use the screenshot as the source of truth."
        ).build()
        screenshot?.let {
            blocks += ImageContent.builder()
                .data(Base64.getEncoder().encodeToString(it))
                .mimeType(ImageContentMimeType.IMAGE_PNG)
                .build()
        }
        return InteractionsInput.ofContent(blocks)
    }

    fun start(goal: String, screenshot: ByteArray?, uiSummary: String): Interaction {
        val params = CreateModelInteraction.builder()
            .model(model)
            .input(firstInput(goal, screenshot, uiSummary))
            .tools(listOf(tool()))
            .build()
        return client.interactions.create(CreateInteractionRequestBody.of(params)).interaction().get()
    }

    fun continueWith(previousId: String, responses: List<Step>): Interaction {
        val params = CreateModelInteraction.builder()
            .model(model)
            .previousInteractionId(previousId)
            .input(InteractionsInput.ofStep(responses))
            .tools(listOf(tool()))
            .build()
        return client.interactions.create(CreateInteractionRequestBody.of(params)).interaction().get()
    }

    fun functionCalls(interaction: Interaction): List<FunctionCallStep> =
        interaction.steps().orElse(emptyList()).filterIsInstance<FunctionCallStep>()

    fun modelText(interaction: Interaction): String =
        interaction.steps().orElse(emptyList())
            .filterIsInstance<ModelOutputStep>()
            .flatMap { it.content().orElse(emptyList()) }
            .filterIsInstance<TextContent>()
            .mapNotNull { it.text().orElse(null) }
            .joinToString(" ")
            .trim()

    fun functionResult(
        name: String,
        callId: String,
        resultText: String,
        screenshot: ByteArray?
    ): FunctionResultStep {
        val content = mutableListOf<Content>()
        content += TextContent.builder().text(resultText).build()
        screenshot?.let {
            content += ImageContent.builder()
                .data(Base64.getEncoder().encodeToString(it))
                .mimeType(ImageContentMimeType.IMAGE_PNG)
                .build()
        }
        return FunctionResultStep.builder()
            .name(name)
            .callId(callId)
            .result(FunctionResultStepResultUnion.of(content))
            .build()
    }
}
