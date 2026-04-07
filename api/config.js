export default async function handler(req, res) {
  const KV_REST_API_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const KV_REST_API_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  const ADMIN_HASH = process.env.ADMIN_HASH;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    return res.status(200).json({});
  }

  if (req.method === 'GET') {
    try {
      const response = await fetch(`${KV_REST_API_URL}/get/trade_config`, {
        headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
      });
      const data = await response.json();
      if (data.result) {
        return res.status(200).json(JSON.parse(data.result));
      }
      return res.status(200).json({});
    } catch {
      return res.status(200).json({});
    }
  }

  if (req.method === 'POST') {
    if (!ADMIN_HASH) return res.status(500).json({ error: 'Admin not configured' });

    const { hash, ...config } = req.body;
    if (!hash || hash !== ADMIN_HASH) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      await fetch(`${KV_REST_API_URL}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${KV_REST_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(['SET', 'trade_config', JSON.stringify(config)])
      });
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to save' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
