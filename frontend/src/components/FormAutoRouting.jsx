import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  ExternalLink, 
  Calculator, 
  Building, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Layers,
  ArrowUpRight,
  RefreshCw,
  Database
} from 'lucide-react';

export default function FormAutoRouting({ intakeData }) {
  const [applicantType, setApplicantType] = useState('startup'); // 'startup' or 'large'
  const [selectedOptionalForms, setSelectedOptionalForms] = useState({
    'Form 9': true,
    'Form 18A': true
  });
  const [formsData, setFormsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/api/forms-routing`);
      const data = await res.json();
      if (data.forms && data.forms.length > 0) {
        setFormsData(data.forms);
      }
    } catch (e) {
      console.warn('Failed to load forms routing from database:', e);
    }
    setLoading(false);
  };

  const toggleOptionalForm = (formId) => {
    setSelectedOptionalForms(prev => ({ ...prev, [formId]: !prev[formId] }));
  };

  // Compute total fees directly from database forms
  const computeTotal = () => {
    let total = 0;
    formsData.forEach(f => {
      const isIncluded = f.mandatory || selectedOptionalForms[f.form_id];
      if (isIncluded) {
        const fee = applicantType === 'startup' ? f.fee_startup_msme : f.fee_large_entity;
        total += fee;
      }
    });
    return total;
  };

  return (
    <div className="form-routing-page">
      {/* Top Banner */}
      <div className="section-header-banner">
        <div className="banner-text">
          <h2>Statutory Form Routing & Fee Optimization</h2>
          <p>
            Directs applicants to the precise official forms, filing deadlines, government fees, and official filing portals required for your Ayurvedic innovation.
          </p>
        </div>

        {/* Fee Summary Widget */}
        <div className="fee-summary-widget">
          <div className="widget-header">
            <Calculator size={16} />
            <span>ESTIMATED STATUTORY FEES</span>
          </div>
          <div className="total-fee-amount">
            ₹{computeTotal().toLocaleString('en-IN')}
          </div>
          <div className="entity-toggle-group">
            <button 
              className={`toggle-btn ${applicantType === 'startup' ? 'selected' : ''}`}
              onClick={() => setApplicantType('startup')}
            >
              <User size={13} /> Natural Person / Startup / MSME (80% Waiver)
            </button>
            <button 
              className={`toggle-btn ${applicantType === 'large' ? 'selected' : ''}`}
              onClick={() => setApplicantType('large')}
            >
              <Building size={13} /> Large Corporate Entity
            </button>
          </div>
        </div>
      </div>

      {/* Official Portals Quick Launch Deck */}
      <div className="portals-deck">
        <div className="portal-card">
          <div className="portal-icon-box">🏛️</div>
          <div className="portal-info">
            <h4>Indian Patent Office (IPO)</h4>
            <p>Official e-filing portal for Form 1, Form 2, and Form 18A</p>
          </div>
          <a 
            href="https://ipindiaonline.gov.in/epatentfiling/goForLogin/doLogin" 
            target="_blank" 
            rel="noopener noreferrer"
            className="portal-link-btn"
          >
            Launch Portal <ArrowUpRight size={14} />
          </a>
        </div>

        <div className="portal-card">
          <div className="portal-icon-box">🌿</div>
          <div className="portal-info">
            <h4>National Biodiversity Authority (NBA)</h4>
            <p>Mandatory portal for Section 6 Form I ABS approval before patent grant</p>
          </div>
          <a 
            href="http://nbaindia.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="portal-link-btn"
          >
            Launch Portal <ArrowUpRight size={14} />
          </a>
        </div>

        <div className="portal-card">
          <div className="portal-icon-box">💊</div>
          <div className="portal-info">
            <h4>Ministry of AYUSH (Sugam)</h4>
            <p>Form 25D manufacturing licenses and classical formulation approvals</p>
          </div>
          <a 
            href="https://e-ayush.gov.in/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="portal-link-btn"
          >
            Launch Portal <ArrowUpRight size={14} />
          </a>
        </div>

        <div className="portal-card">
          <div className="portal-icon-box">🌐</div>
          <div className="portal-info">
            <h4>WIPO ePCT Global Portal</h4>
            <p>International PCT filing preserving 30/31-month worldwide priority</p>
          </div>
          <a 
            href="https://pct.wipo.int/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="portal-link-btn"
          >
            Launch Portal <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* Forms Routing Matrix */}
      <div className="forms-table-card">
        <div className="card-top-header">
          <div>
            <h3>Statutory Forms Matrix & Routing Schedule</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <Database size={13} style={{ color: 'var(--accent-emerald)' }} />
              Stored Records: <strong>{formsData.length} forms</strong>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={fetchForms} 
              disabled={loading}
              className="refresh-btn"
              title="Refresh from database"
              style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 8px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} /> Refresh
            </button>
            <span className="badge-pill green">CURRENT INTAKE: {intakeData.product_name || 'Generic Formulation'}</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="forms-data-table">
            <thead>
              <tr>
                <th>Statutory Form</th>
                <th>Official Purpose & Description</th>
                <th>Authority</th>
                <th>Statutory Deadline</th>
                <th>Govt Fee (₹)</th>
                <th>Inclusion</th>
              </tr>
            </thead>
            <tbody>
              {formsData.map((form) => {
                const fee = applicantType === 'startup' ? form.fee_startup_msme : form.fee_large_entity;
                const isSelected = form.mandatory || selectedOptionalForms[form.form_id];

                return (
                  <tr key={form.form_id} className={isSelected ? 'row-selected' : 'row-muted'}>
                    <td className="form-name-cell">
                      <div className="form-tag">{form.form_id}</div>
                      <div className="form-full-title">{form.name}</div>
                    </td>
                    <td className="desc-cell">
                      <p>{form.description}</p>
                    </td>
                    <td className="auth-cell">
                      <span className="auth-badge">{form.authority}</span>
                    </td>
                    <td className="deadline-cell">
                      <Clock size={13} /> {form.deadline}
                    </td>
                    <td className="fee-cell">
                      <strong>₹{fee.toLocaleString('en-IN')}</strong>
                      {form.fee_natural_person !== form.fee_large_entity && (
                        <div className="fee-discount-tag">
                          {applicantType === 'startup' ? '80% Startup Waiver' : 'Standard Rate'}
                        </div>
                      )}
                    </td>
                    <td className="action-cell">
                      {form.mandatory ? (
                        <span className="mandatory-badge">
                          <CheckCircle size={13} /> Mandatory
                        </span>
                      ) : (
                        <button 
                          className={`toggle-include-btn ${isSelected ? 'included' : ''}`}
                          onClick={() => toggleOptionalForm(form.form_id)}
                        >
                          {isSelected ? 'Included' : '+ Add'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
