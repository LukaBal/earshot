# Earshot

Spotify listening stats: an all-time dashboard built from your Spotify data export, plus a live
"current rotation" view through the Spotify Web API.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in SPOTIFY_CLIENT_ID
npm run dev
```

Open **http://127.0.0.1:3000**. Spotify doesn't accept `localhost` redirect URIs, so `localhost` requests get
redirected to `127.0.0.1` automatically.

## All-time history (`/history`)

1. spotify.com → Account → Privacy settings → request **Extended streaming history**.
2. When the email arrives, unzip it and drop the `Streaming_History_Audio_*.json` files onto the page.

Files are parsed in the browser and stored in IndexedDB. Nothing is uploaded. The basic account data export
(`StreamingHistory_music_*.json`) works too, but only covers about a year and has no skip info.

## Live view (`/now`)

1. Create an app at https://developer.spotify.com/dashboard (select "Web API").
2. Add the Redirect URI `http://127.0.0.1:3000/api/auth/callback`.
3. Put the Client ID in `.env.local`. The app uses PKCE, so it doesn't need a client secret.

While the Spotify app is in Development Mode, only accounts listed under **User Management** can log in.
