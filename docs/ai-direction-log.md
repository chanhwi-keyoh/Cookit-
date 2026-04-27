# AI Direction Log — "Cooked It!"

Editorial notes on how I worked with Claude to build this app.
These are the decisions *I* made; Claude wrote the code against them.

---

## Entry 1 — Locking the stack and pinning the state architecture

Before I let Claude generate anything, I made it stop and answer two
questions I'd already decided: (1) what framework/tooling, and (2) how
state is owned.

**Stack (locked first):** Vite + React with **JavaScript** (not TypeScript,
not Next.js) and **hardcoded data in `src/data/recipes.js`** (not `fetch`,
not localStorage). The reasoning is pedagogical, not technical. The
assignment is about lifting state and the props-down/events-up pattern.
TypeScript would add a second thing to think about. `fetch` would bring
loading states and async timing into the architecture discussion.
localStorage would hide state mutations I need to see. Every layer I
stripped away made the React state pattern more visible — which is the
whole thing I'm supposed to be learning.

**State architecture (locked second, as a hard rule):** `recipes`,
`selectedRecipeId`, `mealPlan`, and `filters` live as four `useState`
calls in `App.jsx`, and **nothing else holds persistent state**. I also
told Claude what the *derived* values had to be: `filteredRecipes`,
`selectedRecipe`, `weeklyBudget`, `groceryList` — all computed each
render from the four atoms above, never stored.

Stating both of these up front saved a lot of back-and-forth. Claude
didn't have to guess what the architecture should look like; it just had
to write code that honored it.

---

## Entry 2 — Building one component at a time, in a specific order

Claude's first instinct was to generate all three panels at once. I made
it follow this order:

1. `src/data/recipes.js` (data first, so everything downstream has a target)
2. `App.jsx` shell (the state container and empty panels)
3. `Browser` (card grid, proved selection wiring)
4. `DetailView` (proved Browser → Detail interaction)
5. `Controller — Filters` (proved Controller → Browser interaction)
6. `Controller — Meal Plan` (proved budget + grocery derivation)
7. `Controller — "Cooked It!" form` (proved the full state-mutation loop)
8. Visual styling

After each step I clicked around and verified the state flow worked
before moving on. The course brief explicitly says "test the wiring before
the styling" and I held that line.

---

## Entry 3 — Refusing `useContext` and Redux before they came up

The course brief names "useContext/Redux too early" as a common AI failure
mode. So I preempted it. In the plan I gave Claude, I wrote:
*"useState + props only. No useContext, no Redux, no Zustand."*

The component tree is two levels deep (`App` → `Browser`/`DetailView`/`Controller`).
Props work. The fact that the `Controller` now takes nine props (four state
slices, four callbacks, one derived object) looks heavy but is honest — every
prop is a wire the assignment wants me to see. Context would hide them.

---

## Entry 4 — Expanding the recipe library as pure data entry

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

## Entry 5 — Post-deploy refinements: images, prices, copy

After the app was live, three small changes came up across separate
sessions. I'm collapsing them into one entry because they all share the
same shape: **the architecture didn't move, only data and labels did.**

**Images.** I generated 30 PNGs (one per recipe) and dropped them in a
`png/` folder, filenames matching recipe names exactly. I asked Claude
to wire them into Browser thumbnails and DetailView hero. Two decisions
I made that Claude would not have made by default: (1) **no `image`
field on each recipe** — derive the URL from `recipe.name` at render
time, so renaming a recipe never desyncs from a third place; (2) put
PNGs in `public/images/recipes/` with `import.meta.env.BASE_URL`,
**not** Vite's `import.meta.glob`. Glob would have hashed the
filenames. Public keeps them readable in DevTools and works under the
GitHub Pages subpath.

**Prices.** The original cost values ($1.00–$5.00) read as 2015 pricing.
I gave Claude two options: write a unit-price table and recompute every
recipe, or just hand-adjust. I picked hand-adjust. A unit-price table
would have been fake precision — grocery prices vary by region/store/week
and I can't hand-verify a $/g value Claude invents. New range $2.00–$7.00
per serving. I also shifted the Max Cost filter from `Under $3 / Under $5`
to `Under $4 / Under $6`, because under the new range "Under $5" was
"almost everything," and a filter that doesn't filter is wrong.

**Copy.** A classmate playtesting asked, "Is this the list for the recipe
I'm looking at?" — pointing at the Grocery List section. It wasn't. It's
the merged list across the whole week's meal plan. I changed
`Grocery List` → `Weekly Grocery List`. One Edit call. The other option
was to split the section into a per-recipe list inside DetailView and a
weekly list inside Controller — which would have created a second state
flow I didn't need. The lesson I want logged: when a tester is confused,
check whether the **label is lying about scope** before reaching for a
component split.

All three changes were data-only or copy-only. The wire diagram from
Entry 1 is unchanged.
