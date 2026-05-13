# QuantFlow | Institutional Alpha Signal & Risk Engine

QuantFlow is a high-performance signal orchestration platform designed for systematic traders and quant analysts. It transforms fragmented market data into high-fidelity alpha signals using a multi-factor ranking system and provides real-time probabilistic risk modeling.

## 🏛️ Engineering Architecture
- **Domain-Driven Design (DDD)**: Core business logic (Signal Generation, Risk Modeling) is decoupled from the framework layer.
- **Signal Orchestration**: A weighted multi-factor engine that correlates Technical, Sentiment, and Macro data.
- **Risk Engine**: Real-time calculation of **Value at Risk (VaR)** and **Sharpe Ratios** for complex portfolios.
- **Institutional UX**: High-density "Terminal" interface with keyboard-first navigation via OmniSearch.
- **Event-Driven Resilience**: Asynchronous workflows powered by Inngest for reliable background processing.

## 🚀 Key Features
- **Alpha Signal Generator**: Proprietary scoring algorithm (0-100) based on cross-referenced indicators.
- **OmniSearch CLI**: Keyboard-first command bar (`⌘K`) for rapid asset analysis and system monitoring.
- **Probabilistic Risk Simulation**: Monte Carlo-inspired drawdown predictions and volatility analysis.
- **Resilient Data Layer**: Service-abstracted gateways with strict schema validation and circuit-breaker logic.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **State**: Zustand (Reactive Store)
- **Styling**: Vanilla CSS + Tailwind (Custom Tokens)
- **Background**: Inngest (Workflow Orchestration)
- **Auth**: Better Auth (Institutional Grade)
- **Database**: MongoDB + Mongoose (Resilient Adapter)
- **Validation**: Zod (Type-Safe Contracts)

## 📦 Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure `.env` (see `.env.example`)
4. Launch terminal: `npm run dev`

---
*Developed for professionals who require signal over noise.*
