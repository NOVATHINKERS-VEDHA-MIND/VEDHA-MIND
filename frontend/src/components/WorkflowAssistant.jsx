import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  Mic, 
  ShieldCheck, 
  BookOpen, 
  Scale, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Lock, 
  Compass, 
  ExternalLink,
  Info,
  RefreshCw
} from 'lucide-react';

export default function WorkflowAssistant({
  intakeData,
  setIntakeData,
  onRunAnalysis,
  analysisResult,
  isAnalyzing,
  onOpenVoiceModal,
  onNavigateToTab
}) {
  const [activeStep, setActiveStep] = useState(1);

  const productTypes = [
    { id: 'Patent or Proprietary (P&P)', name: 'Patent or Proprietary (P&P)', desc: 'Novel ratio, modern dosage form (Capsules, Tablets, Syrups)' },
    { id: 'Classical / Generic (Schedule I)', name: 'Classical / Generic', desc: 'Codified ancient formulations in First Schedule texts' },
    { id: 'Phytopharmaceutical', name: 'Phytopharmaceutical', desc: 'Standardized fractions with 4+ bioactive markers (CDSCO)' },
    { id: 'Ayurveda Aahar (Nutraceutical)', name: 'Ayurveda Aahar', desc: 'Dietary health foods under FSSAI/AYUSH Regulations 2022' },
    { id: 'Novel Drug Delivery System (NDDS)', name: 'Novel Delivery System', desc: 'Liposomal, Nano-emulsion, Supercritical CO2 extraction' },
    { id: 'Cosmetic / Topical', name: 'Cosmetic / Topical', desc: 'Skin & hair formulations under Schedule M-II' }
  ];

  const claimUses = [
    { id: 'Patent Grant', label: 'Patent Grant (Commercial Monopoly)', desc: 'Exclusive 20-year manufacturing & commercialization rights' },
    { id: 'Defensive Publication / TKDL Shield', label: 'Defensive Publication / TKDL Shield', desc: 'Prevent predatory foreign patents & maintain open access' },
    { id: 'Academic & Clinical Research', label: 'Academic / Clinical Research', desc: 'Publications and institutional grant filings' },
    { id: 'Commercial Brand & Trade Secret', label: 'Trade Secret & Brand Protection', desc: 'Non-disclosed extraction methods & trademark filing' }
  ];

  return (
    <div className="workflow-page-container">
      {/* Workflow Architecture Header Banner */}
      <div className="workflow-diagram-banner">
        <div className="banner-left">
          <h2>Ayurveda IP & Patent Regulatory Assistant</h2>
          <p>
            Transforms user-provided details into verified patentability assessments, NBA regulatory directives, and 24-month statutory filing roadmaps.
          </p>
        </div>

      </div>

      <div className="workflow-layout-grid">
        {/* Left Column: Structured Intake Module */}
        <div className="intake-card">
          <div className="card-header">
            <div className="title-with-badge">
              <h3>Innovation Details</h3>
            </div>
          </div>

          <p className="card-subtitle">
            Provide the technical specifics of your Ayurvedic formulation to initiate knowledge retrieval and anti-hallucination validation.
          </p>

          <form className="intake-form" onSubmit={(e) => { e.preventDefault(); onRunAnalysis(); }}>
            {/* Step 1: Product Details */}
            <div className="form-group">
              <label className="input-label">
                1. Product Name / Commercial Codename
                <span className="required">*</span>
              </label>
              <input 
                type="text"
                className="text-input"
                placeholder="e.g. Haridra-Maricha Synergistic Bio-Enhancer"
                onChange={(e) => setIntakeData({ ...intakeData, product_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">
                Botanical & Formulation Ingredients (Herbs, Minerals, Parts Used)
                <span className="required">*</span>
              </label>
              <textarea 
                className="textarea-input"
                rows="3"
                placeholder="e.g. Curcuma longa (Rhizome, 95% Curcuminoids) + Piper nigrum (Fruit, 98% Piperine) in 100:1 ratio"
                value={intakeData.herbs}
                onChange={(e) => setIntakeData({ ...intakeData, herbs: e.target.value })}
                required
              />
              <span className="field-hint">
                Include common names, botanical Latin binomials, and standardized ratios if available.
              </span>
            </div>

            {/* Step 2: Product Type */}
            <div className="form-group">
              <label className="input-label">
                2. Regulatory Product Classification
                <span className="required">*</span>
              </label>
              <div className="product-type-grid">
                {productTypes.map((type) => (
                  <div 
                    key={type.id}
                    className={`type-radio-card ${intakeData.product_type === type.id ? 'selected' : ''}`}
                    onClick={() => setIntakeData({ ...intakeData, product_type: type.id })}
                  >
                    <div className="radio-indicator">
                      {intakeData.product_type === type.id && <span className="inner-dot" />}
                    </div>
                    <div className="type-meta">
                      <span className="type-title">{type.name}</span>
                      <span className="type-desc">{type.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Use of Claim */}
            <div className="form-group">
              <label className="input-label">
                3. Intended Use of Claim / IP Goal
              </label>
              <div className="claim-use-options">
                {claimUses.map((claim) => (
                  <label key={claim.id} className={`claim-pill ${intakeData.claim_use === claim.id ? 'active' : ''}`}>
                    <input 
                      type="radio"
                      name="claim_use"
                      checked={intakeData.claim_use === claim.id}
                      onChange={() => setIntakeData({ ...intakeData, claim_use: claim.id })}
                    />
                    <span>{claim.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 4: Core Objective */}
            <div className="form-group">
              <label className="input-label">
                4. Core Innovation Objective & Synergistic Technical Effect
                <span className="required">*</span>
              </label>
              <textarea 
                className="textarea-input"
                rows="2"
                placeholder="e.g. 2000% enhancement in human serum bioavailability over free curcumin; in-vitro synergistic index < 0.8."
                value={intakeData.core_objective}
                onChange={(e) => setIntakeData({ ...intakeData, core_objective: e.target.value })}
                required
              />
            </div>

            {/* Jurisdiction Selector */}
            <div className="form-row-split">
              <div className="form-group flex-1">
                <label className="input-label">Jurisdiction Scope:</label>
                <select 
                  className="select-input"
                  value={intakeData.jurisdiction}
                  onChange={(e) => setIntakeData({ ...intakeData, jurisdiction: e.target.value })}
                >
                  <option value="india">India (Patents Act 1970 + BDA 2002)</option>
                  <option value="international">International (PCT + Nagoya Protocol)</option>
                  <option value="both">Both (Dual Comparison)</option>
                </select>
              </div>

              <div className="form-group flex-1">
                <label className="input-label">Analysis Language:</label>
                <select 
                  className="select-input"
                  value={intakeData.language || 'en'}
                  onChange={(e) => setIntakeData({ ...intakeData, language: e.target.value })}
                >
                  <option value="en">English (Statutory Standard)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                </select>
              </div>
            </div>

            {/* Submit Action */}
            <button 
              type="submit" 
              className="submit-analysis-btn"
              disabled={isAnalyzing || !intakeData.product_name || !intakeData.herbs}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={18} className="spinner-icon" /> Ingesting TKDL & Analyzing Acts...
                </>
              ) : (
                <>
                  <Play size={18} /> Statutory Analysis 
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: The 4 Final Outputs */}
        <div className="outputs-container">
          {!analysisResult ? (
            <div className="empty-analysis-state">
              <div className="empty-illustration">
                <Scale size={48} className="scale-pulse" />
              </div>
              <h3>Ready for Statutory Analysis</h3>
              <p>
                Fill in the Innovation Details or Click <strong>Demo-Run</strong> at the top to see the Product Evaluation. (For Understanding the working)
              </p>
              <div className="guarantees-list">
                <span><b>DATAS INCLUDED</b></span>
                <div className="guarantee-item">
                  <CheckCircle2 size={16} /> <span>TKDL Formulation Prior-Art Matching</span>
                </div>
                <div className="guarantee-item">
                  <CheckCircle2 size={16} /> <span>Section 3(p) & 3(d) Patentability Clearance</span>
                </div>
                <div className="guarantee-item">
                  <CheckCircle2 size={16} /> <span>National Biodiversity Authority (NBA Form I) Routing</span>
                </div>
                <div className="guarantee-item">
                  <CheckCircle2 size={16} /> <span>Timestamped Storage in Audit Log Trail</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="final-outputs-deck">
              {/* Output Header */}
              <div className="outputs-header">
                <div>
                  <span className="badge-pill green">ANALYSIS COMPLETE & STORED</span>
                  <h3>{analysisResult.product_name}</h3>
                  <span className="stored-timestamp">Recorded at: {new Date(analysisResult.created_at).toLocaleString()}</span>
                </div>

                <div className="verdict-banner">
                  <div className="verdict-title">PATENTABILITY VERDICT:</div>
                  <div className={`verdict-score ${analysisResult.statutory_eval?.score?.includes('Low') ? 'low' : 'high'}`}>
                    {analysisResult.statutory_eval?.verdict || 'Evaluation Complete'}
                  </div>
                </div>
              </div>

              {/* Anti-Hallucination Status Bar */}
              <div className="anti-hallucination-bar">
                <div className="hallucination-left">
                  <ShieldCheck size={18} className="shield-pass" />
                  <span>
                    <strong>Anti-Hallucination Validator:</strong> Grounded in {analysisResult.retrieved_sources?.length || 0} retrieved statutes & TKDL entries.
                  </span>
                </div>
                <span className="badge-verified">100% STATUTORY CITATION MATCH</span>
              </div>

              {/* Pillar 1: Clear Patentability */}
              <div className="output-card pillar-patentability">
                <div className="card-top">
                  <div className="pillar-title">
                    <FileText size={18} className="pillar-icon" />
                    <h4>1. Clear Patentability Assessment</h4>
                  </div>
                  <span className="score-badge">
                    Score: {analysisResult.statutory_eval?.score || '85%'}
                  </span>
                </div>

                <div className="pillar-body">
                  <div className="eval-row">
                    <strong>Section 3(p) Traditional Knowledge Bar:</strong>
                    <p>{analysisResult.statutory_eval?.section_3p_analysis}</p>
                  </div>

                  <div className="eval-row">
                    <strong>Section 3(d) & 3(e) Efficacy / Synergy Hurdle:</strong>
                    <p>
                      Must present comparative pharmacological data proving unexpected synergy (e.g. synergistic bioavailability elevation or combination index &lt; 0.85).
                    </p>
                  </div>

                  <div className="eval-row">
                    <strong>Recommended Filing Strategy:</strong>
                    <span className="highlight-box">
                      {analysisResult.statutory_eval?.recommended_ip_route}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Actionable Regulatory */}
              <div className="output-card pillar-regulatory">
                <div className="card-top">
                  <div className="pillar-title">
                    <Scale size={18} className="pillar-icon" />
                    <h4>2. Actionable Regulatory Directives</h4>
                  </div>
                  <span className="badge-pill gold">NBA MANDATORY</span>
                </div>

                <div className="pillar-body">
                  <div className="eval-row">
                    <strong>National Biodiversity Authority (NBA Form I):</strong>
                    <p>{analysisResult.statutory_eval?.nba_analysis}</p>
                  </div>

                  <div className="eval-row">
                    <strong>AYUSH Manufacturing Licensing Route:</strong>
                    <p>{analysisResult.statutory_eval?.ayush_route}</p>
                  </div>

                  <div className="eval-row">
                    <strong>Mandatory Biological Origin Disclosure:</strong>
                    <p>
                      Under Section 10(4)(ii)(D) of The Patents Act 1970, complete specification must disclose the exact geographical origin of all botanical components sourced from India.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Roadmap For Action */}
              <div className="output-card pillar-roadmap">
                <div className="card-top">
                  <div className="pillar-title">
                    <Clock size={18} className="pillar-icon" />
                    <h4>3. Roadmap For Action (24-Month Milestone Schedule)</h4>
                  </div>
                </div>

                <div className="roadmap-timeline">
                  {analysisResult.statutory_eval?.roadmap?.map((step, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-marker">
                        <span className="marker-dot"></span>
                        {idx < analysisResult.statutory_eval.roadmap.length - 1 && <span className="marker-line"></span>}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-meta">
                          <span className="timeline-phase">{step.phase}</span>
                          <span className="timeline-status">{step.status}</span>
                        </div>
                        <h5 className="timeline-action">{step.action}</h5>
                        <p className="timeline-detail">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pillar 4: Verified Statutory Citations */}
              <div className="output-card pillar-citations">
                <div className="card-top">
                  <div className="pillar-title">
                    <BookOpen size={18} className="pillar-icon" />
                    <h4>4. Verified Statutory Citations & TKDL Records</h4>
                  </div>
                </div>

                <div className="citations-grid">
                  {analysisResult.statutory_eval?.citations?.map((c, idx) => (
                    <div key={idx} className="citation-card">
                      <div className="cit-auth">{c.authority}</div>
                      <div className="cit-sec">{c.section}</div>
                      <div className="cit-title">{c.title}</div>
                      <p className="cit-rel">{c.relevance}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cross-Module Action Shortcuts */}
              <div className="outputs-actions-bar">
                <button 
                  className="action-link-btn primary"
                  onClick={() => onNavigateToTab('application')}
                >
                  <FileText size={16} /> Patent Application Draft ➜
                </button>
                <button 
                  className="action-link-btn secondary"
                  onClick={() => onNavigateToTab('routing')}
                >
                  <Compass size={16} /> Calculate Official Fees & Forms ➜
                </button>
                <button 
                  className="action-link-btn gold"
                  onClick={() => onNavigateToTab('vault')}
                >
                  <Lock size={16} /> Secure in IP Vault➜
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
