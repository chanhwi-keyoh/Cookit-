# Records of Resistance — "Cooked It!"

Three moments where I rejected or significantly revised what Claude produced.
The course calls these "opportunities, not mistakes." Documenting them honestly.

---

## Resistance 1 — Refusing to store `filteredRecipes` as state

**What Claude reached for:** When wiring up the filter controls, there was a
natural path where `filteredRecipes` becomes its own `useState` and every
filter-change callback has to remember to recompute it.

**Why I rejected it:** That's two sources of truth. The "truth" about which
recipes match the filter is a pure function of `recipes` and `filters` — no
extra information exists. Storing it would mean every `onFilterChange` has
to update two things, and if one update path is ever added without the other,
the lists silently drift apart. This is the exact "duplicated state" failure
mode the course calls out as #1.

**What I did instead:** `filteredRecipes` is computed inline in `App.jsx`
every render:

```js
const filteredRecipes = recipes.filter((r) => matchesFilters(r, filters));
```

No storage, no drift. Same pattern applied to `selectedRecipe`,
`weeklyBudget`, and `groceryList`.

---

## Resistance 2 — No `useContext` despite a long prop list

**What Claude (and the prop list) tempted me toward:** `Controller` now
takes nine props:

```js
filters, mealPlan, recipes, selectedRecipeId, selectedRecipe,
weeklyBudget, groceryList,
onFilterChange, onAssignMeal, onRemoveMeal, onCookedIt
```

That's visually heavy. The idiomatic React move when a prop list swells is
to wrap the subtree in a Context provider. Claude didn't suggest it outright
but the shape of the code asks for it.

**Why I rejected it:** The component tree is *two levels deep*. App →
Controller. There is no intermediate component that would otherwise have to
pass these props through. Context here would not eliminate prop drilling; it
would hide an API that's supposed to be visible. The course brief is
explicit: "useContext/Redux too early" is an AI failure mode.

**What I did instead:** Kept the full prop list. Every wire shows, which is
the whole pedagogical point. When I can defend every prop in `Controller`'s
signature, I've demonstrated I understand what the component depends on —
which Context would let me fudge.

---

## Resistance 3 — Styling last, not first

**What Claude wanted to do:** Early in component generation, Claude produced
cards and panels with fairly elaborate CSS (shadows, hover states, tag
badges, typography) in the same commit as the initial render logic. It's the
path of least resistance for an LLM — text output is cheap and CSS makes
things look done.

**Why I rejected it:** The course brief is direct about this: *"Test the
wiring before the styling. [...] If yes, then add visual polish. If no, the
architecture is broken and no amount of CSS will fix it."* Pretty CSS on
broken state management is exactly the artifact ESF is trying to prevent.

**What I did instead:** Ripped the visual flourishes out of early components
and held them until step 9 of my build plan, after all four state flows were
verified working. When I did apply styling, I knew the app worked; the
palette, washi-tape diary accent, rounded cards, and notebook-paper lines
were decisions about *presentation*, not *function*. If I'd styled first,
every design decision would have been contaminated by "does this still
work?" anxiety.
