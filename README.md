# LostLink — Setup Guide

Campus lost & found app built with **Expo Router + React Native + Firebase**.

## What's included

```
app/
├── _layout.tsx              Root layout — handles auth redirect logic
├── index.tsx                Initial redirect
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── signup.tsx
├── (tabs)/
│   ├── _layout.tsx           Bottom tab navigator
│   ├── home.tsx               Browse + search + filter feed
│   ├── post.tsx                Post a lost/found item (with photo)
│   ├── chat.tsx                List of conversations
│   └── profile.tsx            User's own posts + mark resolved + logout
├── item/[id].tsx             Item detail screen + "Contact" button
└── chat/[id].tsx             Real-time chat thread

components/ItemCard.tsx       Reusable card for the feed
constants/colors.ts           App color palette
constants/categories.ts       Item categories + TypeScript types
services/firebase.ts          Firebase init (YOU need to add your config)
hooks/useAuth.tsx             Auth context (login/signup/logout state)
firestore.rules               Security rules to paste into Firebase console
```

## Step-by-step setup

### 1. Install Node.js
Get the LTS version from nodejs.org if you don't have it.

### 2. Create the real Expo project and copy these files in
Since these files were generated outside of a real Expo environment, run this once on your own machine:

```bash
npx create-expo-app@latest lostlink --template blank-typescript
```

Then copy every file from this package into the new `lostlink` folder, **overwriting** the default `app/` contents.

### 3. Install dependencies
From inside the `lostlink` folder:

```bash
npx expo install expo-router expo-image-picker expo-constants expo-linking
npx expo install firebase @react-native-async-storage/async-storage
npx expo install react-native-safe-area-context react-native-screens
```

In `package.json`, make sure `"main"` is set to `"expo-router/entry"` (already set in the package.json provided here).

### 4. Set up Firebase
1. Go to https://console.firebase.google.com → **Add project** → name it "LostLink"
2. In the project, click the **Web (</>) icon** to register a web app → copy the config object
3. Paste those values into `services/firebase.ts` (replace the placeholder `YOUR_...` values)
4. In the Firebase console, enable:
   - **Build → Authentication → Sign-in method → Email/Password**
   - **Build → Firestore Database → Create database** (start in test mode for development)
   - **Build → Storage → Get started**
5. In Firestore, go to the **Rules** tab and paste the contents of `firestore.rules`, then **Publish**

### 5. Run it
```bash
npx expo start
```
Scan the QR code with the **Expo Go** app on your phone (same WiFi network), or press `a`/`i` for an emulator.

### 6. Test the flow
1. Sign up with a test email
2. Post a "lost" item with a photo
3. Sign up a second test account (or use another phone) and post a "found" item, or view the first item and tap **Contact**
4. Send messages back and forth — they should appear in real time on both devices

## Building an APK for your submission/demo
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
This gives you a downloadable `.apk` link once the build finishes (~10-15 min), which you can install directly on a phone for your viva demo — no Play Store needed.

## Notes for your report
- **Auth**: Firebase Authentication (email/password)
- **Database**: Cloud Firestore (NoSQL, real-time listeners via `onSnapshot`)
- **Storage**: Firebase Storage for item photos
- **Navigation**: Expo Router (file-based routing, similar to Next.js)
- **State**: React Context (`useAuth` hook) — no external state library needed for this scope
