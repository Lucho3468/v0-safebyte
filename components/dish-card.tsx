"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ThumbsUp, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { Dish } from "@/types/dish"

interface DishCardProps {
  dish: Dish
  onUpdate?: () => void
}

export function DishCard({ dish, onUpdate }: DishCardProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const getSafetyColor = (score: number) => {
    if (score >= 90) return "safety-safe"
    if (score >= 75) return "safety-caution"
    return "safety-avoid"
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save dishes",
          variant: "destructive",
        })
        return
      }

      if (isSaved) {
        await supabase.from("saved_items").delete().eq("user_id", user.id).eq("dish_id", dish.id)
        setIsSaved(false)
        toast({ title: "Removed from saved", description: `${dish.name} removed from your saved dishes` })
      } else {
        await supabase.from("saved_items").insert({ user_id: user.id, dish_id: dish.id })
        setIsSaved(true)
        toast({ title: "Saved!", description: `${dish.name} added to your saved dishes` })
      }
      onUpdate?.()
    } catch (error) {
      console.error("[v0] Error saving dish:", error)
      toast({ title: "Error", description: "Failed to save dish", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = async (type: "safe" | "issue") => {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to provide feedback",
          variant: "destructive",
        })
        return
      }

      await supabase.from("feedback").insert({ user_id: user.id, dish_id: dish.id, type })

      toast({
        title: "Feedback submitted",
        description: `Thanks for marking this dish as ${type === "safe" ? "safe" : "having an issue"}`,
      })
      onUpdate?.()
    } catch (error) {
      console.error("[v0] Error submitting feedback:", error)
      toast({ title: "Error", description: "Failed to submit feedback", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="space-y-1">
              <h3 className="font-semibold leading-tight text-balance">{dish.name}</h3>
              <p className="text-sm text-muted-foreground">{dish.restaurantName}</p>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">{dish.description}</p>

            <div className="flex flex-wrap gap-2">
              <Badge className={getSafetyColor(dish.safetyScore)}>Safety: {dish.safetyScore}</Badge>
              {dish.trending_score && dish.trending_score > 70 && (
                <Badge variant="secondary">Trending: {dish.trending_score}</Badge>
              )}
              {dish.free_of && dish.free_of.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {dish.free_of.slice(0, 2).join(", ")}
                  {dish.free_of.length > 2 && ` +${dish.free_of.length - 2}`}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {dish.price && <span>${dish.price.toFixed(2)}</span>}
              {dish.calories && <span>{dish.calories} cal</span>}
              {dish.community_safe_count > 0 && (
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {dish.community_safe_count}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant={isSaved ? "default" : "outline"}
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1"
          >
            <Star className={`mr-1 h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleFeedback("safe")} disabled={isLoading}>
            <ThumbsUp className="mr-1 h-4 w-4" />
            Safe
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleFeedback("issue")} disabled={isLoading}>
            <AlertTriangle className="mr-1 h-4 w-4" />
            Issue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
