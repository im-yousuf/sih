# 🛢️ Baghewala Digital Twin — Judge Demo Guide
### Smart India Hackathon · Team Presentation Script

---

## ⏱️ The Hook — 30-Second Elevator Pitch

> *"Oil India Limited operates heavy oil wells in Baghewala, Rajasthan using a process called Cyclic Steam Stimulation. The problem is that the engineers who understand the physics sit in Duliajan, Assam — 2,500 km away from the frontline operators running the pumps in the field. When a critical fault like rod float occurs at 2 AM, the local operator receives a technical alert in English that they cannot act on. Equipment gets damaged. Production is lost.*
>
> *Our solution is a full-stack Digital Twin platform that does three things simultaneously: it simulates the entire well in real time using physics-informed AI, it gives a Field Supervisor in Duliajan a fleet-wide command view, and — crucially — it uses the Government of India's own Bhashini NMT API to translate every alert into the operator's native language: Hindi, Assamese, or Telugu. The AI speaks English to the engineer and the operator's mother tongue to the operator."*

---

## 🔬 Core Innovation — What Makes This Different

### Physics-Informed Neural Networks (PINNs)

Most digital twins use either pure physics simulation **or** machine learning. We use both simultaneously.

Our PINN architecture encodes the governing physics equations directly into the neural network's loss function:

- **For CSS (Cyclic Steam Stimulation):** The Bober-Lantz thermal model governs how the steam front radius expands underground and how reservoir temperature decays over time. The PINN is trained to predict the optimal steam injection volume and timing by minimising both prediction error *and* violations of the heat-diffusion equation. This means it can't cheat — it cannot recommend a physically impossible steam cycle.

- **For SRP (Sucker Rod Pump):** The Gibbs Wave Equation governs the mechanical stress travelling down a 1,300-metre rod string. Our model uses this to predict rod float probability (the dangerous condition where the rod loses contact with fluid during the downstroke) *before* it happens — typically 30–90 seconds ahead — giving the operator time to reduce SPM.

**Why this matters to judges:** Pure ML would require years of labelled field data. PINNs constrain the model with physics, making it effective even with limited historical data from a new field like Baghewala.

### Bhashini Integration

The Bhashini API (MeitY/AI4Bharat) provides Neural Machine Translation for 22 scheduled Indian languages. We integrate it at the alert-dispatch layer: every time the AI generates a critical or warning alert, the alert payload is passed to Bhashini before it reaches the operator's notification feed. The supervisor (typically an English-fluent engineer) sees the original technical text; the well incharge sees the same alert in their configured language.

---

## 👤 Role Workflows

### Role 1 — Field Supervisor (`supervisor@oil.com`)

The Supervisor has a **macro-level, fleet-wide view** — they never interact with a single well's controls directly.

**What they can do:**
1. **Fleet Command Center** — `Supervisor Dashboard` shows all 6 wells (BW-12 through BW-17) as live cards with production rate, temperature, SPM, and energy consumption. Cards pulse green (optimal), yellow (warning), or red (alert).
2. **Drill Down** — Clicking any well card navigates directly into that well's Digital Twin interface.
3. **User Management (CRUD)** — The Supervisor can create new Well Incharge accounts, assign them to specific wells, change their assigned well, and deactivate accounts. This enforces that each Incharge can only see their own well's data.
4. **Fleet-Wide Alerts** — The alert feed on the right shows all critical events across all wells, sorted by severity, so the Supervisor always knows which well needs attention first.
5. **Multi-well Optimization** — The Supervisor can compare CSS cycle timing across wells and initiate field-wide SPM reduction commands.

**Login:** `supervisor@oil.com` / `supervisor123`

---

### Role 2 — Well Incharge (`incharge14@oil.com`)

The Incharge has a **micro-level, site-specific view** — they only see their assigned well (BW-14) and have full operational controls for it.

**What they can do:**
1. **Live 3D Digital Twin** — The Overview page shows a fully animated Three.js pumpjack above ground, connected to a wellbore cross-section and a subsurface reservoir visualization, all updating in real time from WebSocket telemetry.
2. **Pump Control** — The Incharge can adjust the VFD target frequency (which controls SPM), simulate the result before applying it, and see the pumpjack animation update immediately.
3. **Localized Alerts** — All critical alerts appear in the Incharge's configured language (Hindi/Assamese/Telugu via Bhashini). The same alert that says "Rod float probability 87% — reduce SPM" appears in their notification panel in their mother tongue.
4. **Depth Inspector** — On the Wellbore page, a slider lets the Incharge inspect temperature, pressure, viscosity, and mechanical stress at any depth from 0 to 2,000 m, with the 3D marker tracking in real time.
5. **Scenario Simulation** — Before making any real change, the Incharge can run a "What-If" simulation at a new SPM value and see the predicted rod load, vibration, rod float risk, and energy consumption side-by-side against the current baseline.

**Login:** `incharge14@oil.com` / `incharge123`

---

## 🎬 Step-by-Step 3-Minute Demo Script

Use this exact sequence during judge evaluation. Total time: ~3 minutes.

---

### Segment 1 — Supervisor Fleet View (45 seconds)

**Action:** Open the app at `http://localhost:3000`. The login page shows.

**Say:** *"This is the login page for the Baghewala Digital Twin. Notice the split-screen layout — the pumpjack field image on the left and the clean industrial login form on the right. We have two roles."*

**Action:** Click the **Supervisor** demo credential button. Click **SIGN IN**.

**Say:** *"This is the Supervisor Dashboard — our Field Command Center. The supervisor in Duliajan can see all 6 wells simultaneously. Notice BW-14 is flashing red with 3 active alerts."*

**Action:** Point to the KPI row at the top (Total Production, Field Energy, Critical Alerts). Then point to the Alert Feed on the right.

**Say:** *"Real-time production aggregates, and a live alert feed prioritised by severity. The supervisor clicks any well to drill in."*

**Action:** Click the **BW-14** well card.

---

### Segment 2 — Digital Twin Overview (30 seconds)

**Say:** *"We're now inside the Digital Twin for Well BW-14. On the left is a fully animated Three.js scene — the surface pumpjack, the wellbore cross-section going 1,500 metres down, and the reservoir with its thermal front. Everything updates every 2 seconds from our FastAPI WebSocket."*

**Action:** Orbit the 3D scene with the mouse to show it's interactive.

**Say:** *"The panels on the right show live telemetry and the AI recommendation. The AI currently says 'Normal' — let's break it."*

---

### Segment 3 — Trigger Rod Float Fault (45 seconds)

**Action:** On the right panel, find the **Scenario Selector** and click **Rod Float**.

**Say:** *"We're now simulating the rod float scenario — the most dangerous fault in an SRP well. The reservoir has cooled, viscosity has spiked, and the downstroke fluid load is insufficient."*

**Action:** Point to the AI Recommendation panel — it should now show **ROD FLOAT RISK** in red with a probability above 80%.

**Say:** *"Our Physics-Informed Neural Network has detected this in real time. It's showing an 87% rod float probability and recommending an SPM reduction from 5.0 to 3.5. Notice the physics evidence chain — temperature, viscosity, fluid resistance, rod dynamics — each step is traceable."*

**Action:** Click the **Bell icon** in the top-right header.

**Say:** *"And here's where Bhashini comes in. The Well Incharge receives this alert — but in Hindi."*

**Action:** Point to the notification dropdown showing the translated alert text.

---

### Segment 4 — Well Incharge Pump Control (30 seconds)

**Action:** Navigate to **Pump Control** in the sidebar.

**Say:** *"On the Pump Control page, the Incharge sees the live pumpjack animation running at the current SPM. They can drag this VFD slider to 3.5 — the AI's recommended value — and hit Simulate."*

**Action:** Drag the **Target SPM** slider to `3.5` and click **SIMULATE**.

**Say:** *"The simulation runs against our backend physics model. It shows a 23% reduction in rod load, vibration drops from 2.4 to 0.8 mm/s, and rod float risk drops from 87% to 12%. The Incharge can see the predicted result before applying it. Zero risk to actual equipment."*

**Action:** Point to the live 3D pumpjack animating more slowly at the new SPM.

---

### Segment 5 — Close with the Bhashini & RBAC Differentiator (30 seconds)

**Say:** *"Let me show you the Settings page quickly."*

**Action:** Navigate to **Settings**.

**Say:** *"The Incharge can select their preferred language — Hindi, Assamese, Telugu. Every AI alert from this point goes through the Bhashini NMT API before it reaches them. This is the core human-factors innovation: the AI's intelligence is now accessible to a frontline operator who has never used an English interface."*

**Say (closing):** *"To summarise: Physics-Informed AI running on a FastAPI backend, a React Three.js digital twin on the frontend, Role-Based Access Control separating the Supervisor fleet view from the Incharge operational view, and Bhashini bridging the language gap for India's frontline energy workers. Thank you."*

---

## 💡 Likely Judge Questions & Answers

| Question | Answer |
|---|---|
| *"Is this connected to real OIL data?"* | "No — this is a simulation prototype. The physics models are based on published Bober-Lantz and Gibbs equations, but the numerical values are demonstration data. Field calibration would require 6–12 months of historical telemetry from OIL." |
| *"How is this different from existing SCADA?"* | "SCADA monitors. We predict. Our PINN gives 30–90 second advance warning of rod float before it happens, not after. SCADA would show a spike after the rod has already impacted the pump barrel." |
| *"Why Bhashini over Google Translate?"* | "Bhashini is the Government of India's own sovereign NMT infrastructure, built specifically for Indian languages. It doesn't send sensitive industrial data to a foreign commercial API. It also supports less-resourced languages like Assamese and Bodo that Google handles poorly." |
| *"How does RBAC work technically?"* | "JWT tokens carry the user's role. The React Router `RequireRole` guard redirects at the frontend. The FastAPI middleware validates the same JWT on every API call at the backend. A Well Incharge cannot see another well's data even if they guess the URL." |
| *"What's the scalability path?"* | "The current architecture already uses a WebSocket hub pattern. Horizontal scaling means adding more FastAPI workers behind a load balancer. The Zustand store on the frontend is per-session, so there's no shared mutable state on the client." |

---

## 🗂️ Quick Reference — Credentials

| Role | Email | Password | Lands On |
|---|---|---|---|
| Field Supervisor | `supervisor@oil.com` | `supervisor123` | Supervisor Dashboard |
| Well Incharge (BW-14) | `incharge14@oil.com` | `incharge123` | Well BW-14 Overview |

---

*Guide prepared for SIH judge evaluation — keep this tab open during the demo.*
