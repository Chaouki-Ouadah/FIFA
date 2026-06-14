const TABS = [
  { id: 'groups', label: 'Groups & Fixtures' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'picks', label: 'My Picks' },
];

export default function TabNav({ activeTab, onTabChange }) {
  return (
    <nav className="tab-nav">
      {TABS.map(t => (
        <button
          key={t.id}
          className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
          onClick={() => onTabChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
