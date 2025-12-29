"use client"

import { useEffect, useState } from "react"
import { DishCard } from "@/components/dish-card"
import { createClient } from "@/lib/supabase/client"
import type { Dish } from "@/types/dish"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp } from "lucide-react"

interface TrendingTabProps {
  allergies: string[]
  dietTags: string[]
}

export function TrendingTab({ allergies, dietTags }: TrendingTabProps) {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadTrending()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allergies, dietTags])

  const loadTrending = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from("dishes")
        .select(
          `
          *,
          restaurants!inner(name)
        `,
        )
        .order("trending_score", { ascending: false })
        .order("community_safe_count", { ascending: false })
        .limit(20)

      // Filter by allergens
      if (allergies.length > 0) {
        query = query.not("allergens", "ov", allergies)
      }

      const { data, error } = await query

      if (error) throw error

      const formattedDishes: Dish[] =
        data?.map((dish: any) => ({
          id: dish.id,
          restaurant_id: dish.restaurant_id,
          restaurantName: dish.restaurants?.name || "Unknown",
          name: dish.name,
          description: dish.description || "",
          price: dish.price || 0,
          calories: dish.calories || 0,
          allergens: dish.allergens || [],
          free_of: dish.free_of || [],
          ingredients: dish.ingredients || [],
          trending_score: dish.trending_score || 0,
          community_safe_count: dish.community_safe_count || 0,
          community_issue_count: dish.community_issue_count || 0,
          safetyScore: dish.safety_score || 90,
        })) || []

      setDishes(formattedDishes)
    } catch (error) {
      console.error("[v0] Error loading trending dishes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    )
  }

  if (dishes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No trending dishes found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Try adjusting your filters or check back later for community favorites
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">Most popular dishes this week matching your profile</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} onUpdate={loadTrending} />
        ))}
      </div>
    </div>
  )
}
