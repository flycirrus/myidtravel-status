// Vercel Serverless Function: Proxy -> VM-Dashboard /api/log (Cron-Abzug, Text)
module.exports = async (req, res) => {
  const { VM_BASE, DASH_USER, DASH_PASS, APP_PASSWORD } = process.env;
  if (APP_PASSWORD && req.headers['x-app-key'] !== APP_PASSWORD) {
    return res.status(401).send('unauthorized');
  }
  if (!VM_BASE || !DASH_USER || !DASH_PASS) {
    return res.status(500).send('Server-ENV fehlt (VM_BASE/DASH_USER/DASH_PASS)');
  }
  const auth = 'Basic ' + Buffer.from(`${DASH_USER}:${DASH_PASS}`).toString('base64');
  const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '?lines=20';
  try {
    const r = await fetch(`${VM_BASE}/api/log${qs}`, {
      headers: { Authorization: auth },
      signal: AbortSignal.timeout(9000),
    });
    const body = await r.text();
    res.setHeader('cache-control', 'no-store');
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    return res.status(r.status).send(body);
  } catch (e) {
    return res.status(502).send('VM nicht erreichbar: ' + e.message);
  }
};
