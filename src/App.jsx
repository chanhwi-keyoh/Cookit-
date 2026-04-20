import { useState } from 'react';
import Browser from './components/Browser.jsx';
import DetailView from './components/DetailView.jsx';
import Controller from './components/Controller.jsx';
import {
  initialRecipes,
  initialMealPlan,
  initialFilters,
  DAYS,
  SLOTS,
} from './data/recipes.js';
import './App.css';

// ────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH
// All state lives here, in App. Browser / DetailView / Controller receive data
// as props and send changes back up via callbacks. No child holds its own copy.
// ────────────────────────────────────────────────────────────────────────────

function matchesFilters(recipe, filters) {
  if (filters.maxTime != null && recipe.time > filters.maxTime) return false;
  if (filters.difficulty !== 'all' && recipe.difficulty !== filters.difficulty) return false;
  if (filters.maxCost != null && recipe.cost > filters.maxCost) return false;
  if (filters.tag && !recipe.tags.includes(filters.tag)) return false;
  return true;
}

function sumAssignedCosts(mealPlan, recipes) {
  let total = 0;
  for (const day of DAYS) {
    for (const slot of SLOTS) {
      const id = mealPlan[day][slot];
      if (!id) continue;
      const r = recipes.find((x) => x.id === id);
      if (r) total += r.cost;
    }
  }
  return total;
}

function mergeIngredients(mealPlan, recipes) {
  // Group by ingredient name (case/whitespace-insensitive). Within each
  // group, sum quantities per unit. Mixed units stay separate line items
  // *inside* the same ingredient row — e.g. "Sugar: 2 tbsp + 2 tsp" —
  // so we never fake a unit conversion we can't guarantee.
  const byName = new Map(); // nameKey -> { displayName, units: Map<unit, qty> }
  for (const day of DAYS) {
    for (const slot of SLOTS) {
      const id = mealPlan[day][slot];
      if (!id) continue;
      const r = recipes.find((x) => x.id === id);
      if (!r) continue;
      for (const ing of r.ingredients) {
        const nameKey = ing.name.trim().toLowerCase();
        if (!byName.has(nameKey)) {
          byName.set(nameKey, {
            displayName: ing.name.trim(),
            units: new Map(),
          });
        }
        const entry = byName.get(nameKey);
        entry.units.set(ing.unit, (entry.units.get(ing.unit) ?? 0) + ing.qty);
      }
    }
  }
  return Array.from(byName.values())
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((entry) => ({
      name: entry.displayName,
      amounts: Array.from(entry.units.entries()).map(([unit, qty]) => ({
        unit,
        qty,
      })),
    }));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [selectedRecipeId, setSelectedRecipeId] = useState(initialRecipes[0].id);
  const [mealPlan, setMealPlan] = useState(initialMealPlan);
  const [filters, setFilters] = useState(initialFilters);

  // Derived values — computed each render, never stored in state.
  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId) ?? null;
  const filteredRecipes = recipes.filter((r) => matchesFilters(r, filters));
  const weeklyBudget = sumAssignedCosts(mealPlan, recipes);
  const groceryList = mergeIngredients(mealPlan, recipes);

  // ── Callbacks (events up) ────────────────────────────────────────────────

  function handleSelectRecipe(id) {
    setSelectedRecipeId(id);
  }

  function handleFilterChange(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function handleAssignMeal(day, slot) {
    if (!selectedRecipeId) return;
    setMealPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], [slot]: selectedRecipeId },
    }));
  }

  function handleRemoveMeal(day, slot) {
    setMealPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], [slot]: null },
    }));
  }

  function handleCookedIt(note, mood) {
    if (!selectedRecipeId) return;
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === selectedRecipeId
          ? {
              ...r,
              timesCooked: (r.timesCooked ?? 0) + 1,
              cookingLog: [
                { date: todayISO(), note: note || '(no note)', mood },
                ...r.cookingLog,
              ],
            }
          : r
      )
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Cooked It!</h1>
        <p className="app__subtitle">
          Plan the week. Cook the meal. Write it down.
        </p>
      </header>

      <main className="app__grid">
        <aside className="panel panel--browser">
          <Browser
            recipes={filteredRecipes}
            totalCount={recipes.length}
            selectedRecipeId={selectedRecipeId}
            onSelectRecipe={handleSelectRecipe}
          />
        </aside>

        <section className="panel panel--detail">
          <DetailView recipe={selectedRecipe} />
        </section>

        <aside className="panel panel--controller">
          <Controller
            filters={filters}
            mealPlan={mealPlan}
            recipes={recipes}
            selectedRecipeId={selectedRecipeId}
            selectedRecipe={selectedRecipe}
            weeklyBudget={weeklyBudget}
            groceryList={groceryList}
            onFilterChange={handleFilterChange}
            onAssignMeal={handleAssignMeal}
            onRemoveMeal={handleRemoveMeal}
            onCookedIt={handleCookedIt}
          />
        </aside>
      </main>
    </div>
  );
}
