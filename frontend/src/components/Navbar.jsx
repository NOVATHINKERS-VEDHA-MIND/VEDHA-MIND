import React, { useState, useRef, useEffect } from 'react';
import {
  Leaf,
  ShieldCheck,
  Play,
  Layers,
  FileText,
  Compass,
  Lock,
  Database,
  User,
  LogOut,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Shield
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  presets,
  onSelectPreset,
  backendHealth,
  onRetryBackend,
  apiUrl,
  userSession,
  currentUser,
  onSignOut,
  onExitJuryMode,
  isGuestExaminer,
  setIsGuestExaminer
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="site-header">
      <div className="header-top">
        <div className="brand-group">
          <div className="brand-icon">
            <Leaf size={24} />
          </div>
          <div className="brand-info">
            <div className="brand-title-row">
              <h1 className="brand-title">VEDHA MIND</h1>
            </div>
          </div>
        </div>

        <div className="header-actions">
          {/* Backend Status indicator */}
          <button
            type="button"
            className={`status-pill ${backendHealth.connected ? 'online' : backendHealth.status === 'offline' ? 'offline' : 'connecting'}`}
            onClick={!backendHealth.connected && onRetryBackend ? onRetryBackend : undefined}
            title={backendHealth.connected ? `Connected to: ${apiUrl}` : `Target: ${apiUrl || 'http://127.0.0.1:8000'}\nClick to retry connection`}
            style={{ cursor: backendHealth.connected ? 'default' : 'pointer' }}
          >
            <span className="dot"></span>
            <span>
              {backendHealth.connected
                ? 'Connected'
                : backendHealth.status === 'offline'
                  ? 'Offline (Click to Retry)'
                  : 'Connecting Backend...'}
            </span>
          </button>

          {/* Jury Showcase Quick Dry-Run Launcher */}
          <div className="dry-run-launcher">
            <span className="dry-run-label">
              Demo-Run:
            </span>
            <select
              className="preset-select"
              onChange={(e) => {
                if (e.target.value) {
                  onSelectPreset(e.target.value);
                  e.target.value = "";
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Select Demo Case Study ▾</option>
              {presets.map((p) => (
                <option key={p.preset_id} value={p.preset_id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Profile Icon with Interactive Dropdown & Log Out Option */}
          <div className="auth-profile" ref={profileRef}>
            <button
              type="button"
              className={`profile-trigger-btn ${profileDropdownOpen ? 'active' : ''}`}
              onClick={() => setProfileDropdownOpen(prev => !prev)}
              aria-expanded={profileDropdownOpen}
              title="Click for Profile & Log Out"
            >
              <div className={`profile-avatar-circle ${currentUser?.isJury ? 'jury-avatar' : ''}`}>
                {currentUser?.isJury ? <ShieldCheck size={16} /> : <User size={16} />}
              </div>
              <div className="profile-trigger-texts">
                <span className="profile-name">
                  {currentUser?.username || currentUser?.email?.split('@')[0] || (currentUser?.isJury ? 'Jury Examiner' : 'My Account')}
                </span>
                <span className="profile-role-sub">
                  {currentUser?.isJury ? 'Guest Mode' : 'Online'}
                </span>
              </div>
              <ChevronDown size={14} className={`profile-chevron ${profileDropdownOpen ? 'rotated' : ''}`} />
            </button>

            {/* Dropdown Popover */}
            {profileDropdownOpen && (
              <div className="profile-dropdown-card">
                {/* User Identity Header */}
                <div className="dropdown-identity-block">
                  <div className={`dropdown-avatar-wrap ${currentUser?.isJury ? 'jury-wrap' : ''}`}>
                    {currentUser?.isJury ? <ShieldCheck size={24} /> : <User size={24} />}
                  </div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-fullname">
                      {currentUser?.username || (currentUser?.isJury ? 'Jury Examiner (Guest)' : 'Ayurvedic Innovator')}
                    </span>
                    <span className="dropdown-email" title={currentUser?.email}>
                      {currentUser?.email || 'jury.examiner@vedhamind.ai'}
                    </span>
                  </div>
                </div>

                {/* Database Partition Info */}

                <div className="dropdown-divider-line" />

                {/* Dropdown Menu Item: LOG OUT */}
                <div className="dropdown-menu-list">
                  <button
                    type="button"
                    className="dropdown-item-logout"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      if (currentUser?.isJury) {
                        if (onExitJuryMode) onExitJuryMode();
                        else if (onSignOut) onSignOut();
                      } else {
                        if (onSignOut) onSignOut();
                      }
                    }}
                  >
                    <div className="item-icon-box logout-box">
                      <LogOut size={16} />
                    </div>
                    <div className="item-text-box">
                      <span className="item-label-main">
                        {currentUser?.isJury ? 'Exit Jury Mode' : 'Log Out'}
                      </span>
                      <span className="item-label-sub">
                        {currentUser?.isJury ? 'Return to login page' : 'Sign out of your account'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <nav className="tab-navigation">
        <button
          className={`nav-tab ${activeTab === 'workflow' ? 'active' : ''}`}
          onClick={() => setActiveTab('workflow')}
        >
          <Layers size={17} />
          <span>ANALYZING AGENT</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'application' ? 'active' : ''}`}
          onClick={() => setActiveTab('application')}
        >
          <FileText size={17} />
          <span>PATENT DRAFT</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'routing' ? 'active' : ''}`}
          onClick={() => setActiveTab('routing')}
        >
          <Compass size={17} />
          <span>PRODUCT ESTIMATION</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'vault' ? 'active' : ''}`}
          onClick={() => setActiveTab('vault')}
        >
          <Lock size={17} />
          <span>IP VAULT</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveTab('explorer')}
        >
          <Database size={17} />
          <span>STORED ACTS AND DETAILS</span>
        </button>
      </nav>
    </header>
  );
}
