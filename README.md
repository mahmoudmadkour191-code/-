# SG Store

A static, mobile-first app store frontend (Apps + Mods) backed by Firebase Authentication and Firebase Realtime Database.

```
sgstore-app/
├── index.html                    ← user-facing app (login, browse apps, install)
├── dashboard.html                ← admin dashboard (add/edit/delete apps + mods)
├── firebase-database-rules.json  ← security rules for Realtime Database
└── README.md
```

The site is fully static — no build step, no server.

## One-time setup

Image uploads in the dashboard go to **ImgBB** (free, CORS-friendly), and APKs are linked by URL. You only need to do these **two** things once:

### 1. Apply the Realtime Database rules

Open the Firebase Console → **Realtime Database → Rules**, paste the contents of `firebase-database-rules.json`, and **Publish**.

These rules:
- allow everyone to **read** apps / mods / notifs (so the public app can show them);
- allow only the two admin emails (`owner@sgstore.eg` and `admin@sgstore.eg`) to **write** to apps / mods / notifs / settings;
- allow each user to write only their own `users/$uid` profile.

### 2. Get a free ImgBB API key

1. Sign up at <https://api.imgbb.com/> (free, no card).
2. Go to **Account → My settings → API → Add** and copy the generated key.
3. Open the dashboard, click the ⚙ icon at the top right, paste the key, click **Save**.

The key is stored in your browser's `localStorage` — you only need to do this once per browser.

## Admin login

Use either of these admin accounts in the dashboard:

| Email                | Password         | Role  |
|----------------------|------------------|-------|
| `owner@sgstore.eg`   | `SGOwner@2024`   | Owner |
| `admin@sgstore.eg`   | `SGAdmin@2024`   | Admin |

> The first time you log in, the dashboard will automatically create the matching Firebase Authentication accounts. After that, the database rules above recognize those emails as admins.

## APK files

Direct APK uploads are intentionally disabled (Firebase Storage requires the paid Blaze plan, and free file hosts have hard size limits). Instead, host your `.apk` files anywhere with direct-download URLs and paste the URL into the **APK Download URL** field:

- Google Drive (use a "shareable link" → convert to direct-download via `uc?export=download&id=...`)
- MediaFire
- Mega.nz
- Telegram channel attachments
- Any HTTP file host you control

## Deployment

Any static host works. Examples:

- **Vercel / Netlify / Cloudflare Pages**: drag-and-drop the folder, or connect this repo.
- **GitHub Pages**: push the repo and enable Pages on `main` / root.
- **Local test**: `python3 -m http.server 8080` and open <http://localhost:8080/>.

## Troubleshooting

- **Login/sign-up doesn't work** → open the browser DevTools console. Common causes:
  - "Firebase SDK failed to load" → blocked network / ad-blocker; whitelist `*.gstatic.com` and `*.googleapis.com`.
  - "auth/operation-not-allowed" → enable **Email/Password** sign-in in Firebase Console → Authentication → Sign-in method.
  - "auth/email-already-in-use" → that email already has an account, just log in.
- **Dashboard image upload fails** → check the ⚙ Settings dialog and confirm you pasted a valid ImgBB key.
- **Dashboard "Permission denied" when saving** → re-publish the rules in `firebase-database-rules.json`.
