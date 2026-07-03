# Shipping American Mahjong to the App Stores

The app is a fully client-side PWA (installable, offline-capable). This doc
covers the three distribution tiers, from zero-effort to full native.

## Tier 1 — Installable PWA (live today)

The deployed site is installable on iOS ("Add to Home Screen" from Safari's
share sheet) and Android (Chrome shows an install prompt). It runs fullscreen
with its own icon, works offline after first load (service worker in
`public/sw.js`), and persists games/stats/journal in localStorage.

Nothing further is required — share the URL.

## Tier 2 — Google Play via TWA (a day of work)

Android's Trusted Web Activity wraps the deployed PWA in a Play-listable APK
with no code changes:

1. `npm i -g @bubblewrap/cli`
2. `bubblewrap init --manifest https://<your-domain>/mahjong/manifest.webmanifest`
3. `bubblewrap build` → upload the `.aab` to the Play Console.
4. Host the generated `assetlinks.json` at `/.well-known/` on the domain.

Requires: Google Play developer account ($25 one-time).

## Tier 3 — iOS App Store + Play via Capacitor (recommended for iOS)

Apple does not accept bare TWA-style wrappers; Capacitor is the standard path
and keeps this codebase unchanged (it loads `dist/` in a native web view).

```bash
npm i @capacitor/core && npm i -D @capacitor/cli
npx cap init "American Mahjong" com.yourdomain.mahjong --web-dir dist
# IMPORTANT: for native builds set base: './' in vite.config.js (or use an
# env-conditional base), since capacitor serves from the app bundle root.
npm run build
npx cap add ios && npx cap add android
npx cap sync
npx cap open ios      # requires a Mac with Xcode
npx cap open android  # Android Studio
```

Store-readiness checklist:

- [ ] Apple Developer Program account ($99/yr); Play developer account ($25).
- [ ] Bundle IDs, signing certificates, provisioning profiles (Xcode manages).
- [ ] App icons: regenerate from `public/icon-512.png` with Xcode's asset
      catalog / Android Studio's Image Asset tool.
- [ ] Splash screens via `@capacitor/splash-screen`.
- [ ] Screenshots for listings — the share-card renderer style (390×844
      captures of Home, table, advisor, journal, all four themes) makes a
      strong set.
- [ ] Privacy: the app stores everything locally and phones home to nothing;
      declare "no data collected" (Google Fonts is fetched at runtime — bundle
      the fonts locally before submission to make that literally true).
- [ ] App Review note: all gameplay is offline/local; no accounts, no IAP.

### Native niceties worth adding post-wrap

- Haptics on tile placement (`@capacitor/haptics`)
- Native share sheet already works (Web Share API), but
  `@capacitor/share` is a drop-in upgrade for older iOS.
- Keep-awake during games (`@capacitor-community/keep-awake`)

## Content note

The built-in "Garden Card" is an original 24-hand card designed for this app.
It is deliberately NOT a copy of the National Mah Jongg League's annual card
(which is copyrighted); do not ship NMJL card data without a license.
