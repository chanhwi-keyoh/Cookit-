import './Browser.css';

const DIFFICULTY_ICON = {
  beginner: '○',
  intermediate: '◐',
  ambitious: '●',
};

const DIFFICULTY_LABEL = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  ambitious: 'Ambitious',
};

export default function Browser({
  recipes,
  totalCount,
  selectedRecipeId,
  onSelectRecipe,
}) {
  return (
    <div className="browser">
      <header className="browser__header">
        <h2 className="browser__title">Recipe Drawer</h2>
        <span className="browser__count">
          {recipes.length} / {totalCount}
        </span>
      </header>

      {recipes.length === 0 ? (
        <p className="browser__empty">
          No recipes match your filters yet.
          <br />
          Try loosening them in the right panel.
        </p>
      ) : (
        <ul className="browser__list">
          {recipes.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className={
                  'browser__card' +
                  (r.id === selectedRecipeId ? ' browser__card--active' : '')
                }
                onClick={() => onSelectRecipe(r.id)}
              >
                <div className="browser__card-top">
                  <span className="browser__name">{r.name}</span>
                  <span
                    className="browser__diff"
                    title={DIFFICULTY_LABEL[r.difficulty]}
                  >
                    {DIFFICULTY_ICON[r.difficulty]}
                  </span>
                </div>
                <div className="browser__meta">
                  <span>⏱ {r.time} min</span>
                  <span>${r.cost.toFixed(2)}</span>
                  <span>🍳 {r.timesCooked ?? 0}x</span>
                </div>
                <div className="browser__tags">
                  {r.tags.slice(0, 2).map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
