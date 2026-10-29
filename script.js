/**
 * SAMAY — “UPI for Service Promises”
 * Full-Stack Frontend Controller & Voice Assistant Engine
 * 
 * Includes:
 * 1. Landing Page Navigation & View Router (Landing <-> Workspace)
 * 2. Voice Assistant ("Ask SAMAY") with Web Speech API & Bilingual Knowledge Base
 * 3. Citizen & Officer Portal Login Handlers
 * 4. Dynamic Statutory Deadline Engine & Real-Time Days Calculator
 * 5. Applications Table (Search, Filter, Multi-Criteria Sort, Pagination)
 * 6. Add Application Modal with Inline Validation
 * 7. Case Details & Statutory Progression Timeline
 * 8. First Appeal Generator (Section 8 RTS Act) with Copy & Download
 * 9. CSV Export Engines (Citizen, Officer, Commission, Office Health)
 * 10. LocalStorage Demo Persistence with Reset Capability
 */

(function () {
  "use strict";

  // =========================================================================
  // DOM Selectors Helper
  // =========================================================================
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Local storage keys
  const STORAGE_KEY_APPS = "samay_demo_applications_v3";
  const STORAGE_KEY_OFFICER = "samay_officer_cases_v3";

  // =========================================================================
  // Date Utilities & Accurate Days-Remaining Calculator
  // =========================================================================

  function getToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  }

  function parseDate(dateStr) {
    if (!dateStr) return getToday();
    if (dateStr instanceof Date) return dateStr;

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split("-").map(Number);
      return new Date(y, m - 1, d, 0, 0, 0, 0);
    }

    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0);
    }
    return getToday();
  }

  function formatDisplayDate(date) {
    const d = parseDate(date);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function toISODate(date) {
    const d = parseDate(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function getRelativeDate(offsetDays) {
    const d = getToday();
    d.setDate(d.getDate() + offsetDays);
    return d;
  }

  function getDeadlineAnalysis(deadlineStr, customStatus) {
    if (customStatus === "Completed") {
      return {
        days: 0,
        diffDays: 0,
        label: "Delivered on time",
        status: "Completed",
        badgeClass: "completed",
        pillClass: "completed-text"
      };
    }

    const deadline = parseDate(deadlineStr);
    const today = getToday();
    const diffMs = deadline.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const overdue = Math.abs(diffDays);
      return {
        days: diffDays,
        diffDays,
        label: `${overdue} ${overdue === 1 ? "day" : "days"} overdue`,
        status: "Overdue",
        badgeClass: "breached",
        pillClass: "overdue-text"
      };
    } else if (diffDays === 0) {
      return {
        days: 0,
        diffDays: 0,
        label: "Due today",
        status: "Due soon",
        badgeClass: "at-risk",
        pillClass: "due-soon-text"
      };
    } else if (diffDays <= 5) {
      return {
        days: diffDays,
        diffDays,
        label: `${diffDays} ${diffDays === 1 ? "day" : "days"} left`,
        status: "Due soon",
        badgeClass: "at-risk",
        pillClass: "due-soon-text"
      };
    } else {
      return {
        days: diffDays,
        diffDays,
        label: `${diffDays} days left`,
        status: "Pending",
        badgeClass: "on-track",
        pillClass: ""
      };
    }
  }

  // =========================================================================
  // Default Seed Data
  // =========================================================================

  function createInitialApplications() {
    return [
      {
        ref: "SAM-2048",
        service: "Income certificate",
        category: "Revenue",
        symbol: "▤",
        submitted: formatDisplayDate(getRelativeDate(-11)),
        deadline: formatDisplayDate(getRelativeDate(4)), // 4 days left: Due soon
        status: "Due soon",
        officer: "Nayab Tahsildar",
        district: "Pune",
        progress: 75,
        notes: "Field inquiry completed by Talathi; awaiting Tahsildar approval."
      },
      {
        ref: "SAM-2031",
        service: "Residence certificate",
        category: "Revenue",
        symbol: "⌂",
        submitted: formatDisplayDate(getRelativeDate(-5)),
        deadline: formatDisplayDate(getRelativeDate(10)), // 10 days left: Pending
        status: "Pending",
        officer: "Talathi Office",
        district: "Pune",
        progress: 33,
        notes: "Address verification documentation received."
      },
      {
        ref: "SAM-1987",
        service: "Caste certificate",
        category: "Social Justice",
        symbol: "▧",
        submitted: formatDisplayDate(getRelativeDate(-25)),
        deadline: formatDisplayDate(getRelativeDate(-10)), // 10 days overdue: Overdue
        status: "Overdue",
        officer: "Sub-Divisional Officer (SDO)",
        district: "Nashik",
        progress: 100,
        notes: "Exceeded statutory 15-day limit. Eligible for First Appeal."
      },
      {
        ref: "SAM-2012",
        service: "Birth certificate",
        category: "Registration",
        symbol: "✳",
        submitted: formatDisplayDate(getRelativeDate(-8)),
        deadline: formatDisplayDate(getRelativeDate(7)), // 7 days left: Pending
        status: "Pending",
        officer: "Municipal Corporation Desk",
        district: "Mumbai",
        progress: 50,
        notes: "Hospital record verified; ready for digital signature."
      },
      {
        ref: "SAM-1940",
        service: "Domicile certificate",
        category: "Revenue",
        symbol: "✓",
        submitted: formatDisplayDate(getRelativeDate(-20)),
        deadline: formatDisplayDate(getRelativeDate(-5)),
        status: "Completed",
        officer: "Executive Magistrate",
        district: "Pune",
        progress: 100,
        notes: "Certificate digitally signed and issued to applicant."
      }
    ];
  }

  function createInitialOfficerCases() {
    return [
      {
        initials: "RK",
        name: "Ramesh K. · Income certificate",
        ref: "SAM-2048",
        office: "Pune · Nayab Tahsildar",
        deadline: formatDisplayDate(getRelativeDate(4)),
        status: "Due soon",
        days: "4 days remaining"
      },
      {
        initials: "SP",
        name: "Sonal P. · Caste certificate",
        ref: "SAM-1987",
        office: "Nashik · SDO Office",
        deadline: formatDisplayDate(getRelativeDate(-10)),
        status: "Overdue",
        days: "10 days overdue"
      },
      {
        initials: "AM",
        name: "Aarav M. · Residence certificate",
        ref: "SAM-2031",
        office: "Pune · Talathi Office",
        deadline: formatDisplayDate(getRelativeDate(10)),
        status: "Pending",
        days: "10 days remaining"
      },
      {
        initials: "ND",
        name: "Nisha D. · Birth certificate",
        ref: "SAM-2012",
        office: "Mumbai · Municipal Office",
        deadline: formatDisplayDate(getRelativeDate(7)),
        status: "Pending",
        days: "7 days remaining"
      }
    ];
  }

  const officesData = [
    { name: "Pune · Revenue Office", cases: 2180, late: 6.2, appeals: 112, performance: 92 },
    { name: "Nashik · SDO Office", cases: 1740, late: 13.8, appeals: 186, performance: 74 },
    { name: "Mumbai · Municipal Office", cases: 2950, late: 4.1, appeals: 94, performance: 96 },
    { name: "Nagpur · Revenue Office", cases: 1830, late: 11.2, appeals: 173, performance: 79 },
    { name: "Aurangabad · SDO Office", cases: 1460, late: 8.6, appeals: 121, performance: 85 }
  ];

  const districtData = {
    Pune: { late: "6.2%", within: "92%", cases: "2,180" },
    Nashik: { late: "13.8%", within: "84%", cases: "1,740" },
    Nagpur: { late: "11.2%", within: "87%", cases: "1,830" },
    Mumbai: { late: "4.1%", within: "96%", cases: "2,950" },
    Aurangabad: { late: "8.6%", within: "89%", cases: "1,460" }
  };

  // State
  let applications = [];
  let officerCases = [];
  let toastTimer = null;

  // =========================================================================
  // LocalStorage Persistence
  // =========================================================================

  function loadPersistedData() {
    try {
      const storedApps = localStorage.getItem(STORAGE_KEY_APPS);
      const storedCases = localStorage.getItem(STORAGE_KEY_OFFICER);
      applications = storedApps ? JSON.parse(storedApps) : createInitialApplications();
      officerCases = storedCases ? JSON.parse(storedCases) : createInitialOfficerCases();
    } catch (e) {
      console.warn("Storage access blocked or failed, using in-memory demo data.", e);
      applications = createInitialApplications();
      officerCases = createInitialOfficerCases();
    }
    syncComputedStatuses();
  }

  function savePersistedData() {
    try {
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(applications));
      localStorage.setItem(STORAGE_KEY_OFFICER, JSON.stringify(officerCases));
    } catch (e) {
      console.warn("Unable to save to localStorage", e);
    }
  }

  function resetDemoData() {
    applications = createInitialApplications();
    officerCases = createInitialOfficerCases();
    savePersistedData();
    syncComputedStatuses();
    renderAllViews();
    toast("Demonstration records reset to original sample state.", "info");
  }

  function syncComputedStatuses() {
    applications.forEach((a) => {
      const analysis = getDeadlineAnalysis(a.deadline, a.status);
      if (a.status !== "Completed") {
        a.status = analysis.status;
      }
      a.computedDays = analysis.label;
      a.computedClass = analysis.badgeClass;
      a.pillClass = analysis.pillClass;
    });

    officerCases.forEach((c) => {
      const analysis = getDeadlineAnalysis(c.deadline, c.status);
      if (c.status !== "Completed") {
        c.status = analysis.status;
      }
      c.days = analysis.label;
      c.badgeClass = analysis.badgeClass;
    });
  }

  // =========================================================================
  // Toast Notifications
  // =========================================================================

  function toast(message, type = "info") {
    const el = $("#toast");
    if (!el) return;

    el.className = `toast toast-${type} show`;
    el.innerHTML = `<span>${escapeHtml(message)}</span>`;

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove("show");
    }, 3800);
  }

  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));
  }

  // =========================================================================
  // View Router: Landing Page <-> Workspace Dashboards
  // =========================================================================

  function showLandingPage() {
    const landing = $("#landingPage");
    const workspace = $("#workspaceApp");
    if (landing) landing.classList.remove("hidden");
    if (workspace) workspace.classList.add("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showWorkspace(viewName = "citizen") {
    const landing = $("#landingPage");
    const workspace = $("#workspaceApp");
    if (landing) landing.classList.add("hidden");
    if (workspace) workspace.classList.remove("hidden");

    switchWorkspaceView(viewName);
    renderAllViews();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function switchWorkspaceView(viewName) {
    $$(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${viewName}`));
    $$(".nav-item").forEach((btn) => btn.classList.toggle("active", btn.dataset.view === viewName));

    const titles = {
      citizen: "Citizen dashboard",
      officer: "Officer radar",
      commission: "Commission map"
    };

    const crumb = $("#crumbTitle");
    if (crumb) crumb.textContent = titles[viewName] || "Citizen dashboard";

    closeSidebar();
  }

  function openSidebar() {
    const sidebar = $("#sidebar");
    const backdrop = $("#sidebarBackdrop");
    const menuBtn = $("#menuBtn");
    if (sidebar) sidebar.classList.add("open");
    if (backdrop) backdrop.classList.remove("hidden");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
  }

  function closeSidebar() {
    const sidebar = $("#sidebar");
    const backdrop = $("#sidebarBackdrop");
    const menuBtn = $("#menuBtn");
    if (sidebar) sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.add("hidden");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  }

  // =========================================================================
  // Render: Citizen Dashboard & Table
  // =========================================================================

  function renderApplications() {
    syncComputedStatuses();

    const query = ($("#applicationSearch")?.value || "").trim().toLowerCase();
    const filter = $("#statusFilter")?.value || "all";
    const sort = $("#sortFilter")?.value || "deadline-asc";

    let rows = applications.filter((a) => {
      let statusMatches = true;
      if (filter === "due-soon") statusMatches = a.status === "Due soon" || a.status === "At risk";
      else if (filter === "overdue") statusMatches = a.status === "Overdue" || a.status === "Breached";
      else if (filter === "pending") statusMatches = a.status === "Pending" || a.status === "On track";
      else if (filter === "completed") statusMatches = a.status === "Completed";

      const searchText = `${a.service} ${a.ref} ${a.officer || ""} ${a.district || ""} ${a.category || ""}`.toLowerCase();
      const queryMatches = !query || searchText.includes(query);

      return statusMatches && queryMatches;
    });

    rows.sort((a, b) => {
      const dateA = parseDate(a.deadline).getTime();
      const dateB = parseDate(b.deadline).getTime();
      const subA = parseDate(a.submitted).getTime();
      const subB = parseDate(b.submitted).getTime();

      switch (sort) {
        case "deadline-asc": return dateA - dateB;
        case "deadline-desc": return dateB - dateA;
        case "submitted-desc": return subB - subA;
        case "submitted-asc": return subA - subB;
        case "service-asc": return a.service.localeCompare(b.service);
        default: return dateA - dateB;
      }
    });

    const tbody = $("#applicationRows");
    if (tbody) {
      tbody.innerHTML = rows
        .map(
          (a) => `
        <tr data-ref="${escapeHtml(a.ref)}">
          <td>
            <div class="service-cell">
              <span class="service-symbol">${escapeHtml(a.symbol || "▤")}</span>
              <div>
                <strong>${escapeHtml(a.service)}</strong>
                <small>${escapeHtml(a.ref)}</small>
              </div>
            </div>
          </td>
          <td><span class="mini-tag">${escapeHtml(a.category || "General")}</span></td>
          <td>${escapeHtml(a.submitted)}</td>
          <td><strong>${escapeHtml(a.deadline)}</strong></td>
          <td>
            <span class="days-pill ${a.pillClass || ""}">${escapeHtml(a.computedDays)}</span>
          </td>
          <td>
            <span class="badge ${a.computedClass || "neutral"}">${escapeHtml(a.status)}</span>
          </td>
          <td class="text-right">
            <button class="row-action" data-open-case="${escapeHtml(a.ref)}" aria-label="View details for ${escapeHtml(a.service)} ${escapeHtml(a.ref)}">
              Details →
            </button>
          </td>
        </tr>
      `
        )
        .join("");
    }

    const emptyState = $("#tableEmpty");
    if (emptyState) {
      emptyState.classList.toggle("hidden", rows.length > 0);
    }

    const countEl = $("#applicationCount");
    if (countEl) {
      countEl.textContent = `Showing ${rows.length} of ${applications.length} applications`;
    }

    const totalApps = applications.length;
    const pendingApps = applications.filter((a) => a.status === "Pending" || a.status === "On track").length;
    const dueSoonApps = applications.filter((a) => a.status === "Due soon" || a.status === "At risk").length;
    const overdueApps = applications.filter((a) => a.status === "Overdue" || a.status === "Breached").length;
    const completedApps = applications.filter((a) => a.status === "Completed").length;

    if ($("#statTotal")) $("#statTotal").textContent = String(totalApps).padStart(2, "0");
    if ($("#statOnTrack")) $("#statOnTrack").textContent = String(pendingApps).padStart(2, "0");
    if ($("#statRisk")) $("#statRisk").textContent = String(dueSoonApps).padStart(2, "0");
    if ($("#statBreached")) $("#statBreached").textContent = String(overdueApps).padStart(2, "0");
    if ($("#statCompleted")) $("#statCompleted").textContent = String(completedApps).padStart(2, "0");

    const alertCount = dueSoonApps + overdueApps;
    const badgeEl = $("#citizenAlertBadge");
    if (badgeEl) {
      if (alertCount > 0) {
        badgeEl.style.display = "inline-block";
        badgeEl.textContent = alertCount;
      } else {
        badgeEl.style.display = "none";
      }
    }

    renderDeadlineRadar();
  }

  function renderDeadlineRadar() {
    const activeApps = applications.filter((a) => a.status !== "Completed");
    activeApps.sort((a, b) => parseDate(a.deadline).getTime() - parseDate(b.deadline).getTime());

    const urgent = activeApps[0];
    const ringEl = $("#radarRing");
    const daysEl = $("#radarDays");
    const unitEl = $("#radarUnit");
    const nameEl = $("#radarServiceName");
    const badgeEl = $("#radarBadge");
    const dotEl = $("#radarStatusDot");
    const dateEl = $("#radarDeadlineDate");
    const copyEl = $("#radarCopyText");
    const btnEl = $("#radarActionBtn");

    if (!urgent) {
      if (ringEl) ringEl.className = "radar-ring safe-gauge";
      if (daysEl) daysEl.textContent = "✓";
      if (unitEl) unitEl.textContent = "All Clear";
      if (nameEl) nameEl.textContent = "No pending deadlines";
      if (badgeEl) {
        badgeEl.className = "badge completed";
        badgeEl.textContent = "All Compliant";
      }
      if (dotEl) dotEl.className = "status-dot green-bg";
      if (dateEl) dateEl.textContent = "—";
      if (copyEl) copyEl.textContent = "All tracked applications have been resolved within statutory timeframes.";
      if (btnEl) btnEl.style.display = "none";
      return;
    }

    if (btnEl) {
      btnEl.style.display = "block";
      btnEl.dataset.openCase = urgent.ref;
    }

    const analysis = getDeadlineAnalysis(urgent.deadline, urgent.status);
    const absDays = Math.abs(analysis.diffDays);

    if (daysEl) daysEl.textContent = String(absDays).padStart(2, "0");
    if (unitEl) {
      if (analysis.diffDays < 0) {
        unitEl.textContent = absDays === 1 ? "day late" : "days late";
      } else if (analysis.diffDays === 0) {
        unitEl.textContent = "due today";
      } else {
        unitEl.textContent = absDays === 1 ? "day left" : "days left";
      }
    }

    if (nameEl) nameEl.textContent = urgent.service;
    if (dateEl) dateEl.textContent = urgent.deadline;

    if (ringEl) {
      if (analysis.diffDays < 0) ringEl.className = "radar-ring overdue-gauge";
      else if (analysis.diffDays <= 5) ringEl.className = "radar-ring";
      else ringEl.className = "radar-ring safe-gauge";
    }

    if (badgeEl) {
      badgeEl.className = `badge ${analysis.badgeClass}`;
      badgeEl.textContent = analysis.status;
    }

    if (dotEl) {
      dotEl.className = `status-dot ${
        analysis.diffDays < 0 ? "red-bg" : analysis.diffDays <= 5 ? "amber-bg" : "blue-bg"
      }`;
    }

    if (copyEl) {
      if (analysis.diffDays < 0) {
        copyEl.textContent = `This demo case has passed its statutory target date. An official First Appeal may be initiated.`;
      } else if (analysis.diffDays <= 5) {
        copyEl.textContent = `Your demo case is within the 5-day critical alert window. Desk follow-up recommended.`;
      } else {
        copyEl.textContent = `Application is progressing smoothly within the notified 15-day service timeline.`;
      }
    }
  }

  // =========================================================================
  // Render: Officer Radar & Commission Views
  // =========================================================================

  function renderOfficerCases() {
    const filter = $("#officerFilter")?.value || "all";

    const rows = officerCases.filter((c) => {
      if (filter === "all") return true;
      if (filter === "At risk") return c.status === "Due soon" || c.status === "At risk";
      if (filter === "Breached") return c.status === "Overdue" || c.status === "Breached";
      return true;
    });

    const container = $("#officerCases");
    if (container) {
      container.innerHTML =
        rows
          .map(
            (c) => `
        <div class="case-item">
          <div class="case-avatar">${escapeHtml(c.initials || "CR")}</div>
          <div class="case-main">
            <strong>${escapeHtml(c.name)}</strong>
            <small>${escapeHtml(c.ref)} · ${escapeHtml(c.office)}</small>
          </div>
          <div class="case-meta">
            <span class="badge ${c.badgeClass || "at-risk"}">${escapeHtml(c.status)}</span>
            <small>${escapeHtml(c.days)}</small>
          </div>
          <button class="secondary-btn compact-btn" data-open-case="${escapeHtml(c.ref)}" aria-label="Review case ${escapeHtml(c.ref)}">
            Review →
          </button>
        </div>
      `
          )
          .join("") || `<div class="table-empty"><p>No officer cases matching this filter.</p></div>`;
    }

    const dueSoonTotal = officerCases.filter((c) => c.status === "Due soon" || c.status === "At risk").length;
    const overdueTotal = officerCases.filter((c) => c.status === "Overdue" || c.status === "Breached").length;
    if ($("#officerTotalCount")) $("#officerTotalCount").textContent = String(120 + officerCases.length);
    if ($("#officerDueSoonCount")) $("#officerDueSoonCount").textContent = String(15 + dueSoonTotal).padStart(2, "0");
    if ($("#officerOverdueCount")) $("#officerOverdueCount").textContent = String(5 + overdueTotal).padStart(2, "0");
  }

  function renderOffices() {
    const query = ($("#officeSearch")?.value || "").trim().toLowerCase();
    const rows = officesData.filter((o) => o.name.toLowerCase().includes(query));

    const tbody = $("#officeRows");
    if (tbody) {
      tbody.innerHTML = rows
        .map((o) => {
          const state = o.late >= 12 ? "danger" : o.late >= 8 ? "warning" : "";
          const statusText = o.late >= 12 ? "High Intervention" : o.late >= 8 ? "Active Monitoring" : "Compliant";
          const color = o.late >= 12 ? "var(--status-red)" : o.late >= 8 ? "var(--status-amber)" : "var(--status-green)";

          return `
          <tr>
            <td>
              <div class="service-cell">
                <span class="service-symbol">⌖</span>
                <div>
                  <strong>${escapeHtml(o.name)}</strong>
                  <small>Statutory Competent Authority</small>
                </div>
              </div>
            </td>
            <td><strong>${o.cases.toLocaleString("en-IN")}</strong></td>
            <td>
              <strong style="color: ${color}">${o.late.toFixed(1)}%</strong>
            </td>
            <td>${o.appeals}</td>
            <td>
              <span class="performance ${state}" title="${o.performance}% on-time rate">
                <span style="width: ${o.performance}%"></span>
              </span>
              <span style="font-size: 0.78rem; font-weight: 600; color: var(--slate-600)">${statusText}</span>
            </td>
          </tr>
        `;
        })
        .join("");
    }
  }

  function renderAllViews() {
    renderApplications();
    renderOfficerCases();
    renderOffices();
    updateDateDisplay();
  }

  function updateDateDisplay() {
    const el = $("#currentDateDisplay");
    if (!el) return;
    const now = new Date();
    const formatted = now.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    el.textContent = `${formatted.toUpperCase()} · MAHARASHTRA RTS JURISDICTION`;
  }

  // =========================================================================
  // Modal Controller (Case Details, Add App, Appeals, Policies)
  // =========================================================================

  function openModal(title, htmlContent) {
    const titleEl = $("#modalTitle");
    const bodyEl = $("#modalBody");
    const backdrop = $("#modalBackdrop");

    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = htmlContent;
    if (backdrop) backdrop.classList.remove("hidden");

    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const backdrop = $("#modalBackdrop");
    const citizenModal = $("#citizenLoginModal");
    const officerModal = $("#officerLoginModal");

    if (backdrop) backdrop.classList.add("hidden");
    if (citizenModal) citizenModal.classList.add("hidden");
    if (officerModal) officerModal.classList.add("hidden");

    document.body.style.overflow = "";
  }

  // =========================================================================
  // Case Details Modal
  // =========================================================================

  function showCaseDetails(ref) {
    const app = applications.find((x) => x.ref === ref) ||
      officerCases.find((x) => x.ref === ref);

    if (!app) {
      toast("Case record not found in demonstration dataset.", "error");
      return;
    }

    const service = app.service || app.name.split("·")[1]?.trim() || app.name;
    const submitted = app.submitted || "16 Oct 2026";
    const deadline = app.deadline || "31 Oct 2026";
    const officer = app.officer || app.office || "Assigned Public Authority";
    const district = app.district || "Pune";
    const category = app.category || "Certificate";
    const isCompleted = app.status === "Completed";
    const isOverdue = app.status === "Overdue" || app.status === "Breached";
    const analysis = getDeadlineAnalysis(deadline, app.status);

    openModal(
      "Application Details & Statutory Clock",
      `
      <div class="case-detail-grid">
        <div class="detail-tile">
          <span>Service Name</span>
          <strong>${escapeHtml(service)}</strong>
        </div>
        <div class="detail-tile">
          <span>Application Reference</span>
          <strong>${escapeHtml(app.ref)}</strong>
        </div>
        <div class="detail-tile">
          <span>Category & Jurisdiction</span>
          <strong>${escapeHtml(category)} · ${escapeHtml(district)}</strong>
        </div>
        <div class="detail-tile">
          <span>Assigned Office / Desk</span>
          <strong>${escapeHtml(officer)}</strong>
        </div>
        <div class="detail-tile">
          <span>Date of Submission</span>
          <strong>${escapeHtml(submitted)}</strong>
        </div>
        <div class="detail-tile">
          <span>Notified Statutory Deadline</span>
          <strong>${escapeHtml(deadline)}</strong>
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-top:1px solid var(--slate-200);border-bottom:1px solid var(--slate-200);">
        <div>
          <span style="font-size:0.75rem;color:var(--slate-500);display:block;">Statutory Status</span>
          <span class="days-pill ${analysis.pillClass}">${escapeHtml(analysis.label)}</span>
        </div>
        <span class="badge ${analysis.badgeClass}">${escapeHtml(analysis.status)}</span>
      </div>

      <div class="detail-timeline">
        <div>
          <strong>1. Receipt Issued & Clock Started</strong>
          <span>Submitted on ${escapeHtml(submitted)}. Acknowledgement generated with reference number ${escapeHtml(app.ref)}.</span>
        </div>
        <div>
          <strong>2. Assigned Competent Authority</strong>
          <span>Documents dispatched to ${escapeHtml(officer)} for field scrutiny and verification.</span>
        </div>
        <div>
          <strong>3. Statutory Compliance Window</strong>
          <span>${
            isCompleted
              ? "Service fulfilled within the notified deadline."
              : isOverdue
              ? `Statutory delivery date of ${escapeHtml(deadline)} has passed. Under Section 8 of the Public Service Act, citizen is entitled to file a First Appeal.`
              : `Current target deadline is ${escapeHtml(deadline)}. Desk is under proactive deadline monitoring.`
          }</span>
        </div>
      </div>

      ${
        isOverdue
          ? `
        <div style="background:var(--status-amber-bg);border:1px solid var(--status-amber-bd);padding:14px;border-radius:var(--radius-md);font-size:0.82rem;line-height:1.55;color:var(--status-amber);margin-bottom:16px;">
          <strong>Notice of Statutory Delay:</strong> This application has exceeded the maximum timeframe mandated by the Right to Public Service Rules. You may generate an appeal draft addressed to the designated Appellate Authority.
        </div>
      `
          : ""
      }

      <div class="modal-actions">
        <button type="button" class="secondary-btn" id="modalCloseDetailBtn">Close</button>
        <button type="button" class="secondary-btn" id="modalDeleteAppBtn" style="color:var(--status-red);border-color:var(--status-red-bd)">
          Delete Demo Case
        </button>
        <button type="button" class="secondary-btn" id="modalToggleCompleteBtn">
          ${isCompleted ? "Mark as In Progress" : "✓ Mark as Completed"}
        </button>
        ${
          isOverdue
            ? `<button type="button" class="primary-btn saffron-btn" id="modalPrepareAppealBtn">Prepare Appeal Draft</button>`
            : `<button type="button" class="primary-btn" id="modalFollowUpBtn">Mark Follow-up Note</button>`
        }
      </div>
    `
    );

    $("#modalCloseDetailBtn")?.addEventListener("click", closeModal);

    $("#modalDeleteAppBtn")?.addEventListener("click", () => {
      if (confirm(`Remove demo application ${app.ref}?`)) {
        applications = applications.filter((x) => x.ref !== app.ref);
        officerCases = officerCases.filter((x) => x.ref !== app.ref);
        savePersistedData();
        renderApplications();
        renderOfficerCases();
        closeModal();
        toast(`Application ${app.ref} deleted from demo workspace.`, "info");
      }
    });

    $("#modalToggleCompleteBtn")?.addEventListener("click", () => {
      const targetApp = applications.find((x) => x.ref === app.ref);
      if (targetApp) {
        targetApp.status = isCompleted ? "Pending" : "Completed";
        targetApp.progress = isCompleted ? 50 : 100;
        savePersistedData();
        renderApplications();
        renderOfficerCases();
        closeModal();
        toast(
          `Application ${app.ref} marked as ${targetApp.status}.`,
          targetApp.status === "Completed" ? "success" : "info"
        );
      }
    });

    $("#modalPrepareAppealBtn")?.addEventListener("click", () => {
      closeModal();
      showAppealDraftModal(app);
    });

    $("#modalFollowUpBtn")?.addEventListener("click", () => {
      closeModal();
      toast(`Follow-up reminder set for reference ${app.ref}.`, "success");
    });
  }

  // =========================================================================
  // Appeal Draft Generator Modal
  // =========================================================================

  function showAppealDraftModal(app) {
    const service = app.service || app.name || "Public Service";
    const ref = app.ref || "SAM-2000";

    openModal(
      "Prepare Statutory First Appeal Draft",
      `
      <p style="font-size:0.84rem;line-height:1.6;color:var(--slate-600);margin-top:0;">
        Under the Right to Public Service Guarantee, citizens are entitled to an expedited review when statutory delivery timeframes are breached. Customize and generate a review request below.
      </p>

      <form id="appealForm">
        <div class="form-grid">
          <div class="form-field full">
            <label for="appealApplicantName">Applicant Full Name *</label>
            <input id="appealApplicantName" required placeholder="Enter applicant name" value="Citizen Applicant" />
            <span class="field-error-msg hidden" id="errAppealName"></span>
          </div>

          <div class="form-field">
            <label for="appealServiceField">Service Name</label>
            <input id="appealServiceField" value="${escapeHtml(service)}" readonly style="background:var(--slate-100)" />
          </div>

          <div class="form-field">
            <label for="appealRefField">Application Reference</label>
            <input id="appealRefField" value="${escapeHtml(ref)}" readonly style="background:var(--slate-100)" />
          </div>

          <div class="form-field full">
            <label for="appealGrievanceType">Grounds for Grievance *</label>
            <select id="appealGrievanceType">
              <option value="Statutory service deadline exceeded without written explanation">Exceeded statutory timeframe (Section 8 RTS Act)</option>
              <option value="Field enquiry completed but certificate not dispatched">Field enquiry completed; delivery delayed</option>
              <option value="Incorrect document deficiency raised after statutory window">Deficiency raised belatedly after timeline expired</option>
              <option value="No response from designated desk officer">No communication from assigned officer</option>
            </select>
          </div>

          <div class="form-field full">
            <label for="appealNotes">Additional Clarifications</label>
            <textarea id="appealNotes" rows="3" placeholder="Provide any details regarding prior visits or follow-ups..."></textarea>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-btn" id="cancelAppealBtn">Cancel</button>
          <button type="submit" class="primary-btn saffron-btn">Generate Appeal Draft</button>
        </div>
      </form>
    `
    );

    $("#cancelAppealBtn")?.addEventListener("click", closeModal);

    $("#appealForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const applicantName = ($("#appealApplicantName")?.value || "").trim();
      const grievance = $("#appealGrievanceType")?.value;
      const notes = ($("#appealNotes")?.value || "").trim();

      if (!applicantName) {
        $("#errAppealName")?.classList.remove("hidden");
        $("#errAppealName").textContent = "Please enter applicant name.";
        return;
      }

      const todayStr = formatDisplayDate(getToday());
      const appealText = `TO:
The First Appellate Authority
Right to Public Services Act
Office of the Competent District Authority

DATE: ${todayStr}

SUBJECT: First Appeal regarding statutory delay in delivery of ${service} (Reference: ${ref})

Respected Sir / Madam,

I am writing to formally submit this First Appeal under the applicable provisions of the Right to Public Services Act regarding my application detailed below:

1. Application Reference: ${ref}
2. Service Requested: ${service}
3. Submission Date: ${app.submitted || "As per official receipt"}
4. Mandated Statutory Deadline: ${app.deadline || "Within notified days"}
5. Designated Office: ${app.officer || "Local Tahsildar / SDO Desk"}

GROUNDS OF APPEAL:
${grievance}
${notes ? `Additional Context: ${notes}` : ""}

RELIEF SOUGHT:
In accordance with the statutory guarantee, I respectfully request that this matter be urgently reviewed, the pending service be cleared for issuance without further delay, and reasons for the administrative breach be recorded.

I have attached a copy of the official filing receipt and application summary for your immediate reference.

Yours faithfully,
${applicantName}
Mobile & Address: (As registered with application ${ref})

[DISCLAIMER: This is a prototype grievance document generated for demonstration purposes. Confirm filing procedures with the appropriate state appellate office.]`;

      openModal(
        "Statutory Appeal Review",
        `
        <p style="font-size:0.84rem;color:var(--slate-600);margin-top:0;">
          Review the generated formal grievance text. You may copy the draft or download it as a plain-text document.
        </p>
        <div class="form-field full">
          <label for="draftAppealOutput">Generated Appeal Draft</label>
          <textarea id="draftAppealOutput" rows="12" style="font-family:ui-monospace,SFMono-Regular,monospace;font-size:0.82rem;line-height:1.55;">${escapeHtml(appealText)}</textarea>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-btn" id="backToAppealFormBtn">← Back</button>
          <button type="button" class="secondary-btn" id="downloadAppealTxtBtn">↓ Download (.txt)</button>
          <button type="button" class="primary-btn saffron-btn" id="copyAppealBtn">📋 Copy to Clipboard</button>
        </div>
      `
      );

      $("#backToAppealFormBtn")?.addEventListener("click", () => showAppealDraftModal(app));

      $("#copyAppealBtn")?.addEventListener("click", async () => {
        const text = $("#draftAppealOutput")?.value;
        try {
          await navigator.clipboard.writeText(text);
          toast("Appeal draft copied to clipboard.", "success");
        } catch (err) {
          $("#draftAppealOutput")?.select();
          toast("Selected text. Please use Ctrl+C to copy.", "info");
        }
      });

      $("#downloadAppealTxtBtn")?.addEventListener("click", () => {
        const text = $("#draftAppealOutput")?.value;
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SAMAY-Appeal-Draft-${ref}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast(`Appeal draft downloaded as SAMAY-Appeal-Draft-${ref}.txt`, "success");
      });
    });
  }

  // =========================================================================
  // Add Application Modal & Form Validation
  // =========================================================================

  function showTrackApplicationForm() {
    const todayISO = toISODate(getToday());
    const defaultDeadlineISO = toISODate(getRelativeDate(15));
    const nextRef = `SAM-${Math.floor(2050 + Math.random() * 50)}`;

    openModal(
      "Track a Public Service Application",
      `
      <p style="font-size:0.84rem;color:var(--slate-600);margin-top:0;line-height:1.5;">
        Add an application to track its statutory delivery window. All demo data is safely persisted in your browser's local memory.
      </p>

      <form id="trackAppForm" novalidate>
        <div class="form-grid">
          <div class="form-field full">
            <label for="formServiceName">Service Name *</label>
            <input id="formServiceName" required placeholder="e.g. Income certificate, Caste certificate, Ration card" />
            <span class="field-error-msg hidden" id="errServiceName"></span>
          </div>

          <div class="form-field">
            <label for="formCategory">Category</label>
            <select id="formCategory">
              <option value="Revenue">Revenue & Land Records</option>
              <option value="Social Justice">Social Justice & Welfare</option>
              <option value="Registration">Civic Registration & Birth/Death</option>
              <option value="Civic Services">Municipal & Urban Services</option>
              <option value="Certificates">Certificates & Licenses</option>
            </select>
          </div>

          <div class="form-field">
            <label for="formRef">Reference Number *</label>
            <input id="formRef" required placeholder="e.g. SAM-2055" value="${nextRef}" />
            <span class="field-error-msg hidden" id="errRef"></span>
          </div>

          <div class="form-field">
            <label for="formSubDate">Submission Date *</label>
            <input id="formSubDate" type="date" required value="${todayISO}" />
            <span class="field-error-msg hidden" id="errSubDate"></span>
          </div>

          <div class="form-field">
            <label for="formDeadlineDate">Target Statutory Deadline *</label>
            <input id="formDeadlineDate" type="date" required value="${defaultDeadlineISO}" />
            <span class="field-error-msg hidden" id="errDeadlineDate"></span>
          </div>

          <div class="form-field">
            <label for="formOfficer">Designated Office / Desk</label>
            <input id="formOfficer" placeholder="e.g. Nayab Tahsildar, SDO Office" value="Nayab Tahsildar Office" />
          </div>

          <div class="form-field">
            <label for="formDistrict">District Jurisdiction</label>
            <select id="formDistrict">
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Nashik">Nashik</option>
              <option value="Nagpur">Nagpur</option>
              <option value="Aurangabad">Aurangabad</option>
            </select>
          </div>

          <div class="form-field full">
            <label>Receipt Document (Optional Prototype Picker)</label>
            <label class="upload-box" for="receiptFileInput">
              <strong>+ Select Acknowledgement Receipt</strong>
              PDF or image slip · Stored locally in demo mode
              <input id="receiptFileInput" type="file" accept="image/*,.pdf" hidden />
            </label>
            <span class="form-hint" id="receiptHint">No live files will be sent to external servers.</span>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-btn" id="cancelTrackFormBtn">Cancel</button>
          <button type="submit" class="primary-btn saffron-btn">Track Application</button>
        </div>
      </form>
    `
    );

    $("#cancelTrackFormBtn")?.addEventListener("click", closeModal);

    $("#receiptFileInput")?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      const hint = $("#receiptHint");
      if (hint) {
        hint.textContent = file
          ? `Selected: ${file.name} (${Math.round(file.size / 1024)} KB) · Demonstration record`
          : "No live files will be sent to external servers.";
      }
    });

    const form = $("#trackAppForm");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();

      const service = ($("#formServiceName")?.value || "").trim();
      const category = $("#formCategory")?.value || "Revenue";
      const ref = ($("#formRef")?.value || "").trim().toUpperCase();
      const subDateStr = $("#formSubDate")?.value;
      const deadlineDateStr = $("#formDeadlineDate")?.value;
      const officer = ($("#formOfficer")?.value || "").trim() || "Assigned Service Authority";
      const district = $("#formDistrict")?.value || "Pune";

      $$(".field-error-msg", form).forEach((el) => el.classList.add("hidden"));
      $$("input", form).forEach((el) => el.classList.remove("field-error-border"));

      let hasError = false;

      if (!service) {
        hasError = true;
        $("#formServiceName")?.classList.add("field-error-border");
        const err = $("#errServiceName");
        if (err) {
          err.textContent = "Service name is required.";
          err.classList.remove("hidden");
        }
      }

      if (!ref) {
        hasError = true;
        $("#formRef")?.classList.add("field-error-border");
        const err = $("#errRef");
        if (err) {
          err.textContent = "Reference number is required.";
          err.classList.remove("hidden");
        }
      } else if (applications.some((a) => a.ref.toUpperCase() === ref)) {
        hasError = true;
        $("#formRef")?.classList.add("field-error-border");
        const err = $("#errRef");
        if (err) {
          err.textContent = "Reference number already exists in workspace.";
          err.classList.remove("hidden");
        }
      }

      if (!subDateStr) {
        hasError = true;
        $("#formSubDate")?.classList.add("field-error-border");
        const err = $("#errSubDate");
        if (err) {
          err.textContent = "Submission date is required.";
          err.classList.remove("hidden");
        }
      }

      if (!deadlineDateStr) {
        hasError = true;
        $("#formDeadlineDate")?.classList.add("field-error-border");
        const err = $("#errDeadlineDate");
        if (err) {
          err.textContent = "Target deadline date is required.";
          err.classList.remove("hidden");
        }
      } else if (subDateStr && parseDate(deadlineDateStr) < parseDate(subDateStr)) {
        hasError = true;
        $("#formDeadlineDate")?.classList.add("field-error-border");
        const err = $("#errDeadlineDate");
        if (err) {
          err.textContent = "Deadline cannot be earlier than submission date.";
          err.classList.remove("hidden");
        }
      }

      if (hasError) {
        toast("Please correct the form fields highlighted in red.", "error");
        return;
      }

      const displaySub = formatDisplayDate(subDateStr);
      const displayDeadline = formatDisplayDate(deadlineDateStr);
      const analysis = getDeadlineAnalysis(deadlineDateStr, "Pending");

      const newApp = {
        ref,
        service,
        category,
        symbol: "▤",
        submitted: displaySub,
        deadline: displayDeadline,
        status: analysis.status,
        officer,
        district,
        progress: 15,
        notes: "Application captured in local demonstration tracker."
      };

      applications.unshift(newApp);

      officerCases.unshift({
        initials: ref.replace(/[^A-Z]/g, "").slice(0, 2) || "AK",
        name: `Applicant · ${service}`,
        ref,
        office: `${district} · ${officer}`,
        deadline: displayDeadline,
        status: analysis.status,
        days: analysis.label
      });

      savePersistedData();
      renderAllViews();
      closeModal();
      toast(`Application ${ref} added and statutory clock started!`, "success");

      const searchBox = $("#applicationSearch");
      const statusSelect = $("#statusFilter");
      if (searchBox) searchBox.value = "";
      if (statusSelect) statusSelect.value = "all";
      renderApplications();
    });
  }

  // =========================================================================
  // CSV Export Engine
  // =========================================================================

  function exportCSV(filename, rows) {
    if (!rows || !rows.length) {
      toast("No data available to export.", "error");
      return;
    }

    const csvContent = rows
      .map((row) =>
        row
          .map((v) => {
            const str = String(v ?? "").replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast(`Exported spreadsheet: ${filename}`, "success");
  }

  // =========================================================================
  // Informational Modals (How it works & Rule Registry)
  // =========================================================================

  function showHowItWorksModal() {
    openModal(
      "How the SAMAY System Works",
      `
      <p style="font-size:0.88rem;line-height:1.7;color:var(--slate-600);margin-top:0;">
        SAMAY (Statutory Accountability &amp; Monitoring of Administrative Yield) transforms static Right to Public Services (RTS) legislation into actionable, automated citizen timelines.
      </p>

      <div class="detail-timeline">
        <div>
          <strong>1. Receipt Capture &amp; Clock Initiation</strong>
          <span>A citizen or facilitation kiosk records the application receipt number. The official statutory delivery window is immediately locked into the system.</span>
        </div>
        <div>
          <strong>2. Rule Registry Cross-Verification</strong>
          <span>Deadlines are deterministically mapped against notified state gazette rules, accounting for category standards (e.g. 15 days for Income Certificate).</span>
        </div>
        <div>
          <strong>3. Proactive At-Risk Monitoring</strong>
          <span>As cases enter the final 5 days before a breach, automated alerts notify both the desk officer and the citizen to prevent statutory default.</span>
        </div>
        <div>
          <strong>4. Automated Grievance Escalation</strong>
          <span>If a deadline is breached without sanctioned cause, SAMAY pre-fills statutory appeal papers citing Section 8 provisions for one-click submission.</span>
        </div>
      </div>

      <div style="background:var(--slate-100);border:1px solid var(--slate-200);padding:14px;border-radius:var(--radius-md);font-size:0.8rem;color:var(--slate-600);line-height:1.5;">
        <strong>Prototype Demonstration:</strong> This client-side interface simulates public service workflows with local browser storage. In production, connect with state single-sign-on (SSO) and official rule engines.
      </div>

      <div class="modal-actions">
        <button class="primary-btn saffron-btn" id="howItWorksCloseBtn">Understand &amp; Close</button>
      </div>
    `
    );

    $("#howItWorksCloseBtn")?.addEventListener("click", closeModal);
  }

  function showRuleRegistryModal() {
    openModal(
      "Statutory Rule Registry · Maharashtra RTS Act",
      `
      <div class="case-detail-grid">
        <div class="detail-tile">
          <span>Notified Service</span>
          <strong>Income Certificate</strong>
        </div>
        <div class="detail-tile">
          <span>Statutory Time Limit</span>
          <strong>15 Calendar Days</strong>
        </div>
        <div class="detail-tile">
          <span>Designated Competent Officer</span>
          <strong>Nayab Tahsildar</strong>
        </div>
        <div class="detail-tile">
          <span>First Appellate Authority</span>
          <strong>Sub-Divisional Officer (SDO)</strong>
        </div>
      </div>

      <p style="font-size:0.84rem;line-height:1.65;color:var(--slate-600);">
        Notified under the Maharashtra Right to Public Services Act (RTS Act, 2015). Under this schedule, non-disposal within 15 days without documented legal cause empowers the applicant to seek penalty sanctions against the defaulting desk.
      </p>

      <div class="modal-actions">
        <button class="primary-btn saffron-btn" id="ruleRegistryCloseBtn">Close</button>
      </div>
    `
    );

    $("#ruleRegistryCloseBtn")?.addEventListener("click", closeModal);
  }

  // =========================================================================
  // Voice Assistant Component ("Ask SAMAY")
  // Web Speech API + Knowledge Base
  // =========================================================================

  class SAMAYVoiceAssistant {
    constructor() {
      this.currentLang = "en"; // "en" or "hi"
      this.isSpeakingMuted = false;
      this.isListening = false;
      this.recognition = null;
      this.speechSynth = window.speechSynthesis || null;

      this.initSpeechRecognition();
      this.setupDOM();
    }

    initSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
          this.isListening = true;
          this.showListeningUI(true);
        };

        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          this.handleUserInput(transcript);
        };

        this.recognition.onerror = (event) => {
          console.warn("Speech recognition error:", event.error);
          this.showListeningUI(false);
          let errText = "Could not hear clearly. Please try speaking again or type your question below.";
          if (event.error === "not-allowed") {
            errText = "Microphone access was denied. Please allow microphone permissions in your browser or type your question.";
          }
          toast(errText, "warning");
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.showListeningUI(false);
        };
      } else {
        console.info("Web SpeechRecognition is not supported in this browser. Text interaction is enabled.");
      }
    }

    setupDOM() {
      // FAB Toggle
      $("#voiceFab")?.addEventListener("click", () => this.togglePanel());
      $("#voiceCloseBtn")?.addEventListener("click", () => this.togglePanel(false));

      // Mic Button
      $("#voiceMicBtn")?.addEventListener("click", () => this.startListening());
      $("#stopListeningBtn")?.addEventListener("click", () => this.stopListening());

      // Language Toggle
      $("#voiceLangToggle")?.addEventListener("click", () => this.toggleLanguage());

      // Audio Mute Toggle
      $("#voiceSpeechMuteBtn")?.addEventListener("click", () => this.toggleSpeechMute());

      // Text Send
      $("#voiceSendBtn")?.addEventListener("click", () => {
        const input = $("#voiceTextInput");
        if (input && input.value.trim()) {
          this.handleUserInput(input.value.trim());
          input.value = "";
        }
      });

      $("#voiceTextInput")?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const input = $("#voiceTextInput");
          if (input && input.value.trim()) {
            this.handleUserInput(input.value.trim());
            input.value = "";
          }
        }
      });

      // Suggestion Chips
      $$(".suggestion-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          const q = chip.dataset.query;
          if (q) {
            this.handleUserInput(q);
          }
        });
      });
    }

    togglePanel(forceState) {
      const panel = $("#voicePanel");
      const fab = $("#voiceFab");
      if (!panel) return;

      const shouldShow = forceState !== undefined ? forceState : panel.classList.contains("hidden");
      panel.classList.toggle("hidden", !shouldShow);
      if (fab) fab.setAttribute("aria-expanded", String(shouldShow));

      if (shouldShow) {
        $("#voiceTextInput")?.focus();
      } else {
        this.stopListening();
        if (this.speechSynth) this.speechSynth.cancel();
      }
    }

    toggleLanguage() {
      this.currentLang = this.currentLang === "en" ? "hi" : "en";
      const label = $("#voiceLangLabel");
      if (label) label.textContent = this.currentLang === "en" ? "EN" : "हिन्दी";

      const welcome =
        this.currentLang === "en"
          ? "Namaste! Language switched to English. How can I assist you with public service deadlines?"
          : "नमस्ते! भाषा बदलकर हिन्दी कर दी गई है। सरकारी सेवाओं और समय-सीमाओं के बारे में आप क्या जानना चाहते हैं?";

      this.addMessage(welcome, "assistant");
      this.speakText(welcome);
    }

    toggleSpeechMute() {
      this.isSpeakingMuted = !this.isSpeakingMuted;
      const icon = $("#speechMuteIcon");
      if (icon) icon.textContent = this.isSpeakingMuted ? "🔇" : "🔊";
      if (this.isSpeakingMuted && this.speechSynth) {
        this.speechSynth.cancel();
      }
      toast(this.isSpeakingMuted ? "Assistant voice muted." : "Assistant voice enabled.", "info");
    }

    startListening() {
      if (!this.recognition) {
        toast("Voice input is not supported in this browser. Please type your query in the box.", "info");
        return;
      }

      if (this.isListening) {
        this.stopListening();
        return;
      }

      try {
        this.recognition.lang = this.currentLang === "hi" ? "hi-IN" : "en-IN";
        this.recognition.start();
      } catch (err) {
        console.warn("Speech start error:", err);
      }
    }

    stopListening() {
      if (this.recognition && this.isListening) {
        this.recognition.stop();
      }
      this.showListeningUI(false);
    }

    showListeningUI(show) {
      const overlay = $("#voiceListeningOverlay");
      const micBtn = $("#voiceMicBtn");
      if (overlay) overlay.classList.toggle("hidden", !show);
      if (micBtn) micBtn.classList.toggle("active", show);
    }

    handleUserInput(text) {
      this.addMessage(text, "user");
      const answer = this.generateResponse(text);

      setTimeout(() => {
        this.addMessage(answer, "assistant");
        this.speakText(answer);
      }, 350);
    }

    addMessage(text, sender) {
      const chatContainer = $("#voiceChatMessages");
      if (!chatContainer) return;

      const msgDiv = document.createElement("div");
      msgDiv.className = sender === "user" ? "user-msg" : "assistant-msg";

      const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

      msgDiv.innerHTML = `
        <div class="msg-bubble">
          <p>${escapeHtml(text)}</p>
        </div>
        <span class="msg-timestamp">${now}</span>
      `;

      chatContainer.appendChild(msgDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    speakText(text) {
      if (this.isSpeakingMuted || !this.speechSynth) return;
      try {
        this.speechSynth.cancel(); // cancel any ongoing speech
        const cleanText = text.replace(/<[^>]*>/g, ""); // strip HTML
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = this.currentLang === "hi" ? "hi-IN" : "en-IN";
        utterance.rate = 1.0;
        this.speechSynth.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis error:", err);
      }
    }

    /**
     * Structured Knowledge Base & Keyword Matching Engine
     */
    generateResponse(rawQuery) {
      const q = rawQuery.toLowerCase();
      const isHi = this.currentLang === "hi" || /[\u0900-\u097F]/.test(rawQuery);

      // 1. Check specific application reference
      const refMatch = rawQuery.match(/SAM-\d{4}/i);
      if (refMatch) {
        const ref = refMatch[0].toUpperCase();
        const found = applications.find((a) => a.ref === ref);
        if (found) {
          if (isHi) {
            return `आवेदन संदर्भ ${found.ref} (${found.service}): वर्तमान स्थिति '${found.status}' है, जिसमें ${found.computedDays} बाकी हैं। आधिकारिक समय-सीमा ${found.deadline} है।`;
          } else {
            return `Application ${found.ref} (${found.service}): Current status is '${found.status}', with ${found.computedDays}. Statutory target deadline is ${found.deadline} under ${found.officer}.`;
          }
        } else {
          if (isHi) {
            return `संदर्भ ${ref} डेमो डेटासेट में नहीं मिला। आप डैशबोर्ड में नया आवेदन जोड़ सकते हैं या SAM-2048, SAM-1987, SAM-2031 चेक कर सकते हैं।`;
          } else {
            return `Reference ${ref} was not found in the current demonstration workspace. Try checking SAM-2048, SAM-1987, or track a new application.`;
          }
        }
      }

      // 2. Application status query
      if (q.includes("status") || q.includes("check") || q.includes("स्थिति") || q.includes("ट्रैक")) {
        if (isHi) {
          return "आप अपने आवेदन की स्थिति देखने के लिए संदर्भ संख्या (उदा. SAM-2048) बता सकते हैं या ऊपर 'Explore Demo' बटन पर क्लिक करके सीधे सिटिजन डैशबोर्ड में सभी आवेदन देख सकते हैं।";
        } else {
          return "To check your application status, please provide a valid reference number (e.g. SAM-2048) or click 'Explore Demo' to inspect live tracked cases in the Citizen Dashboard.";
        }
      }

      // 3. Delayed application & Appeal
      if (q.includes("delay") || q.includes("late") || q.includes("overdue") || q.includes("appeal") || q.includes("देरी") || q.includes("अपील") || q.includes("शिकायत")) {
        if (isHi) {
          return "यदि आपकी सरकारी सेवा में कानूनी समय-सीमा से अधिक देरी हुई है, तो लोक सेवा गारंटी अधिनियम की धारा 8 के तहत आप प्रथम अपील दायर कर सकते हैं। SAMAY सिस्टम स्वचालित रूप से अपील पत्र तैयार करता है जिसे आप तुरंत कॉपी या डाउनलोड कर सकते हैं।";
        } else {
          return "If your application has exceeded its statutory deadline without documented cause, you hold the legal right to file a First Appeal under Section 8 of the Right to Public Services Act. SAMAY automatically generates this appeal draft for you.";
        }
      }

      // 4. How to apply for a service
      if (q.includes("apply") || q.includes("how to") || q.includes("आवेदन") || q.includes("शुरू")) {
        if (isHi) {
          return "सरकारी सेवा के लिए आवेदन करने के 4 आसान चरण हैं: 1. सेवा और आवश्यक दस्तावेज चुनें, 2. सेतु केंद्र या ऑनलाइन पोर्टल पर आवेदन जमा करें, 3. पावती रसीद प्राप्त करें, 4. SAMAY में संदर्भ संख्या दर्ज कर समय-सीमा ट्रैक करें।";
        } else {
          return "To apply for a public service: 1. Choose the service in our Service Catalog and review required documents; 2. Submit your application at a facilitation center (Seva Kendra) or portal; 3. Obtain an official reference receipt; 4. Track statutory delivery in SAMAY.";
        }
      }

      // 5. Required documents
      if (q.includes("document") || q.includes("documents") || q.includes("दस्तावेज") || q.includes("कागजात") || q.includes("proof")) {
        if (isHi) {
          return "अधिकांश प्रमाणपत्र सेवाओं के लिए आधार कार्ड, पते का प्रमाण (राशन कार्ड/बिजली बिल), पासपोर्ट फोटो, और स्व-घोषणा पत्र आवश्यक होते हैं। आय प्रमाणपत्र के लिए वेतन पर्ची या पटवारी रिपोर्ट की आवश्यकता होती है।";
        } else {
          return "Standard documents for state certificates typically include: Aadhaar card, address proof (electricity bill/ration card), applicant photograph, and age proof. Income certificates require an employer salary slip or revenue Talathi inquiry report.";
        }
      }

      // 6. Specific service timelines (Income, Caste, Domicile, Birth)
      if (q.includes("income") || q.includes("आय")) {
        return isHi
          ? "महाराष्ट्र लोक सेवा गारंटी अधिनियम के अनुसार आय प्रमाणपत्र (Income Certificate) जारी करने की कानूनी समय-सीमा 15 कैलेंडर दिन है।"
          : "Under the notified Maharashtra RTS Rules, an Income Certificate has a legally mandated maximum timeline of 15 calendar days.";
      }

      if (q.includes("caste") || q.includes("जाति")) {
        return isHi
          ? "जाति प्रमाणपत्र (Caste Certificate) जारी करने की सांविधिक समय-सीमा 21 कार्यदिवस है, जो उप-विभागीय अधिकारी (SDO) द्वारा जारी किया जाता है।"
          : "A Caste Certificate has a statutory turnaround limit of 21 working days, designated under the Sub-Divisional Officer (SDO) desk.";
      }

      if (q.includes("domicile") || q.includes("residence") || q.includes("निवास")) {
        return isHi
          ? "अधिवास / निवास प्रमाणपत्र (Domicile Certificate) की कानूनी समय-सीमा 15 दिन है, जो कार्यकारी मजिस्ट्रेट / तहसीलदार द्वारा जारी किया जाता है।"
          : "A Domicile or Residence Certificate must be processed within 15 calendar days under the Executive Magistrate authority.";
      }

      if (q.includes("birth") || q.includes("death") || q.includes("जन्म")) {
        return isHi
          ? "जन्म एवं मृत्यु पंजीकरण (Birth/Death Registration) की समय-सीमा नगर निगम / स्वास्थ्य कार्यालय द्वारा 7 कार्यदिवस है।"
          : "Birth and Death registration certificates have a guaranteed delivery window of 7 calendar days at the Municipal Health desk.";
      }

      // 7. What is SAMAY / UPI for Service Promises
      if (q.includes("samay") || q.includes("upi") || q.includes("what is") || q.includes("क्या है")) {
        if (isHi) {
          return "SAMAY 'सेवा वादों के लिए UPI' की तरह है। यह एक पारदर्शी डिजिटल प्रोटोकॉल है जो सरकारी सेवाओं के लिए सांविधिक समय-सीमा को ट्रैक करता है और देरी होने पर नागरिक अधिकारों की रक्षा करता है।";
        } else {
          return "SAMAY is 'UPI for Service Promises'. Just as UPI streamlined money transfers, SAMAY establishes a transparent, accountable standard for public service delivery commitments under the Right to Public Services Act.";
        }
      }

      // Default fallback
      if (isHi) {
        return "यह एक सामान्य मार्गदर्शन है। आप सेवा की समय-सीमा, आवेदन स्थिति (उदा. SAM-2048), अपील प्रक्रिया या आवश्यक दस्तावेजों के बारे में पूछ सकते हैं। पूर्ण विवरण के लिए 'Explore Demo' देखें।";
      } else {
        return "This is general guidance for the SAMAY demonstration portal. You can ask about service delivery windows (Income, Caste, Domicile), tracking by reference (e.g. SAM-2048), or filing a First Appeal. Explore the interactive demo for full workflows.";
      }
    }
  }

  // =========================================================================
  // Event Listeners & Binding Initialization
  // =========================================================================

  function setupGlobalEventListeners() {
    // 1. Navigation routing (Landing vs Workspace)
    $("#navLaunchDemoBtn")?.addEventListener("click", () => {
      showWorkspace("citizen");
      toast("Entered SAMAY Interactive Demonstration Workspace.", "info");
    });

    $("#mobileLaunchDemoBtn")?.addEventListener("click", () => {
      $("#mobileDrawer")?.classList.add("hidden");
      showWorkspace("citizen");
    });

    $("#heroDemoBtn")?.addEventListener("click", () => {
      showWorkspace("citizen");
      toast("Launched interactive simulation workspace.", "success");
    });

    $("#previewLaunchFullBtn")?.addEventListener("click", () => {
      showWorkspace("citizen");
    });

    $("#sidebarBrandBackHome")?.addEventListener("click", (e) => {
      e.preventDefault();
      showLandingPage();
    });

    $("#sidebarBackToLandingBtn")?.addEventListener("click", showLandingPage);
    $("#topbarBackHomeBtn")?.addEventListener("click", showLandingPage);

    // 2. Auth & Portal Login Modals
    $("#navLoginBtn")?.addEventListener("click", () => {
      $("#citizenLoginModal")?.classList.remove("hidden");
    });

    $("#heroCitizenBtn")?.addEventListener("click", () => {
      $("#citizenLoginModal")?.classList.remove("hidden");
    });

    $("#mobileCitizenLoginBtn")?.addEventListener("click", () => {
      $("#mobileDrawer")?.classList.add("hidden");
      $("#citizenLoginModal")?.classList.remove("hidden");
    });

    $("#closeCitizenModalBtn")?.addEventListener("click", closeModal);
    $("#cancelCitizenLoginBtn")?.addEventListener("click", closeModal);
    $("#cancelCitizenPhoneBtn")?.addEventListener("click", closeModal);

    $("#tabCitizenDemo")?.addEventListener("click", () => {
      $("#tabCitizenDemo")?.classList.add("active");
      $("#tabCitizenPhone")?.classList.remove("active");
      $("#contentCitizenDemo")?.classList.add("active");
      $("#contentCitizenPhone")?.classList.remove("active");
    });

    $("#tabCitizenPhone")?.addEventListener("click", () => {
      $("#tabCitizenPhone")?.classList.add("active");
      $("#tabCitizenDemo")?.classList.remove("active");
      $("#contentCitizenPhone")?.classList.add("active");
      $("#contentCitizenDemo")?.classList.remove("active");
    });

    $("#enterCitizenDashboardBtn")?.addEventListener("click", () => {
      closeModal();
      showWorkspace("citizen");
      toast("Welcome, Dinesh K. (Citizen Demo Account)", "success");
    });

    $("#citizenPhoneForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      closeModal();
      showWorkspace("citizen");
      toast("OTP verified. Welcome to Citizen Dashboard.", "success");
    });

    // Officer Portal
    $("#heroOfficerBtn")?.addEventListener("click", () => {
      $("#officerLoginModal")?.classList.remove("hidden");
    });

    $("#mobileOfficerLoginBtn")?.addEventListener("click", () => {
      $("#mobileDrawer")?.classList.add("hidden");
      $("#officerLoginModal")?.classList.remove("hidden");
    });

    $("#closeOfficerModalBtn")?.addEventListener("click", closeModal);
    $("#cancelOfficerLoginBtn")?.addEventListener("click", closeModal);

    $("#enterOfficerRadarBtn")?.addEventListener("click", () => {
      closeModal();
      showWorkspace("officer");
      toast("Authenticated as Nayab Tahsildar (Officer Radar)", "success");
    });

    // 3. Mobile Navigation Drawer Toggle
    $("#mobileNavToggle")?.addEventListener("click", () => {
      const drawer = $("#mobileDrawer");
      if (drawer) {
        drawer.classList.toggle("hidden");
        const isExpanded = !drawer.classList.contains("hidden");
        $("#mobileNavToggle")?.setAttribute("aria-expanded", String(isExpanded));
      }
    });

    $$(".mobile-nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        $("#mobileDrawer")?.classList.add("hidden");
      });
    });

    // Smooth navigation for all landing anchor links (e.g. #slip-scanner, #services)
    $$("a[href^='#']").forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href && href.length > 1 && $(href)) {
          showLandingPage();
          $("#mobileDrawer")?.classList.add("hidden");
          const targetEl = $(href);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    });

    // 4. Services Catalog Real-time Search
    $("#serviceCatalogSearch")?.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      $$(".service-card").forEach((card) => {
        const text = (card.dataset.serviceName + " " + card.textContent).toLowerCase();
        card.style.display = !q || text.includes(q) ? "block" : "none";
      });
    });

    // 5. Landing Page Contact Form
    $("#landingContactForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = ($("#contactName")?.value || "").trim();
      const email = ($("#contactEmail")?.value || "").trim();
      const message = ($("#contactMessage")?.value || "").trim();

      let valid = true;
      if (!name) {
        $("#errContactName")?.classList.remove("hidden");
        $("#errContactName").textContent = "Please enter your name.";
        valid = false;
      }
      if (!email) {
        $("#errContactEmail")?.classList.remove("hidden");
        $("#errContactEmail").textContent = "Please provide your phone or email.";
        valid = false;
      }
      if (!message) {
        $("#errContactMessage")?.classList.remove("hidden");
        $("#errContactMessage").textContent = "Please describe your query.";
        valid = false;
      }

      if (!valid) return;

      toast("Your assistance query has been recorded. Response time: within 24 hours.", "success");
      $("#landingContactForm").reset();
    });

    // 6. Inspect Case buttons from Demo Preview table
    $$("[data-demo-open]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const ref = btn.dataset.demoOpen;
        showWorkspace("citizen");
        setTimeout(() => showCaseDetails(ref), 200);
      });
    });

    // 7. Footer Portal links
    $("#footerCitizenBtn")?.addEventListener("click", () => showWorkspace("citizen"));
    $("#footerOfficerBtn")?.addEventListener("click", () => showWorkspace("officer"));
    $("#footerCommissionBtn")?.addEventListener("click", () => showWorkspace("commission"));
    $("#footerRuleRegistryBtn")?.addEventListener("click", showRuleRegistryModal);
    $("#footerResetDemoBtn")?.addEventListener("click", resetDemoData);

    $("#footerPrivacyBtn")?.addEventListener("click", () => {
      openModal(
        "Privacy & Demonstration Policy",
        `
        <p style="font-size:0.88rem;line-height:1.65;color:var(--slate-600);">
          <strong>Client-Side Storage:</strong> SAMAY is an architectural civic-technology prototype. All mock records, reference lookups, and simulated applications reside strictly inside your browser's local memory (localStorage). No personally identifiable data (Aadhaar numbers, passwords, or personal identity files) is transmitted to external servers.
        </p>
        <p style="font-size:0.84rem;color:var(--slate-500);line-height:1.6;">
          For production deployments, integration with official State Single Sign-On (SSO) gateways and certified Right to Public Service registries must be verified by the appropriate state IT authorities.
        </p>
        <div class="modal-actions">
          <button class="primary-btn saffron-btn" id="privacyCloseBtn">Got it</button>
        </div>
      `
      );
      $("#privacyCloseBtn")?.addEventListener("click", closeModal);
    });

    $("#footerTermsBtn")?.addEventListener("click", () => {
      openModal(
        "Terms of Demonstration",
        `
        <p style="font-size:0.88rem;line-height:1.65;color:var(--slate-600);">
          This application is designed as a demonstration prototype for hackathon and governance modernization showcases. The deadlines and rule summaries provided are illustrative models based on notified gazette timelines.
        </p>
        <div class="modal-actions">
          <button class="primary-btn saffron-btn" id="termsCloseBtn">Close</button>
        </div>
      `
      );
      $("#termsCloseBtn")?.addEventListener("click", closeModal);
    });

    $("#footerAccessibilityBtn")?.addEventListener("click", () => {
      toast("SAMAY complies with WCAG AA/AAA contrast guidelines, supports keyboard navigation, and provides bilingual voice queries.", "info");
    });

    $("#rightsSectionLearnBtn")?.addEventListener("click", showRuleRegistryModal);

    // 8. Workspace Navigation switching
    $$(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => switchWorkspaceView(btn.dataset.view));
    });

    $("#menuBtn")?.addEventListener("click", openSidebar);
    $("#sidebarCloseBtn")?.addEventListener("click", closeSidebar);
    $("#sidebarBackdrop")?.addEventListener("click", closeSidebar);

    // 9. Citizen Dashboard Filters & Sort
    $("#applicationSearch")?.addEventListener("input", renderApplications);
    $("#statusFilter")?.addEventListener("change", renderApplications);
    $("#sortFilter")?.addEventListener("change", renderApplications);

    $("#viewAllBtn")?.addEventListener("click", () => {
      if ($("#statusFilter")) $("#statusFilter").value = "all";
      if ($("#applicationSearch")) $("#applicationSearch").value = "";
      renderApplications();
      toast("Showing all demo applications.", "info");
    });

    $("#clearFiltersBtn")?.addEventListener("click", () => {
      if ($("#statusFilter")) $("#statusFilter").value = "all";
      if ($("#applicationSearch")) $("#applicationSearch").value = "";
      renderApplications();
      toast("Search and filters reset.", "info");
    });

    $("#emptyTrackBtn")?.addEventListener("click", showTrackApplicationForm);
    $("#newApplicationBtn")?.addEventListener("click", showTrackApplicationForm);

    // 10. Officer & Commission Listeners
    $("#officerFilter")?.addEventListener("change", renderOfficerCases);
    $("#officeSearch")?.addEventListener("input", renderOffices);

    // 11. Modals & Backdrop Dismiss
    $("#closeModalBtn")?.addEventListener("click", closeModal);
    $("#modalBackdrop")?.addEventListener("click", (e) => {
      if (e.target === $("#modalBackdrop")) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
        closeSidebar();
        $("#notificationsPanel")?.classList.add("hidden");
        const voicePanel = $("#voicePanel");
        if (voicePanel && !voicePanel.classList.contains("hidden")) {
          voicePanel.classList.add("hidden");
        }
      }
    });

    // 12. Delegated Click Handlers (Case details, District pins)
    document.addEventListener("click", (e) => {
      const caseBtn = e.target.closest("[data-open-case]");
      if (caseBtn) {
        showCaseDetails(caseBtn.dataset.openCase);
        return;
      }

      const districtBtn = e.target.closest("[data-district]");
      if (districtBtn) {
        const districtName = districtBtn.dataset.district;
        const info = districtData[districtName];
        if (info) {
          const detailEl = $("#districtDetail");
          if (detailEl) {
            detailEl.innerHTML = `
              <div>
                <strong>${escapeHtml(districtName)} district</strong>
                <span>Selected jurisdiction · sample audit data</span>
              </div>
              <div>
                <strong style="color: ${parseFloat(info.late) > 10 ? 'var(--status-red)' : 'var(--status-amber)'}">${info.late}</strong>
                <span>Late disposal rate</span>
              </div>
              <div>
                <strong class="positive">${info.within}</strong>
                <span>Within statutory deadline</span>
              </div>
            `;
          }
          $$(".map-pin").forEach((p) => (p.style.outline = p === districtBtn ? "3px solid var(--navy-900)" : "none"));
          toast(`${districtName}: ${info.cases} sample cases audited. Late rate: ${info.late}`, "info");
        }
        return;
      }

      const notifWrapper = e.target.closest(".notifications-wrapper");
      if (!notifWrapper) {
        $("#notificationsPanel")?.classList.add("hidden");
      }
    });

    // 13. Reset Demo Data
    $("#resetDemoBtn")?.addEventListener("click", resetDemoData);
    $("#sidebarResetBtn")?.addEventListener("click", resetDemoData);

    // 14. Info Modals
    $("#rightsBtn")?.addEventListener("click", showHowItWorksModal);
    $("#policyBtn")?.addEventListener("click", showRuleRegistryModal);
    $("#draftRuleBtn")?.addEventListener("click", () => {
      toast("Draft rules must be vetted against State Gazette before enforcement.", "warning");
    });
    $("#chartDetailsBtn")?.addEventListener("click", () => {
      toast("Delay breakdown is based on sample administrative filings.", "info");
    });

    // 15. Notifications Popover
    $("#notifyBtn")?.addEventListener("click", () => {
      const panel = $("#notificationsPanel");
      if (panel) panel.classList.toggle("hidden");
      $("#notifyDot")?.remove();
    });

    $("#clearNotifyBtn")?.addEventListener("click", () => {
      const list = $("#notifyList");
      if (list) {
        list.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--slate-500); font-size: 0.82rem;">No pending notifications</div>`;
      }
      toast("Notifications marked as read.", "info");
    });

    // 16. CSV Exports
    $("#exportCitizenCsvBtn")?.addEventListener("click", () => {
      syncComputedStatuses();
      const rows = [
        ["Reference", "Service Name", "Category", "Submission Date", "Target Deadline", "Days Remaining", "Status", "Officer / Desk", "District"],
        ...applications.map((a) => [
          a.ref,
          a.service,
          a.category || "General",
          a.submitted,
          a.deadline,
          a.computedDays,
          a.status,
          a.officer || "Assigned Office",
          a.district || "Pune"
        ])
      ];
      exportCSV("samay-my-applications.csv", rows);
    });

    $("#exportCasesBtn")?.addEventListener("click", () => {
      const rows = [
        ["Reference", "Applicant & Service", "Assigned Office", "Deadline", "Status", "Days Label"],
        ...officerCases.map((c) => [c.ref, c.name, c.office, c.deadline, c.status, c.days])
      ];
      exportCSV("samay-officer-cases.csv", rows);
    });

    $("#commissionReportBtn")?.addEventListener("click", () => {
      const rows = [
        ["Office Jurisdiction", "Cases Reviewed", "Late Rate (%)", "Appeals Filed", "Compliance Score (%)"],
        ...officesData.map((o) => [o.name, o.cases, o.late, o.appeals, o.performance])
      ];
      exportCSV("samay-commission-overview.csv", rows);
    });

    $("#officeReportBtn")?.addEventListener("click", () => {
      const rows = [
        ["Office Jurisdiction", "Cases Reviewed", "Late Rate (%)", "Appeals Filed", "Compliance Score (%)"],
        ...officesData.map((o) => [o.name, o.cases, o.late, o.appeals, o.performance])
      ];
      exportCSV("samay-office-health-report.csv", rows);
    });
  }

  // =========================================================================
  // Receipt Slip Scanner & Live Statutory Clock Controller (Features 1 & 2)
  // =========================================================================

  const RTS_SERVICE_RULES = {
    "Income Certificate": {
      days: 15,
      category: "Revenue",
      officer: "Nayab Tahsildar",
      district: "Pune",
      actRef: "Maharashtra Right to Public Services Act (Service #12)"
    },
    "Caste Certificate": {
      days: 21,
      category: "Social Justice",
      officer: "Sub-Divisional Officer (SDO)",
      district: "Pune",
      actRef: "Maharashtra Right to Public Services Act (Service #18)"
    },
    "Domicile Certificate": {
      days: 15,
      category: "Revenue",
      officer: "Executive Magistrate",
      district: "Pune",
      actRef: "Maharashtra Right to Public Services Act (Service #14)"
    },
    "Birth Certificate": {
      days: 7,
      category: "Registration",
      officer: "Municipal Health Officer",
      district: "Pune",
      actRef: "RBD Act & RTS Public Service Schedule #4"
    },
    "Land Mutation": {
      days: 30,
      category: "Land Records",
      officer: "Circle Officer / Talathi",
      district: "Pune",
      actRef: "Maharashtra Land Revenue Code & RTS Schedule #27"
    },
    "Ration Card": {
      days: 21,
      category: "Food & Civil Supplies",
      officer: "Food & Civil Supplies Officer",
      district: "Pune",
      actRef: "National Food Security & RTS Schedule #9"
    }
  };

  const SAMPLE_SLIPS = [
    {
      raw: `MAHARASHTRA SEVA KENDRA RECEIPT
Service: Income Certificate
Application No: MH20261234567
Date: 28/10/2026
Office: Nayab Tahsildar Office, Pune
Applicant: Suresh K. Patel
Statutory Limit: 15 Working Days`,
      service: "Income Certificate",
      appNo: "MH20261234567",
      date: "2026-10-28",
      office: "Nayab Tahsildar Office, Pune"
    },
    {
      raw: `APLE SARKAR SEVA KENDRA ACKNOWLEDGEMENT
Service: Caste Certificate
Application No: CC-2026-889104
Date: 22/10/2026
Office: SDO Office, Pune Division
Applicant: Priya R. More
Statutory Limit: 21 Days`,
      service: "Caste Certificate",
      appNo: "CC-2026-889104",
      date: "2026-10-22",
      office: "SDO Office, Pune Division"
    },
    {
      raw: `CITIZEN SERVICE ACKNOWLEDGEMENT
Service: Domicile Certificate
Application No: DOM-MH-994321
Date: 18/10/2026
Office: Executive Magistrate Desk, Haveli
Applicant: Amit A. Kulkarni
Statutory Limit: 15 Days`,
      service: "Domicile Certificate",
      appNo: "DOM-MH-994321",
      date: "2026-10-18",
      office: "Executive Magistrate Desk, Haveli"
    },
    {
      raw: `BHUMI ABHILEKH KARYALAYA RECEIPT
Service: Land Mutation
Application No: MUT-2026-441029
Date: 25/09/2026
Office: Talathi Office, Kothrud, Pune
Applicant: Sunita B. Shinde
Statutory Limit: 30 Days (Overdue Alert)`,
      service: "Land Mutation",
      appNo: "MUT-2026-441029",
      date: "2026-09-25",
      office: "Talathi Office, Kothrud, Pune"
    }
  ];

  let sampleSlipPointer = 0;
  let isSlipListening = false;
  let slipSpeechRec = null;

  function parseSlipText(rawText) {
    if (!rawText || !rawText.trim()) return null;

    const result = {
      service: "",
      appNo: "",
      dateReceived: "",
      office: ""
    };

    const serviceKeywords = [
      { name: "Income Certificate", match: /income|उत्पन्न|aamdani/i },
      { name: "Caste Certificate", match: /caste|जाती|jaati/i },
      { name: "Domicile Certificate", match: /domicile|residence|अधिवास|रहिवासी/i },
      { name: "Birth Certificate", match: /birth|जन्म/i },
      { name: "Land Mutation", match: /mutation|land|7\/12|फेरफार/i },
      { name: "Ration Card", match: /ration|रेशन/i }
    ];

    for (const item of serviceKeywords) {
      if (item.match.test(rawText)) {
        result.service = item.name;
        break;
      }
    }

    const appNoRegexes = [
      /(?:application\s*(?:no|number|#)?|ref(?:erence)?\s*(?:no|#)?|ack(?:nowledgement)?\s*(?:no|#)?|token\s*(?:no|#)?|receipt\s*(?:no|#)?)\s*[:=\-]?\s*([A-Za-z0-9\-_/]{5,30})/i,
      /\b([A-Z]{2,4}[0-9]{6,14})\b/,
      /\b([A-Z0-9]{3,}-[A-Z0-9\-]{4,})\b/
    ];

    for (const regex of appNoRegexes) {
      const match = rawText.match(regex);
      if (match && match[1]) {
        result.appNo = match[1].trim();
        break;
      }
    }

    const dateRegexes = [
      /(?:date\s*(?:received|of\s*submission|of\s*application)?\s*[:=\-]?\s*)([0-3]?[0-9][\/\-.][0-1]?[0-9][\/\-.](?:20)?\d{2})/i,
      /(?:date\s*[:=\-]?\s*)([0-3]?[0-9][\/\-.][0-1]?[0-9][\/\-.](?:20)?\d{2})/i,
      /\b([0-3]?[0-9][\/\-.][0-1]?[0-9][\/\-.](?:20)\d{2})\b/
    ];

    for (const regex of dateRegexes) {
      const match = rawText.match(regex);
      if (match && match[1]) {
        const rawDateStr = match[1].replace(/\./g, "-").replace(/\//g, "-");
        const parts = rawDateStr.split("-").map(Number);
        if (parts.length === 3) {
          let y, m, d;
          if (parts[0] > 1000) {
            [y, m, d] = parts;
          } else {
            [d, m, y] = parts;
            if (y < 100) y += 2000;
          }
          if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
            result.dateReceived = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            break;
          }
        }
      }
    }

    const officeRegexes = [
      /(?:office|issuing\s*authority|authority|desk|tahsil|tehsil)\s*[:=\-]\s*([^\n\r]+)/i,
      /(?:office|authority)\s*[:\-]?\s*([A-Za-z0-9\s,.\-—]+)$/im
    ];
    for (const reg of officeRegexes) {
      const match = rawText.match(reg);
      if (match && match[1] && !/service|application|date/i.test(match[1])) {
        result.office = match[1].trim();
        break;
      }
    }

    return result;
  }

  function updateSlipClockDisplay() {
    const serviceSelect = $("#slipServiceSelect");
    const appNoInput = $("#slipAppNoInput");
    const dateInput = $("#slipDateInput");
    const officeInput = $("#slipOfficeInput");

    const serviceName = (serviceSelect && serviceSelect.value) ? serviceSelect.value : "Income Certificate";
    const appNo = (appNoInput && appNoInput.value.trim()) ? appNoInput.value.trim() : "MH20261234567";
    const rawDate = (dateInput && dateInput.value) ? dateInput.value : toISODate(getToday());
    const rule = RTS_SERVICE_RULES[serviceName] || RTS_SERVICE_RULES["Income Certificate"];
    const turnaroundDays = rule.days;

    const startDate = parseDate(rawDate);
    const deadlineDate = new Date(startDate);
    deadlineDate.setDate(deadlineDate.getDate() + turnaroundDays);

    const today = getToday();
    const diffMs = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    // Update DOM display elements
    const daysEl = $("#slipClockDays");
    const daysLabelEl = $("#slipClockDaysLabel");
    const serviceEl = $("#slipClockService");
    const appNoEl = $("#slipClockAppNo");
    const deadlineEl = $("#slipClockDeadlineDate");
    const statusBadgeEl = $("#slipClockStatusBadge");
    const turnaroundEl = $("#slipClockTurnaround");
    const gaugeRing = $("#slipGaugeRing");

    if (serviceEl) serviceEl.textContent = serviceName;
    if (appNoEl) appNoEl.textContent = appNo;
    if (deadlineEl) deadlineEl.textContent = formatDisplayDate(deadlineDate);
    if (turnaroundEl) turnaroundEl.textContent = `${turnaroundDays} days`;

    let primaryColor, secondaryColor, badgeText, badgeClass, labelText, numberText;

    if (diffDays < 0) {
      // Overdue statutory breach
      const overdueDays = Math.abs(diffDays);
      numberText = String(overdueDays);
      labelText = overdueDays === 1 ? "day overdue" : "days overdue";
      badgeText = "Statutory Breach · Overdue";
      badgeClass = "badge overdue";
      primaryColor = "#ef4444";
      secondaryColor = "#fee2e2";
    } else if (diffDays === 0) {
      numberText = "0";
      labelText = "due today";
      badgeText = "Statutory Limit · Due Today";
      badgeClass = "badge due-soon";
      primaryColor = "#f59e0b";
      secondaryColor = "#fef3c7";
    } else if (diffDays <= 3) {
      numberText = String(diffDays);
      labelText = diffDays === 1 ? "day left" : "days left";
      badgeText = "Clock Running · Due Soon";
      badgeClass = "badge due-soon";
      primaryColor = "#f59e0b";
      secondaryColor = "#fef3c7";
    } else {
      numberText = String(diffDays);
      labelText = "days left";
      badgeText = "Clock Running · On Track";
      badgeClass = "badge on-track";
      primaryColor = "#10b981";
      secondaryColor = "#d1fae5";
    }

    if (daysEl) daysEl.textContent = numberText;
    if (daysLabelEl) daysLabelEl.textContent = labelText;
    if (statusBadgeEl) {
      statusBadgeEl.textContent = badgeText;
      statusBadgeEl.className = badgeClass;
    }

    if (gaugeRing) {
      const progressRatio = diffDays < 0 ? 1 : Math.max(0.08, Math.min(1, (turnaroundDays - Math.max(0, diffDays)) / turnaroundDays));
      const progressPct = Math.round(progressRatio * 100);
      gaugeRing.style.background = `conic-gradient(${primaryColor} 0% ${progressPct}%, ${secondaryColor} ${progressPct}% 100%)`;
      gaugeRing.style.boxShadow = `0 4px 14px ${primaryColor}33`;
    }
  }

  function setupSlipScannerController() {
    const textInput = $("#slipTextInput");
    const serviceSelect = $("#slipServiceSelect");
    const appNoInput = $("#slipAppNoInput");
    const dateInput = $("#slipDateInput");
    const officeInput = $("#slipOfficeInput");
    const photoInput = $("#slipPhotoInput");
    const photoBtn = $("#slipPhotoBtn");
    const voiceBtn = $("#slipVoiceBtn");
    const parseBtn = $("#slipParseBtn");
    const loadSampleBtn = $("#slipLoadSampleBtn");
    const startClockBtn = $("#slipStartClockBtn");
    const saveToTrackerBtn = $("#slipSaveToTrackerBtn");
    const openDashboardBtn = $("#slipOpenDashboardBtn");
    const dashScanSlipBtn = $("#dashScanSlipBtn");

    // Initialize date field to today if empty
    if (dateInput && !dateInput.value) {
      dateInput.value = toISODate(getToday());
    }

    // Set initial clock display
    updateSlipClockDisplay();

    // 1. Load Sample Slip button
    loadSampleBtn?.addEventListener("click", () => {
      const sample = SAMPLE_SLIPS[sampleSlipPointer % SAMPLE_SLIPS.length];
      sampleSlipPointer++;

      if (textInput) textInput.value = sample.raw;
      if (serviceSelect) serviceSelect.value = sample.service;
      if (appNoInput) appNoInput.value = sample.appNo;
      if (dateInput) dateInput.value = sample.date;
      if (officeInput) officeInput.value = sample.office;

      updateSlipClockDisplay();
      toast(`Loaded sample slip: ${sample.service} (${sample.appNo})`, "info");
    });

    // 2. Read Slip Text button
    parseBtn?.addEventListener("click", () => {
      const raw = textInput?.value.trim();
      if (!raw) {
        toast("Please paste or type slip text first, or click 'Load sample slip'.", "warning");
        return;
      }

      const parsed = parseSlipText(raw);
      if (parsed.service && serviceSelect) {
        serviceSelect.value = parsed.service;
      }
      if (parsed.appNo && appNoInput) {
        appNoInput.value = parsed.appNo;
      }
      if (parsed.dateReceived && dateInput) {
        dateInput.value = parsed.dateReceived;
      }
      if (parsed.office && officeInput) {
        officeInput.value = parsed.office;
      }

      updateSlipClockDisplay();
      toast("Receipt text processed! Service clock updated.", "success");
    });

    // 3. Photo of Slip upload simulation
    photoBtn?.addEventListener("click", () => {
      photoInput?.click();
    });

    photoInput?.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      toast(`Scanning "${file.name}" with OCR...`, "info");
      setTimeout(() => {
        const sample = SAMPLE_SLIPS[sampleSlipPointer % SAMPLE_SLIPS.length];
        sampleSlipPointer++;

        if (textInput) textInput.value = sample.raw;
        if (serviceSelect) serviceSelect.value = sample.service;
        if (appNoInput) appNoInput.value = sample.appNo;
        if (dateInput) dateInput.value = sample.date;
        if (officeInput) officeInput.value = sample.office;

        updateSlipClockDisplay();
        toast("OCR scan complete! Receipt fields extracted and clock active.", "success");
      }, 750);
    });

    // 4. Voice dictation (Speak slip text)
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec && voiceBtn) {
      slipSpeechRec = new SpeechRec();
      slipSpeechRec.continuous = false;
      slipSpeechRec.interimResults = false;
      slipSpeechRec.lang = "en-IN";

      slipSpeechRec.onstart = () => {
        isSlipListening = true;
        voiceBtn.classList.add("listening");
        const span = voiceBtn.querySelector("span");
        if (span) span.textContent = "Listening... Speak slip";
        toast("Listening... Speak service name, application number, or date.", "info");
      };

      slipSpeechRec.onresult = (evt) => {
        const spoken = evt.results[0][0].transcript;
        if (textInput) {
          const prev = textInput.value.trim();
          textInput.value = prev ? `${prev}\n${spoken}` : spoken;
        }

        const parsed = parseSlipText(spoken);
        if (parsed.service && serviceSelect) serviceSelect.value = parsed.service;
        if (parsed.appNo && appNoInput) appNoInput.value = parsed.appNo;
        if (parsed.dateReceived && dateInput) dateInput.value = parsed.dateReceived;
        if (parsed.office && officeInput) officeInput.value = parsed.office;

        updateSlipClockDisplay();
        toast(`Voice captured: "${spoken}"`, "success");
      };

      slipSpeechRec.onerror = (err) => {
        console.warn("Slip voice error:", err.error);
        isSlipListening = false;
        voiceBtn.classList.remove("listening");
        const span = voiceBtn.querySelector("span");
        if (span) span.textContent = "Speak slip text";
        if (err.error === "not-allowed") {
          toast("Microphone access denied. You can paste slip text directly.", "error");
        } else {
          toast("Could not recognize voice. Please try speaking again.", "warning");
        }
      };

      slipSpeechRec.onend = () => {
        isSlipListening = false;
        voiceBtn.classList.remove("listening");
        const span = voiceBtn.querySelector("span");
        if (span) span.textContent = "Speak slip text";
      };

      voiceBtn.addEventListener("click", () => {
        if (isSlipListening) {
          slipSpeechRec.stop();
        } else {
          try {
            slipSpeechRec.start();
          } catch (e) {
            console.error("Speech recognition start failed:", e);
          }
        }
      });
    } else if (voiceBtn) {
      voiceBtn.addEventListener("click", () => {
        toast("Speech recognition is not supported in this browser. Please paste slip text.", "info");
      });
    }

    // 5. Reactive inputs on Card 1
    serviceSelect?.addEventListener("change", () => {
      const rule = RTS_SERVICE_RULES[serviceSelect.value];
      if (rule && officeInput && !officeInput.value) {
        officeInput.value = `${rule.officer} Desk, ${rule.district}`;
      }
      updateSlipClockDisplay();
    });

    appNoInput?.addEventListener("input", updateSlipClockDisplay);
    dateInput?.addEventListener("change", updateSlipClockDisplay);
    officeInput?.addEventListener("input", updateSlipClockDisplay);

    // 6. Start Service Clock Button
    startClockBtn?.addEventListener("click", () => {
      updateSlipClockDisplay();
      const cardClock = $(".slip-card-clock");
      if (cardClock) {
        cardClock.style.transform = "scale(1.02)";
        setTimeout(() => { cardClock.style.transform = ""; }, 300);
      }
      toast("Statutory deadline clock started!", "success");
    });

    // 7. Save to My Applications
    saveToTrackerBtn?.addEventListener("click", () => {
      const service = serviceSelect?.value || "Income Certificate";
      const appNo = (appNoInput?.value.trim()) || `SAM-${Math.floor(1000 + Math.random() * 9000)}`;
      const subDateStr = dateInput?.value || toISODate(getToday());
      const rule = RTS_SERVICE_RULES[service] || RTS_SERVICE_RULES["Income Certificate"];
      const turnaroundDays = rule.days;

      const startDate = parseDate(subDateStr);
      const deadlineDate = new Date(startDate);
      deadlineDate.setDate(deadlineDate.getDate() + turnaroundDays);
      const deadlineDateStr = toISODate(deadlineDate);

      const displaySub = formatDisplayDate(subDateStr);
      const displayDeadline = formatDisplayDate(deadlineDateStr);
      const analysis = getDeadlineAnalysis(deadlineDateStr, "Pending");
      const office = officeInput?.value.trim() || `${rule.officer} Office, ${rule.district}`;

      // Check if reference exists
      const existingIdx = applications.findIndex((a) => a.ref.toUpperCase() === appNo.toUpperCase());
      if (existingIdx >= 0) {
        applications[existingIdx].service = service;
        applications[existingIdx].submitted = displaySub;
        applications[existingIdx].deadline = displayDeadline;
        applications[existingIdx].status = analysis.status;
        applications[existingIdx].officer = office;
      } else {
        applications.unshift({
          ref: appNo,
          service,
          category: rule.category,
          symbol: "▤",
          submitted: displaySub,
          deadline: displayDeadline,
          status: analysis.status,
          officer: office,
          district: rule.district,
          progress: Math.max(15, Math.min(95, Math.round(((turnaroundDays - Math.max(0, analysis.days)) / turnaroundDays) * 100))),
          notes: `Started from receipt slip. Statutory limit: ${turnaroundDays} days.`
        });

        officerCases.unshift({
          initials: appNo.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "AP",
          name: `Applicant · ${service}`,
          ref: appNo,
          office: `${rule.district} · ${office}`,
          deadline: displayDeadline,
          status: analysis.status,
          days: analysis.label
        });
      }

      savePersistedData();
      renderAllViews();

      saveToTrackerBtn.textContent = "Saved to Tracker ✓";
      saveToTrackerBtn.classList.remove("saffron-btn");
      saveToTrackerBtn.style.background = "var(--status-green)";
      saveToTrackerBtn.style.color = "#ffffff";
      setTimeout(() => {
        saveToTrackerBtn.textContent = "Save to My Applications ＋";
        saveToTrackerBtn.classList.add("saffron-btn");
        saveToTrackerBtn.style.background = "";
        saveToTrackerBtn.style.color = "";
      }, 3000);

      toast(`Application ${appNo} saved to My Applications! Statutory clock actively tracked.`, "success");
    });

    // 8. Open in Citizen Dashboard
    openDashboardBtn?.addEventListener("click", () => {
      saveToTrackerBtn?.click();
      showWorkspace("citizen");
      const searchBox = $("#applicationSearch");
      if (searchBox && appNoInput?.value.trim()) {
        searchBox.value = appNoInput.value.trim();
        renderApplications();
      }
      toast("Opened in Citizen Dashboard with active countdown.", "info");
    });

    // 9. Quick jump from Citizen Dashboard
    dashScanSlipBtn?.addEventListener("click", () => {
      showLandingPage();
      const target = $("#slip-scanner");
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    });
  }

  // =========================================================================
  // Initialize Application
  // =========================================================================
  function init() {
    loadPersistedData();
    renderAllViews();
    setupGlobalEventListeners();
    setupSlipScannerController();
    window.samayVoiceAssistant = new SAMAYVoiceAssistant();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
