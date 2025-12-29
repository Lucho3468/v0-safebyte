import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, userProfile, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Build the system prompt with user profile information
    const systemPrompt = `You are SafeByte, an AI food safety assistant specializing in helping people with food allergies and dietary restrictions find safe dining options.

User's Dietary Profile:
${
  userProfile.allergies.length > 0
    ? `Allergies: ${userProfile.allergies
        .map((allergy: string) => {
          const severity = userProfile.severityLevels[allergy] || "moderate"
          return `${allergy} (${severity})`
        })
        .join(", ")}`
    : "No allergies listed"
}
${userProfile.dietTags.length > 0 ? `Dietary Preferences: ${userProfile.dietTags.join(", ")}` : ""}
${userProfile.notes ? `Additional Notes: ${userProfile.notes}` : ""}

Your responsibilities:
1. Help users find safe dining options based on their allergies and dietary restrictions
2. Analyze menus when provided
3. Suggest safe dishes and cuisines
4. Be cautious about cross-contamination
5. Always remind users to inform servers about their allergies
6. Provide practical advice for dining out safely
7. Be empathetic and understanding about food allergies

Important: You are an assistant, not a medical professional. Always encourage users to verify ingredients with restaurants and consult medical professionals if needed.`

    // Prepare messages for Claude
    const messages = [
      ...conversationHistory.slice(-10),
      {
        role: "user",
        content: message,
      },
    ]

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Claude API error:", error)
      return NextResponse.json(
        { error: error.error?.message || "Failed to get response from Claude" },
        { status: 500 }
      )
    }

    const data = await response.json()
    const assistantMessage = data.content[0]?.text || "I couldn't generate a response."

    return NextResponse.json({
      response: assistantMessage,
    })
  } catch (error) {
    console.error("Chat error:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    )
  }
}
