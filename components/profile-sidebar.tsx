"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface ProfileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedAllergies: string[]
  selectedDietTags: string[]
  onFilterChange: (allergies: string[], dietTags: string[]) => void
}

const ALLERGENS = ["gluten", "dairy", "eggs", "nuts", "peanuts", "soy", "fish", "shellfish", "sesame", "wheat"]

const DIET_TAGS = ["gluten-free", "dairy-free", "vegan", "vegetarian", "keto", "paleo", "low-carb", "low-fat"]

export function ProfileSidebar({
  open,
  onOpenChange,
  selectedAllergies,
  selectedDietTags,
  onFilterChange,
}: ProfileSidebarProps) {
  const [allergies, setAllergies] = useState<string[]>(selectedAllergies)
  const [dietTags, setDietTags] = useState<string[]>(selectedDietTags)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    setAllergies(selectedAllergies)
    setDietTags(selectedDietTags)
  }, [selectedAllergies, selectedDietTags])

  const toggleAllergen = (allergen: string) => {
    setAllergies((prev) => (prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]))
  }

  const toggleDietTag = (tag: string) => {
    setDietTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleSave = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        onFilterChange(allergies, dietTags)
        onOpenChange(false)
        return
      }

      await supabase.from("profiles").upsert({ id: user.id, allergies, diet_tags: dietTags, email: user.email })

      onFilterChange(allergies, dietTags)
      onOpenChange(false)
      toast({ title: "Profile saved", description: "Your allergy and diet preferences have been updated" })
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
      toast({ title: "Error", description: "Failed to save profile", variant: "destructive" })
    }
  }

  const handleClear = () => {
    setAllergies([])
    setDietTags([])
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Allergy & Diet Profile</SheetTitle>
          <SheetDescription>Select your allergies and dietary preferences to filter dishes</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Allergens to Avoid</Label>
              {allergies.length > 0 && <Badge variant="secondary">{allergies.length} selected</Badge>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ALLERGENS.map((allergen) => (
                <div key={allergen} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergen-${allergen}`}
                    checked={allergies.includes(allergen)}
                    onCheckedChange={() => toggleAllergen(allergen)}
                  />
                  <label
                    htmlFor={`allergen-${allergen}`}
                    className="text-sm font-medium leading-none capitalize cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {allergen}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Diet Preferences</Label>
              {dietTags.length > 0 && <Badge variant="secondary">{dietTags.length} selected</Badge>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {DIET_TAGS.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`diet-${tag}`}
                    checked={dietTags.includes(tag)}
                    onCheckedChange={() => toggleDietTag(tag)}
                  />
                  <label
                    htmlFor={`diet-${tag}`}
                    className="text-sm font-medium leading-none capitalize cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {tag}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {(allergies.length > 0 || dietTags.length > 0) && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergen) => (
                  <Badge key={allergen} variant="destructive" className="capitalize">
                    {allergen}
                    <button onClick={() => toggleAllergen(allergen)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {dietTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="capitalize">
                    {tag}
                    <button onClick={() => toggleDietTag(tag)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={handleClear} variant="outline" className="flex-1 bg-transparent">
              Clear All
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save & Apply
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
