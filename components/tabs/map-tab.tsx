"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Dish } from "@/types/dish"
import { DishCard } from "@/components/dish-card"

interface MapTabProps {
  allergies: string[]
  dietTags: string[]
}

interface Restaurant {
  id: string
  name: string
  cuisine: string
  price_range: string
  latitude: number
  longitude: number
  safety_rating: number
  topDishes?: Dish[]
}

export function MapTab({ allergies, dietTags }: MapTabProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadRestaurants()
    requestLocation()
  }, [allergies, dietTags])

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log("[v0] Location permission denied:", error)
          // Default to San Francisco if location denied
          setUserLocation({ lat: 37.7749, lng: -122.4194 })
        },
      )
    }
  }

  const loadRestaurants = async () => {
    setIsLoading(true)
    try {
      const { data: restaurantsData, error } = await supabase.from("restaurants").select("*").order("safety_rating", {
        ascending: false,
      })

      if (error) throw error

      // Load top dishes for each restaurant
      const restaurantsWithDishes = await Promise.all(
        (restaurantsData || []).map(async (restaurant) => {
          let query = supabase
            .from("dishes")
            .select("*")
            .eq("restaurant_id", restaurant.id)
            .order("safety_score", { ascending: false })
            .limit(3)

          // Filter by allergens
          if (allergies.length > 0) {
            query = query.not("allergens", "ov", allergies)
          }

          const { data: dishesData } = await query

          const topDishes: Dish[] =
            dishesData?.map((dish: any) => ({
              id: dish.id,
              restaurant_id: dish.restaurant_id,
              restaurantName: restaurant.name,
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

          return {
            ...restaurant,
            topDishes,
          }
        }),
      )

      setRestaurants(restaurantsWithDishes)
      if (restaurantsWithDishes.length > 0) {
        setSelectedRestaurant(restaurantsWithDishes[0])
      }
    } catch (error) {
      console.error("[v0] Error loading restaurants:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSafetyColor = (rating: number) => {
    if (rating >= 90) return "text-green-600 dark:text-green-400"
    if (rating >= 75) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getSafetyBadge = (rating: number) => {
    if (rating >= 90) return "safety-safe"
    if (rating >= 75) return "safety-caution"
    return "safety-avoid"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Interactive Map Coming Soon</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              The full map integration with Mapbox GL JS will show color-coded restaurant markers based on safety
              ratings (green = safe, yellow = caution, red = avoid).
            </p>
            {userLocation && (
              <Badge variant="outline" className="gap-1">
                <Navigation className="h-3 w-3" />
                Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Nearby Restaurants</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedRestaurant?.id === restaurant.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedRestaurant(restaurant)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">{restaurant.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {restaurant.cuisine} • {restaurant.price_range}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={getSafetyBadge(restaurant.safety_rating)}>
                      Safety: {restaurant.safety_rating}
                    </Badge>
                    <span className={`text-sm font-medium ${getSafetyColor(restaurant.safety_rating)}`}>
                      {restaurant.topDishes?.length || 0} safe dishes
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedRestaurant && selectedRestaurant.topDishes && selectedRestaurant.topDishes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Top Safe Dishes at {selectedRestaurant.name}</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {selectedRestaurant.topDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} onUpdate={loadRestaurants} />
            ))}
          </div>
        </div>
      )}

      {selectedRestaurant && (!selectedRestaurant.topDishes || selectedRestaurant.topDishes.length === 0) && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center text-center">
              <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No safe dishes found at {selectedRestaurant.name} with your current filters
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
