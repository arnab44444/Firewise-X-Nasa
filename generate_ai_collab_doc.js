const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, BorderStyle, WidthType, AlignmentType, ShadingType,
  PageNumber, Header, Footer, PageBreak
} = require('docx');
const fs = require('fs');
const path = require('path');

console.log('Generating AI Collaboration Documentation (Bilingual)...');

const C = {
  navy:    '0F172A',
  cyan:    '0284C7',
  orange:  'EA580C',
  green:   '16A34A',
  purple:  '7C3AED',
  text:    '1E293B',
  muted:   '64748B',
  bg:      'F8FAFC',
  border:  'CBD5E1',
  cyanBg:  'EFF6FF',
  orangeBg:'FFF7ED',
  greenBg: 'F0FDF4',
  purpleBg:'F5F3FF',
  white:   'FFFFFF',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function run(text, opts = {}) {
  return new TextRun({
    text,
    font: 'Calibri',
    size: opts.size || 22,
    bold: opts.bold || false,
    italic: opts.italic || false,
    color: opts.color || C.text,
    highlight: opts.highlight || undefined,
  });
}

function para(texts, opts = {}) {
  const runs = typeof texts === 'string'
    ? [run(texts, opts)]
    : texts;
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { before: opts.before || 0, after: opts.after || 140, line: opts.line || 280 },
    children: runs,
  });
}

function h1(text, color = C.navy) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 160 },
    children: [new TextRun({ text, font: 'Calibri', size: 36, bold: true, color })],
  });
}

function h2(text, color = C.cyan) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 120 },
    children: [new TextRun({ text, font: 'Calibri', size: 28, bold: true, color })],
  });
}

function h3(text, color = C.orange) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, font: 'Calibri', size: 24, bold: true, color })],
  });
}

function divider() {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text: '━'.repeat(70), font: 'Calibri', size: 16, color: C.border })],
  });
}

function sp(n = 1) {
  return new Paragraph({ children: [new TextRun({ text: '\n'.repeat(n) })], spacing: { after: n * 80 } });
}

function callout(title, body, colorKey = 'cyan') {
  const palette = {
    cyan:   { border: C.cyan,   bg: C.cyanBg   },
    orange: { border: C.orange, bg: C.orangeBg  },
    green:  { border: C.green,  bg: C.greenBg   },
    purple: { border: C.purple, bg: C.purpleBg  },
  };
  const p = palette[colorKey] || palette.cyan;

  const bodyLines = body.split('\n').map((line, i) =>
    new Paragraph({
      spacing: { after: i === body.split('\n').length - 1 ? 0 : 60 },
      children: [new TextRun({ text: line, font: 'Calibri', size: 20, color: C.text })],
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({
      children: [new TableCell({
        shading: { fill: p.bg, type: ShadingType.CLEAR },
        borders: {
          top:    { style: BorderStyle.NONE },
          right:  { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left:   { style: BorderStyle.SINGLE, size: 32, color: p.border },
        },
        margins: { top: 160, bottom: 160, left: 220, right: 200 },
        children: [
          new Paragraph({
            spacing: { after: 80 },
            children: [new TextRun({ text: title, font: 'Calibri', size: 22, bold: true, color: p.border })],
          }),
          ...bodyLines,
        ],
      })],
    })],
  });
}

function promptBox(promptNumber, promptText) {
  const header = new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: `  PROMPT #${promptNumber}`, font: 'Consolas', size: 20, bold: true, color: C.white }),
    ],
  });
  const bodyLines = promptText.split('\n').map((line, i, arr) =>
    new Paragraph({
      spacing: { after: i === arr.length - 1 ? 0 : 40 },
      children: [new TextRun({ text: `  ${line}`, font: 'Consolas', size: 19, color: 'D1FAE5' })],
    })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [new TableCell({
          shading: { fill: '064E3B', type: ShadingType.CLEAR },
          borders: {
            top:    { style: BorderStyle.SINGLE, size: 2, color: C.green },
            right:  { style: BorderStyle.SINGLE, size: 2, color: C.green },
            bottom: { style: BorderStyle.SINGLE, size: 2, color: C.green },
            left:   { style: BorderStyle.SINGLE, size: 10, color: '34D399' },
          },
          margins: { top: 120, bottom: 120, left: 160, right: 160 },
          children: [header, ...bodyLines],
        })],
      }),
    ],
  });
}

function styledTable(headers, rows, colWidths = [], headerColor = C.navy) {
  const headerCells = headers.map((h, i) => new TableCell({
    width: colWidths[i] ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
    shading: { fill: headerColor, type: ShadingType.CLEAR },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    children: [new Paragraph({
      children: [new TextRun({ text: h, font: 'Calibri', size: 20, bold: true, color: C.white })],
    })],
  }));

  const dataRows = rows.map((row, ri) => {
    const isEven = ri % 2 === 0;
    return new TableRow({
      children: row.map((cell, ci) => new TableCell({
        width: colWidths[ci] ? { size: colWidths[ci], type: WidthType.PERCENTAGE } : undefined,
        shading: { fill: isEven ? C.white : C.bg, type: ShadingType.CLEAR },
        borders: {
          top:    { style: BorderStyle.SINGLE, size: 4, color: C.border },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: C.border },
          left:   { style: BorderStyle.SINGLE, size: 4, color: C.border },
          right:  { style: BorderStyle.SINGLE, size: 4, color: C.border },
        },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [new Paragraph({
          children: [new TextRun({ text: cell, font: 'Calibri', size: 19, color: C.text })],
        })],
      })),
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells, tableHeader: true }), ...dataRows],
  });
}

// ─── DOCUMENT CONTENT ───────────────────────────────────────────────────────

const children = [];

// ══════════════════════════════════════════════════════════════════════════════
//  COVER PAGE
// ══════════════════════════════════════════════════════════════════════════════

children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 600, after: 180 },
    children: [new TextRun({ text: 'FIREWISE-X', font: 'Calibri', size: 64, bold: true, color: C.navy })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: 'AI Collaboration & Human Authorship Declaration', font: 'Calibri', size: 30, bold: true, color: C.cyan })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: 'এআই সহযোগিতা ও মানব-নির্মাণের ঘোষণাপত্র', font: 'Calibri', size: 26, bold: true, color: C.orange })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({ text: 'Bilingual Documentation  ·  English & বাংলা  ·  November 2026', font: 'Calibri', size: 20, italic: true, color: C.muted })],
  }),
  divider(),
  sp(1),

  callout(
    '📌 Core Declaration / মূল ঘোষণা',
    'This project is MASSIVELY human-made. Every architecture decision, scientific grounding choice, UI layout, data pipeline, and safety constraint was conceived, directed, and refined by the human developer.\n\n' +
    'AI (Antigravity / Gemini) served strictly as a tool — like a compiler or a search engine — executing prompts, generating code scaffolding, and formatting documents. The creative vision, scientific judgment, and all final decisions belong 100% to the human.\n\n' +
    'এই প্রকল্পটি সম্পূর্ণরূপে মানব-নির্মিত। প্রতিটি আর্কিটেকচার সিদ্ধান্ত, বৈজ্ঞানিক ভিত্তি নির্ধারণ, UI লেআউট, ডেটা পাইপলাইন এবং নিরাপত্তা সীমাবদ্ধতা মানব ডেভেলপার দ্বারা পরিকল্পিত ও পরিচালিত। এআই কেবল একটি টুল হিসেবে ব্যবহৃত হয়েছে।',
    'green'
  ),
  sp(2),
);

// ══════════════════════════════════════════════════════════════════════════════
//  SECTION A — HIGH-LEVEL SUMMARY (English)
// ══════════════════════════════════════════════════════════════════════════════

children.push(
  h1('A.  HIGH-LEVEL SUMMARY', C.navy),
  divider(),

  h2('What We Built'),
  para(
    'FIREWISE-X is a full-stack, AI-grounded microgravity fire intelligence platform that transforms 129 real NASA ISS flight experiment records (BASS-II, NASA/TM-20210011385) into an interactive, defensible decision-support system for spacecraft fire safety. ' +
    'Unlike black-box generative AI tools that hallucinate answers, every output is physically anchored to a measured flight trial — with page-level citations, empirical nearest-neighbor lookup, and mandatory refusal when data is absent.',
    { after: 160 }
  ),

  h2('Who It Helps'),
  para(
    'FIREWISE-X serves four audiences simultaneously: (1) NASA payload safety engineers planning pre-mission combustion envelopes; (2) ISS crew astronauts needing instant, cited cabin fire guidance; ' +
    '(3) combustion scientists extracting kinematic metrics from archival microgravity video; and (4) mission reviewers demanding defensible, reproducible evidence rather than neural network confidence scores.',
    { after: 160 }
  ),

  h2('How It Works — Four Core Engines'),
  styledTable(
    ['Engine', 'Mechanism', 'Output'],
    [
      ['Empirical Lookup',      '129-run normalized Manhattan distance matching across thickness, O₂ %, and airflow velocity', 'Closest historical runs + out-of-envelope warnings'],
      ['Computer Vision HUD',   'Dual-space HSV + chemiluminescence segmentation; burned-in text mask; morphological filtering', 'Flame area timeline, spread rate, centroid per video frame'],
      ['Grounded RAG Assistant','Fact-table extracted from NASA/TM-20210011385; mandatory page citation; audited refusal logic', 'Cited answers or explicit "no data" refusal'],
      ['Blueprint PDF Engine',  '9-section ReportLab template populated with real run data', 'Printable publication-grade mission report'],
    ],
    [20, 50, 30]
  ),
  sp(2),
);

// ══════════════════════════════════════════════════════════════════════════════
//  SECTION B — HIGH-LEVEL SUMMARY (বাংলা)
// ══════════════════════════════════════════════════════════════════════════════

children.push(
  h1('B.  উচ্চ-স্তরের সারসংক্ষেপ (High-Level Summary — বাংলায়)', C.navy),
  divider(),

  h2('কী তৈরি করা হয়েছে', C.cyan),
  para(
    'FIREWISE-X একটি সম্পূর্ণ ফুল-স্ট্যাক, এআই-নোঙ্গর করা মাইক্রোগ্র্যাভিটি অগ্নি বুদ্ধিমত্তা প্ল্যাটফর্ম, যা নাসার আন্তর্জাতিক মহাকাশ স্টেশনে পরিচালিত ১২৯টি বাস্তব ফ্লাইট পরীক্ষার রেকর্ড (BASS-II, NASA/TM-20210011385) থেকে মহাকাশযানের অগ্নি নিরাপত্তার জন্য একটি ইন্টারেক্টিভ, প্রতিরক্ষাযোগ্য সিদ্ধান্ত-সহায়তা ব্যবস্থায় রূপান্তরিত করে। ' +
    'ব্ল্যাক-বক্স জেনারেটিভ এআই টুলের বিপরীতে, প্রতিটি আউটপুট বাস্তব পরীক্ষার ডেটার সাথে সংযুক্ত — পৃষ্ঠা-স্তরের উদ্ধৃতি, এম্পিরিক্যাল লুকআপ এবং ডেটা না থাকলে বাধ্যতামূলক অস্বীকৃতিসহ।',
    { after: 160 }
  ),

  h2('কাদের সাহায্য করে', C.cyan),
  para(
    'FIREWISE-X একসাথে চারটি দলের সেবা করে: (১) নাসার পেলোড সেফটি ইঞ্জিনিয়ার যারা মিশনের আগে দহন সীমানা পরিকল্পনা করেন; (২) মহাকাশ স্টেশনের নভোচারী ক্রু যাদের তাৎক্ষণিক ও উদ্ধৃতিযুক্ত কেবিন অগ্নি নির্দেশনা দরকার; ' +
    '(৩) দহন বিজ্ঞানীরা যারা মাইক্রোগ্র্যাভিটি ভিডিও থেকে গতিবিদ্যার ডেটা বের করতে চান; এবং (৪) মিশন পর্যালোচকরা যারা নিউরাল নেটওয়ার্কের অস্পষ্ট স্কোরের পরিবর্তে প্রমাণযোগ্য বাস্তব ডেটা চান।',
    { after: 200 }
  ),
  sp(2),
);

// ══════════════════════════════════════════════════════════════════════════════
//  SECTION C — HUMAN AUTHORSHIP DECLARATION
// ══════════════════════════════════════════════════════════════════════════════

children.push(
  h1('C.  HUMAN AUTHORSHIP — What the Developer Decided Alone', C.navy),
  divider(),

  callout(
    '🧠 The Human Made ALL of These Decisions:',
    '• Chose NASA BASS-II as the sole scientific grounding dataset — rejected generative fabrication\n' +
    '• Defined the 10 defensibility mandates (lookup over prediction, citations, refusals, IoU validation…)\n' +
    '• Decided the UI architecture: 6 modules, hamburger nav, full-bleed hero image, responsive layout\n' +
    '• Set the strict "no hallucination" policy — banned buzzwords like "92.5%", "Zero Hallucination", "Trained"\n' +
    '• Chose the pagination (10 per page), the Evidence Card 7-factor structure, and the 9-section PDF blueprint\n' +
    '• Directed the visual identity: deep navy background, cyan accent, orange flame brand, ISS PSI-25 badge\n' +
    '• Specified the flame physics: dual extinction boundaries, HUD text masking, ±1f/±5f frame stepping\n' +
    '• Reviewed every AI-generated output and approved, revised, or rejected it\n' +
    '• Decided when to push to GitHub and what to deploy to Vercel',
    'green'
  ),
  sp(1),
  callout(
    '🤖 AI (Antigravity Agent) Was Used ONLY for:',
    '• Writing React/TypeScript component code from detailed human prompts\n' +
    '• Generating Python FastAPI backend routes from human-specified API contracts\n' +
    '• Creating static JSON fallback data files from the NASA dataset\n' +
    '• Formatting and styling Tailwind CSS classes as instructed\n' +
    '• Producing this documentation from human-written bullet points\n' +
    '• Running terminal commands (git, npm build, file copies) on behalf of the developer\n' +
    '• Suggesting alternatives when asked — final choice always made by the human',
    'cyan'
  ),
  sp(2),
);

// ══════════════════════════════════════════════════════════════════════════════
//  SECTION D — মানব রচনার ঘোষণা (বাংলায়)
// ══════════════════════════════════════════════════════════════════════════════

children.push(
  h1('D.  মানব রচনার ঘোষণা — ডেভেলপার একাই যা সিদ্ধান্ত নিয়েছেন', C.navy),
  divider(),

  callout(
    '🧠 মানব ডেভেলপার নিজে এই সমস্ত সিদ্ধান্ত নিয়েছেন:',
    '• নাসার বিএএসএস-২ ডেটাসেটকে একমাত্র বৈজ্ঞানিক ভিত্তি হিসেবে বেছে নেওয়া — জেনারেটিভ কল্পনাকে বাদ দেওয়া\n' +
    '• ১০টি ডিফেন্সেবিলিটি নীতি নির্ধারণ করা (অনুমানের বদলে লুকআপ, উদ্ধৃতি, অস্বীকৃতি, IoU ভ্যালিডেশন…)\n' +
    '• UI আর্কিটেকচার: ৬টি মডিউল, হ্যামবার্গার নেভিগেশন, ফুল-ব্লিড হিরো ইমেজ, রেসপনসিভ লেআউট\n' +
    '• কঠোর "কোনো হ্যালুসিনেশন নেই" নীতি — "৯২.৫%", "জিরো হ্যালুসিনেশন"-এর মতো শব্দ নিষিদ্ধ করা\n' +
    '• পেজিনেশন (প্রতি পৃষ্ঠায় ১০টি), এভিডেন্স কার্ডের ৭-দফা কাঠামো ও ৯-অংশের পিডিএফ ব্লুপ্রিন্ট নির্ধারণ\n' +
    '• ভিজ্যুয়াল পরিচয়: গভীর নৌ-নীল ব্যাকগ্রাউন্ড, সায়ান অ্যাকসেন্ট, অরেঞ্জ ফ্লেম ব্র্যান্ড, ISS PSI-25 ব্যাজ\n' +
    '• শিখার পদার্থবিদ্যা: দ্বৈত নির্বাপণ সীমানা, HUD টেক্সট মাস্কিং, ±১/±৫ ফ্রেম স্টেপিং নির্ধারণ\n' +
    '• এআই-উৎপন্ন প্রতিটি আউটপুট পর্যালোচনা করা এবং অনুমোদন, সংশোধন বা প্রত্যাখ্যান করা\n' +
    '• গিটহাবে কখন পুশ করবেন ও ভার্সেলে কী ডিপ্লয় করবেন তা সিদ্ধান্ত নেওয়া',
    'green'
  ),
  sp(1),
  callout(
    '🤖 এআই (Antigravity Agent) শুধুমাত্র এই কাজগুলোতে সহায়তা করেছে:',
    '• মানবের বিস্তারিত প্রম্পট থেকে React/TypeScript কম্পোনেন্ট কোড লেখা\n' +
    '• মানব-নির্ধারিত API চুক্তি থেকে Python FastAPI ব্যাকএন্ড রুট তৈরি করা\n' +
    '• নাসার ডেটাসেট থেকে স্ট্যাটিক JSON ফলব্যাক ফাইল তৈরি করা\n' +
    '• নির্দেশনা অনুযায়ী Tailwind CSS ক্লাস ফরম্যাট ও স্টাইল করা\n' +
    '• মানব-লেখা বুলেট পয়েন্ট থেকে এই ডকুমেন্টেশন তৈরি করা\n' +
    '• ডেভেলপারের পক্ষে টার্মিনাল কমান্ড চালানো (git, npm build, ফাইল কপি)\n' +
    '• জিজ্ঞাসা করলে বিকল্প পরামর্শ দেওয়া — চূড়ান্ত সিদ্ধান্ত সবসময় মানব নিয়েছেন',
    'cyan'
  ),
  sp(2),
);

// ══════════════════════════════════════════════════════════════════════════════
//  SECTION E — ALL AI PROMPTS USED (English + বাংলা context)
// ══════════════════════════════════════════════════════════════════════════════

children.push(
  h1('E.  ALL AI PROMPTS — Exactly What Was Typed / প্রম্পট লগ', C.navy),
  divider(),
  para(
    'Every prompt below was written by the human developer and sent to the Antigravity AI agent. ' +
    'These are the exact instructions — the agent merely executed them. ' +
    'নিচের প্রতিটি প্রম্পট মানব ডেভেলপার নিজে লিখেছেন এবং Antigravity এআই-তে পাঠিয়েছেন।',
    { after: 200 }
  ),
);

// ── Phase 1: Initial Architecture & 10 Mandates ──────────────────────────────
children.push(
  h2('Phase 1 — Scientific Foundation & 10 Defensibility Mandates', C.purple),
  h3('পর্যায় ১ — বৈজ্ঞানিক ভিত্তি ও ১০ নীতি নির্ধারণ', C.orange),
);

const phase1Prompts = [
  {
    n: 1,
    text:
`Must implement (these make the teammate's idea defensible)

1. Pre-Mission Assessment, real version. Replace the fake "AI prediction" 
   with a lookup that finds the closest real BASS-II runs to the user's 
   thickness, oxygen and airflow. Show what those runs measured, and show 
   a warning when the inputs fall outside the tested range. Make Scenarios 
   A, B and C use the same lookup. Done when moving a slider changes the 
   matched runs, and extreme inputs trigger the warning.

2. Astronaut Assistant, grounded and able to refuse. Build a small set of 
   cited facts from your own data (for example B1 stayed at 22.2% O2, M5 
   dropped 22.2% to 19.0% and went above 500 ppm). Match each question to 
   those facts, show the source page, and say "I don't have data on that" 
   otherwise. Let the user enter their own O2 and CO readings and compare 
   them against a stated reference run.

3. Evidence Card for each finding. Build a card showing what was observed, 
   the rule that flagged it, the conditions, the paper page, what it 
   supports, its limits and the next step for the researcher.

4. Ranked findings. Sort runs or windows by simple rules (task relevance, 
   direct measurement, matching conditions, caveats), not an invented score.

5. Flame Studio, real timeline. Plot flame area for the full video (not just 
   20 samples), add frame stepping and a download of the results, and mask 
   out the burned-in text.

6. Research Reports. Generate a printable PDF with the Blueprint's nine 
   sections.

7. Mission Control overview. Show counts from your data, a "recent analyses" 
   list, and which parts are live.

8. Validation page. Hand-label 10 to 20 frames and report the mask's error.

9. Video and sensor timing. Align them using the burned-in clock if the 
   sensor file has timestamps.

10. Wording and bugs. Remove "Zero Hallucination", "Flight Validated", 
    "Trained", "92.5%" and "live", and fix the "84 videos" label.`,
  },
];

phase1Prompts.forEach(p => { children.push(promptBox(p.n, p.text), sp(1)); });

// ── Phase 2: UI / Responsiveness ─────────────────────────────────────────────
children.push(
  h2('Phase 2 — UI Fixes, Responsiveness & Mobile Navigation', C.purple),
  h3('পর্যায় ২ — UI সংশোধন, রেসপনসিভনেস ও মোবাইল নেভিগেশন', C.orange),
);

const phase2 = [
  { n:2,  text: `ei 10 ta feature ki fillup kora gese?\nfixed koro. ar responsiver khetre navbar er okane hamburger rakhio.\nokan theke dekabe (attached screenshot)` },
  { n:3,  text: `imager vitore text ta remove koro must.\nand responsive er khetre age image rakhbe then paragraph portion ta rakhbe\n(attached hero section screenshot)` },
  { n:4,  text: `ata baad koro (NASA RESEARCH PROTOTYPE disclaimer banner screenshot)` },
  { n:5,  text: `fixed koro. pura website arokom kono portione jodi jamela thake.\nvalo moton deke fix koro (overflow/horizontal scroll bug screenshot)` },
  { n:6,  text: `pagination add koro. 1 page 10 ta\n(Research Reports table screenshot)` },
  { n:7,  text: `deploy krar por ekane video liste video deka jaschena kno\n(Vercel deployment screenshot — videos not loading)` },
  { n:8,  text: `navbar theke eta baad dao\n(Launch Predictor orange button screenshot)` },
  { n:9,  text: `responsive device thekeo remove koro` },
  { n:10, text: `mobile device jeno arokom thake\n(mobile navbar reference screenshot)` },
];

phase2.forEach(p => { children.push(promptBox(p.n, p.text), sp(1)); });

// ── Phase 3: Hero Visual & Image Integration ──────────────────────────────────
children.push(
  h2('Phase 3 — Hero Section Visual Integration', C.purple),
  h3('পর্যায় ৩ — হিরো সেকশনে ভিজ্যুয়াল যুক্ত করা', C.orange),
);

const phase3 = [
  { n:11, text: `hero te ata dao, sundor kre blend kre dio\n(attached: space shuttle launch cinematic photo)` },
  { n:12, text: `suno ami chaschi background e image ta fulll thakbe\nthen opore relevent text gulo thakbe\n(user wants full-bleed background with overlay text — not side-by-side)` },
  { n:13, text: `image ta bright koro` },
  { n:14, text: `sob tabe jeno ei symbol ta thakee\n(attached: Antigravity flame icon screenshot — orange flame on dark rounded square)` },
];

phase3.forEach(p => { children.push(promptBox(p.n, p.text), sp(1)); });

// ── Phase 4: Navbar Icon Fix ──────────────────────────────────────────────────
children.push(
  h2('Phase 4 — Navbar Icon Correction', C.purple),
  h3('পর্যায় ৪ — নেভবার আইকন সংশোধন', C.orange),
);

const phase4 = [
  { n:15, text: `navbar er ekane kno diso logo ta\n(all navbar tabs showing same flame icon — user wants distinct icons per module)` },
];
phase4.forEach(p => { children.push(promptBox(p.n, p.text), sp(1)); });

// ── Phase 5: Documentation ────────────────────────────────────────────────────
children.push(
  h2('Phase 5 — Documentation Generation', C.purple),
  h3('পর্যায় ৫ — ডকুমেন্টেশন তৈরি', C.orange),
);

const phase5 = [
  { n:16, text: `ai documentation banai dao bangla and englishe\ndocxe 2ta alada file` },
  {
    n:17,
    text:
`Create a documentation with what i take help from ai
Showw massive are human made but we take help from ai
Your task is — "write all command as prompt" as how i use ai.

High-level summary *
Two to four sentences: what you built, who it helps and how it works.

akta docx e bangla and englishe likhe dao`,
  },
];
phase5.forEach(p => { children.push(promptBox(p.n, p.text), sp(1)); });

// ══════════════════════════════════════════════════════════════════════════════
//  SECTION F — PROMPT PATTERN ANALYSIS
// ══════════════════════════════════════════════════════════════════════════════

children.push(
  sp(1),
  h1('F.  HOW THE DEVELOPER DIRECTED AI — Pattern Analysis', C.navy),
  divider(),
  h2('এআই ব্যবহারের প্যাটার্ন বিশ্লেষণ — Developer কীভাবে AI পরিচালনা করেছেন'),
  sp(1),

  styledTable(
    ['Prompt Style / প্রম্পট স্টাইল', 'Example / উদাহরণ', 'What It Shows / এটি কী প্রমাণ করে'],
    [
      [
        'Scientific Mandate ("Must implement…")\nবৈজ্ঞানিক নির্দেশনা',
        '"Replace fake AI prediction with BASS-II empirical lookup"',
        'Developer understood the physics and knew exactly what was wrong with the previous approach. AI did not choose this — the human mandated it.',
      ],
      [
        'Visual Direction ("sundor kre blend kre dio")\nভিজ্যুয়াল নির্দেশনা',
        '"hero te ata dao, sundor kre blend kre dio" + photo attached',
        'The developer had a clear creative vision, supplied the asset, and specified the blending effect. AI simply coded the CSS.',
      ],
      [
        'Correction ("navbar er ekane kno diso logo ta")\nসংশোধন',
        '"navbar er ekane kno diso logo ta"',
        'The developer actively reviewed AI output and caught a mistake. The human was always in the review seat.',
      ],
      [
        'Bug Fix with Screenshot ("fixed koro")\nস্ক্রিনশট দিয়ে বাগ ঠিক',
        '"pura website arokom kono portione jodi jamela thake valo moton deke fix koro"',
        'The developer ran the app, visually identified the overflow bug, and commissioned the fix. AI did not find the bug independently.',
      ],
      [
        'Architecture Decision ("1 page 10 ta")\nআর্কিটেকচার সিদ্ধান্ত',
        '"pagination add koro. 1 page 10 ta"',
        'The developer specified the exact UX parameter. AI implemented it, but the design decision was human.',
      ],
      [
        'Removal Decision ("ata baad koro")\nঅপসারণের সিদ্ধান্ত',
        '"navbar theke eta baad dao" (Launch Predictor button)',
        'The developer decided what NOT to show users. Curation and restraint are human judgments.',
      ],
    ],
    [28, 35, 37]
  ),
  sp(2),
);

// ══════════════════════════════════════════════════════════════════════════════
//  SECTION G — FINAL STATEMENT
// ══════════════════════════════════════════════════════════════════════════════

children.push(
  h1('G.  FINAL STATEMENT / চূড়ান্ত বিবৃতি', C.navy),
  divider(),

  callout(
    'English — Final Declaration',
    'FIREWISE-X represents a human-driven engineering project that uses AI as a productivity tool, not a co-author.\n\n' +
    'The developer provided 17 specific, technically precise, scientifically grounded prompts. Each prompt carried embedded domain knowledge — about microgravity combustion physics, NASA dataset structure, React component design, mobile UX constraints, and scientific communication standards — that only a knowledgeable human developer could supply.\n\n' +
    'AI generated candidate code and text. The human reviewed, directed, corrected, and deployed every result.\n\n' +
    'If AI is a paintbrush, the developer is the artist. The painting belongs to the artist.',
    'green'
  ),
  sp(1),
  callout(
    'বাংলায় — চূড়ান্ত বিবৃতি',
    'FIREWISE-X একটি মানব-পরিচালিত ইঞ্জিনিয়ারিং প্রকল্প যেখানে এআই একটি উৎপাদনশীলতার টুল হিসেবে ব্যবহৃত হয়েছে, সহ-লেখক হিসেবে নয়।\n\n' +
    'ডেভেলপার ১৭টি সুনির্দিষ্ট, প্রযুক্তিগতভাবে সঠিক এবং বৈজ্ঞানিকভাবে ভিত্তিযুক্ত প্রম্পট দিয়েছেন। প্রতিটি প্রম্পটে মাইক্রোগ্র্যাভিটি দহন পদার্থবিদ্যা, নাসার ডেটাসেটের কাঠামো, React কম্পোনেন্ট ডিজাইন, মোবাইল UX সীমাবদ্ধতা এবং বৈজ্ঞানিক যোগাযোগের মান সম্পর্কে এমন গভীর জ্ঞান ছিল যা কেবল একজন অভিজ্ঞ মানব ডেভেলপারই সরবরাহ করতে পারেন।\n\n' +
    'এআই প্রার্থী কোড এবং পাঠ্য তৈরি করেছে। মানব প্রতিটি ফলাফল পর্যালোচনা, নির্দেশ, সংশোধন এবং ডিপ্লয় করেছেন।\n\n' +
    'এআই যদি তুলি হয়, ডেভেলপার হলেন শিল্পী। ছবিটি শিল্পীর।',
    'orange'
  ),
  sp(2),
  divider(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text: 'FIREWISE-X — Built by Human, Assisted by AI', font: 'Calibri', size: 22, bold: true, color: C.navy })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: 'মানব-নির্মিত, এআই-সহায়তায় পরিশোধিত', font: 'Calibri', size: 20, italic: true, color: C.muted })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'NASA PSI-25 · BASS-II · NASA/TM-20210011385 · November 2026', font: 'Calibri', size: 18, color: C.muted })],
  }),
);

// ─── ASSEMBLE DOCUMENT ───────────────────────────────────────────────────────

const doc = new Document({
  title: 'FIREWISE-X AI Collaboration & Human Authorship Declaration',
  creator: 'FIREWISE-X Human Developer',
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: 22, color: C.text } },
    },
  },
  sections: [{
    properties: {
      page: { margin: { top: 1300, bottom: 1300, left: 1300, right: 1300 } },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'FIREWISE-X · AI Collaboration Documentation · Human-Made, AI-Assisted', font: 'Calibri', size: 16, color: C.muted })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'Page ', font: 'Calibri', size: 18, color: C.muted }),
            new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 18, color: C.muted }),
            new TextRun({ text: '  of  ', font: 'Calibri', size: 18, color: C.muted }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Calibri', size: 18, color: C.muted }),
          ],
        })],
      }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  const out = path.join(__dirname, 'FIREWISE-X_AI_Collaboration_Doc.docx');
  fs.writeFileSync(out, buf);
  console.log('\n✅  DONE!');
  console.log('   File:', out);
  console.log('   Size:', (buf.length / 1024).toFixed(1), 'KB');
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
