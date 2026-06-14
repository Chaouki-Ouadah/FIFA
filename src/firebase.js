import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Players

export async function getPlayers() {
  const snap = await getDocs(collection(db, 'players'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addPlayer(name) {
  const id = name.toLowerCase().replace(/\s+/g, '_');
  await setDoc(doc(db, 'players', id), { name });
  return { id, name };
}

export async function removePlayer(playerId) {
  await deleteDoc(doc(db, 'players', playerId));
}

// Picks — path: picks/{matchId}/playerPicks/{playerId}

export async function savePick(matchId, playerId, pick) {
  await setDoc(doc(db, 'picks', String(matchId), 'playerPicks', playerId), {
    ...pick,
    savedAt: serverTimestamp(),
  });
}

export async function getPicksForMatch(matchId) {
  const snap = await getDocs(collection(db, 'picks', String(matchId), 'playerPicks'));
  const result = {};
  snap.docs.forEach(d => { result[d.id] = d.data(); });
  return result;
}

export async function getAllPicksForMatches(matchIds) {
  if (matchIds.length === 0) return {};
  const results = await Promise.all(matchIds.map(id => getPicksForMatch(id)));
  const all = {};
  matchIds.forEach((id, i) => { all[id] = results[i]; });
  return all;
}

export async function getPlayerPicks(playerId, matchIds) {
  const results = await Promise.all(
    matchIds.map(id =>
      getDoc(doc(db, 'picks', String(id), 'playerPicks', playerId))
        .then(d => d.exists() ? [id, d.data()] : null)
    )
  );
  const picks = {};
  results.forEach(r => { if (r) picks[r[0]] = r[1]; });
  return picks;
}

// WC Winner

export async function saveWcWinner(playerId, team) {
  await setDoc(doc(db, 'wcWinner', playerId), {
    team,
    savedAt: serverTimestamp(),
  });
}

export async function getWcWinners() {
  const snap = await getDocs(collection(db, 'wcWinner'));
  const result = {};
  snap.docs.forEach(d => { result[d.id] = d.data(); });
  return result;
}
