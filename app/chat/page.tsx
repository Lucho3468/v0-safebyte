"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useUserProfile } from "@/lib/context/UserProfileContext"
import { Send, Bot, User, AlertTriangle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

function ChatMessage({ message }: { message: Message }) {
  const isAssistant = message.role === "assistant"

  return (
    <div
      className={cn(
        "flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isAssistant
            ? "bg-card border border-border"
            : "bg-primary text-primary-foreground"
        )}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
      </div>
      {!isAssistant && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
          <User className="h-5 w-5 text-secondary-foreground" />
        </div>
      )}
    </div>
  )
}

export default function ChatPage() {
  const { profile } = useUserProfile()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: profile.allergies.length > 0
        ? `Welcome to SafeByte! 🛡️ I see you have ${profile.allergies.join(", ")} allergies listed in your profile. I'll keep these in mind while helping you find safe dining options.\n\nWhat are you craving today? You can:\n• Ask about a specific cuisine (e.g., "Find me safe Mexican food")\n• Name a restaurant you're considering\n• Paste a menu for me to analyze`
        : `Welcome to SafeByte! 🛡️ I'm your AI-powered food safety assistant.\n\nTo give you personalized recommendations, please set up your dietary profile first. Or you can ask me general questions about restaurant food safety!\n\nWhat would you like to know?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsTyping(true)

    try {
      // Call Claude API via Next.js API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          userProfile: {
            allergies: profile.allergies,
            dietTags: profile.dietTags,
            severityLevels: profile.severityLevels,
            notes: profile.notes,
          },
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Request failed: ${response.status}`)
      }

      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1 flex-col">
        {/* Profile reminder banner */}
        {profile.allergies.length === 0 && (
          <Link href="/profile" className="block">
            <div className="border-b border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950 px-4 py-2 text-center text-sm text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors cursor-pointer">
              <AlertTriangle className="mr-1.5 inline h-4 w-4" />
              Set up your dietary profile for personalized safety recommendations →
            </div>
          </Link>
        )}

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="container mx-auto max-w-3xl space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">SafeByte is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-border bg-card px-4 py-4">
          <div className="container mx-auto max-w-3xl">
            <div className="flex items-end gap-3">
              <div className="relative flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about restaurants, cuisines, or paste a menu..."
                  rows={1}
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  style={{ minHeight: "48px", maxHeight: "120px" }}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="h-12 w-12 shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Always inform your server about allergies. SafeByte is an assistant, not medical advice.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
