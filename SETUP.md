# FanFour — Setup Guide

This is a self-contained app: 4 files, no build step, no npm install.
You just need to (1) plug in a free Firebase project so data syncs
between phones, and (2) host the 4 files somewhere.

Files in this folder:
- `index.html` — the whole app
- `manifest.json` — makes it installable as a real app icon
- `sw.js` — service worker (offline app shell)
- `icon-192.png` / `icon-512.png` — app icons

---

## 1. Create a free Firebase project (~5 minutes)

1. Go to https://console.firebase.google.com and sign in with any
   Google account.
2. Click **Add project**. Name it anything (e.g. "fanfour-trip").
   You can disable Google Analytics for this project — not needed.
3. Once the project is created, click the **web icon (`</>`)** on the
   project overview page to register a web app. Give it any nickname.
   You do **not** need Firebase Hosting at this step — skip that
   checkbox if offered.
4. Firebase will show you a `firebaseConfig` object that looks like:

   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "fanfour-trip.firebaseapp.com",
     projectId: "fanfour-trip",
     storageBucket: "fanfour-trip.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

   Copy this whole block.

5. In `index.html`, find the `firebaseConfig` object near the top
   (search for `REPLACE_ME`) and paste your values in, replacing every
   `"REPLACE_ME"` placeholder.

## 2. Turn on Firestore (the database)

1. In the Firebase console sidebar, click **Build → Firestore Database**.
2. Click **Create database**. Choose any region close to you.
3. Choose **Start in test mode**. This allows open read/write for 30
   days by default — fine for a short trip. If you want it to keep
   working after 30 days, go to the **Rules** tab and replace the
   rules with:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /trips/{tripCode} {
         allow read, write: if true;
       }
     }
   }
   ```

   This keeps things open only to anyone who knows a specific trip
   code (5 random characters — not guessable by accident), without an
   expiry date. It's fine for a casual friend-group app; don't reuse
   this pattern for anything sensitive.

## 3. Host the files

Pick whichever is easiest for you — all are free:

- **Netlify Drop** (simplest): go to https://app.netlify.com/drop and
  drag the whole `fanfour-app` folder onto the page. You'll get a live
  URL in seconds.
- **Vercel**: `npx vercel` from inside the folder (needs Node.js
  installed), or drag-and-drop via the Vercel dashboard.
- **Firebase Hosting** (since you already have the project):
  `firebase init hosting` then `firebase deploy`, pointing it at this
  folder. Keeps everything under one Firebase project.
- **GitHub Pages**: push this folder to a repo and enable Pages in the
  repo settings.

Whichever you choose, make sure all 4 files end up in the same
folder/root — the app expects `manifest.json`, `sw.js`, and the icons
to sit right next to `index.html`.

## 4. Test it

1. Open your hosted URL. Tap **Start a new trip**, add a couple of
   test names, add a test expense.
2. Open the same URL on a second phone or in an incognito tab.
3. Join with the trip code. You should see the same people/expenses
   appear immediately — that confirms Firestore sync is working.
4. Once confirmed, delete the test trip data (or just start a real
   trip with a fresh code) and share the link with your group.

## 5. Install it on phones

Since this is now on your own domain (not claude.ai), "Add to Home
Screen" will work cleanly on both iPhone (Safari) and Android
(Chrome) — no app interception, no login prompts. Same steps as
before: Share icon → Add to Home Screen (iPhone), or ⋮ menu → Add to
Home screen (Android).
