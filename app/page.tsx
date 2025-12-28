"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { ProfileSidebar } from "@/components/profile-sidebar"
import { ChatTab } from "@/components/tabs/chat-tab"
import { MenusTab } from "@/components/tabs/menus-tab"
import { SearchTab } from "@/components/tabs/search-tab"
import { TrendingTab } from "@/components/tabs/trending-tab"
import { SavedTab } from "@/components/tabs/saved-tab"
import { MapTab } from "@/components/tabs/map-tab"
import { createClient } from "@/lib/supabase/client"

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])
  const [selectedDietTags, setSelectedDietTags] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("trending")
  const supabase = createClient()

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (profile) {
          setSelectedAllergies(profile.allergies || [])
          setSelectedDietTags(profile.diet_tags || [])
        }
      }
    }
    loadProfile()
  }, [supabase])

  const handleFilterChange = (allergies: string[], dietTags: string[]) => {
    setSelectedAllergies(allergies)
    setSelectedDietTags(dietTags)
  }

  return (
    <main className="min-h-screen">
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-balance">Discover Safe Dishes</h1>
            <p className="text-muted-foreground">Find meals that match your dietary needs and allergies</p>
          </div>
          <Button onClick={() => setSidebarOpen(true)} variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {(selectedAllergies.length > 0 || selectedDietTags.length > 0) && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {selectedAllergies.length + selectedDietTags.length}
              </span>
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="menus">Menus</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="space-y-4">
            <TrendingTab allergies={selectedAllergies} dietTags={selectedDietTags} />
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <SearchTab allergies={selectedAllergies} dietTags={selectedDietTags} />
          </TabsContent>

          <TabsContent value="menus" className="space-y-4">
            <MenusTab allergies={selectedAllergies} dietTags={selectedDietTags} />
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <MapTab allergies={selectedAllergies} dietTags={selectedDietTags} />
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <ChatTab allergies={selectedAllergies} dietTags={selectedDietTags} />
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <SavedTab allergies={selectedAllergies} dietTags={selectedDietTags} />
          </TabsContent>
        </Tabs>

        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Disclaimer:</strong> Menu data is sourced from public information and community feedback. Always
            verify ingredients with restaurant staff before ordering if you have severe allergies.
          </p>
        </div>
      </div>

      <ProfileSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        selectedAllergies={selectedAllergies}
        selectedDietTags={selectedDietTags}
        onFilterChange={handleFilterChange}
      />
    </main>
  )
}
