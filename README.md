# 🎯 Debt Planner

A focused, mobile-first debt-management app built with **React Native (Expo)**. It analyzes your debts, applies the **Snowball** or **Avalanche** payoff strategy, and visualizes the exact timeline to becoming debt-free — keeping you motivated with milestones along the way.

Built for recent graduates and anyone chipping away at high-interest debt.

---

## ✨ Features

- **Add and manage debts** — track balance, APR, and minimum payment for each loan or card.
- **Two proven strategies**
  - ❄️ **Snowball** — pay smallest balances first for fast, motivating wins.
  - 🏔️ **Avalanche** — target the highest interest rate first to minimize total interest paid.
- **Head-to-head comparison** — see exactly how much interest and time Avalanche saves over Snowball for *your* numbers.
- **Adjustable extra payment** — dial in how much you can throw at debt each month and watch the timeline react instantly.
- **Payoff timeline** — a month-by-month schedule plus an SVG balance curve that glides to zero.
- **Motivating milestones** — celebrate every debt cleared and every 25% of progress toward debt-free.
- **Offline-first** — everything is stored locally on the device with AsyncStorage. No account, no servers, no data leaves the phone.

---

## 📱 Screens

| Screen | What it does |
| --- | --- |
| **Dashboard** | Total debt, projected debt-free date, total interest, the active strategy, and your next milestone at a glance. |
| **Debts** | List of debts shown in the order your strategy will attack them. Add, edit, or remove. |
| **Plan** | Choose your strategy, tune the extra monthly payment, and compare Snowball vs Avalanche side by side. |
| **Timeline** | Balance-over-time chart plus a full month-by-month amortization table. |
| **Milestones** | A vertical timeline of every payoff win between today and debt-free. |

---

## 🧮 How the math works

The payoff engine ([`src/core/calculator.ts`](src/core/calculator.ts)) simulates your debts one month at a time:

1. Your total monthly budget is fixed at **sum of all minimum payments + your extra payment**.
2. Each month, interest accrues on every balance at `APR / 12`.
3. Minimum payments are applied to every debt.
4. Everything left over is thrown at the **target debt** — the smallest balance (Snowball) or highest APR (Avalanche).
5. When a debt is cleared, its freed-up payment **rolls over** to the next target. This snowball/rollover effect is what accelerates payoff over time.

The simulation guards against under-funded plans (where interest outpaces payments) so it never loops forever.

> ⚠️ **Disclaimer:** Debt Planner provides estimates for educational and planning purposes only. It is not financial advice. Real-world results vary with compounding methods, fees, and rate changes. Consult a qualified financial professional for guidance specific to your situation.

---

## 🛠 Tech stack

- [Expo](https://expo.dev/) + [React Native](https://reactnative.dev/) (TypeScript)
- [React Navigation](https://reactnavigation.org/) — bottom tabs + native stack
- [react-native-svg](https://github.com/software-mansion/react-native-svg) — the balance chart
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) — local persistence
- [Jest](https://jestjs.io/) + ts-jest — unit tests for the payoff engine

---

## 🚀 Getting started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- The [Expo Go](https://expo.dev/go) app on your phone, or an iOS/Android simulator

### Install & run

```bash
# install dependencies
npm install

# start the Expo dev server
npm start
```

Then scan the QR code with Expo Go, or launch a simulator:

```bash
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # run in the browser
```

### Run the tests

```bash
npm test
```

---

## 📂 Project structure

```
debt-planner/
├── App.tsx                     # App entry: providers + navigation
├── index.ts                    # Expo root registration
├── src/
│   ├── core/
│   │   ├── calculator.ts       # Snowball/Avalanche payoff engine
│   │   ├── format.ts           # Currency / duration formatting
│   │   └── __tests__/          # Engine unit tests
│   ├── components/             # Reusable UI (Card, Chart, Buttons…)
│   ├── screens/                # Dashboard, Debts, Plan, Timeline, Milestones
│   ├── navigation/             # Tab + stack navigators
│   ├── state/                  # DebtContext (global state + persistence)
│   ├── storage/                # AsyncStorage wrappers
│   ├── types/                  # Shared TypeScript types
│   └── theme.ts                # Design tokens
└── README.md
```

---

## 🗺 Roadmap ideas

- Push-notification reminders for monthly payments
- Multiple "what-if" scenarios saved side by side
- CSV/PDF export of the payoff schedule
- Interest-rate change and extra one-time payment support

---

## 📄 License

Released under the [MIT License](LICENSE).
