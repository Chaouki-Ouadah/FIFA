import { useState, useEffect, useMemo } from 'react';
import {
  getPlayerPicks,
  savePick,
  saveWcWinner,
  getWcWinners,
  addPlayer,
  removePlayer,
  getPlayers,
} from '../firebase';
import { isPickLocked, isWcWinnerLocked, matchStatusLabel } from '../api';
import { t } from '../i18n';

const WC2026_TEAMS = [
  'Albania','Algeria','Argentina','Australia','Austria',
  'Belgium','Bolivia','Brazil',
  'Cameroon','Canada','Chile','Colombia','Costa Rica','Croatia','Czech Republic',
  'Denmark','DR Congo',
  'Ecuador','Egypt','England',
  'France',
  'Germany','Ghana',
  'Honduras','Hungary',
  'Indonesia','Iran','Iraq','Israel','Italy','Ivory Coast',
  'Jamaica','Japan','Jordan',
  'Mexico','Morocco',
  'Netherlands','New Zealand','Nigeria','Norway',
  'Oman',
  'Panama','Paraguay','Peru','Poland','Portugal',
  'Qatar',
  'Romania',
  'Saudi Arabia','Scotland','Senegal','Serbia','Slovakia','Slovenia','South Africa','South Korea','Spain','Sweden','Switzerland',
  'Tunisia','Turkey',
  'Ukraine','United States','Uruguay','Uzbekistan',
  'Venezuela',
  'Wales',
];

export default function MyPicksTab({
  players,
  activePlayer,
  onPlayerChange,
  onPlayersChange,
  matches,
  lang,
}) {
  const [savedPicks, setSavedPicks] = useState({});
  const [localPicks, setLocalPicks] = useState({});
  const [wcWinnerData, setWcWinnerData] = useState(null);
  const [localWcWinner, setLocalWcWinner] = useState('');
  const [saving, setSaving] = useState({});
  const [wcSaving, setWcSaving] = useState(false);
  const [adminInput, setAdminInput] = useState('');

  const activePlayerId = useMemo(
    () => players.find(p => p.name === activePlayer)?.id ?? null,
    [players, activePlayer]
  );

  useEffect(() => {
    if (!activePlayerId || matches.length === 0) return;
    Promise.all([
      getPlayerPicks(activePlayerId, matches.map(m => m.id)),
      getWcWinners().then(all => all[activePlayerId] ?? null),
    ]).then(([picks, wcW]) => {
      setSavedPicks(picks);
      setLocalPicks({});
      setWcWinnerData(wcW);
      setLocalWcWinner(wcW?.team ?? '');
    }).catch(console.error);
  }, [activePlayerId, matches]);

  function getPick(matchId) {
    return { ...savedPicks[matchId], ...localPicks[matchId] };
  }

  function setPickField(matchId, field, value) {
    setLocalPicks(s => ({ ...s, [matchId]: { ...s[matchId], [field]: value } }));
  }

  async function handleSavePick(matchId) {
    if (!activePlayerId) return;
    const pick = getPick(matchId);
    if (!pick.winner) return;
    setSaving(s => ({ ...s, [matchId]: true }));
    try {
      await savePick(matchId, activePlayerId, {
        winner: pick.winner,
        homeGoals: Number(pick.homeGoals ?? 0),
        awayGoals: Number(pick.awayGoals ?? 0),
      });
      setSavedPicks(s => ({ ...s, [matchId]: pick }));
      setLocalPicks(s => { const n = { ...s }; delete n[matchId]; return n; });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(s => ({ ...s, [matchId]: false }));
    }
  }

  async function handleSaveWcWinner() {
    if (!activePlayerId || !localWcWinner.trim()) return;
    setWcSaving(true);
    try {
      await saveWcWinner(activePlayerId, localWcWinner.trim());
      setWcWinnerData({ team: localWcWinner.trim() });
    } finally {
      setWcSaving(false);
    }
  }

  async function handleAddPlayer() {
    const name = adminInput.trim();
    if (!name) return;

    const newPlayer = await addPlayer(name);

    // For each locked match, copy a random existing player's pick
    const existingPlayers = players.filter(p => p.id !== newPlayer.id);
    if (existingPlayers.length > 0) {
      const lockedMatches = matches.filter(m => isPickLocked(m.utcDate));
      if (lockedMatches.length > 0) {
        // Fetch all existing players' picks for locked matches in one go
        const allPicks = await Promise.all(
          existingPlayers.map(p =>
            getPlayerPicks(p.id, lockedMatches.map(m => m.id))
              .then(picks => ({ playerId: p.id, picks }))
          )
        );

        await Promise.all(
          lockedMatches.map(m => {
            // Pick a random existing player for this match
            const donor = allPicks[Math.floor(Math.random() * allPicks.length)];
            const pick = donor.picks[m.id];
            if (!pick?.winner) return null;
            return savePick(m.id, newPlayer.id, {
              winner: pick.winner,
              homeGoals: pick.homeGoals ?? 0,
              awayGoals: pick.awayGoals ?? 0,
            });
          })
        );
      }
    }

    const updated = await getPlayers();
    onPlayersChange(updated);
    setAdminInput('');
  }

  async function handleRemovePlayer(playerId) {
    await removePlayer(playerId);
    const updated = await getPlayers();
    onPlayersChange(updated);
  }

  const wcLocked = isWcWinnerLocked();
  const isAdmin = activePlayer === 'Chaouki';

  const CUTOFF_TS = new Date('2026-06-14T00:00:00Z').getTime();
  const sortedMatches = useMemo(
    () => matches
      .filter(m => {
        if (new Date(m.utcDate).getTime() < CUTOFF_TS) return false;
        // Hide only finished matches where player made no pick
        if (m.status === 'FINISHED' && !savedPicks[m.id]?.winner) return false;
        return true;
      })
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate)),
    [matches, savedPicks]
  );

  return (
    <div>
      {/* Player picker */}
      <div className="player-select-row">
        <select
          className="player-select"
          value={activePlayer}
          onChange={e => onPlayerChange(e.target.value)}
        >
          <option value="">{t('select_player', lang)}</option>
          {players.map(p => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Add new player — always visible */}
      <div className="add-player-section">
        <div className="add-player-label">{t('add_new_player', lang)}</div>
        <div className="admin-row">
          <input
            className="admin-input"
            placeholder={t('enter_name', lang)}
            value={adminInput}
            onChange={e => setAdminInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
          />
          <button className="admin-btn add" onClick={handleAddPlayer}>
            {t('add', lang)}
          </button>
        </div>
      </div>

      {!activePlayer && (
        <div className="empty-state" style={{ paddingTop: 8 }}>{t('select_hint', lang)}</div>
      )}

      {activePlayer && (
        <>
          {/* WC Winner */}
          <div className="wc-winner-section">
            <h2>{t('wc_title', lang)}</h2>
            <p className="wc-winner-ar">{t('wc_ar', lang)}</p>
            {!wcLocked ? (
              <>
                <p className="match-time" style={{ marginBottom: 8 }}>
                  {t('deadline', lang)}
                </p>
                <select
                  className="wc-input"
                  value={localWcWinner}
                  onChange={e => setLocalWcWinner(e.target.value)}
                  disabled={wcSaving}
                >
                  <option value="">{t('select_country', lang)}</option>
                  {WC2026_TEAMS.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
                <button
                  className="save-btn"
                  style={{ display: 'block', marginLeft: 0, marginTop: 10 }}
                  onClick={handleSaveWcWinner}
                  disabled={wcSaving || !localWcWinner.trim()}
                >
                  {wcSaving ? t('saving', lang) : t('save_prediction', lang)}
                </button>
                {wcWinnerData && (
                  <div className="wc-saved">{t('saved', lang)} {wcWinnerData.team}</div>
                )}
              </>
            ) : (
              <div style={{ fontSize: '0.85rem' }}>
                {wcWinnerData
                  ? <><span style={{ color: 'var(--text-muted)' }}>{t('locked_dash', lang)}</span>{wcWinnerData.team}</>
                  : <span style={{ color: 'var(--text-muted)' }}>{t('deadline_passed', lang)}</span>
                }
              </div>
            )}
          </div>

          {/* Match picks */}
          <div className="section-title">{t('match_predictions', lang)}</div>
          {sortedMatches.length === 0 && (
            <div className="empty-state">{t('loading_matches', lang)}</div>
          )}
          {sortedMatches.map(match => (
            <PickCard
              key={match.id}
              match={match}
              pick={getPick(match.id)}
              onPickField={(f, v) => setPickField(match.id, f, v)}
              onSave={() => handleSavePick(match.id)}
              saving={!!saving[match.id]}
              lang={lang}
            />
          ))}
        </>
      )}

      {/* Player list with remove (Chaouki only) */}
      {isAdmin && (
        <div className="admin-section">
          <h2>{t('manage_players', lang)}</h2>
          <div className="players-list">
            {players.map(p => (
              <span key={p.id} className="player-tag">
                {p.name}
                <button
                  onClick={() => handleRemovePlayer(p.id)}
                  title={`Remove ${p.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PickCard({ match, pick, onPickField, onSave, saving, lang }) {
  const locked = isPickLocked(match.utcDate);
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';
  const home = match.homeTeam?.shortName ?? match.homeTeam?.name ?? '?';
  const away = match.awayTeam?.shortName ?? match.awayTeam?.name ?? '?';

  const pickLabel = !pick?.winner ? null
    : pick.winner === 'home' ? home
    : pick.winner === 'away' ? away
    : t('draw', lang);

  return (
    <div className="pick-card">
      <div className="pick-teams">
        <span>{home}</span>
        <span className={`status-badge ${isLive ? 'live' : isFinished ? 'finished' : 'upcoming'}`}>
          {matchStatusLabel(match.status)}
        </span>
        <span>{away}</span>
      </div>

      {locked ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="locked-badge">{t('locked', lang)}</span>
          {pickLabel ? (
            <span style={{ fontSize: '0.82rem' }}>
              {pickLabel}
              {pick.homeGoals !== undefined && ` (${pick.homeGoals}–${pick.awayGoals})`}
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('no_pick', lang)}</span>
          )}
        </div>
      ) : (
        <>
          <div className="pick-controls">
            {(['home', 'draw', 'away']).map(w => (
              <button
                key={w}
                className={`pick-btn${pick?.winner === w ? ' selected' : ''}`}
                onClick={() => onPickField('winner', w)}
              >
                {w === 'home' ? home : w === 'away' ? away : t('draw', lang)}
              </button>
            ))}
          </div>
          <div className="score-inputs">
            <input
              className="score-input"
              type="number"
              min="0"
              max="20"
              value={pick?.homeGoals ?? ''}
              placeholder="0"
              onChange={e => onPickField('homeGoals', e.target.value)}
            />
            <span style={{ color: 'var(--text-muted)' }}>–</span>
            <input
              className="score-input"
              type="number"
              min="0"
              max="20"
              value={pick?.awayGoals ?? ''}
              placeholder="0"
              onChange={e => onPickField('awayGoals', e.target.value)}
            />
            <button
              className="save-btn"
              onClick={onSave}
              disabled={saving || !pick?.winner}
            >
              {saving ? '...' : t('save', lang)}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
