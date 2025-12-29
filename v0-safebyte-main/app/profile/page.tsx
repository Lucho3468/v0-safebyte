"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"

const ALLERGENS = ["gluten", "dairy", "eggs", "nuts", "peanuts", "soy", "fish", "shellfish", "sesame", "wheat"]
const DIET_TAGS = ["gluten-free", "dairy-free", "vegan", "vegetarian", "keto", "paleo", "low-carb", "low-fat"]

export default function ProfilePage() {
  const [email, setEmail] = useState("")
  const [allergies, setAllergies] = useState<string[]>([])
  const [dietTags, setDietTags] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      setEmail(user.email || "")

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profile) {
        setAllergies(profile.allergies || [])
        setDietTags(profile.diet_tags || [])
        setNotes(profile.notes || "")
      }
    } catch (error) {
      console.error("[v0] Error loading profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAllergen = (allergen: string) => {
    setAllergies((prev) => (prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]))
  }

  const toggleDietTag = (tag: string) => {
    setDietTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, email: user.email, allergies, diet_tags: dietTags, notes })

      if (error) throw error

      toast({
        title: "Profile saved",
        description: "Your preferences have been updated successfully",
      })
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile & Preferences</h1>
          <p className="text-muted-foreground">Manage your allergies and dietary preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allergens to Avoid</CardTitle>
            <CardDescription>Select all allergens you need to avoid</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {ALLERGENS.map((allergen) => (
                <div key={allergen} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergen-${allergen}`}
                    checked={allergies.includes(allergen)}
                    onCheckedChange={() => toggleAllergen(allergen)}
                  />
                  <label
                    htmlFor={`allergen-${allergen}`}
                    className="text-sm font-medium leading-none capitalize cursor-pointer"
                  >
                    {allergen}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diet Preferences</CardTitle>
            <CardDescription>Select your dietary preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {DIET_TAGS.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`diet-${tag}`}
                    checked={dietTags.includes(tag)}
                    onCheckedChange={() => toggleDietTag(tag)}
                  />
                  <label htmlFor={`diet-${tag}`} className="text-sm font-medium leading-none capitalize cursor-pointer">
                    {tag}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>Any other dietary restrictions or preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., sensitive to MSG, prefer organic ingredients..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
