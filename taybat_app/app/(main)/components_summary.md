Home Screen Workflow (Home → Select Meal → Meal Detail)

1) Home Screen (Dashboard + today log)

- Entry: index.tsx
- On mount it initializes all needed data from stores:
  - useUserStore.initializeUser()
  - useUserMealsStore.initializeUserMeals()
  - useMealsStore.initializeMeals()
  - useWeeklyRatingStore.initializeRatings()
- UI flow:
  - Shows header ( HomeHeader ) + commitment card ( CommitmentCard ).
  - CommitmentCard.onAddMeal navigates to Select Meal: router.push('/(main)/select-meal') .
  - If today has logged meals, it renders a list of TodayMealRow . Tapping a row navigates to Meal Detail with mealId .

2) Select Meal Screen (Pick a meal template)

- Entry: select-meal.tsx
- Pulls composed meals from useMealsStore and shows them under 3 RTL-first tabs (breakfast/lunch/dinner).
- Each meal is rendered as a card; tapping it navigates to Meal Detail:
  - router.push({ pathname: '/(main)/meal-detail', params: { mealId: String(meal.id) } })
- Card shows:
  - Zone badge/stars via getZoneMeta(meal.dominant_zone)
  - Ingredient count from meal.meal_item_ids.split(',').length

3) Meal Detail Screen (Ingredients + log to today)

- Entry: meal-detail.tsx
- Loads:

  - Meal template from useMealsStore.getMealById(Number(mealId))
  - Ingredient items by parsing meal.meal_item_ids into numeric IDs and fetching each item via useMealItemsStore.getMealItemById(id)
- Actions:

  - Share uses React Native Share.share(...)
  - Add to today calls useUserMealsStore.logMeal(meal.id) then router.back()
    Logging rules (core behavior)
- Implemented in userMeals.store.ts :

  - Validates user + meal exist
  - Enforces max 3 meals per day ( todayMeals.length >= 3 → returns false + sets error message)
  - Creates a UserMeal with a snapshot of meal.meal_item_ids and zone_summary = meal.dominant_zone
    Key stores involved
- Meals templates: meals.store.ts
- Meal items reference data: mealItems.store.ts
- Daily logs: userMeals.store.ts
