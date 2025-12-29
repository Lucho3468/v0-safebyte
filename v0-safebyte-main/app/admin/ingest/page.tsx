"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface MenuPayload {
  restaurant: {
    name: string
    cuisine: string
    price_range: string
    address?: string
    latitude?: number
    longitude?: number
  }
  menu_items: Array<{
    name: string
    description: string
    price: number
    calories?: number
    allergens: string[]
    free_of: string[]
    ingredients: string[]
  }>
}

export default function AdminIngestPage() {
  const [jsonInput, setJsonInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      // Validate JSON
      let payload: MenuPayload
      try {
        payload = JSON.parse(jsonInput)
      } catch (err) {
        throw new Error("Invalid JSON format")
      }

      // Validate required fields
      if (!payload.restaurant?.name) {
        throw new Error("Restaurant name is required")
      }
      if (!payload.menu_items || !Array.isArray(payload.menu_items)) {
        throw new Error("menu_items must be an array")
      }

      // Check authentication
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("You must be logged in to ingest menus")
      }

      // Insert or update restaurant
      const { data: existingRestaurant } = await supabase
        .from("restaurants")
        .select("id")
        .eq("name", payload.restaurant.name)
        .single()

      let restaurantId: string

      if (existingRestaurant) {
        // Update existing restaurant
        const { data: updated, error: updateError } = await supabase
          .from("restaurants")
          .update({
            cuisine: payload.restaurant.cuisine,
            price_range: payload.restaurant.price_range,
            address: payload.restaurant.address,
            latitude: payload.restaurant.latitude,
            longitude: payload.restaurant.longitude,
            last_updated: new Date().toISOString().split("T")[0],
          })
          .eq("id", existingRestaurant.id)
          .select("id")
          .single()

        if (updateError) throw updateError
        restaurantId = existingRestaurant.id
      } else {
        // Insert new restaurant
        const { data: inserted, error: insertError } = await supabase
          .from("restaurants")
          .insert({
            name: payload.restaurant.name,
            cuisine: payload.restaurant.cuisine,
            price_range: payload.restaurant.price_range,
            address: payload.restaurant.address,
            latitude: payload.restaurant.latitude,
            longitude: payload.restaurant.longitude,
            last_updated: new Date().toISOString().split("T")[0],
          })
          .select("id")
          .single()

        if (insertError) throw insertError
        restaurantId = inserted.id
      }

      // Insert menu items
      const dishesWithRestaurant = payload.menu_items.map((item) => ({
        restaurant_id: restaurantId,
        name: item.name,
        description: item.description || "",
        price: item.price,
        calories: item.calories || null,
        allergens: item.allergens || [],
        free_of: item.free_of || [],
        ingredients: item.ingredients || [],
      }))

      const { error: dishesError } = await supabase.from("dishes").insert(dishesWithRestaurant)

      if (dishesError) throw dishesError

      setResult({
        success: true,
        message: `Successfully ingested ${payload.menu_items.length} dishes for ${payload.restaurant.name}`,
        count: payload.menu_items.length,
      })

      toast({
        title: "Success!",
        description: `Added ${payload.menu_items.length} dishes`,
      })

      setJsonInput("")
    } catch (error: any) {
      console.error("[v0] Error ingesting menu:", error)
      setResult({
        success: false,
        message: error.message || "Failed to ingest menu",
      })
      toast({
        title: "Error",
        description: error.message || "Failed to ingest menu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const examplePayload: MenuPayload = {
    restaurant: {
      name: "Example Restaurant",
      cuisine: "American",
      price_range: "$$",
      address: "123 Main St, San Francisco, CA",
      latitude: 37.7749,
      longitude: -122.4194,
    },
    menu_items: [
      {
        name: "Grilled Chicken Salad",
        description: "Fresh greens with grilled chicken breast",
        price: 14.99,
        calories: 450,
        allergens: [],
        free_of: ["gluten", "dairy", "nuts"],
        ingredients: ["chicken", "lettuce", "tomatoes", "cucumbers", "olive oil"],
      },
      {
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce and mozzarella",
        price: 12.99,
        calories: 850,
        allergens: ["gluten", "dairy"],
        free_of: ["eggs", "nuts", "soy"],
        ingredients: ["flour", "tomato sauce", "mozzarella", "basil"],
      },
    ],
  }

  const loadExample = () => {
    setJsonInput(JSON.stringify(examplePayload, null, 2))
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Ingestion</h1>
          <p className="text-muted-foreground">Add or update restaurant menus in SafeByte</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Menu Data</CardTitle>
            <CardDescription>
              Submit restaurant and menu information in JSON format. Existing restaurants will be updated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIngest} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="json-input">JSON Payload</Label>
                  <Button type="button" variant="outline" size="sm" onClick={loadExample}>
                    Load Example
                  </Button>
                </div>
                <Textarea
                  id="json-input"
                  placeholder="Paste your menu JSON here..."
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>

              {result && (
                <div
                  className={`flex items-start gap-3 rounded-lg border p-4 ${
                    result.success
                      ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                      : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        result.success ? "text-green-900 dark:text-green-100" : "text-red-900 dark:text-red-100"
                      }`}
                    >
                      {result.message}
                    </p>
                    {result.count !== undefined && (
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        {result.count} {result.count === 1 ? "dish" : "dishes"} ingested successfully
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Button type="submit" disabled={isLoading || !jsonInput.trim()} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ingesting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Ingest Menu
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expected JSON Format</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-x-auto p-4 rounded-lg bg-muted">
              {JSON.stringify(
                {
                  restaurant: {
                    name: "string (required)",
                    cuisine: "string (required)",
                    price_range: "'$' | '$$' | '$$$' | '$$$$' (required)",
                    address: "string (optional)",
                    latitude: "number (optional)",
                    longitude: "number (optional)",
                  },
                  menu_items: [
                    {
                      name: "string (required)",
                      description: "string (optional)",
                      price: "number (required)",
                      calories: "number (optional)",
                      allergens: ["string[]"],
                      free_of: ["string[]"],
                      ingredients: ["string[]"],
                    },
                  ],
                },
                null,
                2,
              )}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
