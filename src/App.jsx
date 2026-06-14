import { useState, useEffect } from 'react';
import TabNav from './components/TabNav';
import GroupsTab from './components/GroupsTab';
import LeaderboardTab from './components/LeaderboardTab';
import MyPicksTab from './components/MyPicksTab';
import RulesTab from './components/RulesTab';
import { getPlayers } from './firebase';
import { fetchMatches } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('groups');
  const [players, setPlayers] = useState([]);
  const [activePlayer, setActivePlayer] = useState(
    () => localStorage.getItem('wc_activePlayer') || ''
  );
  const [matches, setMatches] = useState([]);
  const [matchError, setMatchError] = useState(null);
  const [lang, setLang] = useState(
    () => localStorage.getItem('wc_lang') || 'en'
  );

  useEffect(() => {
    getPlayers().then(setPlayers).catch(console.error);
  }, []);

  useEffect(() => {
    let timer = null;
    let cancelled = false;

    async function load() {
      if (cancelled) return;
      try {
        const m = await fetchMatches();
        if (!cancelled) {
          setMatches(m);
          setMatchError(null);
          const isLive = m.some(x => x.status === 'IN_PLAY' || x.status === 'PAUSED');
          timer = setTimeout(load, isLive ? 60_000 : 300_000);
        }
      } catch (e) {
        if (!cancelled) {
          setMatchError(e.message);
          timer = setTimeout(load, 300_000);
        }
      }
    }

    load();
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  function handlePlayerChange(name) {
    setActivePlayer(name);
    localStorage.setItem('wc_activePlayer', name);
  }

  function toggleLang() {
    const next = lang === 'en' ? 'ar' : 'en';
    setLang(next);
    localStorage.setItem('wc_lang', next);
  }

  return (
    <div className="app">
      <header className="app-header">
        <button className="lang-toggle" onClick={toggleLang} title="Toggle language">
          {lang === 'en' ? 'ع' : 'EN'}
        </button>
        <div className="header-crest-placeholder">DZ</div>
        <h1>World Cup 2026 <span className="accent">Soubella</span></h1>
        <p className="header-sub">Algeria · World Cup 2026</p>
        <div className="header-divider" />
      </header>
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} lang={lang} />
      <main className="app-content">
        {matchError && <div className="error-banner">{matchError}</div>}
        {activeTab === 'groups' && <GroupsTab matches={matches} lang={lang} />}
        {activeTab === 'leaderboard' && (
          <LeaderboardTab players={players} matches={matches} lang={lang} />
        )}
        {activeTab === 'picks' && (
          <MyPicksTab
            players={players}
            activePlayer={activePlayer}
            onPlayerChange={handlePlayerChange}
            onPlayersChange={setPlayers}
            matches={matches}
            lang={lang}
          />
        )}
        {activeTab === 'rules' && <RulesTab lang={lang} />}
      </main>
    </div>
  );
}
