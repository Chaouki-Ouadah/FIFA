import { t } from '../i18n';

export default function TabNav({ activeTab, onTabChange, lang }) {
  const TABS = [
    { id: 'groups', label: t('tab_groups', lang) },
    { id: 'leaderboard', label: t('tab_leaderboard', lang) },
    { id: 'picks', label: t('tab_picks', lang) },
    { id: 'rules', label: t('tab_rules', lang) },
  ];

  return (
    <nav className="tab-nav">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
