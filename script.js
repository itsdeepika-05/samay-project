/**
 * SAMAY — Public Service Deadline Tracker
 * Full-Stack Frontend Controller
 * - Dynamic actual-date calculations (relative to current date)
 * - Multi-criteria search, filter, and sort
 * - Input validation with inline error messaging
 * - Status segregation: Overdue, Due Soon, Pending, Completed
 * - LocalStorage demo persistence with reset capability
 * - CSV export engines for Citizen, Officer & Commission views
 * - Modal management, Appeal draft generator & accessible UX
 */

(function () {
  "use strict";

  // =========================================================================
  // DOM Selectors Helper
  // =========================================================================
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Local storage keys
  const STORAGE_KEY_APPS = "samay_demo_applications_v2";
  const STORAGE_KEY_OFFICER = "samay_officer_cases_v2";

  // =========================================================================
  // Date Utilities & Accurate Days-Remaining Calculator
  // =========================================================================

  /**
   * Returns today's date normalized to local midnight.
   */
  function getToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  }

  /**
   * Parses string dates in ISO (YYYY-MM-DD) or British (DD Mon YYYY) format.
   */
  function parseDate(dateStr) {
    if (!dateStr) return getToday();
    if (dateStr instanceof Date) return dateStr;

    // Check if ISO "YYYY-MM-DD"
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

  /**
   * Formats a date object to "DD Mon YYYY" (e.g. "31 Oct 2026")
   */
  function formatDisplayDate(date) {
    const d = parseDate(date);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  /**
   * Formats a date object to "YYYY-MM-DD" for HTML date inputs
   */
  function toISODate(date) {
    const d = parseDate(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  /**
   * Creates a sample date offset from today by N days.
   */
  function getRelativeDate(offsetDays) {
    const d = getToday();
    d.setDate(d.getDate() + offsetDays);
    return d;
  }

  /**
   * Calculates days remaining between today and deadline.
   * Categorizes into Overdue, Due Soon, Pending, or Completed.
   */
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
  // Dynamically anchored to current runtime date to always show realistic demo
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
      console.warn("Storage access failed or blocked, using in-memory state.", e);
      applications = createInitialApplications();
      officerCases = createInitialOfficerCases();
    }
    // Re-evaluate days and statuses based on current date
    syncComputedStatuses();
  }

  function savePersistedData() {
    try {
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(applications));
      localStorage.setItem(STORAGE_KEY_OFFICER, JSON.stringify(officerCases));
    } catch (e) {
      console.warn("Unable to persist to localStorage", e);
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

  /**
   * Recalculates days and statuses dynamically using today's date
   */
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
  // Feedback & Notification Components
  // =========================================================================

  function toast(message, type = "info") {
    const el = $("#toast");
    if (!el) return;

    el.className = `toast toast-${type} show`;
    el.innerHTML = `<span>${escapeHtml(message)}</span>`;

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove("show");
    }, 3500);
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
  // Render: Citizen Dashboard
  // =========================================================================

  function renderApplications() {
    syncComputedStatuses();

    const query = ($("#applicationSearch")?.value || "").trim().toLowerCase();
    const filter = $("#statusFilter")?.value || "all";
    const sort = $("#sortFilter")?.value || "deadline-asc";

    let rows = applications.filter((a) => {
      // Status filtering with synonym normalization
      let statusMatches = true;
      if (filter === "due-soon") statusMatches = a.status === "Due soon" || a.status === "At risk";
      else if (filter === "overdue") statusMatches = a.status === "Overdue" || a.status === "Breached";
      else if (filter === "pending") statusMatches = a.status === "Pending" || a.status === "On track";
      else if (filter === "completed") statusMatches = a.status === "Completed";

      // Search keyword filter
      const searchText = `${a.service} ${a.ref} ${a.officer || ""} ${a.district || ""} ${a.category || ""}`.toLowerCase();
      const queryMatches = !query || searchText.includes(query);

      return statusMatches && queryMatches;
    });

    // Sorting
    rows.sort((a, b) => {
      const dateA = parseDate(a.deadline).getTime();
      const dateB = parseDate(b.deadline).getTime();
      const subA = parseDate(a.submitted).getTime();
      const subB = parseDate(b.submitted).getTime();

      switch (sort) {
        case "deadline-asc":
          return dateA - dateB;
        case "deadline-desc":
          return dateB - dateA;
        case "submitted-desc":
          return subB - subA;
        case "submitted-asc":
          return subA - subB;
        case "service-asc":
          return a.service.localeCompare(b.service);
        default:
          return dateA - dateB;
      }
    });

    // Build Table Body HTML
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

    // Empty state visibility
    const emptyState = $("#tableEmpty");
    if (emptyState) {
      emptyState.classList.toggle("hidden", rows.length > 0);
    }

    // Foot count
    const countEl = $("#applicationCount");
    if (countEl) {
      countEl.textContent = `Showing ${rows.length} of ${applications.length} applications`;
    }

    // Update 5 Key Metric Cards
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

    // Urgent count badge in sidebar
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

    // Update Deadline Radar Panel
    renderDeadlineRadar();
  }

  /**
   * Updates the circular radar widget to highlight the nearest urgent deadline
   */
  function renderDeadlineRadar() {
    // Find earliest active (non-completed) deadline
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
      // All applications are completed
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
  // Render: Officer Radar
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

    // Update Officer stats
    const dueSoonTotal = officerCases.filter((c) => c.status === "Due soon" || c.status === "At risk").length;
    const overdueTotal = officerCases.filter((c) => c.status === "Overdue" || c.status === "Breached").length;
    if ($("#officerTotalCount")) $("#officerTotalCount").textContent = String(120 + officerCases.length);
    if ($("#officerDueSoonCount")) $("#officerDueSoonCount").textContent = String(15 + dueSoonTotal).padStart(2, "0");
    if ($("#officerOverdueCount")) $("#officerOverdueCount").textContent = String(5 + overdueTotal).padStart(2, "0");
  }

  // =========================================================================
  // Render: Commission Overview
  // =========================================================================

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

  /**
   * Sets top dynamic date banner to actual current date
   */
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
  // Navigation & View Controller
  // =========================================================================

  function switchView(viewName) {
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
  // Modal Management Component
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
    if (backdrop) backdrop.classList.add("hidden");
    document.body.style.overflow = "";
  }

  // =========================================================================
  // Application Details & Timeline Modal
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
            ? `<button type="button" class="primary-btn" id="modalPrepareAppealBtn">Prepare Appeal Draft</button>`
            : `<button type="button" class="primary-btn" id="modalFollowUpBtn">Mark Follow-up Note</button>`
        }
      </div>
    `
    );

    // Bind Details Action Buttons
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
          <button type="submit" class="primary-btn">Generate Appeal Draft</button>
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

      // Show Appeal Review Screen
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
          <button type="button" class="primary-btn" id="copyAppealBtn">📋 Copy to Clipboard</button>
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
    const defaultDeadlineISO = toISODate(getRelativeDate(15)); // 15 days default service guarantee

    // Generate unique suggestion reference
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
          <button type="submit" class="primary-btn">Track Application</button>
        </div>
      </form>
    `
    );

    // Cancel Button
    $("#cancelTrackFormBtn")?.addEventListener("click", closeModal);

    // File Picker feedback
    $("#receiptFileInput")?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      const hint = $("#receiptHint");
      if (hint) {
        hint.textContent = file
          ? `Selected: ${file.name} (${Math.round(file.size / 1024)} KB) · Demonstration record`
          : "No live files will be sent to external servers.";
      }
    });

    // Form Submission & Validation
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

      // Reset errors
      $$(".field-error-msg", form).forEach((el) => el.classList.add("hidden"));
      $$("input", form).forEach((el) => el.classList.remove("field-error-border"));

      let hasError = false;

      // 1. Validate Service Name
      if (!service) {
        hasError = true;
        $("#formServiceName")?.classList.add("field-error-border");
        const err = $("#errServiceName");
        if (err) {
          err.textContent = "Service name is required.";
          err.classList.remove("hidden");
        }
      }

      // 2. Validate Reference Number
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

      // 3. Validate Dates
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

      // Calculate initial analysis
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

      // Add to beginning of citizen list
      applications.unshift(newApp);

      // Also add to officer cases for workflow consistency
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

      // Reset filters so the new application is instantly visible
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

    // Add UTF-8 BOM so Excel opens Indian names and symbols cleanly
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
  // Informational Explanatory Modals
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
        <button class="primary-btn" id="howItWorksCloseBtn">Understand &amp; Close</button>
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
        <button class="primary-btn" id="ruleRegistryCloseBtn">Close</button>
      </div>
    `
    );

    $("#ruleRegistryCloseBtn")?.addEventListener("click", closeModal);
  }

  // =========================================================================
  // Event Listeners & Initialization
  // =========================================================================

  function setupEventListeners() {
    // 1. Navigation switching
    $$(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => switchView(btn.dataset.view));
    });

    // 2. Mobile sidebar drawer
    $("#menuBtn")?.addEventListener("click", openSidebar);
    $("#sidebarCloseBtn")?.addEventListener("click", closeSidebar);
    $("#sidebarBackdrop")?.addEventListener("click", closeSidebar);

    // 3. Citizen table filtering & sorting
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

    // 4. Officer view filters
    $("#officerFilter")?.addEventListener("change", renderOfficerCases);

    // 5. Commission office search
    $("#officeSearch")?.addEventListener("input", renderOffices);

    // 6. Action: Add application
    $("#newApplicationBtn")?.addEventListener("click", showTrackApplicationForm);

    // 7. Modals: Close buttons
    $("#closeModalBtn")?.addEventListener("click", closeModal);
    $("#modalBackdrop")?.addEventListener("click", (e) => {
      if (e.target === $("#modalBackdrop")) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
        closeSidebar();
        $("#notificationsPanel")?.classList.add("hidden");
      }
    });

    // 8. Global delegated click handlers (Case details, District pins)
    document.addEventListener("click", (e) => {
      // Case details button
      const caseBtn = e.target.closest("[data-open-case]");
      if (caseBtn) {
        showCaseDetails(caseBtn.dataset.openCase);
        return;
      }

      // District performance pin
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

      // Close notifications popover when clicking outside
      const notifWrapper = e.target.closest(".notifications-wrapper");
      if (!notifWrapper) {
        $("#notificationsPanel")?.classList.add("hidden");
      }
    });

    // 9. Reset Demo Data buttons
    $("#resetDemoBtn")?.addEventListener("click", resetDemoData);
    $("#sidebarResetBtn")?.addEventListener("click", resetDemoData);

    // 10. How it works & Rule Registry modals
    $("#rightsBtn")?.addEventListener("click", showHowItWorksModal);
    $("#policyBtn")?.addEventListener("click", showRuleRegistryModal);
    $("#draftRuleBtn")?.addEventListener("click", () => {
      toast("Draft rules must be vetted against State Gazette before enforcement.", "warning");
    });
    $("#chartDetailsBtn")?.addEventListener("click", () => {
      toast("Delay breakdown is based on sample administrative filings.", "info");
    });

    // 11. Notifications popover toggle
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

    // 12. CSV Exports
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
  // Initialize Application
  // =========================================================================
  document.addEventListener("DOMContentLoaded", () => {
    loadPersistedData();
    renderAllViews();
    setupEventListeners();
  });

  // Also run immediately in case DOM is already parsed
  if (document.readyState === "interactive" || document.readyState === "complete") {
    loadPersistedData();
    renderAllViews();
    setupEventListeners();
  }
})();
