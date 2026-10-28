# SAMAY — Public Service Deadline Tracker

**A modern, accessible, civic-tech web portal for tracking statutory public service guarantee deadlines.**

SAMAY (Statutory Accountability &amp; Monitoring of Administrative Yield) empowers citizens, desk officers, and commission administrators to monitor public service delivery timelines, prevent statutory defaults, and automatically draft official appeals under Right to Public Service (RTS) legislation.

---

## 🚀 Live Demo & How to Run

1. Open the project folder in your preferred code editor (e.g. VS Code).
2. Open `index.html` directly in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari), or use the **Live Server** extension in VS Code (**Right click `index.html` → Open with Live Server**).
3. Alternatively, run a quick local development server:
   ```bash
   # Using Python
   python -m http.server 8000
   # Then visit http://localhost:8000 in your browser
   ```
4. **No external dependencies, build tools, or packages are required.** Built entirely with clean vanilla HTML5, CSS3, and modern JavaScript.

---

## 🎨 Design System & UI/UX Improvements

The portal features a **modern public-service design system** inspired by national digital governance portals:
- **Palette**: Deep civic navy (`#0f233d` / `#173863`), crisp white cards (`#ffffff`), clean slate-grey canvas (`#f8fafc` / `#f1f5f9`), and warm gold/amber accents (`#d97706`).
- **Typography & Accessibility**: Clear typography with fluid font sizes (14px base, no illegible micro-text), meeting **WCAG AA / AAA contrast standards** across all text and interactive badges.
- **Responsive Layout**: Fluid breakpoints optimized for:
  - **Desktop (1200px+)**: Multi-column command center with sticky top navigation and side radar.
  - **Tablet (768px – 1199px)**: Two-column cards and responsive side panel stacking.
  - **Mobile (< 768px)**: Touch-friendly mobile drawer menu with dark backdrop overlay, stacked stat cards, scrollable tables, and tap-optimized buttons (minimum 44×44px).
- **Consistent Icons**: Crisp, resolution-independent SVG vector iconography that renders consistently across Windows, macOS, Android, and iOS.
- **Status Badges**: Distinct visual badges with dot indicators and accessible color coding:
  - **Overdue (Breached)**: Crimson Red (`#b91c1c` on `#fef2f2`, border `#fecaca`)
  - **Due Soon (≤ 5 Days)**: Amber Gold (`#92400e` on `#fffbeb`, border `#fde68a`)
  - **Pending (On Track)**: Royal Blue (`#1e40af` on `#eff6ff`, border `#bfdbfe`)
  - **Completed**: Emerald Green (`#047857` on `#ecfdf5`, border `#a7f3d0`)

---

## ⚡ Functional Features

### 1. Three Role-Based Dashboards
- **Citizen Dashboard**: Track personal applications, view statutory delivery clocks, inspect step-by-step case timelines, and prepare appeal drafts.
- **Officer Radar**: Proactively monitor desk queues, identify at-risk applications due in ≤ 5 days, review office health compliance index, and consult statutory service rules.
- **Commission Overview**: Audit district-wide disposal performance, inspect interactive GIS performance pins (Pune, Mumbai, Nashik, Nagpur, Aurangabad), review service delay distributions, and analyze administrative accountability.

### 2. Accurate Date Engine & Days Remaining
- Calculates days remaining dynamically using **the actual current date (`new Date()`)**.
- Accurately differentiates:
  - Past deadline: `X days overdue` (Overdue / Breached)
  - Due today: `Due today` (Due soon)
  - 1 to 5 days remaining: `X days left` (Due soon / At risk)
  - More than 5 days remaining: `X days left` (Pending / In progress)
  - Completed: `Delivered on time` (Completed)
- Top banner displays the live, formatted system date dynamically.

### 3. Search, Filter & Multi-Criteria Sorting
- **Real-Time Search**: Search applications instantly by service name, reference number, assigned office, or district.
- **Status Filtering**: Filter by All, Due Soon, Overdue, Pending, or Completed.
- **Sorting**:
  - Target Deadline (Soonest first / Latest first)
  - Submission Date (Newest first / Oldest first)
  - Service Name (Alphabetical A–Z)
- Clear empty state with single-click reset buttons when search yields no matches.

### 4. Application Tracking Form & Validation
- Form validates required fields, formats reference numbers into standard uppercase (`SAM-XXXX`), and ensures deadlines cannot precede submission dates.
- Features **inline error feedback** (`.field-error-msg` and red input highlight) as well as toast notification warnings.
- Submitting an application instantly recalculates metric cards, updates the Deadline Radar widget, synchronizes the officer queue, and persists to local storage.

### 5. Application Details & Dynamic Case Timeline
- Modal view presenting full metadata, statutory clock progression, assigned desk, and compliance status.
- Interactive actions:
  - **Toggle Status**: Mark as "Completed" or "In Progress".
  - **Delete Case**: Safely remove demo records.
  - **First Appeal**: Launch appeal generator for overdue applications.

### 6. Statutory First Appeal Generator
- Automatically drafts formal grievance letters citing Section 8 of the Right to Public Service Act.
- Pre-fills service name, reference number, submission date, and statutory deadline.
- Allows citizen to select grievance grounds and add clarifications.
- Includes **Copy to Clipboard** and **Download Plain Text (`.txt`)** options.

### 7. Full CSV Export Engine
- One-click spreadsheet export for:
  - Citizen applications (`samay-my-applications.csv`)
  - Officer case queue (`samay-officer-cases.csv`)
  - Commission district summary (`samay-commission-overview.csv`)
  - Office compliance report (`samay-office-health-report.csv`)
- Exports include UTF-8 BOM encoding for seamless display in Microsoft Excel, Google Sheets, and LibreOffice.

### 8. LocalStorage Persistence & Demo Reset
- Safely stores demonstration records in browser `localStorage` (`samay_demo_applications_v2` and `samay_officer_cases_v2`).
- Refreshing the browser preserves newly added applications, status changes, and deletions.
- Includes a prominent **Reset Sample Data** button to easily restore the original demonstration state at any time.

---

## 🔒 Security & Prototype Guidelines

- **Mock Data**: All sample cases, statistics, and district numbers are demonstration records designed for presentation purposes.
- **No Sensitive Personal Information**: The prototype does not collect or transmit passwords, Aadhaar numbers, or private citizen credentials.
- **Client-Side Simulation**: Document uploads are client-side prototypes; no files are transmitted to external servers.
- **Accessibility & Standards**: Adheres to modern web accessibility principles, keyboard navigation (ESC key to dismiss modals and menus), and reduced motion media queries.

---

## 📁 File Structure

```
samay/
├── index.html       # Semantic HTML5 app shell, three dashboards, and modal templates
├── style.css        # Modern, responsive public-service design system (navy/white/grey)
├── script.js        # Dynamic date engine, filtering, validation, persistence & exports
└── README.md        # Documentation, feature guide & demonstration instructions
```

## ⚡ Functional Features

### 1. Three Role-Based Dashboards
- **Citizen Dashboard**: Track personal applications, view statutory delivery clocks, inspect step-by-step case timelines, and prepare appeal drafts.
- **Officer Radar**: Proactively monitor desk queues, identify at-risk applications due in ≤ 5 days, review office health compliance index, and consult statutory service rules.
- **Commission Overview**: Audit district-wide disposal performance, inspect interactive GIS performance pins (Pune, Mumbai, Nashik, Nagpur, Aurangabad), review service delay distributions, and analyze administrative accountability.

### 2. Accurate Date Engine & Days Remaining
- Calculates days remaining dynamically using **the actual current date (`new Date()`)**.
- Accurately differentiates:
  - Past deadline: `X days overdue` (Overdue / Breached)
  - Due today: `Due today` (Due soon)
  - 1 to 5 days remaining: `X days left` (Due soon / At risk)
  - More than 5 days remaining: `X days left` (Pending / In progress)
  - Completed: `Delivered on time` (Completed)
- Top banner displays the live, formatted system date dynamically.

### 3. Search, Filter & Multi-Criteria Sorting
- **Real-Time Search**: Search applications instantly by service name, reference number, assigned office, or district.
- **Status Filtering**: Filter by All, Due Soon, Overdue, Pending, or Completed.
- **Sorting**:
  - Target Deadline (Soonest first / Latest first)
  - Submission Date (Newest first / Oldest first)
  - Service Name (Alphabetical A–Z)
- Clear empty state with single-click reset buttons when search yields no matches.

### 4. Application Tracking Form & Validation
- Form validates required fields, formats reference numbers into standard uppercase (`SAM-XXXX`), and ensures deadlines cannot precede submission dates.
- Features **inline error feedback** (`.field-error-msg` and red input highlight) as well as toast notification warnings.
- Submitting an application instantly recalculates metric cards, updates the Deadline Radar widget, synchronizes the officer queue, and persists to local storage.

### 5. Application Details & Dynamic Case Timeline
- Modal view presenting full metadata, statutory clock progression, assigned desk, and compliance status.
- Interactive actions:
  - **Toggle Status**: Mark as "Completed" or "In Progress".
  - **Delete Case**: Safely remove demo records.
  - **First Appeal**: Launch appeal generator for overdue applications.

### 6. Statutory First Appeal Generator
- Automatically drafts formal grievance letters citing Section 8 of the Right to Public Service Act.
- Pre-fills service name, reference number, submission date, and statutory deadline.
- Allows citizen to select grievance grounds and add clarifications.
- Includes **Copy to Clipboard** and **Download Plain Text (`.txt`)** options.

### 7. Full CSV Export Engine
- One-click spreadsheet export for:
  - Citizen applications (`samay-my-applications.csv`)
  - Officer case queue (`samay-officer-cases.csv`)
  - Commission district summary (`samay-commission-overview.csv`)
  - Office compliance report (`samay-office-health-report.csv`)
- Exports include UTF-8 BOM encoding for seamless display in Microsoft Excel, Google Sheets, and LibreOffice.

### 8. LocalStorage Persistence & Demo Reset
- Safely stores demonstration records in browser `localStorage` (`samay_demo_applications_v2` and `samay_officer_cases_v2`).
- Refreshing the browser preserves newly added applications, status changes, and deletions.
- Includes a prominent **Reset Sample Data** button to easily restore the original demonstration state at any time.

---

## 🔒 Security & Prototype Guidelines

- **Mock Data**: All sample cases, statistics, and district numbers are demonstration records designed for presentation purposes.
- **No Sensitive Personal Information**: The prototype does not collect or transmit passwords, Aadhaar numbers, or private citizen credentials.
- **Client-Side Simulation**: Document uploads are client-side prototypes; no files are transmitted to external servers.
- **Accessibility & Standards**: Adheres to modern web accessibility principles, keyboard navigation (ESC key to dismiss modals and menus), and reduced motion media queries.

---

## 📁 File Structure

```
samay/
├── index.html       # Semantic HTML5 app shell, three dashboards, and modal templates
├── style.css        # Modern, responsive public-service design system (navy/white/grey)
├── script.js        # Dynamic date engine, filtering, validation, persistence & exports
└── README.md        # Documentation, feature guide & demonstration instructions
```

