# Reclaim — AI Revenue Recovery Agent

> **Autonomous AI Agent that detects revenue at risk, selects optimal bounded interventions, and recovers lost recurring ARR within strict guardrails.**

---

## 🌟 Overview

Passive dunning emails fail. **Reclaim** is an autonomous AI agent designed for CFOs and RevOps teams that intercepts failed Razorpay and Stripe invoices, diagnoses root causes, and executes bounded retries, dynamic payment links, and WhatsApp reminders within strict business safety boundaries.

---

## 🚀 Key Features

- **Autonomous Decision Engine**: Evaluates payment failures, customer LTV, past clearance history, and calculates recovery probabilities in real-time.
- **Strict Guardrail Core**: Enforces max retry limits (default: 2), contact frequency bounds (default: 3), quiet hours (10 PM – 8 AM IST), and human escalation thresholds for high-value transactions.
- **Revenue Stack Integration Flow**: Multi-source fintech onboarding connecting Razorpay Sandbox, Reclaim Billing, Business Bank sandbox verification, and communication channels.
- **Interactive Recovery Simulator**: 100-case recovery batch processor and custom failure event injector for buildathons and live testing.
- **Real-Time Telemetry & Audit Logs**: Detailed audit trails and step-by-step rationale for every autonomous decision.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, Glassmorphism design system
- **Charts & Visuals**: Canvas-Confetti, Recharts / Custom CSS Metrics
- **State Management**: React Context API with persistent localStorage caching

---

## 🚦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## 👥 Demo Access
- **Email**: `demo@reclaim.ai`
- **Password**: `Reclaim@2026`
- **OTP**: `482916` (Pre-filled for fast evaluation)
