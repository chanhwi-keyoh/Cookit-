import { useState } from 'react';
import { allTags, DAYS, DAY_LABELS, SLOTS } from '../data/recipes.js';
import './Controller.css';

const MOODS = [
  { value: 'proud', emoji: '💪', label: 'Nailed it' },
  { value: 'okay', emoji: '🙂', label: 'Decent' },
  { value: 'learning', emoji: '📖', label: 'Learning' },
];

function nameOf(recipes, id) {
  if (!id) return null;
  return recipes.find((r) => r.id === id)?.name ?? null;
}

export default function Controller({
  filters,
  mealPlan,
  recipes,
  selectedRecipeId,
  selectedRecipe,
  weeklyBudget,
  groceryList,
  onFilterChange,
  onAssignMeal,
  onRemoveMeal,
  onCookedIt,
}) {
  // Local-only UI state (not shared) — the form inputs for "Cooked It!".
  // This is fine: the committed data only enters shared state on submit.
  const [note, setNote] = useState('');
  const [mood, setMood] = useState('proud');

  function handleCookedItSubmit(e) {
    e.preventDefault();
    if (!selectedRecipeId) return;
    onCookedIt(note, mood);
    setNote('');
    setMood('proud');
  }

  return (
    <div className="controller">
      {/* ── Filters ─────────────────────────────────────────────────── */}
      <section className="ctrl-section">
        <h2 className="ctrl-title">Filters</h2>

        <div className="ctrl-row">
          <label className="ctrl-label">Cook time</label>
          <select
            className="ctrl-input"
            value={filters.maxTime ?? 'all'}
            onChange={(e) =>
              onFilterChange(
                'maxTime',
                e.target.value === 'all' ? null : Number(e.target.value)
              )
            }
          >
            <option value="all">Any</option>
            <option value={15}>Under 15 min</option>
            <option value={30}>Under 30 min</option>
          </select>
        </div>

        <div className="ctrl-row">
          <label className="ctrl-label">Difficulty</label>
          <select
            className="ctrl-input"
            value={filters.difficulty}
            onChange={(e) => onFilterChange('difficulty', e.target.value)}
          >
            <option value="all">Any</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="ambitious">Ambitious</option>
          </select>
        </div>

        <div className="ctrl-row">
          <label className="ctrl-label">Max cost</label>
          <select
            className="ctrl-input"
            value={filters.maxCost ?? 'all'}
            onChange={(e) =>
              onFilterChange(
                'maxCost',
                e.target.value === 'all' ? null : Number(e.target.value)
              )
            }
          >
            <option value="all">Any</option>
            <option value={4}>Under $4</option>
            <option value={6}>Under $6</option>
          </select>
        </div>

        <div className="ctrl-row">
          <label className="ctrl-label">Tag</label>
          <select
            className="ctrl-input"
            value={filters.tag ?? 'all'}
            onChange={(e) =>
              onFilterChange('tag', e.target.value === 'all' ? null : e.target.value)
            }
          >
            <option value="all">Any</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* ── Weekly Meal Plan ─────────────────────────────────────────── */}
      <section className="ctrl-section">
        <h2 className="ctrl-title">This Week's Plan</h2>
        <p className="ctrl-hint">
          {selectedRecipe
            ? <>Selected: <strong>{selectedRecipe.name}</strong> — click an empty slot to assign.</>
            : <em>Select a recipe first, then assign it to a day.</em>}
        </p>

        <table className="meal-grid">
          <thead>
            <tr>
              <th></th>
              <th>Lunch</th>
              <th>Dinner</th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day}>
                <th className="meal-grid__day">{DAY_LABELS[day]}</th>
                {SLOTS.map((slot) => {
                  const assignedId = mealPlan[day][slot];
                  const assignedName = nameOf(recipes, assignedId);
                  return (
                    <td key={slot}>
                      {assignedName ? (
                        <button
                          type="button"
                          className="meal-cell meal-cell--filled"
                          onClick={() => onRemoveMeal(day, slot)}
                          title="Click to remove"
                        >
                          {assignedName}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="meal-cell meal-cell--empty"
                          onClick={() => onAssignMeal(day, slot)}
                          disabled={!selectedRecipeId}
                        >
                          + Assign
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ctrl-budget">
          Weekly budget estimate:{' '}
          <strong>${weeklyBudget.toFixed(2)}</strong>
        </div>
      </section>

      {/* ── Grocery List ─────────────────────────────────────────────── */}
      <section className="ctrl-section">
        <h2 className="ctrl-title">Weekly Grocery List</h2>
        {groceryList.length === 0 ? (
          <p className="ctrl-hint">
            <em>Assign meals to the week and the list fills itself.</em>
          </p>
        ) : (
          <ul className="grocery">
            {groceryList.map((g, i) => (
              <li key={i}>
                <span>{g.name}</span>
                <span className="grocery__qty">
                  {g.amounts
                    .map(
                      ({ qty, unit }) =>
                        `${Number.isInteger(qty) ? qty : qty.toFixed(2)} ${unit}`
                    )
                    .join(' + ')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Cooked It! ───────────────────────────────────────────────── */}
      <section className="ctrl-section">
        <h2 className="ctrl-title">Cooked It!</h2>
        <p className="ctrl-hint">
          {selectedRecipe
            ? <>Log today's cook for <strong>{selectedRecipe.name}</strong>.</>
            : <em>Select a recipe to log a cook.</em>}
        </p>
        <form className="cooked-form" onSubmit={handleCookedItSubmit}>
          <textarea
            className="cooked-form__note"
            placeholder="How did it go? e.g. 'Added more gochugaru — better'"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            disabled={!selectedRecipeId}
          />
          <div className="cooked-form__moods">
            {MOODS.map((m) => (
              <label
                key={m.value}
                className={
                  'mood-chip' + (mood === m.value ? ' mood-chip--active' : '')
                }
              >
                <input
                  type="radio"
                  name="mood"
                  value={m.value}
                  checked={mood === m.value}
                  onChange={() => setMood(m.value)}
                  disabled={!selectedRecipeId}
                />
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="cooked-form__submit"
            disabled={!selectedRecipeId}
          >
            🍳 Log this cook
          </button>
        </form>
      </section>
    </div>
  );
}
