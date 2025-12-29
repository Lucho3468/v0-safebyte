"use client"

import { Button } from "@/components/ui/button"

import { useEffect, useState } from "react"
import { DishCard } from "@/components/dish-card"
import { createClient } from "@/lib/supabase/client"
import type { Dish } from "@/types/dish"
import { Skeleton } from "@/components/ui/skeleton"
import { Bookmark } from "lucide-react"
import { useRouter } from "next/navigation"

interface SavedTabProps {
  allergies: string[]
  dietTags: string[]
}

export function SavedTab({ allergies, dietTags }: SavedTabProps) {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadSaved()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allergies, dietTags])

  const loadSaved = async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }
      setIsAuthenticated(true)

      const { data, error } = await supabase
        .from("saved_items")
        .select(
          `
          dish_id,
          dishes!inner(
            *,
            restaurants!inner(name)
          )
        `,
        )
        .eq("user_id", user.id)

      if (error) throw error

      const formattedDishes: Dish[] =
        data?.map((item: any) => ({
          id: item.dishes.id,
          restaurant_id: item.dishes.restaurant_id,
          restaurantName: item.dishes.restaurants?.name || "Unknown",
          name: item.dishes.name,
          description: item.dishes.description || "",
          price: item.dishes.price || 0,
          calories: item.dishes.calories || 0,
          allergens: item.dishes.allergens || [],
          free_of: item.dishes.free_of || [],
          ingredients: item.dishes.ingredients || [],
          trending_score: item.dishes.trending_score || 0,
          community_safe_count: item.dishes.community_safe_count || 0,
          community_issue_count: item.dishes.community_issue_count || 0,
          safetyScore: item.dishes.safety_score || 90,
        })) || []

      setDishes(formattedDishes)
    } catch (error) {
      console.error("[v0] Error loading saved dishes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Login to save dishes</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          Create an account to save your favorite safe dishes and access them anytime
        </p>
        <Button onClick={() => router.push("/auth/login")}>Login</Button>
      </div>
    )
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
        <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No saved dishes yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Start exploring dishes and save your favorites to find them here
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        {dishes.length} saved {dishes.length === 1 ? "dish" : "dishes"}
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} onUpdate={loadSaved} />
        ))}
      </div>
    </div>
  )
}
