/* =============================================================================
 *  data.js  —  YOUR CONTENT LIVES HERE
 * =============================================================================
 *  This is the ONLY file you need to edit to update your portfolio's content.
 *  Change the text, save, refresh — done.
 *
 *  Tips:
 *    • Add a project  -> copy a { ... } block inside `projects` and edit it.
 *    • Add a skill    -> add a { name, level } to a group's `items`.
 *    • `level` 0-100 drives a 3-segment meter: 80+ = Core, 68+ = Working, else Learning.
 * ========================================================================== */

const PORTFOLIO = {

  /* ---- Basic identity ---------------------------------------------------- */
  meta: {
    name: "Jayaprakash M",
    role: "Software Development Engineer",
    // Small uppercase line above the headline.
    eyebrow: "JAYAPRAKASH M · SOFTWARE DEVELOPMENT ENGINEER",
    // The big headline — one array item per line.
    // NOTE: "e‑mobility" uses a non-breaking hyphen (U+2011) so it never splits across lines.
    headline: ["I build battery", "and e‑mobility products", "end to end."],
    tagline:
      "Software Development Engineer at Zenfinity Energy. I own the backend, the real-time telemetry pipeline, and the site that sells the bike — from BMS-style data streams to checkout.",
    // Words wrapped in <strong> inside the tagline so a 3-second skim lands the point.
    taglineBold: ["backend", "real-time telemetry pipeline", "site that sells the bike"],
    location: "Chennai, India",
    availability: "SDE @ Zenfinity Energy · open to talk",
    subline: "SDE @ Zenfinity Energy · B.Tech AI & DS '24 · Chennai, India",
    // Left empty on purpose: the old résumé is backend-generic and contradicts this
    // positioning, so the button stays hidden. Add the path when the new PDF is ready:
    //   resumeUrl: "assets/resume/Jayaprakash-M-Resume.pdf",
    resumeUrl: "",
  },

  /* ---- Hero proof bar (replaces vanity counters) ------------------------- */
  proof: [
    { label: "SHIPPED", value: "3 production-grade builds · source public", accent: "primary" },
    { label: "OWNS",    value: "API → pipeline → live UI → deploy",          accent: "secondary" },
    { label: "DOMAIN",  value: "48V packs · BMS telemetry · e-bikes",        accent: "tertiary" },
  ],

  /* ---- About ------------------------------------------------------------- */
  about: {
    heading: "About Me",
    paragraphs: [
      "I build the software layer of battery and e-bike products — backend services, telemetry pipelines, and the site that sells the ride. My degree is in AI & Data Science, but the interesting part is where software meets hardware.",
      "My favourite part is owning the whole journey: designing the data model and the services, wiring real-time telemetry from pack to screen, and shipping the front end so nothing waits on a handoff. I'm going all-in on battery technology and e-mobility — the systems that move the next decade.",
    ],
    highlights: ["Battery Telemetry", "E-Mobility", "Real-Time Systems", "Data Pipelines", "End-to-End Ownership"],
  },

  /* ---- What I can own (capabilities, not a syntax list) ------------------ */
  skillsIntro:
    "I don't stop at \"the API works.\" I own the product — from the data coming off the pack, through the services that make sense of it, to the website that puts the bike in someone's hands. Every area below is backed by something I've actually shipped.",

  skills: [
    {
      category: "Product Ownership: Concept to Customer",
      icon: "layers",
      claim: "Hand me the outcome, not the ticket. I take it from \"we should build this\" to a customer using it.",
      proof: "Proof: this site — hand-built, no framework, no build step, deployed and maintained by me.",
      items: [
        { name: "End-to-End Product Ownership",      level: 85 },
        { name: "Requirements → Shipped Feature",    level: 80 },
        { name: "Customer-Facing Web Products",      level: 80 },
        { name: "Hardware ↔ Software Coordination",  level: 74 },
        { name: "Technical Writing & Handover Docs", level: 75 },
      ],
    },
    {
      category: "Backend & API System Design",
      icon: "code",
      claim: "Schema to endpoint. I design the data model, build the service, and keep it running.",
      proof: "Proof: Smart Support Desk — ticket schema, routing service, REST layer, SQLite persistence.",
      items: [
        { name: "Python & FastAPI Services",               level: 85 },
        { name: "REST API Design & Contracts",             level: 82 },
        { name: "Relational Data Modelling (SQL)",         level: 78 },
        { name: "Java & Object-Oriented System Design",    level: 78 },
        { name: "Async & Event-Driven Backends",           level: 74 },
        { name: "Reliability, Error Handling & Debugging", level: 76 },
      ],
    },
    {
      category: "Real-Time Data & Telemetry Pipelines",
      icon: "cpu",
      claim: "Device data on a screen without lag — the hard part of any battery product.",
      proof: "Proof: Battery Health & Telemetry Dashboard — live 48V pack stream over WebSockets.",
      items: [
        { name: "WebSocket Streaming Architecture",      level: 80 },
        { name: "Data Pipeline & ETL Engineering",       level: 78 },
        { name: "Time-Series Ingestion & Storage",       level: 75 },
        { name: "Analytics & Data Visualisation",        level: 74 },
        { name: "Applied ML & LLM Integration",          level: 70 },
        { name: "Anomaly Detection & Signal Validation", level: 66 },
      ],
    },
    {
      category: "Battery Systems & E-Mobility Domain",
      icon: "zap",
      claim: "The domain layer: what the numbers coming off a pack actually mean, and why the product should care.",
      proof: "Proof: daily work at Zenfinity Energy on battery and e-bike products.",
      items: [
        { name: "BMS Data & Battery Telemetry",            level: 72 },
        { name: "E-Bike / EV Product Domain",              level: 70 },
        { name: "State-of-Charge & State-of-Health Logic", level: 68 },
        { name: "Embedded / Device Data Integration",      level: 68 },
        { name: "48V Pack Architecture Fundamentals",      level: 64 },
        { name: "Thermal & Safety Awareness",              level: 62 },
      ],
    },
  ],

  /* ---- How I ship (process = reads senior without claiming seniority) ---- */
  process: {
    heading: "How I Ship",
    subtext: "Same six steps whether it's a telemetry service or a product page.",
    closing: "I ask questions early rather than guess late. It's the cheapest thing I do.",
    steps: [
      { title: "Start at the constraint", text: "I start at the hardware and the person waiting on it, not the ticket. What does the pack actually do, and who's blocked?" },
      { title: "Model the data first",    text: "Schema before features. Get the data model wrong and everything downstream becomes a workaround." },
      { title: "Thin slice to running",   text: "Smallest path that actually runs end to end — API to screen — before I add anything to it." },
      { title: "Make it observable",      text: "Logs, health checks, and a view a non-engineer can read. If I can't see it, I can't own it." },
      { title: "Ship, then sit with it",  text: "Deploy and watch real data for a week. The bugs that matter don't show up in tests." },
      { title: "Write it down",           text: "README, setup steps, and why it's built this way. Handover shouldn't need me in the room." },
    ],
  },

  /* ---- Projects ---------------------------------------------------------- */
  /* `status`: Shipped | Building | Planned. Shipped projects carry a full     */
  /* case study (`study`) shown in an expandable "engineering notes" block.    */
  projects: [
    {
      title: "Battery Health & Telemetry Dashboard",
      blurb: "A FastAPI service that streams 48V pack telemetry — voltage, current, temperature, SoC and SoH — over WebSockets to a live dashboard.",
      tags: ["Python", "FastAPI", "WebSockets", "Telemetry", "Canvas"],
      accent: "primary",
      metric: "Real-time · BMS",
      status: "Shipped",
      liveUrl: "",
      codeUrl: "https://github.com/jayaprakash627/battery-health-dashboard",
      featured: true,
      study: {
        problem: "A battery pack is a black box until someone builds the window. Service and fleet teams need voltage, current, temperature, SoC and SoH as it happens — not in a CSV the next morning.",
        built: "A FastAPI service that streams 48V pack telemetry over WebSockets to a live dashboard, with live charts, per-cell voltages and threshold warnings.",
        decisions: "WebSockets over polling, so the reading on screen is the reading right now. The simulator sits behind the same interface a real BMS feed would use — swapping in hardware is a driver change, not a rewrite.",
        scope: "Telemetry is simulated. This is the software layer, deliberately built so a real pack can be plugged into it.",
        proves: "I can take device-shaped data all the way to a screen a technician can act on.",
      },
    },
    {
      title: "Smart Support Desk — AI Email Triage",
      blurb: "Reads incoming support email, classifies it by urgency and category, then creates and routes a ticket with a priority and an SLA.",
      tags: ["Python", "FastAPI", "SQLite", "NLP", "AI"],
      accent: "secondary",
      metric: "AI · Triage",
      status: "Shipped",
      liveUrl: "",
      codeUrl: "https://github.com/jayaprakash627/smart-support-desk",
      featured: true,
      study: {
        problem: "Support inboxes get triaged by whoever opens them first. An urgent battery-safety email sits behind a shipping question.",
        built: "A service that reads incoming email, classifies urgency and category, then creates and routes a ticket with priority and SLA — tracked in SQLite with a live queue dashboard.",
        decisions: "Rules first, AI optional. The deterministic classifier runs by default and Claude takes over when a key is present. It never breaks because a third party is down, and it costs nothing to run idle.",
        scope: "Built as a working product, not deployed publicly yet — code is on GitHub and it runs locally in one command.",
        proves: "I ship AI features the way production wants them: with a fallback and a cost ceiling.",
      },
    },
    {
      title: "Physique & Nutrition Coaching Toolkit",
      blurb: "A coaching tool that explains every number it gives you — macros from lean mass, a micronutrient panel, and the physiology behind each target with the standard it came from. Plus a private client onboarding flow behind real auth.",
      tags: ["Python", "FastAPI", "SQLite", "Auth & Security", "Canvas", "Sports Science"],
      accent: "tertiary",
      metric: "Coaching · Explains why",
      status: "Shipped",
      liveUrl: "https://physique-nutrition-toolkit.onrender.com",
      liveNote: "Hosted free — if it's been idle, the first load takes ~50s to wake up.",
      codeUrl: "https://github.com/jayaprakash627/physique-nutrition-toolkit",
      featured: true,
      study: {
        problem: "Most trainers say \"eat 180g protein\" and stop there. The client doesn't understand it, doesn't trust it, and quits by week three. I've competed in powerlifting and bodybuilding — people don't fail because the numbers were wrong, they fail because nobody explained them.",
        built: "A FastAPI service that computes calories, macros from lean body mass, fibre, water and a 15-nutrient micronutrient panel — and returns every number with the physiology behind it, what goes wrong at too little or too much, real Indian food portions to hit it, and the published standard it came from. Plus body-fat comparison across four methods, a contest-prep planner, 1RM tools, and client tracking with progress charts.",
        decisions: "The nutrition knowledge lives in its own package with zero dependencies on the app, so a dietitian can verify the content without reading application code. The report builder can't construct a target without an explanation and a source list attached — the \"teach, don't just calculate\" promise is enforced by the data structure, not by remembering. Charts are hand-rolled Canvas rather than a library: ~250 lines, DPR-aware, and they recolour on theme toggle.",
        scope: "Estimates, not measurements — BMR equations carry ~±10% error and the app says so, showing the spread between body-fat methods instead of hiding behind one number. Single-coach by design: one password, no roles, no multi-tenancy, and the failed-login counter is still per-process, so it runs on one worker until that moves out of memory. It refuses to plan for under-18s, pregnancy, body fat below essential levels, or unsafe timelines rather than quietly producing a harmful number.",
        security: "Then I went to deploy it and found the real problem: Coach mode held clients' health data behind no authentication at all — fine on a laptop, a breach on a domain. Added password auth with server-side sessions, a rate-limited login, and security headers. The design decision I'd defend in an interview is that it fails closed: with no password configured, client endpoints return 503 with setup instructions instead of running open, because a missing config must never mean an unlocked door. /api/health reports whether the lock is on so a deployment mistake is one curl away from being caught. Client onboarding uses unguessable single-use links, versioned consent, and a delete that really deletes.",
        rebuilt: "Then I gave v1 to friends who train, and they wouldn't use it. The front page asked for 20 inputs — including seven calliper sites — before showing a single number. I'd built it for a coach who already owns callipers, not for someone who wants to know what to eat. So I rebuilt the entry: five plain questions, then one number, one sentence, and one priority. The full report is still there behind a fold, and the depth per number never moved. The engine already supported the gentler path; I'd just never exposed it.",
        proves: "I can turn domain knowledge I actually hold into a product, be responsible about it — 33 cited standards, guardrails that block rather than warn, 240 tests — and then take \"nobody wants to use this\" as data and rebuild the part that was wrong instead of defending it.",
      },
    },
    {
      title: "E-Bike Fleet Telematics Platform",
      blurb: "Track every e-bike live — location, battery %, range and ride stats — through backend APIs and a dashboard that manages the whole fleet.",
      tags: ["Backend", "REST API", "GPS", "Analytics"],
      accent: "tertiary",
      metric: "EV · Telematics",
      status: "Building",
      liveUrl: "",
      codeUrl: "",
      featured: false,
    },
    {
      title: "Battery State-of-Health Prediction",
      blurb: "An ML model that predicts battery degradation and remaining useful life from charge/discharge cycles and ride data.",
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
      blurb: "The end-to-end product site: browse models, configure a build, and order an e-bike — carrying it from the website to the sale.",
      tags: ["Full-Stack", "Web", "SQL", "Commerce"],
      accent: "primary",
      metric: "Full-Stack · Commerce",
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

  /* ---- Beyond the code (sports) ------------------------------------------ */
  athletics: {
    heading: "Beyond the Code",
    subtext:
      "Competitive powerlifting and bodybuilding taught me what engineering rewards too — discipline, progressive overload, and showing up every single day.",
    achievements: [
      { sport: "Powerlifting",         title: "State-Level Gold",           detail: "1× Gold medal",              tier: "State",         icon: "trophy", accent: "primary"   },
      { sport: "Powerlifting",         title: "Inter-College Overall Gold", detail: "Overall champion",           tier: "Inter-College", icon: "medal",  accent: "secondary" },
      { sport: "Bodybuilding · TABBA", title: "State Gold — Junior",        detail: "1st place, Junior category", tier: "State",         icon: "trophy", accent: "tertiary"  },
      { sport: "Bodybuilding · TABBA", title: "District Silver",            detail: "2nd place",                  tier: "District",      icon: "medal",  accent: "primary"   },
    ],
  },

  /* ---- Where I'm going (shown at the top of Contact) --------------------- */
  direction: {
    lead: "I'm two years in and deliberately pointed at one thing: the software layer of energy and mobility. Batteries, telemetry, and the products built on top of them.",
    cards: [
      { label: "NOW", text: "SDE at Zenfinity Energy — owning backend, data pipelines and web for battery and e-bike products. Intern to full-time in three months.", accent: "primary" },
      { label: "LEARNING DELIBERATELY", text: "CAN bus and BMS protocols, battery degradation and remaining-useful-life modelling, time-series forecasting for State-of-Health. Named because I'm in the middle of them, not because I've finished.", accent: "secondary" },
      { label: "OPEN TO", text: "Conversations about battery and EV platforms, telemetry systems, and roles where one person owns the product end to end. Also happy to just talk shop about packs.", accent: "tertiary" },
    ],
  },

  /* ---- Contact & socials ------------------------------------------------- */
  contact: {
    heading: "Let's build what moves people",
    subtext:
      "Batteries, telemetry, e-mobility, or a product that needs one person to own it end to end — that's the conversation I want. Tell me what you're working on and what's in your way.",
    email: "jayaprakashmohanraj627@gmail.com",
    socials: [
      { name: "GitHub",   icon: "github",   url: "https://github.com/jayaprakash627", handle: "@jayaprakash627" },
      { name: "LinkedIn", icon: "linkedin", url: "https://linkedin.com/in/jaya-prakash-369139244", handle: "/in/jaya-prakash" },
      { name: "Email",    icon: "mail",     url: "mailto:jayaprakashmohanraj627@gmail.com", handle: "jayaprakashmohanraj627@gmail.com" },
    ],
  },
};

window.PORTFOLIO = PORTFOLIO;
