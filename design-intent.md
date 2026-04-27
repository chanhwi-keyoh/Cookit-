# "Cooked It!" — Design Intent

## Project Overview

A weekly meal planner + cooking diary system for solo-living young adults.
A React app that helps users plan their weekly meals and track their cooking journey — from "I can barely boil water" to "I'm actually getting good at this."

**Core Emotion**: The satisfaction of feeding yourself well, one meal at a time.

**Target User**: Young adults living alone, beginner-to-intermediate cooks, single-serving meals.

---

## Architecture: Browser → Detail → Controller

Three panels sharing a single state object.
No duplicated data across components — props down, events up.

### Browser (Left) — "Recipe Drawer"

A card grid of saved recipes.

Each card shows:
- Recipe name
- Cook time
- Difficulty icon
- Estimated cost
- Times cooked
- 1–2 tags

Role: Reads the recipe array and filter conditions from shared state. Writes selectedRecipe to shared state on click.

### Detail View (Center) — "Recipe + My Notes"

Full info for the selected recipe. This panel should be the richest.

**Top — Recipe Info**:
- Name, cook time, difficulty, estimated cost
- Ingredient list (single serving by default)
- Step-by-step instructions
- Tags (solo meal, fridge cleanout, late night, healthy, etc.)

**Bottom — My Cooking Diary**:
- A log that grows each time you cook this recipe
- Each entry: date + one-line note + mood emoji
- My rating (1–5 stars)
- Total times cooked

Role: Reads selectedRecipe from shared state. Read-only — does not modify state directly.

### Controller (Right) — "This Week's Plan"

Meal planning + filtering + utilities.

**Weekly Meal Grid**:
- Mon–Sun, each day has lunch/dinner slots
- Assign selected recipe from Browser to a specific day/meal
- Shows assigned recipe name, click to remove

**Filter Controls**:
- Cook time (Under 15 min / Under 30 min / All)
- Difficulty (Beginner / Intermediate / Ambitious / All)
- Cost (Under $3 / Under $5 / All)
- Tag select (Solo Meal, Late Night, Healthy, Fridge Cleanout, etc.)

**Utilities**:
- "Weekly Budget Estimate" — auto-sum of assigned recipe costs
- "Grocery List" — merged ingredients from all assigned recipes
- "Cooked It!" button — adds a new diary entry to the selected recipe's cooking log

Role: Reads and writes shared state. Filter change → Browser reacts. Meal assignment → budget/grocery updates. "Cooked It!" → diary entry added + times cooked +1.

---

## Core State Flows (4 Interactions)

1. **Browser click → Detail updates**: Selecting a recipe changes selectedRecipe → Detail View shows that recipe's info + cooking diary
2. **Controller filter → Browser changes**: Changing filter conditions → Browser card grid filters to matching recipes
3. **Controller meal assignment → Auto-calculation**: Assigning a recipe to a day → "Weekly Budget" and "Grocery List" recalculate
4. **"Cooked It!" → Diary entry**: Button click → new cookingLog entry on the selected recipe + timesCooked +1

---

## Data Model (JSON)

```json
{
  "selectedRecipe": "r-03",
  "recipes": [
    {
      "id": "r-03",
      "name": "Egg Fried Rice",
      "time": 15,
      "difficulty": "beginner",
      "cost": 2.50,
      "servings": 1,
      "ingredients": [
        { "name": "Cooked rice", "qty": 1, "unit": "bowl" },
        { "name": "Eggs", "qty": 2, "unit": "pcs" },
        { "name": "Green onion", "qty": 0.5, "unit": "stalk" },
        { "name": "Soy sauce", "qty": 1, "unit": "tbsp" }
      ],
      "steps": [
        "Let the rice cool down",
        "Beat eggs and mix with rice",
        "Chop green onions",
        "Heat oil on high and stir-fry",
        "Drizzle soy sauce to finish"
      ],
      "tags": ["solo meal", "under 15 min", "fridge cleanout"],
      "myRating": 4,
      "cookingLog": [
        {
          "date": "2026-04-10",
          "note": "Swapped green onion for regular onion — even better",
          "mood": "proud"
        },
        {
          "date": "2026-03-28",
          "note": "First attempt. Burned it a little",
          "mood": "learning"
        }
      ]
    }
  ],
  "mealPlan": {
    "mon": { "lunch": null, "dinner": "r-03" },
    "tue": { "lunch": "r-07", "dinner": null },
    "wed": { "lunch": null, "dinner": null },
    "thu": { "lunch": null, "dinner": "r-12" },
    "fri": { "lunch": "r-03", "dinner": null },
    "sat": { "lunch": null, "dinner": null },
    "sun": { "lunch": null, "dinner": null }
  },
  "filters": {
    "maxTime": null,
    "difficulty": "all",
    "maxCost": null,
    "tag": null
  }
}
```

### Difficulty Levels

| Value | Label | Meaning |
|---|---|---|
| beginner | Beginner | If you can boil ramen, you can do this |
| intermediate | Intermediate | Basic knife skills and heat control needed |
| ambitious | Ambitious | For when you've got time and motivation |

### Mood Options

| Value | Meaning |
|---|---|
| proud | Nailed it — turned out great |
| okay | Decent — edible and fine |
| learning | Failed but learned something |

---

## Visual Direction: "My Recipe Notebook"

### Color Palette
- **Background**: Cream/Ivory (#FFF8F0)
- **Primary**: Warm orange-brown (#C4743A, #8B5E3C)
- **Accents**: Mustard (#D4A537), Olive green (#7A8B5E), Salmon pink (#E8967A) — ingredient-inspired tones
- **Text**: Dark brown (#3D2B1F)

### Typography
- **Body**: Clean sans-serif (Pretendard, Noto Sans)
- **Headings / Recipe names**: Rounded or handwritten feel (Gowun Batang, or similar warm serif)

### Component Style
- Rounded corners (border-radius: 12px–16px)
- Soft shadows (subtle box-shadow)
- Notebook-line texture and washi-tape details in the diary section
- Tags as small rounded badges in ingredient-inspired colors

### Overall Mood
A recipe notebook spread open at a cafe.
Organized but not sterile — warm, lived-in, personal.

---

## Solo-Living Features

- Single serving is the default
- Most recipes under 30 minutes
- Cost displayed per serving (USD for class submission; KRW planned for Korean launch)
- "Fridge Cleanout" tag — use up leftover ingredients
- Grocery list — auto-generated from the week's meal plan
- Weekly budget estimate

---

## Sample Recipes (10)

1. **Egg Fried Rice** — 15 min, Beginner, $2.50, [Solo Meal, Fridge Cleanout]
2. **Tuna Mayo Rice Bowl** — 10 min, Beginner, $3.00, [Solo Meal, Under 15 Min]
3. **Kimchi Jjigae (Single Serve)** — 20 min, Intermediate, $3.50, [Solo Meal, Korean]
4. **One-Pan Pasta** — 20 min, Intermediate, $4.00, [Solo Meal, Western]
5. **Toast + Scrambled Eggs** — 10 min, Beginner, $2.00, [Breakfast, Under 15 Min]
6. **Bean Sprout Soup Rice** — 25 min, Intermediate, $2.50, [Hangover, Healthy]
7. **Soy Sauce Egg Rice** — 5 min, Beginner, $1.50, [Solo Meal, Under 15 Min, Fridge Cleanout]
8. **Chicken Breast Salad** — 15 min, Intermediate, $4.50, [Healthy, Diet]
9. **Tteokbokki (Single Serve)** — 20 min, Intermediate, $3.00, [Late Night, Snack]
10. **Cream Risotto** — 30 min, Ambitious, $5.00, [Western, Special Occasion]

---

## ESF Checklist

- [x] Design Intent written (this document)
- [ ] AI Direction Log — 3–5 entries (document during development)
- [ ] Records of Resistance — 3 entries (rejected/revised AI output)
- [ ] Five Questions answered (include in README)
- [ ] Git commit strategy (commit before and after AI sessions)
