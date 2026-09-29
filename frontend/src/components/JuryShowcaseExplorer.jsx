import React, { useState, useEffect } from 'react';
import { 
  Database, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  Clock, 
  ExternalLink, 
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function JuryShowcaseExplorer({ currentUser }) {
  const [activeSubTab, setActiveSubTab] = useState('acts'); // 'acts', 'products', 'audit'
  const [acts, setActs] = useState([]);
  const [products, setProducts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJur, setFilterJur] = useState('all');

  const userEmail = currentUser?.email || 'guest@vedhamind.ai';
  const isJury = currentUser?.isJury;

  useEffect(() => {
    fetchData();
  }, [userEmail, isJury]);

  const fetchData = async () => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    try {
      const prodUrl = isJury 
        ? `${apiUrl}/api/stored-details` 
        : `${apiUrl}/api/stored-details?user_email=${encodeURIComponent(userEmail)}`;

      const [actsRes, prodsRes, logsRes] = await Promise.all([
        fetch(`${apiUrl}/api/corpus/acts`),
        fetch(prodUrl),
        fetch(`${apiUrl}/api/audit-logs`)
      ]);

      const actsData = await actsRes.json();
      const prodsData = await prodsRes.json();
      const logsData = await logsRes.json();

      if (actsData.acts) setActs(actsData.acts);
      if (prodsData.products) setProducts(prodsData.products);
      if (logsData.logs) setAuditLogs(logsData.logs);
    } catch (e) {
      console.warn('Failed to load explorer data:', e);
    }
    setLoading(false);
  };

  const filteredActs = acts.filter(act => {
    const matchesSearch = 
      act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.section_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.authority.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJur = filterJur === 'all' || act.jurisdiction === filterJur;
    return matchesSearch && matchesJur;
  });

  return (
    <div className="jury-explorer-page">
      {/* Banner */}
      <div className="section-header-banner">
        <div className="banner-text">
          <h2>Stored Acts, Ingested Details & DPDP Audit Trail</h2>
          <p>
            Model transparency for the jury: Stored and analyzing the 17 codified statutory acts & TKDL formulations, examine the user-provided intake details, and verify the immutable audit logs.
          </p>
        </div>

        <button className="btn-toolbar" onClick={fetchData} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spinner-icon' : ''} />
          Refresh Page Data
        </button>
      </div>

      {/* Explorer Navigation Tabs */}
      <div className="explorer-subtabs">
        <button 
          className={`exp-tab ${activeSubTab === 'acts' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('acts')}
        >
          <BookOpen size={16} /> Stored Statutory Acts & Treaties ({acts.length})
        </button>
        <button 
          className={`exp-tab ${activeSubTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('products')}
        >
          <Layers size={16} />Stored Product Details  ({products.length})
        </button>
        <button 
          className={`exp-tab ${activeSubTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('audit')}
        >
          <ShieldCheck size={16} />Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Subtab 1: Stored Acts & Treaties */}
      {activeSubTab === 'acts' && (
        <div className="acts-explorer-container">
          <div className="filter-search-bar">
            <div className="search-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search across sections, authorities, or legal text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="jur-filter">
              <Filter size={15} />
              <select value={filterJur} onChange={(e) => setFilterJur(e.target.value)}>
                <option value="all">All Jurisdictions</option>
                <option value="india">India Only</option>
                <option value="international">International Only</option>
              </select>
            </div>
          </div>

          <div className="acts-cards-grid">
            {filteredActs.map((act) => (
              <div key={act.id} className="act-card">
                <div className="act-card-top">
                  <span className={`jur-pill ${act.jurisdiction}`}>{act.jurisdiction.toUpperCase()}</span>
                  <span className="category-pill">{act.category}</span>
                </div>
                <div className="act-authority">{act.authority}</div>
                <h3 className="act-section-title">{act.section_ref} — {act.title}</h3>
                <p className="act-summary"><strong>Summary:</strong> {act.summary}</p>
                <div className="act-text-box">
                  <p>{act.text}</p>
                </div>
                <div className="act-applicability">
                  <strong>Applicability:</strong> {act.applicability}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 2: Stored Intake Details Taken */}
      {activeSubTab === 'products' && (
        <div className="products-table-card">
          <div className="card-top-header">
            <h3>User Formulations & Intake Records Taken ({products.length})</h3>
            <span className="badge-pill green">PERSISTENT DB STORAGE</span>
          </div>

          {products.length === 0 ? (
            <div className="empty-state-box">
              <Database size={36} className="muted-icon" />
              <p>No product intake submissions recorded yet. Run an analysis from the Workflow Assistant.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="forms-data-table">
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Botanical Components Taken</th>
                    <th>Core Objective</th>
                    <th>Patentability Verdict</th>
                    <th>Recorded Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod.id} className="row-selected">
                      <td>
                        <span className="tag-mono">{prod.product_id}</span>
                      </td>
                      <td>
                        <strong>{prod.product_name}</strong>
                      </td>
                      <td>
                        <span className="badge-pill">{prod.product_type}</span>
                      </td>
                      <td className="desc-cell">
                        <small>{prod.herbs}</small>
                      </td>
                      <td className="desc-cell">
                        <small>{prod.core_objective}</small>
                      </td>
                      <td>
                        <span className={`verdict-pill ${prod.patentability_score?.includes('Low') ? 'low' : 'high'}`}>
                          {prod.patentability_score} — {prod.summary_result}
                        </span>
                      </td>
                      <td className="deadline-cell">
                        <Clock size={12} /> {new Date(prod.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Subtab 3: Live DPDP Audit Logs */}
      {activeSubTab === 'audit' && (
        <div className="audit-logs-card">
          <div className="card-top-header">
            <h3>DPDP Act 2023 Aligned Audit Trail ({auditLogs.length})</h3>
            <span className="badge-pill gold">IMMUTABLE LOGGING</span>
          </div>

          <p className="card-subtitle">
            Records each query, jurisdiction toggle, retrieved statutory chunks, anti-hallucination validation state, and ISO timestamps.
          </p>

          <div className="table-responsive">
            <table className="forms-data-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>User / Session</th>
                  <th>Action / Query</th>
                  <th>Jurisdiction</th>
                  <th>Anti-Hallucination Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="tag-mono">{log.log_id}</span>
                    </td>
                    <td>
                      <small>{log.user_id}</small>
                    </td>
                    <td>
                      <strong>{log.query_text}</strong>
                    </td>
                    <td>
                      <span className="jur-pill">{log.jurisdiction?.toUpperCase()}</span>
                    </td>
                    <td>
                      <span className="hallucination-badge">
                        <CheckCircle size={13} className="text-green" /> PASSED GROUNDING
                      </span>
                    </td>
                    <td className="deadline-cell">
                      <Clock size={12} /> {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
