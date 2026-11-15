// Vercel Serverless Function: Proxy -> VM-Dashboard /api/status
// Holt den Live-Status von der VM (die den echten SFTP-/Log-Check macht) und
// fügt die VM-Basic-Auth serverseitig hinzu. So bleiben die VM-Zugangsdaten
// geheim und landen nie im Browser.
module.exports = async (req, res) => {
  const { VM_BASE, DASH_USER, DASH_PASS, APP_PASSWORD } = process.env;

  // Eigener Zugangsschutz der Vercel-App (ein gemeinsames App-Passwort).
  if (APP_PASSWORD && req.headers['x-app-key'] !== APP_PASSWORD) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  if (!VM_BASE || !DASH_USER || !DASH_PASS) {
    return res.status(500).json({ error: 'Server-ENV fehlt (VM_BASE/DASH_USER/DASH_PASS)' });
  }

  const auth = 'Basic ' + Buffer.from(`${DASH_USER}:${DASH_PASS}`).toString('base64');
  try {
    const r = await fetch(`${VM_BASE}/api/status`, {
      headers: { Authorization: auth },
      signal: AbortSignal.timeout(9000),
    });
    const body = await r.text();
    res.setHeader('cache-control', 'no-store');
    res.setHeader('content-type', r.headers.get('content-type') || 'application/json');
    return res.status(r.status).send(body);
  } catch (e) {
    return res.status(502).json({ error: 'VM nicht erreichbar: ' + e.message });
  }
};
