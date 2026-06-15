export default async function handler(req, res) {
  const API_KEY = process.env.VITE_FOOTBALL_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'Missing API key' });
  }

  try {
    const r = await fetch(
      'https://api.football-data.org/v4/competitions/2000/matches',
      { headers: { 'X-Auth-Token': API_KEY } }
    );

    if (!r.ok) {
      return res.status(r.status).json({ error: `football-data.org ${r.status}` });
    }

    const data = await r.json();
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
