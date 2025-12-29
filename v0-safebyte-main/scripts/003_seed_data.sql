-- Seed data for SafeByte
-- Adds sample restaurants and dishes for testing

-- Insert restaurants
insert into public.restaurants (id, name, cuisine, price_range, address, latitude, longitude, community_verified, safety_rating) values
  ('550e8400-e29b-41d4-a716-446655440001', 'Chipotle Mexican Grill', 'Mexican', '$$', '123 Main St, San Francisco, CA', 37.7749, -122.4194, true, 92),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sweetgreen', 'Salads', '$$', '456 Market St, San Francisco, CA', 37.7899, -122.4014, true, 95),
  ('550e8400-e29b-41d4-a716-446655440003', 'True Food Kitchen', 'American', '$$$', '789 Valencia St, San Francisco, CA', 37.7599, -122.4213, true, 94)
on conflict (id) do nothing;

-- Insert dishes for Chipotle
insert into public.dishes (restaurant_id, name, description, price, calories, allergens, free_of, ingredients, trending_score, community_safe_count, safety_score) values
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Chicken Bowl',
    'Grilled chicken with cilantro-lime rice, black beans, fajita veggies, fresh tomato salsa, and romaine lettuce',
    10.75,
    625,
    '{}',
    '{gluten, dairy, eggs, nuts, soy, fish, shellfish}',
    '{chicken, rice, black beans, bell peppers, onions, tomatoes, lettuce, cilantro, lime}',
    88,
    42,
    95
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Veggie Bowl',
    'Sofritas (spicy tofu) with brown rice, pinto beans, fajita veggies, corn salsa, and guacamole',
    9.95,
    580,
    '{soy}',
    '{gluten, dairy, eggs, nuts, fish, shellfish}',
    '{tofu, rice, pinto beans, bell peppers, onions, corn, avocado, lime}',
    75,
    35,
    93
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Steak Burrito',
    'Grilled steak wrapped in a flour tortilla with white rice, black beans, cheese, sour cream, and salsa',
    12.95,
    950,
    '{gluten, dairy}',
    '{eggs, nuts, soy, fish, shellfish}',
    '{steak, flour tortilla, rice, black beans, cheese, sour cream, tomatoes, lettuce}',
    92,
    55,
    88
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Carnitas Tacos',
    'Three soft corn tortillas with braised pork, cilantro, onions, and lime',
    11.25,
    720,
    '{}',
    '{gluten, dairy, eggs, nuts, soy, fish, shellfish}',
    '{pork, corn tortillas, cilantro, onions, lime}',
    80,
    38,
    94
  );

-- Insert dishes for Sweetgreen
insert into public.dishes (restaurant_id, name, description, price, calories, allergens, free_of, ingredients, trending_score, community_safe_count, safety_score) values
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Harvest Bowl',
    'Organic wild rice, roasted chicken, apples, goat cheese, almonds, and balsamic vinaigrette',
    13.95,
    510,
    '{dairy, nuts}',
    '{gluten, eggs, soy, fish, shellfish}',
    '{wild rice, chicken, apples, goat cheese, almonds, spinach, balsamic vinegar}',
    95,
    68,
    91
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Kale Caesar',
    'Chopped kale, shaved parmesan, house-made caesar dressing, and breadcrumbs',
    11.50,
    420,
    '{gluten, dairy, eggs, fish}',
    '{nuts, soy, shellfish}',
    '{kale, parmesan, bread crumbs, anchovies, lemon, garlic}',
    82,
    45,
    87
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Guacamole Greens',
    'Organic mesclun, avocado, roasted chicken, tomatoes, and lime cilantro jalapeño vinaigrette',
    12.95,
    480,
    '{}',
    '{gluten, dairy, eggs, nuts, soy, fish, shellfish}',
    '{mixed greens, avocado, chicken, tomatoes, red onions, cilantro, lime, jalapeño}',
    90,
    72,
    97
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Shroomami Bowl',
    'Warm quinoa, roasted tofu, roasted mushrooms, and miso sesame ginger dressing',
    12.50,
    530,
    '{soy, sesame}',
    '{gluten, dairy, eggs, nuts, fish, shellfish}',
    '{quinoa, tofu, shiitake mushrooms, kale, cabbage, miso, sesame, ginger}',
    78,
    40,
    89
  );

-- Insert dishes for True Food Kitchen
insert into public.dishes (restaurant_id, name, description, price, calories, allergens, free_of, ingredients, trending_score, community_safe_count, safety_score) values
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Grilled Sustainable Fish',
    'Wild-caught sustainable fish with ancient grains, seasonal vegetables, and lemon herb sauce',
    24.95,
    580,
    '{fish}',
    '{gluten, dairy, eggs, nuts, soy, shellfish}',
    '{mahi-mahi, quinoa, farro, broccoli, carrots, lemon, herbs}',
    85,
    50,
    92
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Organic Chicken Bowl',
    'Antibiotic-free chicken breast with organic greens, sweet potato, avocado, and tahini dressing',
    18.95,
    620,
    '{sesame}',
    '{gluten, dairy, eggs, nuts, soy, fish, shellfish}',
    '{chicken, kale, sweet potato, avocado, tahini, lemon}',
    88,
    58,
    94
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Ancient Grains Bowl',
    'Organic quinoa and farro with roasted vegetables, chickpeas, and turmeric vinaigrette',
    16.95,
    520,
    '{}',
    '{gluten, dairy, eggs, nuts, soy, fish, shellfish, sesame}',
    '{quinoa, farro, chickpeas, brussels sprouts, butternut squash, turmeric, olive oil}',
    76,
    44,
    95
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Teriyaki Quinoa Bowl',
    'Organic quinoa with edamame, shiitake mushrooms, snap peas, and house-made teriyaki sauce',
    17.50,
    490,
    '{soy, sesame}',
    '{gluten, dairy, eggs, nuts, fish, shellfish}',
    '{quinoa, edamame, shiitake mushrooms, snap peas, carrots, sesame seeds, soy sauce}',
    80,
    36,
    90
  );
