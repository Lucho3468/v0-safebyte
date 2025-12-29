export interface Dish {
  id: string
  restaurant_id?: string
  restaurantName: string
  name: string
  description: string
  price: number
  calories: number
  allergens: string[]
  free_of: string[]
  ingredients: string[]
  trending_score: number
  community_safe_count: number
  community_issue_count?: number
  safetyScore: number
}
