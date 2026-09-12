// Using Fetch to render markdown from GitHub (raw).
// Parse via marked.js, sanitize via DOMPurify with Trusted Types enabled.
//
// Behaviors:
// - toggle-be2 (Sandbox Notes) shows sandbox subnav + renders into #markdown-sandbox
// - Sandbox sub-buttons remain hidden unless Sandbox is active
// - Network button reveals child buttons (CD / Web / LT) only when selected
// - HTTPS screenshot is pinned + ONLY visible when Network -> Web is clicked
// - Lab Terminals applies the optional terminal Markdown theme
// - Loading another Sandbox Markdown file restores the inherited Sandbox palette
// - Leaving Sandbox hides sandbox UI + collapses children + clears pressed states

document.addEventListener("DOMContentLoaded", () => {
  // =========================================================
  // Main Toggle Buttons
  // =========================================================
  const btnCyber = document.getElementById("toggle-be1");
  const btnSandbox = document.getElementById("toggle-be2");


  // =========================================================
  // Markdown Sections
  // =========================================================
  const cyberContainer = document.getElementById("markdown-be1");

  // Stable render target for ALL Sandbox Markdown.
  const sandboxContainer = document.getElementById("markdown-sandbox");


  // =========================================================
  // Sandbox UI Containers
  // =========================================================
  const sandboxSubnav = document.getElementById("sandbox-subnav");

  const networkChildren = document.getElementById(
    "sandbox-network-children"
  );


  // =========================================================
  // Sandbox Primary Buttons
  // =========================================================
  const servicesBtn = document.getElementById(
    "sandbox-services-btn"
  );

  const networkBtn = document.getElementById(
    "sandbox-network-btn"
  );

  const pcapBtn = document.getElementById(
    "sandbox-pcap-btn"
  );


  // =========================================================
  // Network Child Buttons
  // =========================================================
  const cdBtn = document.getElementById(
    "sandbox-network-cd-btn"
  );

  const webBtn = document.getElementById(
    "sandbox-network-web-btn"
  );

  const labBtn = document.getElementById(
    "sandbox-network-lab-terminals-btn"
  );


  // =========================================================
  // Optional Sandbox Live Region
  //
  // If #sandbox-subnav-status exists, announcements are sent
  // to it. If it does not exist, announce() safely does nothing.
  // =========================================================
  const sandboxStatus = document.getElementById(
    "sandbox-subnav-status"
  );


  // =========================================================
  // HTTPS Screenshot
  //
  // Visible ONLY while WebHttpHttps.md is selected.
  // =========================================================
  const httpsScreenshot = document.getElementById(
    "sandbox-https-screenshot"
  );


  // =========================================================
  // Required Element Guardrails
  // =========================================================
  if (
    !btnCyber ||
    !btnSandbox ||
    !cyberContainer ||
    !sandboxContainer
  ) {
    console.warn(
      "CyberCuriosity: Missing required main elements."
    );

    return;
  }


  // =========================================================
  // Markdown URLs
  // =========================================================
  const URLS = {
    cyber:
      "https://raw.githubusercontent.com/nathanMcL/nathanMcL.github.io/main/CSP_Readme.md",

    sandboxHome:
      "https://raw.githubusercontent.com/nathanMcL/nathanMcL.github.io/main/nmap.md",

    services:
      "https://raw.githubusercontent.com/nathanMcL/nathanMcL.github.io/main/Services.md",

    pcap:
      "https://raw.githubusercontent.com/nathanMcL/nathanMcL.github.io/main/PacketCapture.md",

    networkCD:
      "https://raw.githubusercontent.com/nathanMcL/nathanMcL.github.io/main/MacATron.md",

    networkWeb:
      "https://raw.githubusercontent.com/nathanMcL/nathanMcL.github.io/main/WebHttpHttps.md",

    networkLab:
      "https://raw.githubusercontent.com/nathanMcL/nathanMcL.github.io/main/LabTerminals.md"
  };


  // =========================================================
  // Markdown Cache
  //
  // Stores already-sanitized HTML so switching between sections
  // does not require another GitHub fetch.
  // =========================================================
  const cache = new Map();


  // =========================================================
  // Accessibility Announcement Helper
  // =========================================================
  function announce(message) {
    if (!sandboxStatus) return;

    sandboxStatus.textContent = message;
  }


  // =========================================================
  // HTTPS Screenshot Helpers
  // =========================================================

  function hideHttpsScreenshot() {
    if (!httpsScreenshot) return;

    httpsScreenshot.classList.remove("is-pinned");
    httpsScreenshot.hidden = true;
  }


  function showHttpsScreenshot() {
    if (!httpsScreenshot) return;

    httpsScreenshot.hidden = false;
    httpsScreenshot.classList.add("is-pinned");
  }


  // =========================================================
  // Sandbox Markdown Theme Controller
  //
  // No argument:
  //     Return to the normal inherited Sandbox palette.
  //
  // "terminal":
  //     Apply .markdown-theme-terminal
  //
  // Future examples:
  //     setSandboxMarkdownTheme("packet");
  //     setSandboxMarkdownTheme("cellular");
  //
  // Those future themes are NOT implemented yet.
  // =========================================================
  const sandboxThemeClasses = [
    "markdown-theme-terminal"
  ];


  function setSandboxMarkdownTheme(theme = null) {
    sandboxContainer.classList.remove(
      ...sandboxThemeClasses
    );

    if (!theme) {
      return;
    }

    const themeClass = `markdown-theme-${theme}`;

    // Only permit theme classes that have been explicitly
    // registered above. This avoids adding arbitrary classes.
    if (sandboxThemeClasses.includes(themeClass)) {
      sandboxContainer.classList.add(themeClass);
    }
  }


  // =========================================================
  // Markdown Loader
  //
  // Workflow:
  //
  // GitHub Raw Markdown
  //        ↓
  // marked.js
  //        ↓
  // DOMPurify
  //        ↓
  // TrustedHTML / sanitized HTML
  //        ↓
  // existing Markdown container
  // =========================================================
  async function loadMarkdown(url, container) {
    if (!url || !container) return;

    if (cache.has(url)) {
      container.innerHTML = cache.get(url);
      return;
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status} while fetching ${url}`
        );
      }

      const markdown = await response.text();

      const rawHtml = marked.parse(markdown);

      const cleanHtml = DOMPurify.sanitize(
        rawHtml,
        {
          RETURN_TRUSTED_TYPE: true
        }
      );

      container.innerHTML = cleanHtml;

      cache.set(url, cleanHtml);
    } catch (error) {
      console.error(
        "Error fetching markdown:",
        error
      );

      container.textContent =
        "Failed to load content.";
    }
  }


  // =========================================================
  // Button State Helpers
  // =========================================================

  function clearPressedStates() {
    const allButtons = [
      servicesBtn,
      networkBtn,
      pcapBtn,
      cdBtn,
      webBtn,
      labBtn
    ].filter(Boolean);

    allButtons.forEach((button) => {
      button.classList.remove("is-active");

      button.setAttribute(
        "aria-pressed",
        "false"
      );
    });
  }


  function setActiveButton(activeButton, group) {
    group
      .filter(Boolean)
      .forEach((button) => {
        const isActive =
          button === activeButton;

        button.classList.toggle(
          "is-active",
          isActive
        );

        button.setAttribute(
          "aria-pressed",
          String(isActive)
        );
      });
  }


  function collapseNetworkChildren() {
    if (!networkChildren) return;

    networkChildren.hidden = true;
  }


  // =========================================================
  // Cyber Thoughts Mode
  // =========================================================
  async function showCyberMode({
    scroll = true
  } = {}) {
    btnCyber.setAttribute(
      "aria-pressed",
      "true"
    );

    btnSandbox.setAttribute(
      "aria-pressed",
      "false"
    );

    btnCyber.classList.add("is-active");
    btnSandbox.classList.remove("is-active");


    cyberContainer.hidden = false;
    sandboxContainer.hidden = true;


    // Reset any optional Sandbox-specific visual theme.
    setSandboxMarkdownTheme();


    // Hide everything Sandbox-related.
    hideHttpsScreenshot();

    if (sandboxSubnav) {
      sandboxSubnav.hidden = true;
    }

    if (networkChildren) {
      networkChildren.hidden = true;
    }


    clearPressedStates();
    announce("");


    await loadMarkdown(
      URLS.cyber,
      cyberContainer
    );


    if (scroll) {
      cyberContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }


  // =========================================================
  // Sandbox Notes Home
  // =========================================================
  async function showSandboxMode({
    scroll = true
  } = {}) {
    btnCyber.setAttribute(
      "aria-pressed",
      "false"
    );

    btnSandbox.setAttribute(
      "aria-pressed",
      "true"
    );

    btnCyber.classList.remove("is-active");
    btnSandbox.classList.add("is-active");


    if (sandboxSubnav) {
      sandboxSubnav.hidden = false;
    }


    cyberContainer.hidden = true;
    sandboxContainer.hidden = false;


    if (networkChildren) {
      networkChildren.hidden = true;
    }


    clearPressedStates();


    // Sandbox home uses the existing inherited palette.
    setSandboxMarkdownTheme();


    // Screenshot starts hidden.
    hideHttpsScreenshot();


    await loadMarkdown(
      URLS.sandboxHome,
      sandboxContainer
    );


    announce(
      "Loaded: Sandbox Notes"
    );


    if (scroll) {
      sandboxContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }


  // =========================================================
  // Services
  // =========================================================
  servicesBtn?.addEventListener(
    "click",
    async (event) => {
      event.preventDefault();

      if (sandboxContainer.hidden) {
        return;
      }


      // Services is not Web.
      hideHttpsScreenshot();


      // Services uses the normal Sandbox palette.
      setSandboxMarkdownTheme();


      collapseNetworkChildren();


      setActiveButton(
        servicesBtn,
        [
          servicesBtn,
          networkBtn,
          pcapBtn
        ]
      );


      setActiveButton(
        null,
        [
          cdBtn,
          webBtn,
          labBtn
        ]
      );


      await loadMarkdown(
        URLS.services,
        sandboxContainer
      );


      announce(
        "Loaded: Services"
      );


      sandboxContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  );


  // =========================================================
  // Network Parent
  //
  // Network does not load a new Markdown document itself.
  // Therefore, it does NOT alter the current Markdown theme.
  //
  // If Lab Terminals is currently displayed, collapsing and
  // reopening Network leaves that document/theme untouched.
  // =========================================================
  networkBtn?.addEventListener(
    "click",
    (event) => {
      event.preventDefault();

      if (sandboxContainer.hidden) {
        return;
      }


      // Screenshot belongs ONLY to Web selection.
      hideHttpsScreenshot();


      if (!networkChildren) {
        return;
      }


      const willShow =
        networkChildren.hidden;

      networkChildren.hidden =
        !willShow;


      setActiveButton(
        networkBtn,
        [
          servicesBtn,
          networkBtn,
          pcapBtn
        ]
      );


      // Opening Network begins with no child marked active.
      if (willShow) {
        setActiveButton(
          null,
          [
            cdBtn,
            webBtn,
            labBtn
          ]
        );
      }


      announce(
        willShow
          ? "Network sub-sections expanded."
          : "Network sub-sections collapsed."
      );
    }
  );


  // =========================================================
  // Network -> Cellular Device
  // MacATron.md
  // =========================================================
  cdBtn?.addEventListener(
    "click",
    async (event) => {
      event.preventDefault();

      if (sandboxContainer.hidden) {
        return;
      }


      hideHttpsScreenshot();


      // Cellular Device returns to the inherited palette.
      setSandboxMarkdownTheme();


      // Keep Network children visible.
      if (networkChildren) {
        networkChildren.hidden = false;
      }


      setActiveButton(
        networkBtn,
        [
          servicesBtn,
          networkBtn,
          pcapBtn
        ]
      );


      setActiveButton(
        cdBtn,
        [
          cdBtn,
          webBtn,
          labBtn
        ]
      );


      await loadMarkdown(
        URLS.networkCD,
        sandboxContainer
      );


      announce(
        "Loaded: Network — Cellular Device"
      );


      sandboxContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  );


  // =========================================================
  // Network -> Web HTTP / HTTPS
  // WebHttpHttps.md
  // =========================================================
  webBtn?.addEventListener(
    "click",
    async (event) => {
      event.preventDefault();

      if (sandboxContainer.hidden) {
        return;
      }


      // Web uses the inherited Sandbox palette.
      setSandboxMarkdownTheme();


      // Keep Network children visible.
      if (networkChildren) {
        networkChildren.hidden = false;
      }


      setActiveButton(
        networkBtn,
        [
          servicesBtn,
          networkBtn,
          pcapBtn
        ]
      );


      setActiveButton(
        webBtn,
        [
          cdBtn,
          webBtn,
          labBtn
        ]
      );


      await loadMarkdown(
        URLS.networkWeb,
        sandboxContainer
      );


      // ONLY Web shows and pins this screenshot.
      showHttpsScreenshot();


      announce(
        "Loaded: Network — Web HTTP/HTTPS"
      );


      sandboxContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  );


  // =========================================================
  // Network -> Lab Terminals
  // LabTerminals.md
  //
  // This is currently the ONLY Markdown document with its own
  // optional visual palette.
  // =========================================================
  labBtn?.addEventListener(
    "click",
    async (event) => {
      event.preventDefault();

      if (sandboxContainer.hidden) {
        return;
      }


      // HTTPS screenshot belongs only to WebHttpHttps.md.
      hideHttpsScreenshot();


      // Keep Network children visible.
      if (networkChildren) {
        networkChildren.hidden = false;
      }


      setActiveButton(
        networkBtn,
        [
          servicesBtn,
          networkBtn,
          pcapBtn
        ]
      );


      setActiveButton(
        labBtn,
        [
          cdBtn,
          webBtn,
          labBtn
        ]
      );


      // Apply Lab Terminals-specific theme BEFORE rendering.
      // This prevents a brief flash of the normal Sandbox
      // palette while the Markdown request resolves.
      setSandboxMarkdownTheme(
        "terminal"
      );


      await loadMarkdown(
        URLS.networkLab,
        sandboxContainer
      );


      announce(
        "Loaded: Network — Lab Terminals"
      );


      sandboxContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  );


  // =========================================================
  // Packet Capture
  // =========================================================
  pcapBtn?.addEventListener(
    "click",
    async (event) => {
      event.preventDefault();

      if (sandboxContainer.hidden) {
        return;
      }


      hideHttpsScreenshot();


      // Packet Capture returns to inherited Sandbox colors.
      setSandboxMarkdownTheme();


      collapseNetworkChildren();


      setActiveButton(
        pcapBtn,
        [
          servicesBtn,
          networkBtn,
          pcapBtn
        ]
      );


      setActiveButton(
        null,
        [
          cdBtn,
          webBtn,
          labBtn
        ]
      );


      await loadMarkdown(
        URLS.pcap,
        sandboxContainer
      );


      announce(
        "Loaded: Packet Capture"
      );


      sandboxContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  );


  // =========================================================
  // Main Toggle Wiring
  // =========================================================
  btnCyber.addEventListener(
    "click",
    (event) => {
      event.preventDefault();

      showCyberMode();
    }
  );


  btnSandbox.addEventListener(
    "click",
    (event) => {
      event.preventDefault();

      showSandboxMode();
    }
  );


  // =========================================================
  // Initial Page State
  // =========================================================
  showCyberMode({
    scroll: false
  });
});
