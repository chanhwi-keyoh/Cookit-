# AI Direction Log — "Cooked It!"

Editorial notes on how I worked with Claude to build this app.
These are the decisions *I* made; Claude wrote the code against them.

---

## Entry 1 — Locking the stack before touching code

Before I let Claude generate anything, I made it stop and ask me two questions:
(1) what framework/tooling? and (2) how does data enter the app?

I chose **Vite + React with JavaScript** (not TypeScript, not Next.js) and
**hardcoded data in `src/data/recipes.js`** (not `fetch`, not localStorage).

The reasoning is pedagogical, not technical. The assignment is about lifting
state and the props-down/events-up pattern. TypeScript would add a second thing
to think about. `fetch` would bring loading states and async timing into the
architecture discussion. localStorage would hide state mutations I need to see.
Every layer I stripped away made the React state pattern more visible — which
is the whole thing I'm supposed to be learning.

---

## Entry 2 — "All state lives in App.jsx. Period."

I told Claude this as a hard rule before it wrote a single component:
`recipes`, `selectedRecipeId`, `mealPlan`, and `filters` live as four
`useState` calls in `App.jsx`, and nothing else holds persistent state.

I also told it what the *derived* values had to be:
`filteredRecipes`, `selectedRecipe`, `weeklyBudget`, `groceryList` — all
computed each render from the state atoms above. Never stored.

This framing up front saved a lot of back-and-forth. Claude didn't have to
guess what the architecture should look like; it just had to write code that
honored it.

---

## Entry 3 — Building one component at a time, in a specific order

Claude's first instinct was to generate all three panels at once. I made it
follow this order:

1. `src/data/recipes.js` (data first, so everything downstream has a target)
2. `App.jsx` shell (the state container and empty panels)
3. `Browser` (card grid, proved selection wiring)
4. `DetailView` (proved Browser → Detail interaction)
5. `Controller — Filters` (proved Controller → Browser interaction)
6. `Controller — Meal Plan` (proved budget + grocery derivation)
7. `Controller — "Cooked It!" form` (proved the full state-mutation loop)
8. Visual styling

After each step I clicked around and verified the state flow worked before
moving on. The course brief explicitly says "test the wiring before the
styling" and I held that line.

---

## Entry 4 — Refusing `useContext` and Redux before they came up

The course brief names "useContext/Redux too early" as a common AI failure
mode. So I preempted it. In the plan I gave Claude, I wrote:
*"useState + props only. No useContext, no Redux, no Zustand."*

The component tree is two levels deep (`App` → `Browser`/`DetailView`/`Controller`).
Props work. The fact that the `Controller` now takes nine props (four state
slices, four callbacks, one derived object) looks heavy but is honest — every
prop is a wire the assignment wants me to see. Context would hide them.

---

## Entry 5 — Expanding the recipe library as pure data entry

After the base app was working, my instructor-supplied
`additional-recipes.md` added 20 more recipes (r-11 through r-30). I had
Claude convert the markdown tables and step lists into JS objects matching
the schema of recipes 1–10.

This was deliberate in how I scoped it: no new components, no new state, no
new UI. Just data. The app absorbed the 20 new records with zero
architectural change — which I took as a quiet proof that the state shape I
defined up front was the right one. If adding data forces changes to
components, the data model is wrong.

---

## Entry 6 — Adding recipe images without touching state

I generated 30 PNGs (one per recipe) and dropped them in a `png/` folder,
filenames matching recipe names exactly. I asked Claude to wire them into
the Browser (as thumbnails) and the DetailView (as a hero image), and to
let the build/deploy handle them cleanly on GitHub Pages.

Two decisions I made that Claude would not have made by default:

1. **No `image` field on each recipe.** Since the filenames already match
   recipe names, I told Claude to derive the image URL from `recipe.name`
   at render time, not add a new field to every recipe in `recipes.js`.
   The data model stays exactly as it was — 30 recipes, zero schema
   change. If I ever rename a recipe, I rename its PNG; there's no third
   place to update.

2. **`public/images/recipes/` + `import.meta.env.BASE_URL`**, not Vite's
   glob import. Claude's first instinct for bundled assets in a React app
   is `import.meta.glob`, which would have hashed the filenames and
   embedded them in the bundle. That's more "idiomatic" but hides the
   images behind generated URLs. Putting them in `public/` keeps the
   filenames readable on the deployed site — useful when I'm debugging a
   404 in DevTools, and necessary anyway because the repo is served under
   a subpath (`/Cookit-/`) on GitHub Pages.

Images fail silently: both components have an `onError` handler that hides
the broken-image placeholder. No red boxes if a PNG is missing.

This was another "no state added" change. The Browser already knew each
recipe's name through props; it just started rendering an `<img>` next to
the name. The Detail View did the same. The wire diagram from Entry 2 is
unchanged.

---

## Entry 7 — Rebalancing recipe costs by eye, not by formula

The seed data I had Claude write set per-serving costs between $1.00 and
$5.00. Scanning the Browser after deploy, the numbers felt wrong —
Cream Risotto at $5.00, Chicken Salad at $4.50, Avocado Toast at $3.00.
That's 2015 pricing, not 2026.

I gave Claude two options:
1. Write a unit-price table (rice $X/bowl, chicken breast $Y/g …), multiply
   through every recipe, and recompute.
2. Just hand-adjust each of the 30 costs based on what I'd actually pay.

I went with option 2. The assignment doesn't care *how* the numbers were
derived — it cares that they're plausible and that the derived
`weeklyBudget` reacts correctly when I assign meals. A unit-price table
would have been a fake precision: grocery prices vary by region, store,
and week, and I can't hand-verify a $/g value Claude invented for "thinly
sliced beef." Hand-adjusting took five minutes, is transparent, and the
number I put in is the number I stand behind.

I also shifted the Max Cost filter tiers from `Under $3 / Under $5` to
`Under $4 / Under $6`. With the new range, `Under $5` would have been
"almost everything" — which is a filter that doesn't filter.

The state architecture didn't move. This was a data-only change, exactly
like Entry 5 (adding 20 recipes). Another small proof that the schema
from day one holds up.

---

## Entry 8 — Renaming "Grocery List" after playtest feedback

A classmate playtesting the app asked me: "Is this the list for the
recipe I'm looking at?" It was not. It's the merged list across every
meal assigned to the week — the thing you'd actually take shopping.

Two fixes were possible:
1. Move the list into `DetailView` as a per-recipe ingredient roll-up.
2. Leave the list where it is (Controller, weekly scope) and fix the
   label so the scope is visible.

The per-recipe list already exists — it's the Ingredients section in
DetailView. Splitting "grocery" into two lists in two places would be a
worse UX and would also tempt a second state flow I don't need. So I
kept the architecture and changed the copy: `Grocery List` →
`Weekly Grocery List`.

The lesson I wanted to log: when a tester is confused, the first thing
to check is whether the label is lying about scope. Changing the label
was one Edit call. Splitting the component would have been a rewrite. I
had to stop myself from going straight for the rewrite.
