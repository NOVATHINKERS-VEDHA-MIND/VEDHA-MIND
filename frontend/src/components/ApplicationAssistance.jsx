import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  Printer,
  Sparkles,
  ShieldAlert,
  Layers,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  FileCode,
  FileSpreadsheet,
  FileCheck
} from 'lucide-react';

const SAMPLE_FORMULATIONS = [
  {
    name: 'CurcuShield Tri-Herbal Synergy Formulation',
    herbs: 'Curcuma longa (95% curcuminoids), Piper nigrum (piperine 98%), Zingiber officinale',
    objective: 'Enhanced bioavailability, metabolic stability, and synergistic anti-inflammatory efficacy overcoming Section 3(d) and 3(p)',
    type: 'Patent or Proprietary (P&P)'
  },
  {
    name: 'Ashwagandha Neuro-Active Bio-Complex',
    herbs: 'Withania somnifera (standardized withanolides 5%), Bacopa monnieri (bacosides 20%), Convolvulus pluricaulis',
    objective: 'Synergistic neuroprotective and adaptogenic efficacy with enhanced blood-brain barrier transport under Section 3(e)',
    type: 'Patent or Proprietary (P&P)'
  },
  {
    name: 'Neem-Tulsi Antimicrobial Nano-Matrix',
    herbs: 'Azadirachta indica (active nimbin/salannin fractions), Ocimum sanctum (eugenol/ursolic acid)',
    objective: 'Broad-spectrum synergistic topical antimicrobial delivery with sustained non-cytotoxic release',
    type: 'Patent or Proprietary (P&P)'
  }
];

export default function ApplicationAssistance({
  intakeData = {},
  setIntakeData,
  presets: _presets = [],
  onGenerateDraft,
  patentDraft,
  isDrafting
}) {
  const [copiedSection, setCopiedSection] = useState(null);
  const [activeFormTab, setActiveFormTab] = useState('form2'); // 'form2', 'form1', or 'combined'
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const exportRef = useRef(null);

  // Auto-generate if intake data has a product name and no draft exists yet
  useEffect(() => {
    if (intakeData?.product_name && !patentDraft && !isDrafting && onGenerateDraft) {
      onGenerateDraft(intakeData);
    }
  }, [intakeData, patentDraft, isDrafting, onGenerateDraft]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3500);
  };

  const handleCopy = (text, sectionName) => {
    if (!text) return;
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedSection(sectionName);
      showToast(`Copied ${sectionName || 'section'} to clipboard!`, 'success');
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      showToast('Could not copy to clipboard', 'error');
    }
  };

  // Safe filename generator
  const getSafeFileName = (extension) => {
    const rawName = intakeData?.product_name || patentDraft?.product_name || 'Patent_Application';
    const sanitized = rawName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    return `Patent_Draft_${sanitized}_IPO_Form1_Form2.${extension}`;
  };

  // Safe download trigger
  const triggerDownload = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 250);
  };

  // Build plain text patent draft specification
  const generateTextContent = () => {
    if (!patentDraft) return '';
    return `================================================================================
INDIAN PATENT APPLICATION SPECIFICATION — VEDHA MIND AI ASSISTANT
THE PATENTS ACT 1970 (39 OF 1970) & THE PATENTS RULES, 2003
================================================================================
Generated on: ${new Date().toLocaleString()}
Reference Draft ID: ${patentDraft.draft_id || 'IPO-DRAFT-REF'}
Jurisdiction: ${patentDraft.form_1?.jurisdiction || 'INDIA'}

--------------------------------------------------------------------------------
PART I: APPLICATION FOR GRANT OF PATENT
[See section 7, 54 & 135 and rule 20(1)]
--------------------------------------------------------------------------------
1. APPLICANT(S): 
   Name & Address: ${patentDraft.form_1?.applicant_name || 'Ayurvedic Innovations Lab (India)'}
   
2. INVENTOR(S): 
   Name(s): ${patentDraft.form_1?.inventor_names || 'Dr. V. Sharma & Research Team'}

3. TITLE OF THE INVENTION: 
   ${patentDraft.form_1?.title_of_invention || patentDraft.form_2?.title || 'Synergistic Herbal Formulation'}

4. APPLICATION CATEGORY: 
   ${patentDraft.form_1?.type_of_application || 'Ordinary Application (Complete Specification)'}

5. MANDATORY BIOLOGICAL RESOURCES DECLARATION [Section 10(4)(ii)(D)]:
   ${patentDraft.form_1?.declaration_biological_resources || 'Biological material sourced in India; NBA approval initiated.'}

6. JURISDICTION: 
   ${patentDraft.form_1?.jurisdiction || 'INDIA'}

--------------------------------------------------------------------------------
PART II: COMPLETE SPECIFICATION
[See section 10 and rule 13]
--------------------------------------------------------------------------------
TITLE OF THE INVENTION:
${patentDraft.form_2?.title || 'SYNERGISTIC HERBAL FORMULATION AND PROCESS FOR PREPARATION THEREOF'}

1. FIELD OF THE INVENTION:
${patentDraft.form_2?.field_of_invention || 'Not specified'}

2. BACKGROUND OF THE INVENTION AND PRIOR ART (TKDL CITATION BARRIER):
${patentDraft.form_2?.background_and_prior_art || 'Not specified'}

3. OBJECTS OF THE INVENTION:
${patentDraft.form_2?.objects_of_invention?.map((obj, i) => `${i + 1}. ${obj}`).join('\n') || 'Not specified'}

4. SUMMARY OF THE INVENTION:
${patentDraft.form_2?.summary_of_invention || 'Not specified'}

5. DETAILED DESCRIPTION OF PREFERRED EMBODIMENTS:
${patentDraft.form_2?.detailed_description || 'Not specified'}

6. WORKING EXAMPLES (COMPARATIVE SYNERGY VALIDATION UNDER SECTION 3(d)):
${patentDraft.form_2?.working_examples?.map((ex) => `[${ex.example_no}]\n${ex.finding}`).join('\n\n') || 'Not specified'}

7. CLAIMS (STATUTORY INDEPENDENT AND DEPENDENT CLAIMS):
${patentDraft.form_2?.claims?.map((cl, i) => `${cl.startsWith(String(i + 1)) ? '' : `${i + 1}. `}${cl}`).join('\n\n') || 'Not specified'}

8. ABSTRACT OF THE INVENTION (< 150 WORDS):
${patentDraft.form_2?.abstract || 'Not specified'}

================================================================================
VERIFICATION AND DECLARATION
We, the applicant(s) herein, hereby declare that the particulars given above are
true to the best of our knowledge and belief, and that the complete specification
fully describes the invention and method by which it is to be performed.

Dated this: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
Prepared by: Vedha Mind Statutory IP Assistant
Disclaimer: Review with a Registered Indian Patent Agent before submission to IPO.
================================================================================`;
  };

  // Build Word Document HTML (.doc)
  const generateWordDocContent = () => {
    if (!patentDraft) return '';
    const title = patentDraft.form_2?.title || 'SYNERGISTIC HERBAL FORMULATION';
    return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @page { size: A4 portrait; margin: 25.4mm; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: #000000; }
  h1 { font-size: 15pt; text-align: center; text-transform: uppercase; font-weight: bold; margin-bottom: 8pt; }
  h2 { font-size: 13pt; text-align: center; font-weight: bold; margin-top: 18pt; margin-bottom: 12pt; border-bottom: 2pt solid #000; padding-bottom: 4pt; }
  h3 { font-size: 12pt; font-weight: bold; margin-top: 14pt; margin-bottom: 6pt; text-decoration: underline; }
  p, li { font-size: 12pt; text-align: justify; margin-bottom: 8pt; }
  table { width: 100%; border-collapse: collapse; margin-top: 10pt; margin-bottom: 14pt; }
  th, td { border: 1pt solid #333333; padding: 6pt 10pt; font-size: 11pt; text-align: left; }
  th { background-color: #f2f2f2; font-weight: bold; }
  .claim-text { margin-bottom: 10pt; text-align: justify; }
  .disclaimer { border-top: 1pt solid #777; margin-top: 24pt; padding-top: 10pt; font-size: 10pt; font-style: italic; color: #555; }
</style>
</head>
<body>
  <h1>THE PATENTS ACT 1970 (39 OF 1970)<br>&amp; THE PATENTS RULES, 2003</h1>
  
  <h2>PART I: APPLICATION FOR GRANT OF PATENT<br><span style="font-size: 10pt; font-weight: normal;">[See section 7, 54 &amp; 135 and rule 20(1)]</span></h2>
  
  <table>
    <tr><th width="35%">Draft Reference ID</th><td>${patentDraft.draft_id || 'IPO-DRAFT'}</td></tr>
    <tr><th>Title of the Invention</th><td><strong>${patentDraft.form_1?.title_of_invention || title}</strong></td></tr>
    <tr><th>Applicant Name &amp; Address</th><td>${patentDraft.form_1?.applicant_name || 'Ayurvedic Innovations Lab (India)'}</td></tr>
    <tr><th>True &amp; First Inventors</th><td>${patentDraft.form_1?.inventor_names || 'Dr. V. Sharma &amp; Team'}</td></tr>
    <tr><th>Application Type</th><td>${patentDraft.form_1?.type_of_application || 'Ordinary Application'}</td></tr>
    <tr><th>Section 10(4) Biological Resource Declaration</th><td><strong>${patentDraft.form_1?.declaration_biological_resources || 'YES - Biological material from India'}</strong></td></tr>
    <tr><th>Designated Jurisdiction</th><td>${patentDraft.form_1?.jurisdiction || 'INDIA'}</td></tr>
  </table>

  <br style="page-break-before: always;">

  <h2>PART II: COMPLETE SPECIFICATION<br><span style="font-size: 10pt; font-weight: normal;">[See section 10 and rule 13]</span></h2>

  <h1 style="margin-top: 14pt;">${title}</h1>

  <h3>1. FIELD OF THE INVENTION</h3>
  <p>${patentDraft.form_2?.field_of_invention || ''}</p>

  <h3>2. BACKGROUND OF THE INVENTION AND PRIOR ART</h3>
  <p>${patentDraft.form_2?.background_and_prior_art || ''}</p>

  <h3>3. OBJECTS OF THE INVENTION</h3>
  <ol>
    ${patentDraft.form_2?.objects_of_invention?.map((obj) => `<li>${obj}</li>`).join('') || ''}
  </ol>

  <h3>4. SUMMARY OF THE INVENTION</h3>
  <p>${patentDraft.form_2?.summary_of_invention || ''}</p>

  <h3>5. DETAILED DESCRIPTION OF PREFERRED EMBODIMENTS</h3>
  <p>${patentDraft.form_2?.detailed_description || ''}</p>

  <h3>6. WORKING EXAMPLES (SYNERGISTIC EFFICACY UNDER SECTION 3(d))</h3>
  ${patentDraft.form_2?.working_examples?.map((ex) => `
    <div style="margin-bottom: 10pt; padding: 8pt; border: 1pt solid #ccc; background-color: #fafafa;">
      <strong>${ex.example_no}:</strong>
      <p style="margin-top: 4pt;">${ex.finding}</p>
    </div>
  `).join('') || ''}

  <h3>7. CLAIMS</h3>
  <div style="margin-top: 8pt;">
    <p><strong>WE CLAIM:</strong></p>
    ${patentDraft.form_2?.claims?.map((claim, idx) => `
      <p class="claim-text">${claim.startsWith(String(idx + 1)) ? '' : `${idx + 1}. `}${claim}</p>
    `).join('') || ''}
  </div>

  <h3>8. ABSTRACT</h3>
  <p>${patentDraft.form_2?.abstract || ''}</p>

  <div class="disclaimer">
    <p><strong>Official Notice:</strong> Generated by Vedha Mind Statutory Ayurvedic IP Assistant. Formulated to withstand Section 3(p) TKDL and Section 3(d) efficacy scrutiny. Review with a certified Patent Agent before IPO e-filing.</p>
  </div>
</body>
</html>`;
  };

  // Build Markdown content (.md)
  const generateMarkdownContent = () => {
    if (!patentDraft) return '';
    return `# Indian Patent Application Complete Specification
**Draft Reference ID:** \`${patentDraft.draft_id}\`  
**Generated Date:** ${new Date().toLocaleString()}  
**Jurisdiction:** ${patentDraft.form_1?.jurisdiction || 'INDIA'}

---

## Form 1: Application for Grant of Patent
- **Title:** ${patentDraft.form_1?.title_of_invention || patentDraft.form_2?.title}
- **Applicant:** ${patentDraft.form_1?.applicant_name}
- **Inventors:** ${patentDraft.form_1?.inventor_names}
- **Type:** ${patentDraft.form_1?.type_of_application}
- **Biological Resources Declaration (NBA):** ${patentDraft.form_1?.declaration_biological_resources}

---

## Form 2: Complete Specification
### Title of Invention
> **${patentDraft.form_2?.title}**

### 1. Field of Invention
${patentDraft.form_2?.field_of_invention}

### 2. Background and Prior Art (TKDL Citations)
${patentDraft.form_2?.background_and_prior_art}

### 3. Objects of the Invention
${patentDraft.form_2?.objects_of_invention?.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

### 4. Summary of the Invention
${patentDraft.form_2?.summary_of_invention}

### 5. Detailed Description
${patentDraft.form_2?.detailed_description}

### 6. Working Examples (Section 3(d) Synergy Validation)
${patentDraft.form_2?.working_examples?.map((ex) => `**${ex.example_no}:**\n${ex.finding}`).join('\n\n')}

### 7. Claims
**We Claim:**
${patentDraft.form_2?.claims?.map((cl, i) => `${i + 1}. ${cl}`).join('\n\n')}

### 8. Abstract
${patentDraft.form_2?.abstract}

---
*Disclaimer: Generated by Vedha Mind AI Assistant. Consult registered patent agent for formal filing.*`;
  };

  // Main Export handler
  const handleDownload = (format = 'doc') => {
    if (!patentDraft) {
      showToast('Please generate a patent draft first.', 'error');
      return;
    }

    try {
      if (format === 'doc') {
        const content = generateWordDocContent();
        const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
        const fileName = getSafeFileName('doc');
        triggerDownload(blob, fileName);
        showToast(`Exported as Microsoft Word document (${fileName})!`, 'success');
      } else if (format === 'txt') {
        const content = generateTextContent();
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const fileName = getSafeFileName('txt');
        triggerDownload(blob, fileName);
        showToast(`Exported as Plain Text specification (${fileName})!`, 'success');
      } else if (format === 'md') {
        const content = generateMarkdownContent();
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const fileName = getSafeFileName('md');
        triggerDownload(blob, fileName);
        showToast(`Exported as Markdown (${fileName})!`, 'success');
      } else if (format === 'json') {
        const content = JSON.stringify(patentDraft, null, 2);
        const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
        const fileName = getSafeFileName('json');
        triggerDownload(blob, fileName);
        showToast(`Exported as JSON specification (${fileName})!`, 'success');
      }
      setExportMenuOpen(false);
    } catch (err) {
      console.error('Export error:', err);
      showToast('Error exporting file: ' + err.message, 'error');
    }
  };

  // Main Print handler: creates an official formatted printable document window
  const handlePrint = () => {
    if (!patentDraft) {
      showToast('Please generate a patent draft first.', 'error');
      return;
    }

    try {
      showToast('Opening print view for Indian Patent Office Complete Specification...', 'info');

      const printHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Official IPO Patent Draft - ${patentDraft.form_2?.title || 'Complete Specification'}</title>
  <style>
    @page { 
      size: A4 portrait; 
      margin: 20mm; 
      @bottom-right { content: counter(page); }
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body {
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 11.5pt;
      line-height: 1.6;
      color: #111111;
      background: #ffffff;
      margin: 0;
      padding: 20px;
    }
    .print-header {
      text-align: center;
      border-bottom: 2px solid #111;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .print-header h1 {
      font-size: 15pt;
      margin: 0 0 6px 0;
      letter-spacing: 0.5px;
    }
    .print-header p {
      margin: 2px 0;
      font-size: 10pt;
      color: #333;
    }
    .badge {
      display: inline-block;
      font-family: monospace;
      font-weight: bold;
      background: #f0f0f0;
      border: 1px solid #ccc;
      padding: 3px 8px;
      font-size: 9.5pt;
      margin-top: 6px;
    }
    h2.part-title {
      font-size: 13pt;
      background: #f5f5f5;
      border-top: 1px solid #000;
      border-bottom: 1px solid #000;
      padding: 6px 10px;
      margin-top: 28px;
      margin-bottom: 16px;
      text-transform: uppercase;
      page-break-after: avoid;
    }
    h3.section-header {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 6px;
      text-decoration: underline;
      page-break-after: avoid;
    }
    p, li {
      text-align: justify;
      margin-bottom: 10px;
    }
    .table-container {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0 24px 0;
      page-break-inside: avoid;
    }
    .table-container td, .table-container th {
      border: 1px solid #333;
      padding: 8px 12px;
      font-size: 10.5pt;
      vertical-align: top;
    }
    .table-container th {
      background: #f8f8f8;
      width: 32%;
      font-weight: bold;
    }
    .example-box {
      border: 1px solid #888;
      background: #fafafa;
      padding: 10px 14px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .claim-item {
      margin-bottom: 12px;
      text-align: justify;
      page-break-inside: avoid;
    }
    .page-break {
      page-break-before: always;
    }
    .signature-block {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #444;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="print-header">
    <h1>THE PATENTS ACT 1970 (39 OF 1970)<br>&amp; THE PATENTS RULES, 2003</h1>
    <p><strong>INDIAN PATENT OFFICE (IPO) OFFICIAL SPECIFICATION</strong></p>
    <div class="badge">REFERENCE DRAFT ID: ${patentDraft.draft_id || 'IPO-DRAFT-OFFICIAL'}</div>
    <p style="font-size: 9pt; margin-top: 6px; color: #555;">Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
  </div>

  <h2 class="part-title">PART I: FORM 1 — APPLICATION FOR GRANT OF PATENT</h2>
  <table class="table-container">
    <tr><th>Title of the Invention</th><td><strong>${patentDraft.form_1?.title_of_invention || patentDraft.form_2?.title}</strong></td></tr>
    <tr><th>Name of Applicant(s)</th><td>${patentDraft.form_1?.applicant_name || 'Ayurvedic Innovations Lab (India)'}</td></tr>
    <tr><th>True and First Inventor(s)</th><td>${patentDraft.form_1?.inventor_names || 'Dr. V. Sharma & Team'}</td></tr>
    <tr><th>Application Type</th><td>${patentDraft.form_1?.type_of_application || 'Ordinary Application (Complete Specification)'}</td></tr>
    <tr><th>Section 10(4) Biological Resource Declaration</th><td><strong>${patentDraft.form_1?.declaration_biological_resources || 'YES - Biological resources from India'}</strong></td></tr>
    <tr><th>Designated Jurisdiction</th><td>${patentDraft.form_1?.jurisdiction || 'INDIA'}</td></tr>
  </table>

  <div class="page-break"></div>

  <div class="print-header">
    <h1> COMPLETE SPECIFICATION</h1>
    <p>[See section 10 and rule 13]</p>
    <h2 style="font-size: 13pt; margin-top: 10px; color: #000;">${patentDraft.form_2?.title || 'SYNERGISTIC HERBAL FORMULATION'}</h2>
  </div>

  <h3 class="section-header">1. FIELD OF THE INVENTION</h3>
  <p>${patentDraft.form_2?.field_of_invention || ''}</p>

  <h3 class="section-header">2. BACKGROUND OF THE INVENTION AND PRIOR ART (TKDL CITATION BARRIER)</h3>
  <p>${patentDraft.form_2?.background_and_prior_art || ''}</p>

  <h3 class="section-header">3. OBJECTS OF THE INVENTION</h3>
  <ol>
    ${patentDraft.form_2?.objects_of_invention?.map((obj) => `<li>${obj}</li>`).join('') || ''}
  </ol>

  <h3 class="section-header">4. SUMMARY OF THE INVENTION</h3>
  <p>${patentDraft.form_2?.summary_of_invention || ''}</p>

  <h3 class="section-header">5. DETAILED DESCRIPTION OF PREFERRED EMBODIMENTS</h3>
  <p>${patentDraft.form_2?.detailed_description || ''}</p>

  <h3 class="section-header">6. WORKING EXAMPLES (SYNERGISTIC EFFICACY UNDER SECTION 3(d))</h3>
  ${patentDraft.form_2?.working_examples?.map((ex) => `
    <div class="example-box">
      <strong>${ex.example_no}:</strong>
      <p style="margin: 4px 0 0 0;">${ex.finding}</p>
    </div>
  `).join('') || ''}

  <h3 class="section-header">7. CLAIMS</h3>
  <p><strong>WE CLAIM:</strong></p>
  ${patentDraft.form_2?.claims?.map((claim, i) => `
    <div class="claim-item">
      <p>${claim.startsWith(String(i + 1)) ? '' : `<strong>${i + 1}.</strong> `}${claim}</p>
    </div>
  `).join('') || ''}

  <h3 class="section-header">8. ABSTRACT</h3>
  <p>${patentDraft.form_2?.abstract || ''}</p>

  <div class="signature-block">
    <div>
      <p><strong>For Applicant(s):</strong><br>Authorized Signatory &amp; Principal Investigator<br>Ayurvedic Innovations Lab (India)</p>
    </div>
    <div style="text-align: right;">
      <p><strong>Registered Indian Patent Agent:</strong><br>Enrollment: IN/PA/3842<br>Jurisdiction: IPO New Delhi / Mumbai / Chennai / Kolkata</p>
    </div>
  </div>
</body>
</html>`;

      const printWindow = window.open('', '_blank', 'width=900,height=750');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printHtml);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      } else {
        // If popup was blocked, fallback to browser print with @media print CSS
        window.print();
      }
    } catch (e) {
      console.warn('Dedicated print window error, falling back to direct print:', e);
      window.print();
    }
  };

  // Regenerate draft with fallback handling
  const handleRegenerate = async (customData = null) => {
    if (isDrafting) return;
    try {
      const dataToUse = customData || intakeData;
      // If product name is empty, use a curated sample
      const effectiveData = {
        ...dataToUse,
        product_name: dataToUse?.product_name || SAMPLE_FORMULATIONS[0].name,
        herbs: dataToUse?.herbs || SAMPLE_FORMULATIONS[0].herbs,
        core_objective: dataToUse?.core_objective || SAMPLE_FORMULATIONS[0].objective,
        product_type: dataToUse?.product_type || SAMPLE_FORMULATIONS[0].type
      };

      if (setIntakeData && !intakeData?.product_name) {
        setIntakeData(prev => ({
          ...prev,
          product_name: effectiveData.product_name,
          herbs: effectiveData.herbs,
          core_objective: effectiveData.core_objective,
          product_type: effectiveData.product_type
        }));
      }

      showToast('Generating official patent draft specification...', 'info');
      const res = await onGenerateDraft(effectiveData);
      showToast(`Patent draft regenerated successfully! (Ref: ${res?.draft_id || patentDraft?.draft_id || 'IPO-DRAFT'})`, 'success');
    } catch (err) {
      console.error('Draft generation error:', err);
      showToast('Error regenerating draft: ' + (err.message || 'Please check connection'), 'error');
    }
  };

  // Quick load sample formulation
  const handleLoadSample = (sample) => {
    if (setIntakeData) {
      setIntakeData(prev => ({
        ...prev,
        product_name: sample.name,
        herbs: sample.herbs,
        core_objective: sample.objective,
        product_type: sample.type
      }));
    }
    handleRegenerate(sample);
  };

  return (
    <div className="application-assistance-page">
      {/* Toast Notification Banner */}
      {toast.visible && (
        <div className={`app-toast toast-${toast.type}`}>
          {toast.type === 'success' && <CheckCircle2 size={16} />}
          {toast.type === 'error' && <AlertCircle size={16} />}
          {toast.type === 'info' && <RefreshCw size={16} className={isDrafting ? 'spinner-icon' : ''} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="section-header-banner">
        <div className="banner-text">
          <h2>Patent Application Generator</h2>
          <p>
            Converts user-provided formulation and synergy details into official Indian Patent Office (IPO)
          </p>
        </div>

        <div className="banner-toolbar">

          {/* Export File Button with Multi-format Dropdown */}
          <div className="export-dropdown-wrapper" ref={exportRef}>
            <div className="btn-toolbar-group">
              <button
                className="btn-toolbar btn-export-main"
                onClick={() => handleDownload('doc')}
                disabled={!patentDraft || isDrafting}
                title="Download formatted Microsoft Word specification"
              >
                <Download size={15} /> Export File
              </button>
              <button
                className="btn-toolbar-arrow"
                onClick={() => setExportMenuOpen(prev => !prev)}
                disabled={!patentDraft || isDrafting}
                title="Select export format"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            {exportMenuOpen && patentDraft && (
              <div className="export-menu-popover">
                <div className="menu-header">SELECT EXPORT FORMAT</div>
                <button className="menu-item" onClick={() => handleDownload('doc')}>
                  <FileText size={15} className="item-icon icon-blue" />
                  <div className="item-text">
                    <strong>Word Document (.doc)</strong>
                    <span>IPO formal margins, tables &amp; font</span>
                  </div>
                </button>
                <button className="menu-item" onClick={() => handleDownload('txt')}>
                  <FileText size={15} className="item-icon icon-green" />
                  <div className="item-text">
                    <strong>Plain Text (.txt)</strong>
                    <span>Standard text for IPO e-filing portal</span>
                  </div>
                </button>
                <button className="menu-item" onClick={() => handleDownload('md')}>
                  <FileCode size={15} className="item-icon icon-purple" />
                  <div className="item-text">
                    <strong>Markdown (.md)</strong>
                    <span>Clean document for legal review &amp; git</span>
                  </div>
                </button>
                <button className="menu-item" onClick={() => handleDownload('json')}>
                  <FileSpreadsheet size={15} className="item-icon icon-orange" />
                  <div className="item-text">
                    <strong>JSON Data (.json)</strong>
                    <span>Raw codified Form 1 &amp; Form 2 data</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Print Draft Button */}
          <button
            className="btn-toolbar btn-print"
            onClick={handlePrint}
            disabled={!patentDraft || isDrafting}
            title="Open printable official IPO patent document"
          >
            <Printer size={15} /> Print Draft
          </button>
        </div>
      </div>

      {!patentDraft ? (
        <div className="empty-draft-prompt">
          <FileText size={44} className="muted-icon" />
          <h3>No Patent Draft Generated Yet</h3>
          <p>
            You can generate an official Indian Patent Office Complete Specification immediately. Select a curated botanical formulation below or click generate to draft using default parameters.
          </p>

          <div className="sample-chips-row">
            <span className="chips-label">Quick-Fill Formulation:</span>
            {SAMPLE_FORMULATIONS.map((sample, idx) => (
              <button
                key={idx}
                className="sample-chip-btn"
                onClick={() => handleLoadSample(sample)}
                disabled={isDrafting}
              >
                <Sparkles size={13} /> {sample.name.split(' ')[0]} {sample.name.split(' ')[1]}
              </button>
            ))}
          </div>

          <button
            className="btn-primary btn-generate-empty"
            onClick={() => handleRegenerate()}
            disabled={isDrafting}
          >
            {isDrafting ? <RefreshCw size={16} className="spinner-icon" /> : <Sparkles size={16} />}
            {isDrafting ? 'Drafting Specification...' : `Generate Draft for "${intakeData?.product_name || 'CurcuShield Formulation'}"`}
          </button>
        </div>
      ) : (
        <div className="draft-workspace">
          {/* Sub-Tabs: Form 2 vs Form 1 vs Combined View */}
          <div className="form-subtabs">
            <button
              className={`subtab-btn ${activeFormTab === 'form2' ? 'active' : ''}`}
              onClick={() => setActiveFormTab('form2')}
            >
              <FileText size={16} />  Complete Specification &amp; Claims
            </button>
            <button
              className={`subtab-btn ${activeFormTab === 'form1' ? 'active' : ''}`}
              onClick={() => setActiveFormTab('form1')}
            >
              <Layers size={16} />  Application for Grant of Patent
            </button>
            <button
              className={`subtab-btn ${activeFormTab === 'combined' ? 'active' : ''}`}
              onClick={() => setActiveFormTab('combined')}
            >
              <FileCheck size={16} /> Full Official Consolidated Draft
            </button>
          </div>

          {/* Form 2 Complete Specification View */}
          {(activeFormTab === 'form2' || activeFormTab === 'combined') && (
            <div className="patent-document-viewer print-section-form2">
              <div className="doc-meta-header">
                <div>
                  <span className="doc-number">DRAFT REF: {patentDraft.draft_id}</span>
                </div>
                <button
                  className="copy-chip"
                  onClick={() => handleCopy(JSON.stringify(patentDraft.form_2, null, 2), 'Form 2 Specification')}
                >
                  {copiedSection === 'Form 2 Specification' ? <Check size={14} /> : <Copy size={14} />}
                  {copiedSection === 'Form 2 Specification' ? 'Copied Full Spec!' : 'Copy Form 2'}
                </button>
              </div>

              {/* Title Section */}
              <div className="spec-section title-box">
                <span className="section-label">TITLE OF THE INVENTION</span>
                <h3 className="spec-title-text">{patentDraft.form_2?.title}</h3>
              </div>

              {/* Field of Invention */}
              <div className="spec-section">
                <div className="section-title-row">
                  <h4>1. FIELD OF THE INVENTION</h4>
                  <button
                    className="copy-btn-mini"
                    onClick={() => handleCopy(patentDraft.form_2?.field_of_invention, 'Field of Invention')}
                  >
                    {copiedSection === 'Field of Invention' ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
                <p className="spec-paragraph">{patentDraft.form_2?.field_of_invention}</p>
              </div>

              {/* Background and Prior Art */}
              <div className="spec-section">
                <div className="section-title-row">
                  <h4>2. BACKGROUND AND PRIOR ART (TKDL CITATION BARRIER)</h4>
                  <button
                    className="copy-btn-mini"
                    onClick={() => handleCopy(patentDraft.form_2?.background_and_prior_art, 'Background & Prior Art')}
                  >
                    {copiedSection === 'Background & Prior Art' ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
                <p className="spec-paragraph">{patentDraft.form_2?.background_and_prior_art}</p>
                <div className="legal-callout">
                  <ShieldAlert size={16} />
                  <span>
                    <strong>Statutory Shield:</strong> Draft specifically disclaims classical generic mixtures under Section 3(p) and establishes unexpected synergy under Section 3(d).
                  </span>
                </div>
              </div>

              {/* Objects of Invention */}
              <div className="spec-section">
                <div className="section-title-row">
                  <h4>3. OBJECTS OF THE INVENTION</h4>
                </div>
                <ul className="spec-list">
                  {patentDraft.form_2?.objects_of_invention?.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>

              {/* Summary */}
              <div className="spec-section">
                <div className="section-title-row">
                  <h4>4. SUMMARY OF THE INVENTION</h4>
                </div>
                <p className="spec-paragraph">{patentDraft.form_2?.summary_of_invention}</p>
              </div>

              {/* Detailed Description */}
              <div className="spec-section">
                <div className="section-title-row">
                  <h4>5. DETAILED DESCRIPTION OF EMBODIMENTS</h4>
                </div>
                <p className="spec-paragraph">{patentDraft.form_2?.detailed_description}</p>
              </div>

              {/* Working Examples */}
              <div className="spec-section">
                <div className="section-title-row">
                  <h4>6. WORKING EXAMPLES (COMPARATIVE SYNERGY VALIDATION)</h4>
                </div>
                <div className="examples-deck">
                  {patentDraft.form_2?.working_examples?.map((ex, i) => (
                    <div key={i} className="example-card">
                      <span className="ex-badge">{ex.example_no}</span>
                      <p className="ex-text">{ex.finding}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Claims Section */}
              <h4>7. CLAIMS (INDEPENDENT &amp; DEPENDENT DRAFT)</h4>
              <div className="spec-section claims-box">

                <div className="section-title-row">

                  <button
                    className="copy-btn-mini"
                    onClick={() => handleCopy(patentDraft.form_2?.claims?.join('\n\n'), 'Claims')}
                  >
                    {copiedSection === 'Claims' ? <Check size={13} /> : <Copy size={13} />} Copy Claims
                  </button>
                </div>
                <div className="claims-list">
                  {patentDraft.form_2?.claims?.map((claim, i) => (
                    <div key={i} className="claim-item">
                      <p>{claim}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Abstract */}
              <div className="spec-section abstract-box">
                <div className="section-title-row">
                  <h4>8. CONCLUSION (&lt; 150 WORDS)</h4>
                  <button
                    className="copy-btn-mini"
                    onClick={() => handleCopy(patentDraft.form_2?.abstract, 'Abstract')}
                  >
                    {copiedSection === 'Abstract' ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
                <p className="spec-paragraph">{patentDraft.form_2?.abstract}</p>
              </div>
            </div>
          )}

          {/* Form 1 Application for Grant View */}
          {(activeFormTab === 'form1' || activeFormTab === 'combined') && (
            <div className="patent-document-viewer print-section-form1" style={activeFormTab === 'combined' ? { marginTop: '24px' } : {}}>
              <div className="doc-meta-header">
                <div>
                  <span className="doc-number">FORM 1 RECORD</span>
                  <span className="doc-status">APPLICATION FOR GRANT OF PATENT</span>
                </div>
                <button
                  className="copy-chip"
                  onClick={() => handleCopy(JSON.stringify(patentDraft.form_1, null, 2), 'Form 1 Record')}
                >
                  {copiedSection === 'Form 1 Record' ? <Check size={14} /> : <Copy size={14} />}
                  {copiedSection === 'Form 1 Record' ? 'Copied Form 1!' : 'Copy Form 1'}
                </button>
              </div>

              <div className="form-1-fields-table">
                <div className="table-row">
                  <span className="row-label">Form Title:</span>
                  <span className="row-val font-semibold">{patentDraft.form_1?.form_title}</span>
                </div>
                <div className="table-row">
                  <span className="row-label">Applicant Name &amp; Address:</span>
                  <span className="row-val">{patentDraft.form_1?.applicant_name}</span>
                </div>
                <div className="table-row">
                  <span className="row-label">True &amp; First Inventors:</span>
                  <span className="row-val">{patentDraft.form_1?.inventor_names}</span>
                </div>
                <div className="table-row">
                  <span className="row-label">Title of Invention:</span>
                  <span className="row-val">{patentDraft.form_1?.title_of_invention}</span>
                </div>
                <div className="table-row">
                  <span className="row-label">Application Type:</span>
                  <span className="row-val">{patentDraft.form_1?.type_of_application}</span>
                </div>
                <div className="table-row">
                  <span className="row-label">Section 10(4) Biological Resource Declaration:</span>
                  <span className="row-val highlight-green">{patentDraft.form_1?.declaration_biological_resources}</span>
                </div>
                <div className="table-row">
                  <span className="row-label">Designated Jurisdiction:</span>
                  <span className="row-val">{patentDraft.form_1?.jurisdiction}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
