"use client"

import type React from "react"

import { useState } from "react"
import { DishCard } from "@/components/dish-card"
import { createClient } from "@/lib/supabase/client"
import type { Dish } from "@/types/dish"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"

interface SearchTabProps {
  allergies: string[]
  dietTags: string[]
}

export function SearchTab({ allergies, dietTags }: SearchTabProps) {
  const [query, setQuery] = useState("")
  const [dishes, setDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const supabase = createClient()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setHasSearched(true)
    try {
      let dishQuery = supabase
        .from("dishes")
        .select(
          `
          *,
          restaurants!inner(name)
        `,
        )
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,ingredients.cs.{${query}}`)
        .order("safety_score", { ascending: false })
        .limit(20)

      // Filter by allergens
      if (allergies.length > 0) {
        dishQuery = dishQuery.not("allergens", "ov", allergies)
      }

      const { data, error } = await dishQuery

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
      console.error("[v0] Error searching dishes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="search"
          placeholder="Search for dishes, ingredients, or restaurants..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="ml-2">Search</span>
        </Button>
      </form>

      {!hasSearched && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Search for safe dishes</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Try searching for &quot;chicken bowl&quot;, &quot;gluten-free&quot;, or &quot;Chipotle&quot;
          </p>
        </div>
      )}

      {hasSearched && dishes.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No dishes found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">Try searching with different keywords</p>
        </div>
      )}

      {dishes.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Found {dishes.length} {dishes.length === 1 ? "dish" : "dishes"} matching &quot;{query}&quot;
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} onUpdate={() => handleSearch(new Event("submit") as any)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
