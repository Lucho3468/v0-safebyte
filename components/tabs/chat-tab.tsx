"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Send, Loader2 } from "lucide-react"

interface ChatTabProps {
  allergies: string[]
  dietTags: string[]
}

export function ChatTab({ allergies, dietTags }: ChatTabProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setIsLoading(true)
    // Stub for future AI implementation
    setTimeout(() => {
      setIsLoading(false)
      setMessage("")
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Chat Coming Soon</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Ask questions about dishes and get personalized recommendations based on your allergies and preferences.
              This feature will use RAG (Retrieval Augmented Generation) to provide accurate, context-aware responses.
            </p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          placeholder="Ask about dishes safe for you... (coming soon)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled
          className="flex-1"
        />
        <Button type="submit" disabled>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  )
}
