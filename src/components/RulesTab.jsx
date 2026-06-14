const SCORING_ROWS = [
  { scenario: 'Correct winner (home or away)', pts: '+3', type: 'green' },
  { scenario: 'Correct winner + correct goal difference', pts: '+5', sub: 'total (+3 +2)', type: 'green' },
  { scenario: 'Exact score — non-draw', pts: '+10', sub: 'total (+3 +2 +5)', type: 'gold' },
  { scenario: 'Predicted draw — match was draw', pts: '+3', type: 'green' },
  { scenario: 'Exact score — draw (e.g. 1–1 correct)', pts: '+8', sub: 'total (+3 +5)', type: 'gold' },
  { scenario: 'Wrong prediction', pts: '0', type: null },
  { scenario: 'WC Winner correct (one-time guess)', pts: '+10', type: 'red' },
];

const HOW_TO_AR = [
  {
    num: '١',
    title: 'سجّل اسمك',
    desc: 'اذهب إلى "تنبؤاتي" → اختر اسمك من القائمة، أو أضف اسمك إذا لم يكن موجوداً.',
  },
  {
    num: '٢',
    title: 'تنبأ بنتائج المباريات',
    desc: 'لكل مباراة قادمة، اختر الفائز (الفريق المضيف / تعادل / الفريق الضيف) وأدخل النتيجة المتوقعة، ثم احفظ.',
  },
  {
    num: '٣',
    title: 'لا تتأخر',
    desc: 'تُغلق التنبؤات قبل 10 دقائق من انطلاق المباراة. بعد الإغلاق لا يمكنك تغيير توقعك.',
  },
  {
    num: '٤',
    title: 'توقع بطل العالم',
    desc: 'لديك تنبؤ واحد فقط لبطل كأس العالم. يجب إدخاله قبل 24 يونيو 2026. إن أصبت تحصل على 10 نقاط إضافية.',
  },
  {
    num: '٥',
    title: 'تابع الترتيب',
    desc: 'تتحدث النقاط تلقائياً بعد انتهاء كل مباراة. تُحتسب فقط المباريات من 14 يونيو 2026.',
  },
  {
    num: '٦',
    title: 'نظام النقاط',
    desc: 'الفائز الصحيح = 3 نقاط → فرق الأهداف صحيح = 5 نقاط → النتيجة الدقيقة = 10 نقاط. التعادل الصحيح = 3 نقاط، النتيجة الدقيقة للتعادل = 8 نقاط.',
  },
];

const HOW_TO = [
  {
    num: '01',
    title: 'Pick your player',
    desc: 'Go to My Picks → select your name from the dropdown. Your picks are saved to your profile.',
  },
  {
    num: '02',
    title: 'Predict match results',
    desc: 'For each upcoming match, pick the winner (Home / Draw / Away) and optionally enter a score. Save before kickoff.',
  },
  {
    num: '03',
    title: 'Beat the deadline',
    desc: 'Picks lock 10 minutes before kickoff. After that you cannot change your prediction for that match.',
  },
  {
    num: '04',
    title: 'World Cup winner guess',
    desc: 'Make your one-time WC winner prediction before June 24, 2026. Worth +10 bonus points if correct.',
  },
  {
    num: '05',
    title: 'Track the leaderboard',
    desc: 'Points update automatically as matches finish. Only matches from June 14, 2026 onward count toward the leaderboard.',
  },
  {
    num: '06',
    title: 'Score as much as you can',
    desc: 'Points stack: correct winner (+3) → correct goal diff (+5 total) → exact score (+10 total). Draws: correct (+3) → exact draw score (+8 total).',
  },
];

export default function RulesTab() {
  return (
    <div>
      {/* Scoring Rules */}
      <div className="rules-section">
        <h2>Scoring Rules</h2>
        <div className="card">
          <table className="scoring-table">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {SCORING_ROWS.map(r => (
                <tr key={r.scenario}>
                  <td>{r.scenario}</td>
                  <td>
                    <span className={`pts-badge${r.type ? ` ${r.type}` : ''}`}>{r.pts}</span>
                    {r.sub && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 8 }}>{r.sub}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stacking explainer */}
      <div className="rules-section">
        <h2>How Points Stack</h2>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <StackRow label="Non-draw win" steps={['+3 winner', '+2 goal diff', '+5 exact']} total="10" />
          <StackRow label="Draw" steps={['+3 correct draw', '+5 exact score']} total="8" color="var(--accent-2)" />
          <StackRow label="WC Winner" steps={['+10 one-time bonus']} total="10" color="var(--accent-gold)" />
        </div>
      </div>

      {/* Arabic how-to */}
      <div className="rules-section">
        <h2 dir="rtl" style={{ fontFamily: 'var(--font-body)', letterSpacing: 0 }}>كيفية المشاركة</h2>
        <ul className="how-to-list" dir="rtl">
          {HOW_TO_AR.map(h => (
            <li key={h.num} className="how-to-item" style={{ flexDirection: 'row-reverse', textAlign: 'right' }}>
              <span className="how-to-num" style={{ fontFamily: 'var(--font-body)', minWidth: 28 }}>{h.num}</span>
              <div className="how-to-text">
                <strong>{h.title}</strong>
                <span>{h.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* How to use — English */}
      <div className="rules-section">
        <h2>How to Play</h2>
        <ul className="how-to-list">
          {HOW_TO.map(h => (
            <li key={h.num} className="how-to-item">
              <span className="how-to-num">{h.num}</span>
              <div className="how-to-text">
                <strong>{h.title}</strong>
                <span>{h.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Deadlines */}
      <div className="rules-section">
        <h2>Key Dates</h2>
        <div className="card">
          {[
            { label: 'Competition start (leaderboard cutoff)', value: 'June 14, 2026' },
            { label: 'Pick lock per match', value: '10 minutes before kickoff' },
            { label: 'WC winner prediction deadline', value: 'June 24, 2026' },
            { label: 'Tournament end', value: 'July 19, 2026' },
          ].map(d => (
            <div key={d.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '9px 0', borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{d.label}</span>
              <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--accent)' }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StackRow({ label, steps, total, color = 'var(--accent)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', minWidth: 90, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
        {steps.map((s, i) => (
          <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', fontSize: '0.78rem', color: 'var(--text)' }}>{s}</span>
            {i < steps.length - 1 && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>→</span>}
          </span>
        ))}
        <span style={{ marginLeft: 4, fontFamily: 'var(--font-heading)', fontWeight: 700, color, fontSize: '1rem' }}>= {total} pts</span>
      </div>
    </div>
  );
}
