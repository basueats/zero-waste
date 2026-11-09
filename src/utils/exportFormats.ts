import JSZip from 'jszip';
import { CourseOverview } from '../types/course';

// Helper to trigger browser download
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 1. Export as SCORM 1.2 Package (.zip) for Moodle, Canvas, TalentLMS, Alison Partner portal
export async function exportScormPackage(course: CourseOverview) {
  const zip = new JSZip();

  // Create imsmanifest.xml
  const itemsXml = course.modules.map((m, idx) => `
      <item identifier="ITEM_${m.id}" identifierref="RES_${m.id}">
        <title>Module ${m.moduleNumber}: ${escapeXml(m.title)}</title>
        <item identifier="ITEM_${m.id}_outcomes" identifierref="RES_${m.id}">
          <title>Learning Outcomes</title>
        </item>
        ${m.lessons.map((l, lIdx) => `
        <item identifier="ITEM_${l.id}" identifierref="RES_${m.id}">
          <title>${escapeXml(l.title)}</title>
        </item>
        `).join('')}
        ${m.assessment ? `
        <item identifier="ITEM_${m.id}_assess" identifierref="RES_${m.id}">
          <title>${escapeXml(m.assessment.title)}</title>
        </item>
        ` : ''}
      </item>
  `).join('\n');

  const resourcesXml = course.modules.map(m => `
    <resource identifier="RES_${m.id}" type="webcontent" adlcp:scormtype="sco" href="index.html#${m.id}">
      <file href="index.html"/>
      <file href="course-data.js"/>
      <file href="scorm-api.js"/>
    </resource>
  `).join('\n');

  const imsmanifest = `<?xml version="1.0" standalone="no" ?>
<manifest identifier="${course.id}" version="1.2"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG_DEFAULT">
    <organization identifier="ORG_DEFAULT">
      <title>${escapeXml(course.title)}</title>
      ${itemsXml}
    </organization>
  </organizations>
  <resources>
    ${resourcesXml}
  </resources>
</manifest>`;

  zip.file('imsmanifest.xml', imsmanifest);

  // course-data.js
  zip.file('course-data.js', `window.COURSE_DATA = ${JSON.stringify(course, null, 2)};`);

  // scorm-api.js (SCORM 1.2 wrapper)
  const scormApiJs = `
function findAPI(win) {
  var findAPITries = 0;
  while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
    findAPITries++;
    if (findAPITries > 500) return null;
    win = win.parent;
  }
  return win.API;
}
window.scormAPI = findAPI(window) || (window.opener ? findAPI(window.opener) : null);
window.initSCORM = function() {
  if (window.scormAPI) {
    window.scormAPI.LMSInitialize("");
    window.scormAPI.LMSSetValue("cmi.core.lesson_status", "incomplete");
    window.scormAPI.LMSCommit("");
  }
};
window.completeSCORM = function(score) {
  if (window.scormAPI) {
    window.scormAPI.LMSSetValue("cmi.core.score.raw", score || 100);
    window.scormAPI.LMSSetValue("cmi.core.lesson_status", "completed");
    window.scormAPI.LMSCommit("");
    window.scormAPI.LMSFinish("");
  }
};
`;
  zip.file('scorm-api.js', scormApiJs);

  // index.html (Standalone LMS Course Player)
  const standaloneHtml = generateStandaloneLmsHtml(course);
  zip.file('index.html', standaloneHtml);

  // README-LMS-IMPORT.txt
  const readmeText = `========================================================================
SCORM 1.2 COURSE PACKAGE: ${course.title}
Synthesized from "The Zero Waste Kitchen" 252 Newsletters
========================================================================

HOW TO UPLOAD TO LEARNING MANAGEMENT SYSTEMS:
1. Moodle:
   - Navigate to your course -> "Turn editing on" -> "Add an activity or resource".
   - Select "SCORM package".
   - Drag and drop this .zip file directly into the Package file area.
   - Set Appearance to "Current window" and Grading method to "Highest grade".

2. Canvas LMS:
   - Go to Settings -> "Import Course Content".
   - Select "SCORM Package" from the Content Type dropdown.
   - Upload this .zip file and choose "Import as graded assignment".

3. Alison Partner Portal:
   - In your Alison Publisher dashboard, create a new course: "Diploma in Sustainable Culinary Arts & The Zero Waste Kitchen".
   - Under "Content Upload", choose "SCORM 1.2" or use the JSON Ingestion Kit.

4. TalentLMS / Blackboard / Teachable:
   - Upload directly as a SCORM 1.2 zip file.
========================================================================
`;
  zip.file('README-LMS-IMPORT.txt', readmeText);

  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, `zero-waste-kitchen-scorm12-package.zip`);
}

// 2. Export Alison Publishing Kit (.zip)
export async function exportAlisonPublishingKit(course: CourseOverview) {
  const zip = new JSZip();

  // 1. alison-curriculum-package.json
  const alisonJson = {
    courseTitle: course.title,
    category: 'Food Safety & Sustainable Culinary Arts',
    accreditationType: 'Alison Diploma',
    totalEstimatedHours: course.totalHours,
    sourceAttribution: 'The Zero Waste Kitchen Newsletter Series (252 Issues)',
    modules: course.modules.map(m => ({
      moduleNumber: m.moduleNumber,
      title: m.title,
      estimatedHours: m.estimatedHours,
      learningOutcomes: m.learningOutcomes,
      topics: m.lessons.map(l => ({
        topicTitle: l.title,
        readTimeMinutes: l.readTimeMinutes,
        contentSections: l.sections,
        keyTakeaways: l.keyTakeaways,
        scrapMetrics: l.scrapWasteMetrics
      })),
      assessment: m.assessment ? {
        title: m.assessment.title,
        passingThreshold: `${m.assessment.passingGrade}%`,
        questions: m.assessment.questions.map(q => ({
          question: q.question,
          options: q.options,
          correctOptionIndex: q.correctIndex,
          correctAnswer: q.options[q.correctIndex],
          rationale: q.explanation
        }))
      } : null
    }))
  };
  zip.file('alison-curriculum-package.json', JSON.stringify(alisonJson, null, 2));

  // 2. alison-learning-outcomes.csv
  let outcomesCsv = 'Module Number,Module Title,Outcome Number,Bloom Verb,Learning Outcome Statement\n';
  course.modules.forEach(m => {
    m.learningOutcomes.forEach((outcome, idx) => {
      const firstWord = outcome.split(' ')[0];
      outcomesCsv += `${m.moduleNumber},"${escapeCsv(m.title)}",${idx + 1},"${escapeCsv(firstWord)}","${escapeCsv(outcome)}"\n`;
    });
  });
  zip.file('alison-learning-outcomes.csv', outcomesCsv);

  // 3. alison-quiz-bank.csv
  let quizCsv = 'Module,Question ID,Question Text,Option A,Option B,Option C,Option D,Correct Option,Explanation\n';
  course.modules.forEach(m => {
    if (m.assessment) {
      m.assessment.questions.forEach((q, idx) => {
        quizCsv += `${m.moduleNumber},${q.id},"${escapeCsv(q.question)}","${escapeCsv(q.options[0] || '')}","${escapeCsv(q.options[1] || '')}","${escapeCsv(q.options[2] || '')}","${escapeCsv(q.options[3] || '')}",${q.correctIndex + 1},"${escapeCsv(q.explanation)}"\n`;
      });
    }
  });
  zip.file('alison-quiz-bank.csv', quizCsv);

  // 4. alison-text-based-modules.md (Sequential Text-Based Reading Modules)
  let textModulesMd = `# Alison Course Text-Based Reading Modules\n`;
  textModulesMd += `## Course: ${course.title}\n`;
  textModulesMd += `### Total Modules: 12 | Estimated Duration: 18 CPD Hours\n\n`;

  course.modules.forEach(m => {
    textModulesMd += `========================================================================\n`;
    textModulesMd += `MODULE ${m.moduleNumber}: ${m.title.toUpperCase()}\n`;
    textModulesMd += `Subtitle: ${m.subtitle} (Source: ${m.newsletterRange})\n`;
    textModulesMd += `========================================================================\n\n`;

    textModulesMd += `[STEP 1: LEARNING OUTCOMES]\n`;
    textModulesMd += `After completing this module, you will be able to:\n`;
    m.learningOutcomes.forEach(o => {
      textModulesMd += `- ${o}\n`;
    });
    textModulesMd += `\n`;

    // Topic 1: Concept Explanation + Reading Material
    if (m.lessons[0]) {
      textModulesMd += `[STEP 2: TOPIC 1 - CONCEPT EXPLANATION + READING MATERIAL]\n`;
      textModulesMd += `Title: ${m.lessons[0].title}\n`;
      textModulesMd += `Read Time: ${m.lessons[0].readTimeMinutes} minutes\n\n`;
      m.lessons[0].sections.forEach(s => {
        textModulesMd += `### ${s.heading}\n${s.content}\n\n`;
        if (s.formulaBox) {
          textModulesMd += `> ${s.formulaBox.title}: ${s.formulaBox.ratioOrStep}\n\n`;
        }
      });
      textModulesMd += `Key Takeaways:\n`;
      m.lessons[0].keyTakeaways.forEach(k => {
        textModulesMd += `- ${k}\n`;
      });
      textModulesMd += `\n`;
    }

    // Topic 2: Case Study / Practical Examples
    if (m.lessons[1]) {
      textModulesMd += `[STEP 3: TOPIC 2 - CASE STUDY & PRACTICAL EXAMPLES (TEXT)]\n`;
      textModulesMd += `Title: ${m.lessons[1].title}\n`;
      textModulesMd += `Read Time: ${m.lessons[1].readTimeMinutes} minutes\n\n`;
      m.lessons[1].sections.forEach(s => {
        textModulesMd += `### ${s.heading}\n${s.content}\n\n`;
        if (s.formulaBox) {
          textModulesMd += `> ${s.formulaBox.title}: ${s.formulaBox.ratioOrStep}\n\n`;
        }
      });
      textModulesMd += `Key Takeaways:\n`;
      m.lessons[1].keyTakeaways.forEach(k => {
        textModulesMd += `- ${k}\n`;
      });
      textModulesMd += `\n`;
    }

    // Topic Summary
    textModulesMd += `[STEP 4: TOPIC SUMMARY & REVIEW]\n`;
    textModulesMd += `Key Principles to Remember:\n`;
    m.lessons.flatMap(l => l.keyTakeaways).slice(0, 4).forEach(k => {
      textModulesMd += `- ${k}\n`;
    });
    textModulesMd += `\n`;

    // Module Assessment
    if (m.assessment) {
      textModulesMd += `[STEP 5: MODULE ASSESSMENT (MULTIPLE-CHOICE QUIZ)]\n`;
      textModulesMd += `Passing Grade Requirement: ${m.assessment.passingGrade}%\n\n`;
      m.assessment.questions.forEach((q, qIdx) => {
        textModulesMd += `Q${qIdx + 1}: ${q.question}\n`;
        q.options.forEach((opt, oIdx) => {
          textModulesMd += `  ${String.fromCharCode(65 + oIdx)}. ${opt} ${oIdx === q.correctIndex ? '[CORRECT]' : ''}\n`;
        });
        textModulesMd += `  Rationale: ${q.explanation}\n\n`;
      });
    }

    textModulesMd += `\n\n`;
  });

  zip.file('alison-text-based-modules.md', textModulesMd);

  // 5. alison-course-submission-guide.md
  const submissionGuide = `# Alison Course Submission & Creator Publishing Guide
## Course: ${course.title}
### Source: Synthesized from 252 Issues of "${course.originalNewsletterTitle}"

========================================================================
HOW TO PREPARE TEXT-BASED CONTENT FOR ALISON
========================================================================

A large portion of Alison's certificate and diploma courses are structured as step-by-step reading modules rather than video lectures. This kit is formatted to Alison's canonical text-based publishing standards.

### 1. Apply as a Creator
1. Register via the Alison Publishing Portal at https://alison.com/publish.
2. Complete your Creator Profile and upload proof of subject matter expertise (Culinary Arts / Hospitality / Sustainability).
3. Choose **Diploma Course** (10-15+ hours) or **Certificate Course** (2-3 hours).
4. Review the Alison Publisher Royalty Model: Creators earn 50% net revenue share from display advertisements on reading pages and digital/parchment certificate purchases.

### 2. Format in Sequential Text Modules
Alison structures courses into clear, sequential text modules and topic summaries:

- **Learning Outcomes:** Must lead with: "After completing this module, you will be able to:" followed by Bloom's Taxonomy action verbs (Instruct, Develop, Identify, Describe, Formulate, Calculate).
- **Topic 1: Concept Explanation + Reading Material:** Substantial instructional text explaining why the problem exists (cell biology, methane kinetics, collagen denaturation, starch retrogradation).
- **Topic 2: Case Study / Practical Examples (Text):** Real-world kitchen execution, station blueprints, tested recipes, and before/after yield comparisons.
- **Topic Summary:** Bulleted review of key takeaways and operational checklist before the test.
- **Module Assessment:** Multiple-choice quiz covering the text material with an 80% passing grade requirement and pedagogical rationales.

### 3. Uploading This Package to Alison CMS
1. Use \`alison-curriculum-package.json\` to auto-populate curriculum outlines.
2. Upload \`alison-learning-outcomes.csv\` into the Learning Outcomes tab.
3. Copy and paste each module's text directly from \`alison-text-based-modules.md\` into the Alison rich-text editor.
4. Import \`alison-quiz-bank.csv\` to generate graded module assessments.
5. Submit for Alison Quality Assurance (QA) review.
`;
  zip.file('alison-course-submission-guide.md', submissionGuide);

  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, `alison-course-publishing-kit.zip`);
}

// 3. Export Udemy / Teachable Curriculum CSV & Outline
export async function exportUdemyTeachableKit(course: CourseOverview) {
  const zip = new JSZip();

  // Udemy bulk import CSV
  let udemyCsv = 'Section Title,Lecture Title,Lecture Description,Lecture Type\n';
  course.modules.forEach(m => {
    udemyCsv += `"${escapeCsv(`Module ${m.moduleNumber}: ${m.title}`)}","Learning Outcomes","${escapeCsv(m.learningOutcomes.join(' | '))}",Article\n`;
    m.lessons.forEach(l => {
      udemyCsv += `"${escapeCsv(`Module ${m.moduleNumber}: ${m.title}`)}","${escapeCsv(l.title)}","${escapeCsv(l.sections[0]?.content.slice(0, 200) || '')}...",Article\n`;
    });
    if (m.assessment) {
      udemyCsv += `"${escapeCsv(`Module ${m.moduleNumber}: ${m.title}`)}","${escapeCsv(m.assessment.title)}","Comprehensive ${m.assessment.questions.length}-question assessment with 80% passing grade.",Quiz\n`;
    }
  });
  zip.file('udemy-curriculum-import.csv', udemyCsv);

  // Teachable outline text
  let teachableText = `TEACHABLE COURSE CURRICULUM OUTLINE\nCourse Title: ${course.title}\n\n`;
  course.modules.forEach(m => {
    teachableText += `==============================================\n`;
    teachableText += `SECTION ${m.moduleNumber}: ${m.title}\n`;
    teachableText += `==============================================\n`;
    teachableText += `  - LESSON 1: Learning Outcomes & Objectives\n`;
    m.lessons.forEach((l, idx) => {
      teachableText += `  - LESSON ${idx + 2}: ${l.title} (${l.readTimeMinutes} min)\n`;
    });
    if (m.assessment) {
      teachableText += `  - QUIZ: ${m.assessment.title} (${m.assessment.questions.length} questions)\n`;
    }
    teachableText += `\n`;
  });
  zip.file('teachable-curriculum-outline.txt', teachableText);

  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, `udemy-teachable-curriculum-pack.zip`);
}

// 4. Export Complete Printable Course Handbook (Single HTML for PDF Print + Markdown)
export function exportPrintableCourseHandbook(course: CourseOverview) {
  const htmlContent = generatePrintableHtml(course);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  downloadBlob(blob, `zero-waste-kitchen-handbook-printable.html`);
}

// 5. Export Complete Markdown Course File
export function exportCourseMarkdown(course: CourseOverview) {
  let md = `# ${course.title}\n\n`;
  md += `**Accreditation Level:** ${course.accreditationLevel}\n`;
  md += `**Total Modules:** ${course.totalModules} | **Estimated Duration:** ${course.totalHours} Hours\n`;
  md += `**Source Material:** Synthesized from 252 issues of "${course.originalNewsletterTitle}"\n\n`;
  md += `## Course Overview\n${course.description}\n\n`;
  md += `---\n\n`;

  course.modules.forEach(m => {
    md += `## Module ${m.moduleNumber}: ${m.title}\n`;
    md += `*${m.subtitle}* (Estimated: ${m.estimatedHours} hrs | Source: ${m.newsletterRange})\n\n`;
    md += `### Learning Outcomes\n`;
    md += `After completing this module, you will be able to:\n`;
    m.learningOutcomes.forEach(out => {
      md += `- ${out}\n`;
    });
    md += `\n`;

    m.lessons.forEach(l => {
      md += `### ${l.title}\n`;
      md += `*Read time: ${l.readTimeMinutes} minutes*\n\n`;
      l.sections.forEach(s => {
        md += `#### ${s.heading}\n${s.content}\n\n`;
        if (s.formulaBox) {
          md += `> **${s.formulaBox.title}**  \n> ${s.formulaBox.ratioOrStep}  \n`;
          if (s.formulaBox.safetyNote) {
            md += `> *Food Safety:* ${s.formulaBox.safetyNote}  \n`;
          }
          md += `\n`;
        }
      });

      if (l.scrapWasteMetrics) {
        md += `**Scrap Diversion Impact:**  \n`;
        md += `- Diversion Rate: ${l.scrapWasteMetrics.wasteDivertedPercentage}  \n`;
        md += `- Annual Savings: ${l.scrapWasteMetrics.householdAnnualSavingsUSD}  \n`;
        md += `- CO2 Diverted: ${l.scrapWasteMetrics.co2ReductionKg}  \n\n`;
      }

      md += `**Key Takeaways:**\n`;
      l.keyTakeaways.forEach(kt => {
        md += `- ${kt}\n`;
      });
      md += `\n---\n\n`;
    });

    if (m.assessment) {
      md += `### ${m.assessment.title} (Passing Grade: ${m.assessment.passingGrade}%)\n\n`;
      m.assessment.questions.forEach((q, qIdx) => {
        md += `**Question ${qIdx + 1}:** ${q.question}\n`;
        q.options.forEach((opt, oIdx) => {
          md += `${String.fromCharCode(65 + oIdx)}. ${opt}\n`;
        });
        md += `*Correct Answer: ${String.fromCharCode(65 + q.correctIndex)}*  \n`;
        md += `*Explanation: ${q.explanation}*\n\n`;
      });
    }

    md += `\n=======================================================\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown' });
  downloadBlob(blob, `zero-waste-kitchen-master-handbook.md`);
}

// 6. Export Commercial Resell & Monetization Pack (Gumroad, Etsy, Shopify, Stan Store)
export async function exportCommercialResellPack(course: CourseOverview) {
  const zip = new JSZip();

  // 1. Sales Page Copy
  const salesCopy = `# High-Converting Sales Page Copy: The Zero Waste Kitchen Master Diploma
## Targeted for: Gumroad, Stan Store, Etsy Digital Downloads, Shopify & Kajabi

---

### [SECTION 1: THE HOOK & HERO HEADLINE]
**Headline:** "Turn Kitchen Waste Into Culinary Gold: The Accredited 12-Module Master Diploma in Zero Waste Cooking & Sustainable Kitchen Economics"

**Sub-headline:** "Master the exact root-to-stem knife skills, fermentation techniques, bone broth extractions, and circular pantry systems synthesized from 252 professional culinary newsletters. Slash grocery bills by up to $1,400/year and eliminate food waste forever."

**Primary CTA:** [Enroll Now – Instant Access for $67] *(Normally $197)*

---

### [SECTION 2: THE PROBLEM (WHY 80% OF FOOD IS WASTED)]
Did you know that the average household throws away over 35% of purchased groceries every single month?
- Broccoli stems tossed in the trash.
- Souring milk poured down the drain.
- Stale sourdough loaves hardening into bricks.
- Expensive poultry carcasses discarded after a single dinner.

That is literally throwing hard-earned money straight into the municipal dump. Even worse, rotting food in landfills releases massive clouds of methane gas.

---

### [SECTION 3: THE SOLUTION]
Introducing **${course.title}**.
A structured, accredited-level culinary curriculum breaking down all 252 lessons from "The Zero Waste Kitchen" newsletter into 12 step-by-step master modules:
- Module 1: The Science of Food Waste Audits & Methane Economics
- Module 2: Root-to-Stem Vegetable Utilization & Scrap Alchemy
- Module 3: Nose-to-Tail Protein & High-Gelatin Broth Mastery
- Module 4: Mid-Term Synthesis & Culinary Yield Calculations
- Module 5: Wild Lacto-Fermentation (The 2% Golden Ratio) & Live Vinegar Mothers
- Module 6: Stale Bread Renaissance, Panagrattato & Aquafaba Science
- Module 7: Souring Milk Ricotta, Acid Whey Brines & Broken Sauce Restoration
- Module 8: Mid-Term Synthesis 2
- Module 9: Thermal Momentum, Residual Cookery & Induction Efficiency
- Module 10: Circular Pantry Design & Decoding "Best Before" Dates
- Module 11: Commercial Restaurant Cross-Utilization & Donation Law
- Module 12: Final Comprehensive Assessment & Alison-Grade Diploma

---

### [SECTION 4: WHAT IS INCLUDED IN YOUR DOWNLOAD]
1. Complete 12-Module Interactive Course Player & Offline Web App.
2. 180+ Page Printable Student Master Handbook & Scrap Formula Cookbook (PDF).
3. 252-Issue Searchable Zero Waste Kitchen Newsletter Reference Index.
4. Quizzes & Assessments with instant answer keys and rationale sheets.
5. Official Certificate of Completion (Printable & Verifiable).

---

### [SECTION 5: PRICING TIERS & COMMERCIAL LICENSE]
- **Personal Learner Tier:** $47 (Self-paced study + Handbook + Certificate)
- **Professional Chef & Educator Tier:** $97 (Includes SCORM 1.2 files for school/LMS upload)
- **Master Resell Rights (MRR) Tier:** $197 (Re-brand, bundle, and sell this course as your own digital product, keeping 100% of profits!)
`;
  zip.file('sales-page-copy.md', salesCopy);

  // 2. Master Resell Rights (MRR) / PLR Commercial License
  const licenseText = `========================================================================
MASTER RESELL RIGHTS (MRR) & COMMERCIAL PRIVATE LABEL LICENSE
Product: ${course.title}
Issue Date: 2026-11-06
========================================================================

TERMS OF RESALE & COMMERCIAL RIGHTS:
1. WHAT YOU CAN DO:
   - You may sell this course on Gumroad, Etsy, Stan Store, Shopify, or your personal website.
   - You may bundle this course into paid memberships, coaching programs, or culinary academies.
   - You may upload the provided SCORM 1.2 files into your own private or commercial LMS (Moodle, Teachable, Thinkific, Kajabi).
   - You may publish the modules on Alison as a self-published instructor or partner.
   - You may convert the content into webinars, audiobooks, or printed spiral-bound manuals.
   - You keep 100% of all profits generated from your sales.

2. SUGGESTED PRICING:
   - Digital Download (PDF + Web Player): $27.00 - $67.00 USD
   - Complete Video/Interactive LMS Course: $97.00 - $197.00 USD
   - Corporate Hospitality Training License: $495.00+ USD

Authorized Commercial Release.
========================================================================
`;
  zip.file('master-resell-rights-license.txt', licenseText);

  // 3. 5-Part Email Sequence
  const emailSequence = `# 5-Part Email Sequence for Selling the Course

### Email 1: The $1,200 Kitchen Trash Can (Curiosity & Agitation)
Subject: Look in your kitchen garbage can right now...
Preview: You might be throwing away $100 every single week.
Body:
Hey [Name],
When you cut the florets off a head of broccoli, where do the thick stalks go?
If you're like 90% of people, they go straight into the trash.
Did you know that broccoli stems contain up to 40% of the purchased vegetable mass—and when peeled, they are actually SWEETER and crunchier than the florets?
Over the course of a year, the average home tosses over $1,200 of edible food scraps into landfills.
I've spent months compiling all 252 issues of "The Zero Waste Kitchen" into a master accredited-grade course:
[Link: Discover the Zero Waste Kitchen Diploma]

---

### Email 2: The 2% Golden Fermentation Secret (Value Delivery)
Subject: How salt and cabbage cores save your grocery budget
Body:
Hey [Name],
In Module 5 of our new Diploma in The Zero Waste Kitchen, we teach students the "2% Golden Salinity Ratio".
You don't need fancy starter cultures or laboratory equipment to make Michelin-grade pickles and kimchi out of vegetable trimmings.
All you need is raw scraps, non-iodized salt, and a clean jar...
[Link: Grab the complete course and start today]

---

### Email 3: From Stale Bread to Crispy Gourmet Crunch (Practical Demo)
Subject: Stop throwing away rock-hard bread!
Body:
Hey [Name],
Bread doesn't stale because it loses water. It stales because of a process called "starch retrogradation".
Here is a 5-minute chef trick from Module 6 that Italian trattorias have used for centuries: Panagrattato...
[Link: Get all 12 modules and the printable handbook]

---

### Email 4: What is Inside the 12-Module Course? (Curriculum Breakdown)
Subject: 12 Modules, 252 Newsletter Lessons, 1 Master Diploma
Body:
Hey [Name],
Here is a full breakdown of what you unlock today:
- Root-to-stem vegetable transformations
- Collagen broth & animal fat rendering
- Souring milk to artisan ricotta in 15 minutes
- Decoding misleading "Best Before" dates
- SCORM LMS downloads and accredited certificate!
[Link: Enroll before the price increases]

---

### Email 5: Final Call (Urgency & Guarantee)
Subject: Final chance to get 65% off the Zero Waste Master Course
Body:
Hey [Name],
Our launch pricing closes at midnight tonight.
If you want to cut your food waste by 85%, slash grocery expenses, and gain a verified culinary diploma, this is your moment.
100% 30-Day Money-Back Guarantee.
[Link: Enroll Now and Claim Your Diploma]
`;
  zip.file('email-marketing-sequence.md', emailSequence);

  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, `zero-waste-resell-monetization-pack.zip`);
}

// Helpers
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function escapeCsv(text: string): string {
  return text.replace(/"/g, '""').replace(/\n/g, ' ');
}

function generateStandaloneLmsHtml(course: CourseOverview): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXml(course.title)}</title>
  <script src="scorm-api.js"></script>
  <script src="course-data.js"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: #f8fafc; color: #1e293b; }
    header { background: #0f172a; color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .layout { display: flex; min-height: calc(100vh - 64px); }
    aside { width: 320px; background: white; border-right: 1px solid #e2e8f0; padding: 1.5rem; overflow-y: auto; }
    main { flex: 1; padding: 2.5rem; max-width: 900px; margin: 0 auto; }
    .module-card { margin-bottom: 1rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem; }
    .module-card h4 { margin: 0 0 0.5rem 0; font-size: 0.95rem; color: #0284c7; }
    .topic-btn { display: block; width: 100%; text-align: left; background: none; border: none; padding: 0.4rem 0.5rem; font-size: 0.85rem; color: #475569; cursor: pointer; border-radius: 4px; }
    .topic-btn:hover { background: #f1f5f9; color: #0f172a; }
    .outcomes-box { background: #fef9c3; border: 1px solid #fef08a; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; }
    .outcomes-box h2 { margin-top: 0; color: #854d0e; font-size: 1.25rem; }
    .outcomes-box ul { padding-left: 1.5rem; }
    .outcomes-box li { margin-bottom: 0.5rem; font-size: 0.95rem; color: #713f12; }
    .lesson-section { margin-bottom: 2rem; line-height: 1.6; }
    .formula-callout { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 1rem; border-radius: 6px; margin: 1rem 0; color: #166534; font-size: 0.9rem; }
    .takeaways { background: #f8fafc; border: 1px solid #e2e8f0; padding: 1.25rem; border-radius: 6px; margin-top: 2rem; }
    .takeaways h4 { margin-top: 0; color: #0f172a; }
    .btn { background: #0284c7; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 600; }
  </style>
</head>
<body>
  <header>
    <div>
      <h2 style="margin: 0; font-size: 1.1rem;">${escapeXml(course.title)}</h2>
      <div style="font-size: 0.8rem; opacity: 0.8;">Accredited Alison & LMS SCORM 1.2 Package</div>
    </div>
    <button class="btn" style="background: #16a34a;" onclick="window.completeSCORM(100); alert('Course completed! Progress sent to LMS.');">Complete & Record Score</button>
  </header>
  <div class="layout">
    <aside>
      <h3 style="font-size: 1rem; margin-top: 0;">Course Modules</h3>
      <div id="moduleNav"></div>
    </aside>
    <main id="contentArea">
      <div class="outcomes-box">
        <h2>Learning Outcomes</h2>
        <p>After completing this module, you will be able to:</p>
        <ul id="outcomesList"></ul>
      </div>
      <div id="lessonContent"></div>
    </main>
  </div>
  <script>
    window.initSCORM();
    var currentModuleIdx = 0;
    var currentLessonIdx = 0;
    function renderNav() {
      var nav = document.getElementById('moduleNav');
      nav.innerHTML = window.COURSE_DATA.modules.map(function(m, mIdx) {
        return '<div class="module-card">' +
          '<h4>Module ' + m.moduleNumber + '</h4>' +
          '<div style="font-size: 0.8rem; margin-bottom: 0.4rem; font-weight: 600;">' + m.title + '</div>' +
          '<button class="topic-btn" onclick="selectTopic(' + mIdx + ', -1)">📋 Learning Outcomes</button>' +
          m.lessons.map(function(l, lIdx) {
            return '<button class="topic-btn" onclick="selectTopic(' + mIdx + ', ' + lIdx + ')">📖 ' + l.title + '</button>';
          }).join('') +
          '</div>';
      }).join('');
    }
    function selectTopic(mIdx, lIdx) {
      currentModuleIdx = mIdx;
      currentLessonIdx = lIdx;
      var m = window.COURSE_DATA.modules[mIdx];
      var outcomesEl = document.getElementById('outcomesList');
      outcomesEl.innerHTML = m.learningOutcomes.map(function(o) { return '<li>' + o + '</li>'; }).join('');
      var contentEl = document.getElementById('lessonContent');
      if (lIdx === -1) {
        contentEl.innerHTML = '<p><em>Select a lesson topic from the left sidebar to begin studying.</em></p>';
      } else {
        var l = m.lessons[lIdx];
        contentEl.innerHTML = '<h1>' + l.title + '</h1>' +
          '<p style="color: #64748b; font-size: 0.9rem;">Estimated read: ' + l.readTimeMinutes + ' minutes</p>' +
          l.sections.map(function(s) {
            return '<div class="lesson-section"><h3>' + s.heading + '</h3><p>' + s.content + '</p>' +
              (s.formulaBox ? '<div class="formula-callout"><strong>' + s.formulaBox.title + '</strong><br>' + s.formulaBox.ratioOrStep + '</div>' : '') +
              '</div>';
          }).join('') +
          '<div class="takeaways"><h4>Key Takeaways</h4><ul>' + l.keyTakeaways.map(function(k) { return '<li>' + k + '</li>'; }).join('') + '</ul></div>';
      }
    }
    renderNav();
    selectTopic(0, 0);
  </script>
</body>
</html>`;
}

function generatePrintableHtml(course: CourseOverview): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${course.title} - Complete Student Handbook</title>
  <style>
    @media print {
      body { font-size: 11pt; color: #000; }
      .page-break { page-break-after: always; }
      .no-print { display: none !important; }
    }
    body { font-family: 'Georgia', serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #222; }
    h1, h2, h3, h4 { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; }
    h1 { font-size: 26pt; text-align: center; margin-bottom: 5px; }
    .subtitle { text-align: center; color: #555; font-size: 13pt; margin-bottom: 30px; }
    .meta-box { border: 1px solid #ccc; padding: 15px; background: #fafafa; margin-bottom: 40px; font-size: 10pt; }
    .outcome-box { background: #fefce8; border: 1px solid #fde047; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .formula-box { background: #f0fdf4; border: 1px solid #86efac; padding: 12px; margin: 15px 0; font-size: 10pt; }
    .quiz-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; margin: 20px 0; font-size: 10pt; }
    .takeaways-box { background: #f1f5f9; padding: 12px; margin: 15px 0; }
    .btn-print { background: #16a34a; color: white; border: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; display: block; margin: 0 auto 30px auto; }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 20px;">
    <button class="btn-print" onclick="window.print()">🖨️ Print or Save as PDF</button>
  </div>
  <h1>${course.title}</h1>
  <div class="subtitle">Complete Student Handbook & Accredited Syllabus</div>
  <div class="meta-box">
    <strong>Accreditation Level:</strong> ${course.accreditationLevel}<br>
    <strong>Curriculum Size:</strong> 12 Master Modules | 18 Course Hours<br>
    <strong>Source Foundation:</strong> Synthesized from all 252 issues of "The Zero Waste Kitchen" Newsletter<br>
    <strong>Learning Outcomes Alignment:</strong> Compliant with Bloom's Taxonomy for Vocational & Higher Culinary Qualifications
  </div>

  ${course.modules.map(m => `
    <div class="page-break"></div>
    <h2>Module ${m.moduleNumber}: ${m.title}</h2>
    <p><em>${m.subtitle} (Estimated: ${m.estimatedHours} hrs | Source: ${m.newsletterRange})</em></p>
    
    <div class="outcome-box">
      <h3 style="margin-top: 0; color: #854d0e;">Learning Outcomes</h3>
      <p>After completing this module, you will be able to:</p>
      <ul>
        ${m.learningOutcomes.map(out => `<li>${out}</li>`).join('')}
      </ul>
    </div>

    ${m.lessons.map(l => `
      <h3>${l.title}</h3>
      <p style="font-size: 9pt; color: #666;">Estimated Study Time: ${l.readTimeMinutes} minutes</p>
      ${l.sections.map(s => `
        <h4>${s.heading}</h4>
        <p>${s.content}</p>
        ${s.formulaBox ? `
          <div class="formula-box">
            <strong>${s.formulaBox.title}:</strong> ${s.formulaBox.ratioOrStep}<br>
            ${s.formulaBox.safetyNote ? `<em>Safety Rule:</em> ${s.formulaBox.safetyNote}` : ''}
          </div>
        ` : ''}
      `).join('')}
      <div class="takeaways-box">
        <strong>Key Takeaways:</strong>
        <ul>
          ${l.keyTakeaways.map(k => `<li>${k}</li>`).join('')}
        </ul>
      </div>
    `).join('')}

    ${m.assessment ? `
      <div class="quiz-box">
        <h4 style="margin-top: 0;">${m.assessment.title} (Passing Grade: ${m.assessment.passingGrade}%)</h4>
        ${m.assessment.questions.map((q, idx) => `
          <p><strong>Q${idx + 1}: ${q.question}</strong></p>
          <ul>
            ${q.options.map((opt, oIdx) => `<li>${String.fromCharCode(65 + oIdx)}. ${opt} ${oIdx === q.correctIndex ? '<strong>[Correct]</strong>' : ''}</li>`).join('')}
          </ul>
          <p><em>Rationale: ${q.explanation}</em></p>
        `).join('')}
      </div>
    ` : ''}
  `).join('')}
</body>
</html>`;
}
