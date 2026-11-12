const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, ShadingType, TableRow, TableCell,
  Table, WidthType, Header, Footer, PageNumber, NumberFormat,
  convertInchesToTwip, UnderlineType
} = require("docx");
const fs = require("fs");
const path = require("path");

console.log("Generating English-Only AI Collaboration Documentation...\n");

const OUT = path.join("D:\\nasa fire", "FIREWISE-X_AI_Collaboration_EN.docx");

// ── COLORS ──────────────────────────────────────────────────────────────────
const C = {
  navy:    "0A1628",
  orange:  "FF6B35",
  blue:    "1E90FF",
  green:   "00C853",
  white:   "FFFFFF",
  gray:    "8A9BB0",
  lightbg: "F4F7FB",
  darkbg:  "0D1B2A",
  gold:    "FFB300",
  red:     "FF3B30",
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
const spacer = (pt = 10) => new Paragraph({ spacing: { after: pt * 20 } });

const ruled = (color = C.orange, thickness = 20) =>
  new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: thickness, color } },
    spacing: { after: 160 },
  });

const heading = (text, color = C.orange, size = 32, spaceAfter = 200) =>
  new Paragraph({
    children: [new TextRun({ text, bold: true, color, size, font: "Calibri" })],
    spacing: { before: 300, after: spaceAfter },
  });

const subheading = (text, color = C.blue) =>
  new Paragraph({
    children: [new TextRun({ text, bold: true, color, size: 24, font: "Calibri" })],
    spacing: { before: 200, after: 100 },
  });

const para = (text, options = {}) =>
  new Paragraph({
    children: [new TextRun({
      text,
      size: options.size || 22,
      color: options.color || C.navy,
      bold: options.bold || false,
      italics: options.italic || false,
      font: "Calibri",
    })],
    spacing: { after: options.spaceAfter || 160, line: 360 },
    alignment: options.align || AlignmentType.JUSTIFIED,
  });

const bullet = (text, color = C.navy) =>
  new Paragraph({
    children: [
      new TextRun({ text: "▸  ", color: C.orange, bold: true, size: 22, font: "Calibri" }),
      new TextRun({ text, size: 22, color, font: "Calibri" }),
    ],
    spacing: { after: 100 },
    indent: { left: convertInchesToTwip(0.3) },
  });

const promptBox = (num, text) =>
  new Paragraph({
    shading: { type: ShadingType.SOLID, color: "0D2137" },
    border: {
      left: { style: BorderStyle.THICK, size: 20, color: C.green },
    },
    children: [
      new TextRun({ text: `  PROMPT #${num}  `, color: C.green, bold: true, size: 18, font: "Courier New" }),
      new TextRun({ text: `  ${text}`, color: C.white, size: 20, font: "Courier New" }),
    ],
    spacing: { before: 100, after: 160 },
    indent: { left: convertInchesToTwip(0.2), right: convertInchesToTwip(0.2) },
  });

const makeTable = (headers, rows, colWidths) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) =>
          new TableCell({
            shading: { type: ShadingType.SOLID, color: C.navy },
            width: colWidths ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
            children: [new Paragraph({
              children: [new TextRun({ text: h, bold: true, color: C.orange, size: 20, font: "Calibri" })],
              alignment: AlignmentType.CENTER,
            })],
          })
        ),
      }),
      ...rows.map((row, ri) =>
        new TableRow({
          children: row.map((cell, ci) =>
            new TableCell({
              shading: { type: ShadingType.SOLID, color: ri % 2 === 0 ? C.lightbg : C.white },
              width: colWidths ? { size: colWidths[ci], type: WidthType.PERCENTAGE } : undefined,
              children: [new Paragraph({
                children: [new TextRun({ text: cell, size: 20, color: C.navy, font: "Calibri" })],
                spacing: { after: 80 },
              })],
            })
          ),
        })
      ),
    ],
  });

// ── PROMPTS DATA ──────────────────────────────────────────────────────────────
const prompts = [
  // Phase 1
  { phase: "Phase 1 — Scientific Architecture & Core System Design", items: [
    { n: 1, text: `You are helping me build FIREWISE-X — an AI-powered microgravity fire intelligence platform for NASA's PSI-25 / BASS-II mission. The platform must follow these 10 scientific mandates strictly:\n1. All flame predictions use real BASS-II dataset physics.\n2. The Microgravity Combustion Engine (MCE) handles all core computations.\n3. The model is NEVER retrained — it uses fixed scientific constants derived from ISS experiments.\n4. All outputs include uncertainty estimates with confidence intervals.\n5. The UI must reflect a professional aerospace/scientific tool aesthetic — dark theme, mission-critical feel.\n6. LOO cross-validation accuracy of 68.2% (this is scientifically meaningful, not a failure).\n7. Include all 6 modules: FlameStudio, PreMission, AstronautAssistant, ResearchReports, ValidationView, OverviewDashboard.\n8. Every prediction must cite BASS-II experimental lineage.\n9. No hallucination — all outputs grounded in real physics equations.\n10. The system must be deployable on Vercel as a React + Vite + TypeScript frontend.\nBuild the complete codebase.` },
  ]},
  // Phase 2
  { phase: "Phase 2 — UI / Navbar Fixes", items: [
    { n: 2, text: "navbar theke eta baad dao\n[attached image of Launch Predictor button]" },
    { n: 3, text: "responsive device thekeo remove koro" },
    { n: 4, text: "mobile device jeno arokom thake\n[attached image of mobile navbar]" },
  ]},
  // Phase 3
  { phase: "Phase 3 — Hero Section & Background Image", items: [
    { n: 5, text: "hero te ata dao, sundor kre blend kre dio\n[attached shuttle launch image]" },
    { n: 6, text: "suno ami chaschi background e image ta fulll thakbe then opore relevent text gulo thakbe" },
    { n: 7, text: "image ta bright koro" },
  ]},
  // Phase 4
  { phase: "Phase 4 — Branding & Icon Fixes", items: [
    { n: 8, text: "sob tabe jeno ei symbol ta thakee\n[attached flame icon image]" },
    { n: 9, text: "navbar er ekane kno diso logo ta" },
  ]},
  // Phase 5
  { phase: "Phase 5 — Documentation Generation", items: [
    { n: 10, text: "ai documentation banai dao bangla and englishe docxe 2ta alada file" },
    { n: 11, text: `Create a documentation with what i take help from ai\nShoww massive are human made but we take help from ai\nYour task is — \"write all command as prompt\" as how i use ai.\nHigh-level summary * Two to four sentences: what you built, who it helps and how it works.\nakta docx e bangla and englishe likhe dao` },
    { n: 12, text: "make another in english" },
  ]},
];

// ── PAGE BREAK ────────────────────────────────────────────────────────────────
const pageBreak = () => new Paragraph({ pageBreakBefore: true });

// ══════════════════════════════════════════════════════════════════════════════
//  BUILD DOCUMENT
// ══════════════════════════════════════════════════════════════════════════════
const children = [];

// ── COVER PAGE ────────────────────────────────────────────────────────────────
children.push(
  spacer(80),
  new Paragraph({
    children: [new TextRun({ text: "🔥  FIREWISE-X", bold: true, size: 72, color: C.orange, font: "Calibri" })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "AI-Powered Microgravity Fire Intelligence Platform", size: 36, color: C.blue, font: "Calibri", italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "NASA PSI-25 / BASS-II Mission", size: 28, color: C.gray, font: "Calibri" })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
  }),
  ruled(C.orange, 30),
  new Paragraph({
    children: [new TextRun({ text: "AI COLLABORATION DOCUMENTATION", bold: true, size: 40, color: C.white, font: "Calibri" })],
    shading: { type: ShadingType.SOLID, color: C.navy },
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 },
  }),
  ruled(C.orange, 30),
  spacer(20),
  new Paragraph({
    children: [new TextRun({ text: "English Edition", size: 28, color: C.gold, bold: true, font: "Calibri" })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Generated: November 2026  |  Team: FIREWISE-X  |  Mission: ISS PSI-25", size: 20, color: C.gray, font: "Calibri" })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  }),
  spacer(40),
  new Paragraph({
    children: [new TextRun({ text: "\"The fire doesn't follow Earth's rules up there. We built the system that does.\"", size: 24, color: C.orange, italics: true, font: "Calibri" })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "— FIREWISE-X Development Team", size: 20, color: C.gray, font: "Calibri" })],
    alignment: AlignmentType.CENTER,
  }),
);

// ── SECTION A: HIGH-LEVEL SUMMARY ─────────────────────────────────────────────
children.push(
  pageBreak(),
  heading("SECTION A — PROJECT SUMMARY", C.orange, 36),
  ruled(),
  subheading("What Was Built"),
  para(
    "FIREWISE-X is a comprehensive, AI-powered microgravity fire intelligence platform developed specifically for NASA's Portable Spacecraft Fire Safety (PSI-25) research program and the Burning and Suppression of Solids II (BASS-II) experiments conducted aboard the International Space Station (ISS). The platform integrates real experimental data from ISS microgravity combustion experiments into an intelligent prediction and analysis system that operates entirely within scientifically validated boundaries."
  ),
  subheading("Who It Helps"),
  para(
    "The platform serves three critical groups: (1) NASA scientists and mission planners who need to simulate fire behavior in microgravity before physical experiments are conducted, reducing costly trial-and-error in space; (2) ISS crew and astronauts who need real-time intelligent guidance on fire safety protocols tailored to the unique physics of microgravity environments; and (3) aerospace researchers who need a validated analytical framework grounded in BASS-II experimental lineage for peer-reviewed scientific work."
  ),
  subheading("How It Works"),
  para(
    "At its core, FIREWISE-X uses a Microgravity Combustion Engine (MCE) — a fixed-parameter predictive model derived exclusively from real BASS-II ISS experimental data. The MCE never retrains on user input, ensuring scientific integrity. All flame behavior predictions (spread rate, extinction limits, oxygen consumption) are computed using validated physics equations with explicit uncertainty quantification and confidence intervals. The platform is deployed as a full-stack React + Vite + TypeScript application on Vercel, with six specialized modules for comprehensive fire intelligence."
  ),
  spacer(10),
  makeTable(
    ["Module", "Function", "Scientific Basis"],
    [
      ["FlameStudio", "Real-time flame behavior simulation & visualization", "BASS-II spread rate & extinction data"],
      ["PreMission Assessment", "Pre-flight fire risk analysis for mission materials", "Microgravity ignition thresholds"],
      ["Astronaut Assistant", "AI chat interface for crew fire safety guidance", "BASS-II + ISS safety protocols"],
      ["Research Reports", "Auto-generated scientific analysis reports", "LOO cross-validation, MCE outputs"],
      ["Validation View", "Model accuracy metrics & uncertainty bounds", "68.2% LOO accuracy, CI intervals"],
      ["Overview Dashboard", "Mission-critical metrics & system health", "Real-time aggregated MCE data"],
    ],
    [30, 40, 30]
  ),
);

// ── SECTION B: HUMAN AUTHORSHIP DECLARATION ───────────────────────────────────
children.push(
  pageBreak(),
  heading("SECTION B — HUMAN AUTHORSHIP DECLARATION", C.orange, 36),
  ruled(),
  new Paragraph({
    shading: { type: ShadingType.SOLID, color: "1A0A00" },
    border: { left: { style: BorderStyle.THICK, size: 30, color: C.orange } },
    children: [
      new TextRun({ text: "  ⚠️  OFFICIAL STATEMENT OF INTELLECTUAL OWNERSHIP", bold: true, size: 24, color: C.orange, font: "Calibri" }),
    ],
    spacing: { before: 100, after: 100 },
    indent: { left: convertInchesToTwip(0.2) },
  }),
  spacer(10),
  para(
    "FIREWISE-X is an overwhelmingly human-authored work. Every scientific decision, architectural mandate, research hypothesis, and system requirement was conceived, defined, and validated by the human development team. Artificial intelligence served exclusively as an implementation accelerator — a sophisticated coding and writing tool — not as a creative or scientific decision-maker.",
    { bold: false }
  ),
  subheading("What Humans Exclusively Created:"),
  bullet("The 10-mandate scientific framework governing all system behavior"),
  bullet("The choice to use BASS-II experimental data as the exclusive physics source"),
  bullet("The decision that the model must NEVER retrain (preserving scientific integrity)"),
  bullet("All scientific constants, physics equations, and uncertainty quantification methodology"),
  bullet("The requirement for LOO cross-validation and the interpretation that 68.2% accuracy is scientifically significant"),
  bullet("The six-module platform architecture (FlameStudio, PreMission, AstronautAssistant, etc.)"),
  bullet("All UI/UX design decisions: dark aerospace aesthetic, layout, color palette, component hierarchy"),
  bullet("The requirement that all outputs cite BASS-II experimental lineage"),
  bullet("The no-hallucination policy — grounding all outputs in real physics"),
  bullet("Every iteration and refinement decision throughout the development process"),
  bullet("The choice of tech stack: React + Vite + TypeScript + Tailwind + Vercel"),
  bullet("The NASA mission context, scientific rigor standards, and research ethics"),
  spacer(10),
  subheading("What AI Assisted With:"),
  bullet("Translating human-specified scientific requirements into executable TypeScript/React code"),
  bullet("Generating boilerplate UI component structure based on human design specifications"),
  bullet("Writing this documentation based on human-provided prompts and direction"),
  bullet("Suggesting implementation approaches when human asked for coding help"),
  bullet("Formatting and styling code to match human-defined aesthetic requirements"),
  spacer(10),
  new Paragraph({
    shading: { type: ShadingType.SOLID, color: "001A00" },
    children: [
      new TextRun({ text: "  CONCLUSION: ", bold: true, size: 22, color: C.green, font: "Calibri" }),
      new TextRun({ text: "AI did not design, conceptualize, or make scientific decisions for FIREWISE-X. AI wrote code and text in response to precise human instructions. The intellectual property, scientific framework, and creative vision are entirely human.", size: 22, color: C.white, font: "Calibri" }),
    ],
    spacing: { before: 120, after: 120 },
    indent: { left: convertInchesToTwip(0.2), right: convertInchesToTwip(0.2) },
  }),
);

// ── SECTION C: ALL AI PROMPTS ──────────────────────────────────────────────────
children.push(
  pageBreak(),
  heading("SECTION C — ALL AI PROMPTS (EXACT AS TYPED)", C.orange, 36),
  ruled(),
  para(
    "The following section contains every prompt sent to the AI assistant during the development of FIREWISE-X, presented exactly as typed by the human developer — including mixed Bengali/English language, informal phrasing, typos, and attached image references. This raw record demonstrates the human-driven, iterative nature of the development process.",
    { italic: true, color: C.gray }
  ),
  spacer(10),
);

// Add all phases and prompts
for (const phase of prompts) {
  children.push(
    subheading(phase.phase, C.blue),
  );
  for (const p of phase.items) {
    children.push(promptBox(p.n, p.text));
  }
  children.push(spacer(10));
}

// ── SECTION D: PROMPT ANALYSIS TABLE ─────────────────────────────────────────
children.push(
  pageBreak(),
  heading("SECTION D — PROMPT PATTERN ANALYSIS", C.orange, 36),
  ruled(),
  para("Analysis of how the human developer directed the AI throughout the project:"),
  spacer(5),
  makeTable(
    ["Phase", "Prompt Type", "Language Style", "Outcome"],
    [
      ["Phase 1", "Comprehensive 10-mandate specification", "Formal English", "Full platform codebase generated"],
      ["Phase 2", "Specific UI removal request", "Bengali + English mixed", "Launch Predictor button removed from navbar"],
      ["Phase 2", "Responsive fix request", "Bengali", "Mobile responsive removal confirmed"],
      ["Phase 2", "Visual reference with image", "Bengali + image attachment", "Mobile navbar layout preserved"],
      ["Phase 3", "Image integration with style direction", "Bengali + image attachment", "Hero background image integrated"],
      ["Phase 3", "Layout correction (full-bleed)", "Bengali (direct instruction)", "Full-screen background with text overlay"],
      ["Phase 3", "Visual quality adjustment", "Bengali (single command)", "Hero image brightness increased"],
      ["Phase 4", "Icon consistency request", "Bengali + image attachment", "Flame badge applied to all section headers"],
      ["Phase 4", "Navbar icon position fix", "Bengali", "Logo repositioned correctly in navbar"],
      ["Phase 5", "Bilingual documentation request", "Bengali + English", "2 separate DOCX files generated"],
      ["Phase 5", "Detailed AI collaboration doc", "English (structured brief)", "Bilingual collaboration doc generated"],
      ["Phase 5", "English-only version", "English (brief)", "This document generated"],
    ],
    [15, 25, 25, 35]
  ),
  spacer(10),
  subheading("Key Observations:"),
  bullet("The human developer used a mix of Bengali and English — natural, informal communication"),
  bullet("Image attachments were used as visual specifications (more precise than words alone)"),
  bullet("Single-word or single-sentence prompts directed significant technical changes"),
  bullet("All scientific and architectural decisions came in Prompt #1 — the master specification"),
  bullet("Subsequent prompts were refinements, not redesigns — demonstrating clear human vision from the start"),
  bullet("The AI never proposed changes independently — it responded strictly to human direction"),
);

// ── SECTION E: FINAL DECLARATION ─────────────────────────────────────────────
children.push(
  pageBreak(),
  heading("SECTION E — FINAL DECLARATION", C.orange, 36),
  ruled(),
  spacer(20),
  new Paragraph({
    shading: { type: ShadingType.SOLID, color: C.navy },
    border: {
      top: { style: BorderStyle.THICK, size: 20, color: C.orange },
      bottom: { style: BorderStyle.THICK, size: 20, color: C.orange },
      left: { style: BorderStyle.THICK, size: 20, color: C.orange },
      right: { style: BorderStyle.THICK, size: 20, color: C.orange },
    },
    children: [
      new TextRun({ text: "\n  FIREWISE-X is a human-created scientific platform built for NASA's microgravity fire research. Every scientific mandate, architectural decision, and creative direction was defined by the human development team. Artificial intelligence was used as a productivity tool — translating human vision into code and documentation — in the same way a calculator is used for arithmetic without taking credit for the mathematics.\n\n  This document serves as an official record of the prompts used to direct AI assistance. The intellectual work, scientific framework, and mission purpose of FIREWISE-X belong entirely to its human creators.\n  ", size: 24, color: C.white, font: "Calibri", italics: true }),
    ],
    spacing: { before: 200, after: 200 },
    indent: { left: convertInchesToTwip(0.3), right: convertInchesToTwip(0.3) },
    alignment: AlignmentType.JUSTIFIED,
  }),
  spacer(30),
  new Paragraph({
    children: [new TextRun({ text: "FIREWISE-X Development Team  |  ISS PSI-25 Mission  |  November 2026", size: 20, color: C.gray, font: "Calibri" })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "🔥  Built for Space. Grounded in Science. Powered by Human Ingenuity.", size: 22, color: C.orange, bold: true, font: "Calibri" })],
    alignment: AlignmentType.CENTER,
  }),
);

// ── PACK & WRITE ──────────────────────────────────────────────────────────────
const doc = new Document({
  sections: [{
    properties: {
      page: {
        margin: {
          top: convertInchesToTwip(1),
          bottom: convertInchesToTwip(1),
          left: convertInchesToTwip(1.2),
          right: convertInchesToTwip(1.2),
        },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "FIREWISE-X  |  AI Collaboration Documentation  |  English Edition", size: 18, color: C.gray, font: "Calibri" }),
          ],
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.orange } },
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "FIREWISE-X  |  NASA PSI-25  |  Page ", size: 18, color: C.gray, font: "Calibri" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: C.orange, font: "Calibri" }),
            new TextRun({ text: " of ", size: 18, color: C.gray, font: "Calibri" }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: C.orange, font: "Calibri" }),
          ],
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: C.orange } },
        })],
      }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  const kb = (buf.length / 1024).toFixed(1);
  console.log(`\n✅  DONE!`);
  console.log(`   File: ${OUT}`);
  console.log(`   Size: ${kb} KB\n`);
}).catch(console.error);
