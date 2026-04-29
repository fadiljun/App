# EQ — Emotional Intelligence Test App

iOS-first Expo / React Native app. 30-question quiz across 5 emotional
dimensions, AI-personalized profile via Claude (Sonnet 4.6), free score
teaser → paywall → full reveal → home.

## Quick start

```sh
cd eq-app
npm install
cp .env.example .env   # fill in values (see below)
npm run start          # then press i for iOS simulator
```

## Configuration

The Claude API call is wrapped in `src/lib/claude.ts`. You have two paths:

1. **Recommended (production):** Run a tiny Cloudflare Worker proxy that
   holds your Anthropic API key server-side. Set
   `EXPO_PUBLIC_CLAUDE_PROXY_URL` to the worker URL. The worker should
   accept the body the app sends (`{ model, max_tokens, system, messages }`)
   and forward it to `https://api.anthropic.com/v1/messages` with the
   `x-api-key` and `anthropic-version` headers.

2. **Dev only:** Set `EXPO_PUBLIC_CLAUDE_API_KEY`. This bundles the key
   into the shipped app — anyone with the IPA can extract it. Don't ship
   this way.

Set `EXPO_PUBLIC_REVENUECAT_IOS_KEY` when wiring up the paywall (the
RevenueCat call in `src/screens/PaywallScreen.tsx` is currently stubbed).

## Project structure

```
eq-app/
├── App.tsx
├── src/
│   ├── data/questions.ts        — all 30 quiz questions
│   ├── lib/
│   │   ├── types.ts             — shared types (Pillar, Question, …)
│   │   ├── scoring.ts           — pillar weights + EQ composite
│   │   ├── claude.ts            — Anthropic call + prompt
│   │   ├── storage.ts           — AsyncStorage wrappers
│   │   └── theme.ts             — colors, spacing
│   ├── components/              — Button, ProgressBar, RadarChart, PillarCard
│   ├── screens/                 — one file per screen in the spec flow
│   └── navigation/              — React Navigation stack
└── ...
```

## Flow

`Hook → Onboarding → Quiz (30) → Calculating → FreeReveal → Paywall →
FullReveal → Home`

Storage holds the most recent report (`@eq:lastReport`) and a paid flag
(`@eq:paid`). The Calculating screen kicks off the Claude call, falls
back to a hardcoded profile if the API errors, and writes the result to
storage before navigating into the reveal flow.

## What's stubbed

- **RevenueCat** — `src/screens/PaywallScreen.tsx` simulates the unlock
  with a 800ms delay and `setPaid(true)`. Replace with the RevenueCat
  SDK call.
- **Push notifications** — re-engagement schedule from §8 of the spec
  isn't wired up. `expo-notifications` is the path.
- **Share certificate** — the `Share` button posts a text snippet only.
  `react-native-view-shot` is in `package.json`; capture the FullReveal
  scroll view and share it as an image.
- **Analytics** — no PostHog / Amplitude yet.

## Apple-review notes

- Frame the test as "for self-reflection," not clinically validated.
- The paywall has Restore Purchase and shows clear pricing.
- Test runs without sign-up.
- See §12 of the spec.
