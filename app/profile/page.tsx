"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useUserProfile } from "@/lib/context/UserProfileContext"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  X,
  Plus,
  Check,
  AlertTriangle,
  Leaf,
  ArrowRight,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

const commonAllergies = [
  { name: "Peanuts", icon: "🥜" },
  { name: "Tree Nuts", icon: "🌰" },
  { name: "Milk", icon: "🥛" },
  { name: "Eggs", icon: "🥚" },
  { name: "Wheat", icon: "🌾" },
  { name: "Soy", icon: "🫘" },
  { name: "Fish", icon: "🐟" },
  { name: "Shellfish", icon: "🦐" },
  { name: "Sesame", icon: "🌱" },
  { name: "Gluten", icon: "🍞" },
  { name: "Lactose", icon: "🧀" },
  { name: "Celiac", icon: "⚠️" },
]

const dietaryPreferences = [
  { name: "Vegetarian", icon: "🥬" },
  { name: "Vegan", icon: "🌱" },
  { name: "Pescatarian", icon: "🐟" },
  { name: "Kosher", icon: "✡️" },
  { name: "Halal", icon: "☪️" },
  { name: "Keto", icon: "🥩" },
  { name: "Low FODMAP", icon: "🥕" },
  { name: "Dairy-Free", icon: "🥤" },
]

const severityOptions = [
  { value: "mild", label: "Mild", description: "Minor discomfort", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { value: "moderate", label: "Moderate", description: "Significant reaction", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  { value: "severe", label: "Severe", description: "Anaphylaxis risk", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
] as const

export default function ProfilePage() {
  const { profile, addAllergy, removeAllergy, addDietTag, removeDietTag, updateProfile } = useUserProfile()
  const [customAllergy, setCustomAllergy] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleAddCustomAllergy = () => {
    if (customAllergy.trim()) {
      addAllergy(customAllergy.trim(), "moderate")
      setCustomAllergy("")
      toast({ title: "Allergy added", description: `"${customAllergy}" has been added to your profile.` })
    }
  }

  const handleSeverityChange = (allergy: string, severity: "mild" | "moderate" | "severe") => {
    updateProfile({
      severityLevels: { ...profile.severityLevels, [allergy]: severity },
    })
  }

  const handleComplete = () => {
    updateProfile({ isComplete: true })
    toast({
      title: "Profile saved!",
      description: "Your dietary profile is ready. Start exploring safe dining options!",
    })
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">Your Dietary Profile</h1>
            <p className="text-muted-foreground">
              Tell us about your allergies and dietary needs for personalized recommendations
            </p>
          </div>

          {/* Allergies Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Food Allergies
              </CardTitle>
              <CardDescription>
                Select your allergies. We'll flag dishes that may contain these ingredients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Common allergies grid */}
              <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {commonAllergies.map((allergy) => {
                  const isSelected = profile.allergies.includes(allergy.name)
                  return (
                    <button
                      key={allergy.name}
                      onClick={() =>
                        isSelected ? removeAllergy(allergy.name) : addAllergy(allergy.name, "moderate")
                      }
                      className={cn(
                        "flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-medium transition-all",
                        isSelected
                          ? "border-red-600 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-200"
                          : "border-border hover:border-primary/50 hover:bg-accent"
                      )}
                    >
                      <span className="text-lg">{allergy.icon}</span>
                      {allergy.name}
                      {isSelected && <Check className="ml-auto h-4 w-4" />}
                    </button>
                  )
                })}
              </div>

              {/* Custom allergy input */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustomAllergy()}
                  placeholder="Add custom allergy..."
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button onClick={handleAddCustomAllergy} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected allergies with severity */}
              {profile.allergies.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">Your allergies & severity:</h4>
                  <div className="space-y-2">
                    {profile.allergies.map((allergy) => (
                      <div
                        key={allergy}
                        className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3"
                      >
                        <Badge variant="secondary" className="mr-2">
                          {allergy}
                        </Badge>
                        <div className="flex flex-1 flex-wrap gap-1.5">
                          {severityOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleSeverityChange(allergy, option.value)}
                              className={cn(
                                "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                                profile.severityLevels[allergy] === option.value
                                  ? option.color
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => removeAllergy(allergy)}
                          className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dietary Preferences Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Dietary Preferences
              </CardTitle>
              <CardDescription>
                Optional: Select any dietary lifestyles you follow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {dietaryPreferences.map((pref) => {
                  const isSelected = profile.dietTags.includes(pref.name)
                  return (
                    <button
                      key={pref.name}
                      onClick={() =>
                        isSelected ? removeDietTag(pref.name) : addDietTag(pref.name)
                      }
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all",
                        isSelected
                          ? "border-green-600 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-200"
                          : "border-border hover:border-primary/50 hover:bg-accent"
                      )}
                    >
                      <span>{pref.icon}</span>
                      {pref.name}
                      {isSelected && <Check className="ml-1 h-3.5 w-3.5" />}
                    </button>
                  )
                })}
              </div>

              {/* Selected tags */}
              {profile.dietTags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.dietTags.map((tag) => (
                    <Badge key={tag} variant="default" className="cursor-pointer">
                      {tag}
                      <button
                        onClick={() => removeDietTag(tag)}
                        className="ml-1.5 hover:opacity-70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>
                Anything else restaurants should know about your dietary needs?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={profile.notes}
                onChange={(e) => updateProfile({ notes: e.target.value })}
                placeholder="E.g., 'Cross-contamination is a concern' or 'I carry an EpiPen'..."
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleComplete}
              size="lg"
              className="gap-2"
              disabled={profile.allergies.length === 0 && profile.dietTags.length === 0}
            >
              Save & Start Exploring
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
