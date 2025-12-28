"use client"

import { useEffect, useState } from "react"
import { DishCard } from "@/components/dish-card"
import { createClient } from "@/lib/supabase/client"
import type { Dish } from "@/types/dish"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Utensils } from "lucide-react"

interface MenusTabProps {
  allergies: string[]
  dietTags: string[]
}

interface Restaurant {
  id: string
  name: string
}

export function MenusTab({ allergies, dietTags }: MenusTabProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("")
  const [dishes, setDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadRestaurants()
  }, [supabase])

  useEffect(() => {
    if (selectedRestaurant) {
      loadMenu()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant, allergies, dietTags])

  const loadRestaurants = async () => {
    try {
      const { data, error } = await supabase.from("restaurants").select("id, name").order("name")

      if (error) throw error
      setRestaurants(data || [])
      if (data && data.length > 0) {
        setSelectedRestaurant(data[0].id)
      }
    } catch (error) {
      console.error("[v0] Error loading restaurants:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMenu = async () => {
    if (!selectedRestaurant) return
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
        .eq("restaurant_id", selectedRestaurant)
        .order("safety_score", { ascending: false })

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
      console.error("[v0] Error loading menu:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (restaurants.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No restaurants found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Check back later for restaurant menus</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Restaurant:</label>
        <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Select a restaurant" />
          </SelectTrigger>
          <SelectContent>
            {restaurants.map((restaurant) => (
              <SelectItem key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : dishes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No safe dishes found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Try adjusting your filters to see more options from this restaurant
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Showing {dishes.length} safe {dishes.length === 1 ? "dish" : "dishes"}
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} onUpdate={loadMenu} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
