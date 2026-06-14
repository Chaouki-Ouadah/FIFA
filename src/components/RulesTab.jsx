import { t } from '../i18n';

const SCORING_ROWS = (lang) => [
  { scenario: lang === 'ar' ? 'الفائز الصحيح (فريق محلي أو ضيف)' : 'Correct winner (home or away)', pts: '+3', type: 'green' },
  { scenario: lang === 'ar' ? 'الفائز الصحيح + فارق الأهداف' : 'Correct winner + correct goal difference', pts: '+5', sub: lang === 'ar' ? 'إجمالي (+3 +2)' : 'total (+3 +2)', type: 'green' },
  { scenario: lang === 'ar' ? 'النتيجة الدقيقة — غير تعادل' : 'Exact score — non-draw', pts: '+10', sub: lang === 'ar' ? 'إجمالي (+3 +2 +5)' : 'total (+3 +2 +5)', type: 'gold' },
  { scenario: lang === 'ar' ? 'توقع تعادل — المباراة تعادلت' : 'Predicted draw — match was draw', pts: '+3', type: 'green' },
  { scenario: lang === 'ar' ? 'النتيجة الدقيقة للتعادل (مثال 1–1)' : 'Exact score — draw (e.g. 1–1 correct)', pts: '+8', sub: lang === 'ar' ? 'إجمالي (+3 +5)' : 'total (+3 +5)', type: 'gold' },
  { scenario: lang === 'ar' ? 'توقع خاطئ' : 'Wrong prediction', pts: '0', type: null },
  { scenario: lang === 'ar' ? 'بطل العالم الصحيح (مرة واحدة)' : 'WC Winner correct (one-time guess)', pts: '+10', type: 'red' },
];

const HOW_TO_AR = [
  { num: '١', title: 'سجّل اسمك', desc: 'اذهب إلى "تنبؤاتي" → اختر اسمك من القائمة، أو أضف اسمك إذا لم يكن موجوداً.' },
  { num: '٢', title: 'تنبأ بنتائج المباريات', desc: 'لكل مباراة قادمة، اختر الفائز (المضيف / تعادل / الضيف) وأدخل النتيجة المتوقعة، ثم احفظ.' },
  { num: '٣', title: 'لا تتأخر', desc: 'تُغلق التنبؤات قبل 10 دقائق من انطلاق المباراة. بعد الإغلاق لا يمكنك تغيير توقعك.' },
  { num: '٤', title: 'توقع بطل العالم', desc: 'لديك تنبؤ واحد فقط لبطل كأس العالم. يجب إدخاله قبل 24 يونيو 2026. إن أصبت تحصل على 10 نقاط إضافية.' },
  { num: '٥', title: 'تابع الترتيب', desc: 'تتحدث النقاط تلقائياً بعد انتهاء كل مباراة. تُحتسب فقط المباريات من 14 يونيو 2026.' },
  { num: '٦', title: 'نظام النقاط', desc: 'الفائز الصحيح = 3 نقاط → فرق الأهداف = 5 نقاط → النتيجة الدقيقة = 10 نقاط. التعادل الصحيح = 3، النتيجة الدقيقة للتعادل = 8 نقاط.' },
];

const HOW_TO_EN = [
  { num: '01', title: 'Pick your player', desc: 'Go to My Picks → select your name from the dropdown. Your picks are saved to your profile.' },
  { num: '02', title: 'Predict match results', desc: 'For each upcoming match, pick the winner (Home / Draw / Away) and optionally enter a score. Save before kickoff.' },
  { num: '03', title: 'Beat the deadline', desc: 'Picks lock 10 minutes before kickoff. After that you cannot change your prediction for that match.' },
  { num: '04', title: 'World Cup winner guess', desc: 'Make your one-time WC winner prediction before June 24, 2026. Worth +10 bonus points if correct.' },
  { num: '05', title: 'Track the leaderboard', desc: 'Points update automatically as matches finish. Only matches from June 14, 2026 onward count toward the leaderboard.' },
  { num: '06', title: 'Score as much as you can', desc: 'Points stack: correct winner (+3) → correct goal diff (+5 total) → exact score (+10 total). Draws: correct (+3) → exact draw score (+8 total).' },
];

export default function RulesTab({ lang }) {
  const isAr = lang === 'ar';
  const howTo = isAr ? HOW_TO_AR : HOW_TO_EN;

  return (
    <div>
      {/* Scoring table */}
      <div className="rules-section">
        <h2 style={isAr ? { direction: 'rtl', fontFamily: 'var(--font-body)', letterSpacing: 0 } : {}}>
          {t('rules_scoring', lang)}
        </h2>
        <div className="card">
          <table className="scoring-table">
            <thead>
              <tr>
                <th style={isAr ? { textAlign: 'right' } : {}}>{t('scenario', lang)}</th>
                <th style={isAr ? { textAlign: 'right' } : {}}>{t('points', lang)}</th>
              </tr>
            </thead>
            <tbody>
              {SCORING_ROWS(lang).map(r => (
                <tr key={r.scenario}>
                  <td style={isAr ? { direction: 'rtl', textAlign: 'right' } : {}}>{r.scenario}</td>
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
        <h2 style={isAr ? { direction: 'rtl', fontFamily: 'var(--font-body)', letterSpacing: 0 } : {}}>
          {t('rules_stacking', lang)}
        </h2>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <StackRow label={isAr ? 'فوز (غير تعادل)' : 'Non-draw win'} steps={['+3 winner', '+2 goal diff', '+5 exact']} total="10" />
          <StackRow label={isAr ? 'تعادل' : 'Draw'} steps={['+3 correct draw', '+5 exact score']} total="8" color="var(--accent-2)" />
          <StackRow label={isAr ? 'بطل العالم' : 'WC Winner'} steps={['+10 one-time bonus']} total="10" color="var(--accent-gold)" />
        </div>
      </div>

      {/* How to play — Arabic or English */}
      <div className="rules-section">
        <h2 style={isAr ? { direction: 'rtl', fontFamily: 'var(--font-body)', letterSpacing: 0 } : {}}>
          {t('rules_how', lang)}
        </h2>
        <ul className="how-to-list" dir={isAr ? 'rtl' : 'ltr'}>
          {howTo.map(h => (
            <li key={h.num} className="how-to-item" style={isAr ? { flexDirection: 'row-reverse', textAlign: 'right' } : {}}>
              <span className="how-to-num" style={isAr ? { fontFamily: 'var(--font-body)', minWidth: 28 } : {}}>{h.num}</span>
              <div className="how-to-text">
                <strong>{h.title}</strong>
                <span>{h.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Key dates */}
      <div className="rules-section">
        <h2 style={isAr ? { direction: 'rtl', fontFamily: 'var(--font-body)', letterSpacing: 0 } : {}}>
          {t('rules_dates', lang)}
        </h2>
        <div className="card">
          {[
            ['date_cutoff', 'date_cutoff_v'],
            ['date_lock',   'date_lock_v'],
            ['date_wc',     'date_wc_v'],
            ['date_end',    'date_end_v'],
          ].map(([lk, vk]) => (
            <div key={lk} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '9px 0', borderBottom: '1px solid var(--border)',
              flexDirection: isAr ? 'row-reverse' : 'row',
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', direction: isAr ? 'rtl' : 'ltr' }}>{t(lk, lang)}</span>
              <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--accent)' }}>{t(vk, lang)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Late joiner notice */}
      <div className="late-joiner-banner">
        <div className="late-joiner-icon">🎲</div>
        <div>
          {isAr ? (
            <>
              <strong style={{ display: 'block', marginBottom: 4, direction: 'rtl' }}>انضممت متأخراً؟ لا مشكلة!</strong>
              <span style={{ direction: 'rtl', display: 'block' }}>
                ستُسند إليك تلقائياً توقعات أحد المشاركين بشكل عشوائي عن المباريات التي فاتتك، حتى لا تبدأ من الصفر.
              </span>
            </>
          ) : (
            <>
              <strong style={{ display: 'block', marginBottom: 4 }}>Joined late? No worries!</strong>
              <span>
                Any matches you missed will be automatically filled with a random participant's predictions — so you don't start from zero.
              </span>
            </>
          )}
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
