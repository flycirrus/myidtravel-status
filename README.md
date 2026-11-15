# MyIDTravel Status — Vercel Web-App

Mobiles Status-Dashboard für die Empty-Leg-Pipeline (Leon → VM → Lufthansa-SFTP).
Zeigt: großer 🟢/🔴-Status, letzter Push, Flüge online, verworfene Zeilen,
Datei-Stand auf dem LH-Server, CSV-Preview und Cron-Abzug.

## Wie es funktioniert

```
[Handy-Browser]  →  [Vercel: hübsche Oberfläche + /api-Proxy]  →  [VM-Dashboard :8099]
   HTTPS, App-Passwort        fügt VM-Login serverseitig hinzu      macht echten SFTP/Log-Check
```

Die Vercel-App hält **keine** Lufthansa-Zugangsdaten. Sie fragt im Hintergrund das
VM-Dashboard (`http://178.105.81.13:8099`) ab, das den echten Check macht.

## In 5 Minuten live: GitHub → Vercel

1. **GitHub-Repo anlegen** (nur dieser Ordner `vercel-status/`), z. B. `myidtravel-status`:
   ```bash
   cd vercel-status
   git init && git add . && git commit -m "MyIDTravel Status Web-App"
   git branch -M main
   git remote add origin https://github.com/<DEIN-USER>/myidtravel-status.git
   git push -u origin main
   ```
2. **Vercel** öffnen → **Add New… → Project** → das GitHub-Repo importieren.
   Framework Preset: **Other** (keiner nötig, kein Build-Schritt).
3. **Environment Variables** setzen (Project → Settings → Environment Variables),
   Werte siehe `.env.example`:
   | Name | Wert |
   |------|------|
   | `VM_BASE` | `http://178.105.81.13:8099` |
   | `DASH_USER` | `larry` |
   | `DASH_PASS` | *(VM-Dashboard-Passwort)* |
   | `APP_PASSWORD` | *(frei wählbares Passwort für diese Webseite)* |
4. **Deploy** klicken. Danach bekommst du eine Adresse wie
   `https://myidtravel-status.vercel.app` — die aufs Handy, zum Home-Bildschirm
   hinzufügen, fertig. Beim ersten Öffnen das `APP_PASSWORD` eingeben.

> Änderst du später die Env-Vars, einmal **Redeploy** auslösen.

## Wichtig

- Die App ist nur so erreichbar, wie das **VM-Dashboard** erreichbar ist
  (läuft auf der VM als `systemd`-Dienst `myidtravel-dashboard`). Ist die VM aus,
  zeigt die App „VM nicht erreichbar" — was selbst ein sinnvolles Alarmsignal ist.
- `APP_PASSWORD` **immer setzen** — sonst ist die Vercel-URL offen im Netz.
- Keine Secrets ins Repo (siehe `.gitignore`); alle Zugangsdaten leben in den
  Vercel-Environment-Variablen.

## Dateien
```
vercel-status/
├── index.html        # Oberfläche (mobile-first)
├── api/status.js     # Proxy -> VM /api/status
├── api/csv.js        # Proxy -> VM /api/csv
├── api/log.js        # Proxy -> VM /api/log
├── .env.example      # welche Env-Vars Vercel braucht
└── package.json
```
