/* =============================================================================
 *  data.js  —  YOUR CONTENT LIVES HERE
 * =============================================================================
 *  This is the ONLY file you need to edit to update your portfolio's content.
 *  Everything on the page (name, about, skills, projects, timeline, contact)
 *  is generated from the object below. Change the text, save, refresh — done.
 *
 *  Tips:
 *    • Add a project  -> copy a { ... } block inside `projects` and edit it.
 *    • Add a skill     -> add a { name, level } to a category's `items`.
 *    • Reorder sections -> handled in index.html, not here.
 * ========================================================================== */

const PORTFOLIO = {

  /* ---- Basic identity ---------------------------------------------------- */
  meta: {
    name: "Jayaprakash M",
    // Short role shown under your name + in the browser tab.
    role: "Software Development Engineer",
    // Mono subline under the hero name.
    subline: "SDE @ Zenfinity Energy · B.Tech AI & DS '24 · Chennai, India",
    // Rotating words that complete "Engineering ___" in the hero.
    rotatingRoles: [
      "Battery Systems",
      "E-Bike Platforms",
      "Full-Stack Products",
      "Data Pipelines",
      "End-to-End Delivery",
    ],
    // One-line hook (hero paragraph + SEO description).
    tagline:
      "Software Development Engineer at Zenfinity Energy, building battery and e-bike products end to end — from backend and data pipelines to the website that sells the ride.",
    location: "Chennai, India",
    availability: "Building @ Zenfinity Energy", // shown in the status chip + footer
    resumeUrl: "assets/resume/Jayaprakash-M-Resume.pdf", // replace with an updated PDF anytime
  },

  /* ---- Hero call-to-action stats (edit freely) --------------------------- */
  stats: [
    { value: 2024, label: "B.Tech · AI & DS", suffix: "" },
    { value: 4,    label: "Roles Held",       suffix: "+" },
    { value: 6,    label: "Builds Planned",   suffix: "+" },
    { value: 100,  label: "End-to-End",       suffix: "%" },
  ],

  /* ---- About ------------------------------------------------------------- */
  about: {
    heading: "About Me",
    paragraphs: [
      "I'm Jayaprakash M — an AI & Data Science graduate who found his groove where software meets hardware. Today I'm a Software Development Engineer at Zenfinity Energy, building battery and e-bike products end to end.",
      "My favourite part is owning the whole journey: designing the backend and data pipelines, wiring up real-time telemetry, and building the website that actually puts the bike in someone's hands. I'm going all-in on battery technology and e-mobility — the systems that will move the next decade.",
    ],
    highlights: [
      "Battery Systems",
      "E-Mobility",
      "Full-Stack",
      "Data Pipelines",
      "End-to-End Product",
    ],
  },

  /* ---- Skills (grouped into 3 domains) ----------------------------------- */
  /* `level` (0-100) drives the animated proficiency bars. Colours are keyed  */
  /* off the category name (see clusterColor in render.js).                   */
  skills: [
    {
      category: "Backend & Software",
      icon: "code",
      items: [
        { name: "Java (OOP, Collections)", level: 85 },
        { name: "Python",                  level: 82 },
        { name: "SQL",                     level: 80 },
        { name: "REST APIs",               level: 78 },
        { name: "WebSockets",              level: 75 },
        { name: "Git & GitHub",            level: 80 },
      ],
    },
    {
      category: "Data & AI",
      icon: "cpu",
      items: [
        { name: "Data Pipelines",   level: 78 },
        { name: "Data Processing",  level: 78 },
        { name: "Problem Solving",  level: 85 },
        { name: "ML Foundations",   level: 65 },
        { name: "Analytics",        level: 70 },
      ],
    },
    {
      category: "Battery & Product",
      icon: "zap",
      items: [
        { name: "Battery / BMS",        level: 62 },
        { name: "E-Mobility / EV",      level: 66 },
        { name: "Web Development",      level: 76 },
        { name: "End-to-End Delivery",  level: 82 },
        { name: "System Integration",  level: 70 },
      ],
    },
  ],

  /* ---- Projects ---------------------------------------------------------- */
  /* These are strong, on-theme builds aligned to battery + e-bike + software */
  /* — framed honestly by `status` (Building / Planned / Concept / Live).     */
  /* Add real `liveUrl` / `codeUrl` once a project is shipped and they'll     */
  /* replace the "In development" note automatically.                         */
  projects: [
    {
      title: "Battery Health & Telemetry Dashboard",
      blurb: "A real-time BMS dashboard streaming live voltage, current, temperature, State-of-Charge and State-of-Health over WebSockets, with historical analytics.",
      tags: ["Python", "FastAPI", "WebSockets", "IoT", "Dashboard"],
      accent: "primary",
      metric: "Real-time · BMS",
      status: "Live",
      liveUrl: "",
      codeUrl: "https://github.com/jayaprakash627/battery-health-dashboard",
      featured: true,
    },
    {
      title: "Smart Support Desk — AI Email Triage",
      blurb: "A support tool that reads incoming emails, classifies them by urgency and topic, then auto-creates and routes tickets with priorities and SLAs. Rule-based by default, Claude-powered when enabled.",
      tags: ["Python", "FastAPI", "SQLite", "NLP", "AI"],
      accent: "secondary",
      metric: "AI · Triage",
      status: "Live",
      liveUrl: "",
      codeUrl: "https://github.com/jayaprakash627/smart-support-desk",
      featured: true,
    },
    {
      title: "E-Bike Fleet Telematics Platform",
      blurb: "Track every e-bike live — location, battery %, range and ride stats — through backend APIs and a web dashboard that manages the whole fleet.",
      tags: ["Backend", "REST API", "GPS", "Analytics"],
      accent: "tertiary",
      metric: "EV · Telematics",
      status: "Building",
      liveUrl: "",
      codeUrl: "",
      featured: true,
    },
    {
      title: "Battery State-of-Health Prediction",
      blurb: "An ML model that predicts battery degradation and remaining useful life from charge/discharge cycles and ride data — putting my AI & DS background to work.",
      tags: ["Python", "Machine Learning", "Time Series", "Batteries"],
      accent: "secondary",
      metric: "AI · Predictive",
      status: "Planned",
      liveUrl: "",
      codeUrl: "",
      featured: false,
    },
    {
      title: "E-Bike Storefront & Order System",
      blurb: "The end-to-end product site: browse models, configure a build, and order an e-bike — carrying it all the way from the website to the sale.",
      tags: ["Full-Stack", "Web", "SQL", "Commerce"],
      accent: "primary",
      metric: "Full-Stack · Commerce",
      status: "Planned",
      liveUrl: "",
      codeUrl: "",
      featured: false,
    },
    {
      title: "Smart Charging Optimizer",
      blurb: "Schedules and optimises charging based on battery health, usage patterns and electricity cost — kinder to the pack, easier on the bill.",
      tags: ["Python", "Optimization", "Data"],
      accent: "tertiary",
      metric: "Optimization",
      status: "Concept",
      liveUrl: "",
      codeUrl: "",
      featured: false,
    },
    {
      title: "Ride & Trip Analytics Pipeline",
      blurb: "Ingests ride telemetry into clean data pipelines and turns it into insights on usage, range and battery wear across the fleet.",
      tags: ["Data Pipelines", "SQL", "Analytics", "Python"],
      accent: "secondary",
      metric: "Data · Pipelines",
      status: "Planned",
      liveUrl: "",
      codeUrl: "",
      featured: false,
    },
  ],

  /* ---- Journey / timeline (most recent first) ---------------------------- */
  timeline: [
    {
      period: "2026 — Present",
      title: "Software Development Engineer",
      place: "Zenfinity Energy",
      type: "experience",
      points: [
        "End-to-end ownership of battery & e-bike products — backend, data pipelines, and the web presence.",
        "Converted from intern to full-time SDE after the first three months.",
        "Bridging software and hardware: real-time telemetry, data handling, and system integration.",
      ],
    },
    {
      period: "Jan 2026 — 2026",
      title: "Backend Engineer Intern",
      place: "Zenfinity Energy",
      type: "experience",
      points: [
        "Built and maintained backend scripts and data pipelines for operational data.",
        "Worked on data processing and pipeline workflows supporting internal applications.",
        "Collaborated with the team to improve system reliability and backend performance.",
      ],
    },
    {
      period: "Dec 2024 — Jul 2025",
      title: "Program Analyst",
      place: "KultureHire",
      type: "experience",
      points: [
        "Designed and validated end-to-end program flows and logic.",
        "Contributed to workflow testing, issue identification, and documentation.",
      ],
    },
    {
      period: "Dec 2024 — Jun 2025",
      title: "Software Developer Intern",
      place: "Lentera Technologies",
      type: "experience",
      points: [
        "Contributed to the internal product 'Ticketzee' — feature work, bug fixes, and testing.",
        "Learned real-world project workflow, debugging, and version control.",
      ],
    },
    {
      period: "Nov 2023 — Jan 2024",
      title: "Software Developer Intern",
      place: "Netphenix",
      type: "experience",
      points: [
        "Strengthened Python fundamentals and problem-solving on hands-on tasks.",
        "Practised reading, executing, and debugging existing codebases.",
      ],
    },
    {
      period: "2020 — 2024",
      title: "B.Tech, Artificial Intelligence & Data Science",
      place: "Sri Venkateswaraa College of Technology · CGPA 7.95",
      type: "education",
      points: [
        "Specialised in machine learning, data science, and software development.",
        "The foundation that now powers data-driven battery and e-mobility products.",
      ],
    },
  ],

  /* ---- Beyond the code (sports & leadership) ----------------------------- */
  athletics: {
    heading: "Beyond the Code",
    subtext:
      "Competitive powerlifting and bodybuilding taught me what engineering rewards too — discipline, progressive overload, and showing up every single day.",
    achievements: [
      { sport: "Powerlifting",        title: "State-Level Gold",           detail: "1× Gold medal",             tier: "State",         icon: "trophy", accent: "primary"   },
      { sport: "Powerlifting",        title: "Inter-College Overall Gold", detail: "Overall champion",          tier: "Inter-College", icon: "medal",  accent: "secondary" },
      { sport: "Bodybuilding · TABBA", title: "State Gold — Junior",        detail: "1st place, Junior category", tier: "State",         icon: "trophy", accent: "tertiary"  },
      { sport: "Bodybuilding · TABBA", title: "District Silver",            detail: "2nd place",                 tier: "District",      icon: "medal",  accent: "primary"   },
    ],
  },

  /* ---- Contact & socials ------------------------------------------------- */
  contact: {
    heading: "Let's build what moves people",
    subtext:
      "Working on batteries, e-mobility, or a product that needs someone to own it end to end? I'd love to talk. Drop a message and I'll get back to you.",
    email: "jayaprakashmohanraj627@gmail.com", // <- your email (edit anytime)
    socials: [
      { name: "GitHub",   icon: "github",   url: "https://github.com/jayaprakash627", handle: "@jayaprakash627" },
      { name: "LinkedIn", icon: "linkedin", url: "https://linkedin.com/in/jaya-prakash-369139244", handle: "/in/jaya-prakash" },
      { name: "Email",    icon: "mail",     url: "mailto:jayaprakashmohanraj627@gmail.com", handle: "jayaprakashmohanraj627@gmail.com" },
    ],
  },
};

// Expose for the other scripts (no build step / modules needed).
window.PORTFOLIO = PORTFOLIO;
