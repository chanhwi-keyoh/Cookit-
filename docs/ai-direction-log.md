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
