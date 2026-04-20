import './DetailView.css';

const DIFFICULTY_LABEL = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  ambitious: 'Ambitious',
};

const MOOD_EMOJI = {
  proud: '💪',
  okay: '🙂',
  learning: '📖',
};

const MOOD_LABEL = {
  proud: 'Nailed it',
  okay: 'Decent',
  learning: 'Learning',
};

function Stars({ value }) {
  const full = Math.round(value);
  return (
    <span className="stars" aria-label={`${full} out of 5`}>
      {'★'.repeat(full)}
      <span className="stars__empty">{'★'.repeat(5 - full)}</span>
    </span>
  );
}

export default function DetailView({ recipe }) {
  if (!recipe) {
    return (
      <div className="detail detail--empty">
        <p>Pick a recipe on the left to see the details here.</p>
      </div>
    );
  }

  return (
    <article className="detail">
      {/* ── Top: Recipe Info ─────────────────────────────────────────── */}
      <header className="detail__header">
        <div className="detail__heading">
          <h2 className="detail__name">{recipe.name}</h2>
          <Stars value={recipe.myRating} />
        </div>
        <div className="detail__meta">
          <span>⏱ {recipe.time} min</span>
          <span>· {DIFFICULTY_LABEL[recipe.difficulty]}</span>
          <span>· ${recipe.cost.toFixed(2)}</span>
          <span>· {recipe.servings} serving</span>
        </div>
        <div className="detail__tags">
          {recipe.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      </header>

      <section className="detail__section">
        <h3 className="detail__subtitle">Ingredients</h3>
        <ul className="detail__ingredients">
          {recipe.ingredients.map((ing, i) => (
            <li key={i}>
              <span className="detail__ing-name">{ing.name}</span>
              <span className="detail__ing-qty">
                {ing.qty} {ing.unit}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="detail__section">
        <h3 className="detail__subtitle">Instructions</h3>
        <ol className="detail__steps">
          {recipe.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </section>

      {/* ── Bottom: Cooking Diary ────────────────────────────────────── */}
      <section className="diary">
        <div className="diary__washi" aria-hidden="true" />
        <header className="diary__header">
          <h3 className="diary__title">My Cooking Diary</h3>
          <span className="diary__count">
            Cooked {recipe.timesCooked ?? 0}x
          </span>
        </header>

        {recipe.cookingLog.length === 0 ? (
          <p className="diary__empty">
            You haven't cooked this one yet. Use the "Cooked It!" button on the
            right when you do.
          </p>
        ) : (
          <ul className="diary__list">
            {recipe.cookingLog.map((entry, i) => (
              <li key={i} className="diary__entry">
                <div className="diary__entry-top">
                  <span className="diary__date">{entry.date}</span>
                  <span className="diary__mood" title={MOOD_LABEL[entry.mood]}>
                    {MOOD_EMOJI[entry.mood] ?? '•'} {MOOD_LABEL[entry.mood]}
                  </span>
                </div>
                <p className="diary__note">{entry.note}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
