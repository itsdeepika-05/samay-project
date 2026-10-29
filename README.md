# SAMAY — “UPI for Service Promises”

**A Modern, Accessible, GovTech Landing Page & Statutory Public Service Deadline Tracker**

SAMAY (Statutory Accountability &amp; Monitoring of Administrative Yield) is a unified digital platform that transforms citizen service guarantees from discretionary favors into deterministic, enforceable timelines under the **Right to Public Services (RTS) Act**.

---

## 🚀 How to Run the Website Locally

You can run this project with zero build steps or package installations:

### Option 1: Direct Browser Launch
Simply double-click `index.html` or open it directly in any modern browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### Option 2: Local HTTP Server (Recommended for Web Speech API & Speech Synthesis)
Run this single command in your terminal from the project directory:

```powershell
# Using Python
python -m http.server 8000
```
Then visit:
```
http://localhost:8000
```

Alternatively, if you use Node.js:
```powershell
npx serve .
```
Or right-click `index.html` in VS Code and select **Open with Live Server**.

---

## 🌟 What's New: Landing Page & Voice Assistant Upgrade

### 1. Modern Government-Tech Visual Design
- **Color Palette**: Deep Civic Navy (`#0f233d` / `#173863`), Pure White (`#ffffff`), and Subtle National Saffron accents (`#ea580c` / `#f97316`).
- **Typography**: Clean `Inter` font stack with accessible line heights and WCAG AA/AAA compliant contrast ratios.
- **Micro-Interactions**: Ambient radial glow, hover card elevations, smooth scrolling navigation, and accessible keyboard focus states (`:focus-visible`).

### 2. Sticky Navbar with Brand Emblem
- Brand logo with clock/time emblem and tagline: *"UPI for Service Promises"*.
- Navigation links: **Home**, **How It Works**, **Services**, **Citizen Rights**, **Contact**.
- Action buttons: **Explore Demo** and **Login / Get Started**.
- Responsive mobile drawer menu with touch-friendly tap targets.

### 3. Hero Section with 3 Action Cards (Above the Fold)
- **Top Eyebrow**: *"TRANSPARENT GOVERNANCE. ACCOUNTABLE SERVICES."*
- **Main Heading**: *"Every Public Service. Every Deadline. Accountable."*
- **Three Prominent Cards**:
  1. **Citizen Login**: Apply for services, track applications, and understand rights. Routes to the Citizen Portal modal and dashboard.
  2. **Officer Portal**: Manage desk queues, monitor deadlines, and clear at-risk requests. Routes to the Officer Portal modal and radar.
  3. **Explore Demo**: Direct, instant access to sample workflows, live countdowns, and simulated cases without registration.

### 4. Instant Receipt Clock ("Start Clock from Slip")
A dedicated two-card interactive module matching the official citizen workflow:
- **Card 1: Start clock from slip**:
  - **Photo of slip**: Upload or capture physical receipt images with OCR scan simulation.
  - **Speak slip text**: Web Speech API voice dictation directly into the slip text field.
  - **Paste slip text**: Paste any receipt or acknowledgement text with instant smart regex parsing.
  - **Load sample slip**: One-click rotating loader with realistic receipts (Income Certificate, Caste Certificate, Domicile, Land Mutation).
  - **Read slip text**: Intelligent parser extracting Service, Application No, Date Received, and Office.
  - **Editable extracted fields**: Real-time reactive updates as user selects services or modifies dates.
- **Card 2: Clock and deadline**:
  - **Circular Dynamic Gauge**: Visual conic-gradient ring showing days remaining, on-track, due-soon, or overdue breach status.
  - **Accurate Statutory Calculation**: Calculates statutory turnaround days under RTS Act provisions (e.g. 15 days for Income Certificate, 21 days for Caste Certificate).
  - **Statutory Guarantee Note**: Cites relevant state RTS Act clauses and legal entitlement for Section 8 First Appeal on breach.
  - **Save to My Applications**: Persists the scanned case directly into `localStorage`, updating citizen stats and table immediately.
  - **Open in Citizen Dashboard**: Seamlessly transitions to the Citizen Workspace with the application highlighted.

### 5. Floating Voice Assistant ("Ask SAMAY")
- Accessible floating button in the bottom-right corner with microphone icon and pulsing indicator.
- Expandable bilingual assistant panel (English & हिन्दी):
  - Greeting: *"Namaste! I'm SAMAY Voice Assistant. How can I help you today?"*
  - **Browser Web Speech API** integration for speech-to-text (`SpeechRecognition`) and text-to-speech (`speechSynthesis`).
  - Animated soundwave listening overlay with manual stop button.
  - Speech synthesis audio mute/unmute control.
  - Suggestion chips for instant answers:
    1. *“How do I apply for a government service?”*
    2. *“How can I check my application status?”*
    3. *“What can I do if my application is delayed?”*
    4. *“How do I file an appeal?”*
    5. *“Which documents do I need?”*
  - Recognizes specific case queries (e.g. *“Status of SAM-2048”*) and answers with real-time in-memory tracking countdowns.
  - Graceful fallback for unsupported browsers with standard text messaging.

### 5. Step-by-Step Connecting Timeline (How It Works)
- **Step 1**: Choose a Government Service (check statutory days).
- **Step 2**: Submit & Receive Reference ID (official acknowledgement).
- **Step 3**: Track Progress & Clocks (proactive color-coded alerts).
- **Step 4**: File Automated Appeal (Section 8 First Appeal draft).

### 6. Key Features Grid
- 6 modern cards with SVG iconography:
  - Application Tracking
  - Service Deadline Monitoring
  - Citizen Rights Information
  - Proactive Delay Alerts
  - Grievance & Appeal Guidance
  - Voice-Based Assistance

### 7. Statutory Services Directory
- Catalog of popular state citizen services with guaranteed maximum turnaround times:
  - Income Certificate (15 Days · Tahsildar)
  - Caste Certificate (21 Days · SDO Office)
  - Domicile Certificate (15 Days · Executive Magistrate)
  - Birth & Death Registration (7 Days · Municipal Health)
  - Land Mutation / 7/12 Extract (30 Days · Talathi/Circle Officer)
  - Ration Card Modification (21 Days · Food & Supplies)
- Real-time search filter to quickly find any service or timeline.

### 8. Citizen Rights & RTS Act Section
- Highlights key legal protections under the Right to Public Services Act:
  - Guaranteed delivery by law.
  - Mandatory written reasons for rejection.
  - Right of First Appeal under Section 8.
  - Financial penalty deductions on defaulting officers.

### 9. Live-Looking Demo Preview Section
- Embedded preview table labeled with a prominent **DEMO DATA · SIMULATED DASHBOARD** badge.
- Shows live sample applications with status pills (Due Soon, Overdue, In Progress, Completed).
- Inspect Case buttons jump directly into the full working case details modal.
- Prominent button: **Launch Full Interactive Tracker →**.

### 10. Contact & Citizen Support
- Helpline details (1800-RTS-SAMAY) and District Kendra information.
- Working assistance form with client-side validation and toast confirmation.

### 11. Full Interactive Workspace Preserved
- Full multi-dashboard command center preserved and accessible via **Launch Demo**, **Explore Demo**, or the Login modals:
  - **Citizen Dashboard**: Stat cards, search, status filter, multi-criteria sort, deadline radar widget, educational timeline, add application form, details modal, appeal draft generator.
  - **Officer Radar**: Proactive desk queue management, at-risk filtering, office health score, rule registry.
  - **Commission Map**: Interactive district performance pins (Pune, Mumbai, Nashik, Nagpur, Aurangabad), delay distribution bar chart, office accountability table.
  - **CSV Exports**: One-click download for citizen applications, officer cases, commission reports, and office health.
  - **Seamless Navigation**: Clear **← Back to Public Portal** and **← Home Portal** buttons return to the landing page anytime.

---

## 📁 File Structure

```
samay/
├── index.html       # Landing page sections, modals, workspace app shell & voice widget
├── style.css        # Navy/white/saffron design system, responsive styles & animations
├── script.js        # Voice assistant engine, view router, statutory date logic & exports
└── README.md        # Documentation, feature guide & execution instructions
```

---

## 🏆 National Hackathon Presentation Highlights

When demonstrating this project to judges:
1. **Landing Page First Impression**: Start on the public landing page to showcase the citizen-first digital governance portal.
2. **Interactive Voice Assistant**: Click **Ask SAMAY** at bottom right. Demonstrate either voice input via microphone or click the quick question chips to see instant bilingual answers.
3. **The 3 Hero Action Paths**:
   - Click **Citizen Login** to show the mobile OTP and demo profile modal.
   - Click **Officer Portal** to show the administrative desk selector.
   - Click **Launch Demo** to transition into the interactive workspace.
4. **Statutory Deadline Engine**: In the Citizen Dashboard, highlight how days remaining are calculated dynamically from the actual current date (`new Date()`).
5. **Overdue First Appeal**: Open case `SAM-1987` (overdue case) and generate the formal appeal draft citing Section 8. Demonstrate **Copy to Clipboard** and **Download (.txt)**.
6. **Data Persistence**: Add a new application and refresh the browser to prove local persistence, or click **Reset sample data** to restore the initial demo state.
