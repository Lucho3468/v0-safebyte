"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"

export interface UserProfile {
  allergies: string[]
  severityLevels: Record<string, "mild" | "moderate" | "severe">
  dietTags: string[]
  notes: string
  isComplete: boolean
}

interface UserProfileContextType {
  profile: UserProfile
  addAllergy: (allergy: string, severity: "mild" | "moderate" | "severe") => void
  removeAllergy: (allergy: string) => void
  addDietTag: (tag: string) => void
  removeDietTag: (tag: string) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  resetProfile: () => void
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined)

const DEFAULT_PROFILE: UserProfile = {
  allergies: [],
  severityLevels: {},
  dietTags: [],
  notes: "",
  isComplete: false,
}

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("userProfile")
    if (saved) {
      try {
        setProfile(JSON.parse(saved))
      } catch (error) {
        console.error("Failed to load profile:", error)
      }
    }
    setIsHydrated(true)
  }, [])

  // Save to localStorage whenever profile changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("userProfile", JSON.stringify(profile))
    }
  }, [profile, isHydrated])

  const addAllergy = useCallback((allergy: string, severity: "mild" | "moderate" | "severe") => {
    setProfile((prev) => {
      if (prev.allergies.includes(allergy)) return prev
      return {
        ...prev,
        allergies: [...prev.allergies, allergy],
        severityLevels: { ...prev.severityLevels, [allergy]: severity },
      }
    })
  }, [])

  const removeAllergy = useCallback((allergy: string) => {
    setProfile((prev) => {
      const newSeverity = { ...prev.severityLevels }
      delete newSeverity[allergy]
      return {
        ...prev,
        allergies: prev.allergies.filter((a) => a !== allergy),
        severityLevels: newSeverity,
      }
    })
  }, [])

  const addDietTag = useCallback((tag: string) => {
    setProfile((prev) => {
      if (prev.dietTags.includes(tag)) return prev
      return { ...prev, dietTags: [...prev.dietTags, tag] }
    })
  }, [])

  const removeDietTag = useCallback((tag: string) => {
    setProfile((prev) => ({
      ...prev,
      dietTags: prev.dietTags.filter((t) => t !== tag),
    }))
  }, [])

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }))
  }, [])

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE)
    localStorage.removeItem("userProfile")
  }, [])

  const value: UserProfileContextType = {
    profile,
    addAllergy,
    removeAllergy,
    addDietTag,
    removeDietTag,
    updateProfile,
    resetProfile,
  }

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>
}

export function useUserProfile() {
  const context = useContext(UserProfileContext)
  if (context === undefined) {
    throw new Error("useUserProfile must be used within UserProfileProvider")
  }
  return context
}
