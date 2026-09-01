# Reclaim

### Autonomous Revenue Recovery Agent

**Detect revenue at risk. Decide the right intervention. Recover it safely. Learn from every outcome.**

Reclaim is an AI-powered revenue recovery agent built for the **Razorpay AI Buildathon**.

Revenue leakage rarely happens in one clean step. A payment fails, a checkout is abandoned, an invoice becomes overdue, or a customer promises to pay but doesn't follow through.

Reclaim closes that loop.

It detects revenue at risk, diagnoses the underlying issue, evaluates recovery strategies by expected recovery value, applies deterministic business guardrails, executes bounded recovery actions, verifies outcomes, and learns from historical results.

> **Reclaim doesn't just identify lost revenue. It takes action to recover it — and knows when to stop.**

---

## 🚀 What Reclaim Does

Reclaim brings multiple revenue recovery workflows into one autonomous system.

### Payment Recovery

Detect and recover failed payments through context-aware interventions.

**Example:**

```text
Payment failed
      ↓
Diagnose failure
      ↓
Evaluate recovery strategies
      ↓
Calculate expected recovery value
      ↓
Apply guardrails
      ↓
Execute retry / payment link / reminder
      ↓
Verify payment
      ↓
Recovered → STOP
```

---

### Checkout Recovery

Recover revenue from abandoned checkouts.

Reclaim identifies where the customer dropped off and selects an appropriate intervention such as:

* Payment link
* Checkout reminder
* Session recovery
* Customer communication
* Human escalation

---

### Receivables Recovery

Recover overdue B2B invoices through controlled follow-ups.

```text
Invoice overdue
      ↓
Risk assessment
      ↓
Reminder
      ↓
Follow-up
      ↓
Promise-to-Pay
      ↓
Payment verification
      ↓
Recovered → STOP
```

---

## 🧠 How the Reclaim Agent Works

Reclaim follows a bounded agentic loop:

```text
                REVENUE EVENT
                     │
                     ▼
                  DETECT
                     │
                     ▼
                 DIAGNOSE
                     │
                     ▼
             GENERATE OPTIONS
                     │
                     ▼
          HISTORICAL OUTCOMES
                     │
                     ▼
      EXPECTED RECOVERY VALUE
                     │
                     ▼
            STRATEGY SELECTION
                     │
                     ▼
          DETERMINISTIC GATE
                     │
                     ▼
                  EXECUTE
                     │
                     ▼
                  VERIFY
                 /      \
                /        \
          RECOVERED      FAILED
             │              │
             ▼              ▼
            STOP       NEXT ACTION
                            │
                            ▼
                        ESCALATE
                            │
                            ▼
                           AUDIT
                            │
                            ▼
                          LEARN
                            │
                            └──────► Better future decisions
```

The LLM helps with **diagnosis and decision intelligence**, while deterministic policies control what the agent is actually allowed to execute.

This keeps financial actions bounded and explainable.

---

# 💰 Expected Recovery Value

Reclaim doesn't simply select the action with the highest probability of success.

It considers the economic value of each intervention.

At a basic level:

```text
Expected Recovery Value
=
Recovery Probability × Recoverable Amount
```

For example:

| Intervention     | Recovery Probability | Expected Recovery |
| ---------------- | -------------------: | ----------------: |
| Retry            |                  82% |           ₹20,499 |
| Payment Link     |                  61% |           ₹15,249 |
| Reminder         |                  47% |           ₹11,749 |
| Human Escalation |                  74% |           ₹18,499 |

Reclaim selects the highest-value **permitted** intervention.

The action must still pass all applicable guardrails.

---

# 🛡️ Built for Safe Autonomous Execution

Financial automation should not give an LLM unlimited control.

Reclaim places a deterministic policy gate between the AI recommendation and execution.

### Guardrails include:

* Retry limits
* Recovery windows
* Contact frequency limits
* Amount thresholds
* Quiet hours
* Human approval thresholds
* Action eligibility
* Idempotency protection
* Stopping rules

Example:

```text
AI recommendation
      ↓
"Retry payment"
      ↓
Policy Gate
      ↓
✓ Retry limit
✓ Recovery window
✓ Amount threshold
✓ Contact frequency
✓ Idempotency
      ↓
ACTION APPROVED
```

If a policy fails:

```text
ACTION BLOCKED

Reason:
Maximum retry limit reached.
```

The agent cannot bypass the policy layer.

---

# 🔁 Idempotent Recovery

Payment systems can deliver duplicate events.

Reclaim protects against duplicate recovery actions.

```text
PAYMENT_FAILED
      ↓
Create recovery case
      ↓
PAYMENT_FAILED (duplicate)
      ↓
Detect duplicate event
      ↓
Skip duplicate action
```

The event is recorded in the audit trail without executing another financial action.

---

# 🤝 Promise-to-Pay

Reclaim turns customer payment commitments into trackable recovery workflows.

Example:

```text
Customer
Acme Technologies

Amount
₹48,000

Promise date
31 Aug 2026

Status
Promised
```

When the promised date arrives:

```text
Verify payment
      │
      ├── Payment received
      │       ↓
      │    Fulfilled
      │       ↓
      │      STOP
      │
      └── Payment not received
              ↓
        Promise overdue
              ↓
        Next permitted action
```

This prevents unnecessary follow-ups after payment has already been received.

---

# 📈 Recovery Lab

Reclaim includes a simulation environment for measuring recovery performance across batches.

The Recovery Lab compares:

### 1. Naive Retry

Fixed recovery behavior without intelligent diagnosis.

### 2. Static Rules

Traditional deterministic recovery rules.

### 3. Reclaim Agent

AI-assisted diagnosis + expected recovery value + guardrails + verification.

The simulator measures:

* Recovery rate
* Revenue recovered
* Revenue at risk
* Average attempts
* Time to recovery
* Escalation rate
* Policy violations
* Stop-rule compliance
* Failed actions

### Example

```text
                Recovery Rate

Naive Retry          XX.X%

Static Rules         XX.X%

RECLAIM              XX.X%
```

> **All benchmark values shown by the application are generated by the simulation engine and are not hardcoded marketing claims.**

---

# 🧪 Learning From Outcomes

Reclaim records recovery outcomes and uses historical performance to improve future strategy selection.

For example:

```text
Insufficient Funds

Retry at 10 AM
58% recovery

Retry at 6 PM
72% recovery
```

For future similar cases, Reclaim can incorporate this historical signal when ranking recovery strategies.

The learning layer never bypasses deterministic guardrails.

### Learning pipeline

```text
Recovery outcome
      ↓
Record intervention + result
      ↓
Aggregate similar outcomes
      ↓
Calculate historical performance
      ↓
Update strategy estimates
      ↓
Improve future ranking
```

For cold-start scenarios where insufficient historical data exists, Reclaim falls back to baseline estimates rather than pretending it has learned something.

---

# 💬 Ask Reclaim

**Ask Reclaim** is the conversational interface to the recovery system.

Instead of navigating through multiple dashboards, merchants can ask questions such as:

> Why did Reclaim choose retry?

> What was the second-best recovery strategy?

> How much revenue did we recover?

> Which intervention performs best?

> Why was this action blocked?

> Which promises are overdue?

> What has Reclaim learned about insufficient-funds payments?

> How does Reclaim compare with static rules?

Ask Reclaim uses the same underlying recovery data as the dashboard, agent, insights, and audit system.

---

# 🔍 Audit Trail

Every important recovery event is recorded.

Examples:

```text
Recovery case created
Diagnosis generated
Recovery strategy calculated
Expected value calculated
Strategy selected
Guardrail checked
Action executed
Payment verified
Promise created
Promise fulfilled
Promise overdue
Action blocked
Recovery escalated
Learning signal recorded
```

Each event can contain:

* Timestamp
* Case ID
* Action
* Reason
* Outcome
* Relevant metadata

This creates an explainable history of autonomous decisions.

---

# 🏗️ Product Architecture

```text
                     RECLAIM
                        │
                Revenue Sources
                        │
          ┌─────────────┼─────────────┐
          │             │             │
       Payments      Checkout    Receivables
          │             │             │
          └─────────────┼─────────────┘
                        │
                        ▼
                Revenue Detector
                        │
                        ▼
                   AI Diagnosis
                        │
                        ▼
               Strategy Generator
                        │
                        ▼
          Expected Recovery Value
                        │
                        ▼
              Historical Learning
                        │
                        ▼
             Deterministic Policy
                    Gate
                        │
                        ▼
                   Execution
                        │
                        ▼
                   Verification
                        │
              ┌─────────┴─────────┐
              │                   │
          Recovered             Failed
              │                   │
             STOP            Next Action
                                  │
                              Escalation
                                  │
                                Audit
                                  │
                                Learn
```

---

# 🧩 Core Product Modules

| Module           | Purpose                                       |
| ---------------- | --------------------------------------------- |
| **Overview**     | Revenue health and recovery performance       |
| **Recovery**     | Manage payment, checkout and receivable cases |
| **Agent**        | Autonomous decisions and execution            |
| **Insights**     | Recovery and intervention analytics           |
| **Recovery Lab** | Batch simulation and benchmarking             |
| **Ask Reclaim**  | Natural-language access to recovery data      |
| **Integrations** | Connect revenue sources                       |
| **Audit Trail**  | Explainable action history                    |
| **Settings**     | Recovery policies and controls                |

---

# 🎯 Example End-to-End Recovery

### Scenario

A ₹24,999 payment fails because of insufficient funds.

### Reclaim:

**1. Detects**

Payment failure event received.

**2. Diagnoses**

Likely insufficient funds.

**3. Evaluates**

```text
Retry              → ₹20,499 expected
Payment Link       → ₹15,249 expected
Reminder           → ₹11,749 expected
Human Escalation   → ₹18,499 expected
```

**4. Selects**

Retry.

**5. Checks**

All recovery policies pass.

**6. Executes**

Retry according to the permitted recovery schedule.

**7. Verifies**

Payment succeeds.

**8. Recovers**

₹24,999 recovered.

**9. Stops**

No further recovery actions are taken.

**10. Learns**

The outcome becomes part of future strategy evaluation.

---

# 🔐 Demo & Safety

Reclaim currently operates in a **sandbox/demo environment** for the buildathon.

No real customer financial information or real financial actions are required.

Simulated data is clearly separated from production financial activity.

The goal is to demonstrate the complete agentic recovery loop safely:

> **Detect → Decide → Act → Verify → Recover → Learn**

---

# 🛠️ Tech Stack

> Update this section to exactly match the technologies in the final repository.

### Frontend

* React
* TypeScript
* Tailwind CSS
* Responsive design

### Backend / APIs

* [Your backend framework]
* REST APIs
* Webhook/event processing

### AI

* [Your LLM/model]
* Structured agent decisioning
* Recovery strategy evaluation

### Data

* [Your database]
* Synthetic recovery dataset
* Event/outcome history

### Infrastructure

* [Your deployment platform]
* Sandbox integrations

---

# 📱 Responsive by Design

Reclaim is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile

The core recovery workflow remains accessible across screen sizes.

---



# 🏆 Built for the Razorpay AI Buildathon

Reclaim was built for the **AI Revenue Recovery** track of the Razorpay AI Buildathon.

The project focuses on the complete recovery loop:

```text
Revenue at Risk
      ↓
Diagnosis
      ↓
Intervention
      ↓
Bounded Execution
      ↓
Verification
      ↓
Revenue Recovered
      ↓
Learning
```

Rather than simply identifying revenue leakage, Reclaim is designed to **close the loop between detection and recovery** while maintaining:

* measurable outcomes
* bounded execution
* deterministic guardrails
* compliant escalation
* stopping rules
* auditability
* explainability

---

# 💡 Why Reclaim?

Revenue recovery is often fragmented across dashboards, payment systems, billing tools, spreadsheets, and manual follow-ups.

Reclaim brings the decision loop together.

### Traditional approach

```text
Failure
 ↓
Dashboard alert
 ↓
Human investigates
 ↓
Human decides
 ↓
Human executes
 ↓
Human checks result
```

### Reclaim

```text
Failure
 ↓
Detect
 ↓
Diagnose
 ↓
Decide
 ↓
Guard
 ↓
Act
 ↓
Verify
 ↓
Recover
 ↓
Learn
```

# Reclaim

### **Don't just find lost revenue. Reclaim it.**
