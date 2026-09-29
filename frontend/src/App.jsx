import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import AuthPage from './components/AuthPage';
import Navbar from './components/Navbar';
import WorkflowAssistant from './components/WorkflowAssistant';
import ApplicationAssistance from './components/ApplicationAssistance';
import FormAutoRouting from './components/FormAutoRouting';
import IpVault from './components/IpVault';
import JuryShowcaseExplorer from './components/JuryShowcaseExplorer';
import ConsultationChat from './components/ConsultationChat';
import VoiceInputModal from './components/VoiceInputModal';
import './index.css';

const DEFAULT_INTAKE = {
  product_name: '',
  product_type: 'Patent or Proprietary (P&P)',
  herbs: '',
  claim_use: 'Patent Grant',
  core_objective: '',
  jurisdiction: 'india',
  language: 'en'
};

export default function App() {
  const [activeTab, setActiveTab] = useState('workflow');
  const [intakeData, setIntakeData] = useState(DEFAULT_INTAKE);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patentDraft, setPatentDraft] = useState(null);
  const [isDrafting, setIsDrafting] = useState(false);

  const [presets, setPresets] = useState([]);
  const [backendHealth, setBackendHealth] = useState({ connected: false, status: 'connecting', targetUrl: '' });
  
  // Auth state: Session or Jury Mode (Guest)
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isJuryMode, setIsJuryMode] = useState(() => {
    return sessionStorage.getItem('vedha_jury_mode') === 'true';
  });

  // Voice Input Modal State
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState('intake'); // 'intake' or 'chat'
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const apiUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

  // Active user entity (isolated per user)
  const currentUser = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        username: session.user.user_metadata?.username || session.user.email.split('@')[0],
        isJury: false
      }
    : isJuryMode
    ? {
        id: 'jury-guest',
        email: 'jury.examiner@vedhamind.ai',
        username: 'Jury Examiner (Guest)',
        isJury: true
      }
    : null;

  useEffect(() => {
    // Check Supabase session on startup
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsJuryMode(false);
        sessionStorage.removeItem('vedha_jury_mode');
      }
    });

    // Check backend health & fetch presets
    checkBackend();

    // Auto-retry polling: pings backend every 6s until connected, then keeps a gentle 30s heartbeat
    const interval = setInterval(() => {
      checkBackend();
    }, 6000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [apiUrl]);

  // Load user-partitioned data whenever the active user changes
  useEffect(() => {
    if (!currentUser) return;

    const userEmail = currentUser.email;

    // 1. Load cached intake for this user
    try {
      const savedIntake = localStorage.getItem(`vedha_intake_${userEmail}`);
      if (savedIntake) {
        setIntakeData(JSON.parse(savedIntake));
      } else {
        setIntakeData(DEFAULT_INTAKE);
      }
    } catch (_) {
      setIntakeData(DEFAULT_INTAKE);
    }

    // 2. Load cached analysis for this user
    try {
      const savedAnalysis = localStorage.getItem(`vedha_analysis_${userEmail}`);
      if (savedAnalysis) {
        setAnalysisResult(JSON.parse(savedAnalysis));
      } else {
        setAnalysisResult(null);
      }
    } catch (_) {
      setAnalysisResult(null);
    }

    // 3. Load latest patent draft for this user
    fetchUserLatestDraft(userEmail);
  }, [currentUser?.email]);

  const fetchUserLatestDraft = async (userEmail) => {
    if (!userEmail) return;
    try {
      const draftRes = await fetch(`${apiUrl}/api/patent-drafts/latest?user_email=${encodeURIComponent(userEmail)}`);
      if (draftRes.ok) {
        const draftData = await draftRes.json();
        if (draftData && draftData.draft_id) {
          setPatentDraft(draftData);
          if (draftData.product_name) {
            setIntakeData(prev => prev.product_name ? prev : {
              ...prev,
              product_name: draftData.product_name
            });
          }
          return;
        }
      }
    } catch (_) {}

    // Fallback to local user partition
    try {
      const cachedDraft = localStorage.getItem(`vedha_draft_${userEmail}`);
      if (cachedDraft) {
        setPatentDraft(JSON.parse(cachedDraft));
      } else {
        setPatentDraft(null);
      }
    } catch (_) {
      setPatentDraft(null);
    }
  };

  const checkBackend = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/health`, { method: 'GET' });
      if (res.ok) {
        setBackendHealth({ connected: true, status: 'online', targetUrl: apiUrl });
        const presetsRes = await fetch(`${apiUrl}/api/dry-run-presets`);
        const presetsData = await presetsRes.json();
        if (presetsData.presets) {
          setPresets(presetsData.presets);
        }
      } else {
        setBackendHealth({ connected: false, status: 'offline', targetUrl: apiUrl, error: `HTTP ${res.status}` });
      }
    } catch (e) {
      console.warn('Backend connection warning:', e);
      setBackendHealth({ connected: false, status: 'offline', targetUrl: apiUrl, error: e.message });
    }
  };

  const handleEnterJuryMode = () => {
    setIsJuryMode(true);
    sessionStorage.setItem('vedha_jury_mode', 'true');
    setActiveTab('workflow');
  };

  const handleAuthSuccess = (newSession) => {
    setSession(newSession);
    setIsJuryMode(false);
    sessionStorage.removeItem('vedha_jury_mode');
    setActiveTab('workflow');
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    setSession(null);
    setIsJuryMode(false);
    sessionStorage.removeItem('vedha_jury_mode');
    setIntakeData(DEFAULT_INTAKE);
    setAnalysisResult(null);
    setPatentDraft(null);
  };

  const handleRunAnalysis = async (customData = null) => {
    const dataToAnalyze = customData || intakeData;
    setIsAnalyzing(true);

    const userEmail = currentUser?.email || 'guest@vedhamind.ai';

    try {
      const res = await fetch(`${apiUrl}/api/analyze-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dataToAnalyze,
          user_email: userEmail
        })
      });
      const data = await res.json();
      setAnalysisResult(data);

      // Save to user's isolated partition in local storage
      localStorage.setItem(`vedha_analysis_${userEmail}`, JSON.stringify(data));
      localStorage.setItem(`vedha_intake_${userEmail}`, JSON.stringify(dataToAnalyze));

      // Auto-trigger draft generation in background
      handleGenerateDraft(dataToAnalyze);
    } catch (e) {
      alert('Analysis error: ' + e.message);
    }
    setIsAnalyzing(false);
  };

  const handleGenerateDraft = async (customData = null) => {
    const dataToUse = customData || intakeData;
    setIsDrafting(true);

    const userEmail = currentUser?.email || 'guest@vedhamind.ai';
    const applicant = currentUser?.username || 'Ayurvedic Innovations Lab (India)';

    try {
      const prodName = (dataToUse.product_name || patentDraft?.product_name || 'CurcuShield Tri-Herbal Synergy Formulation').trim();
      const prodType = dataToUse.product_type || 'Patent or Proprietary (P&P)';
      const herbs = (dataToUse.herbs || 'Curcuma longa (95% curcuminoids), Piper nigrum (piperine 98%), Zingiber officinale').trim();
      const coreObj = (dataToUse.core_objective || 'Enhanced bioavailability, metabolic stability, and synergistic anti-inflammatory efficacy overcoming Section 3(d) and 3(p)').trim();
      const jurisdiction = dataToUse.jurisdiction || 'india';

      // Keep intakeData in sync if it was previously empty
      if (!intakeData.product_name) {
        setIntakeData(prev => ({
          ...prev,
          product_name: prodName,
          product_type: prodType,
          herbs: herbs,
          core_objective: coreObj,
          jurisdiction: jurisdiction
        }));
      }

      const res = await fetch(`${apiUrl}/api/patent-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: prodName,
          product_type: prodType,
          herbs: herbs,
          core_objective: coreObj,
          applicant_name: applicant,
          inventors: `${applicant} & Team`,
          jurisdiction: jurisdiction,
          user_email: userEmail
        })
      });
      if (!res.ok) {
        throw new Error(`Failed to generate draft: ${res.statusText}`);
      }
      const data = await res.json();
      setPatentDraft(data);

      // Save to user partition cache
      localStorage.setItem(`vedha_draft_${userEmail}`, JSON.stringify(data));
      return data;
    } catch (e) {
      console.warn('Draft generation error:', e);
      throw e;
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSelectPreset = (presetId) => {
    const found = presets.find(p => p.preset_id === presetId);
    if (found) {
      const newIntake = {
        product_name: found.product_name,
        product_type: found.product_type,
        herbs: found.herbs,
        claim_use: found.claim_use,
        core_objective: found.core_objective,
        jurisdiction: found.jurisdiction,
        language: found.language || 'en'
      };
      setIntakeData(newIntake);
      setActiveTab('workflow');
      handleRunAnalysis(newIntake);
    }
  };

  const openVoiceModal = (target) => {
    setVoiceTarget(target);
    setIsVoiceOpen(true);
  };

  const handleVoiceTranscription = (text) => {
    if (voiceTarget === 'intake') {
      setIntakeData(prev => ({
        ...prev,
        core_objective: prev.core_objective ? `${prev.core_objective} | Voice addition: ${text}` : text
      }));
    } else {
      setVoiceTranscript(text);
    }
  };

  // 1. FRONT PAGE: If not logged in and not in Jury Mode, render AuthPage as the Front Page
  if (!currentUser && authChecked) {
    return (
      <AuthPage 
        onEnterJuryMode={handleEnterJuryMode}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  // 2. MAIN APPLICATION: Authenticated Workspace or Jury Mode
  return (
    <div className="vedha-app-wrapper">
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        presets={presets}
        onSelectPreset={handleSelectPreset}
        backendHealth={backendHealth}
        onRetryBackend={checkBackend}
        apiUrl={apiUrl}
        userSession={session}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onExitJuryMode={handleSignOut}
      />

      {/* Main Tab Views */}
      <main className="main-content-view">
        {activeTab === 'workflow' && (
          <WorkflowAssistant 
            intakeData={intakeData}
            setIntakeData={setIntakeData}
            onRunAnalysis={() => handleRunAnalysis()}
            analysisResult={analysisResult}
            isAnalyzing={isAnalyzing}
            onOpenVoiceModal={openVoiceModal}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'application' && (
          <ApplicationAssistance 
            intakeData={intakeData}
            setIntakeData={setIntakeData}
            presets={presets}
            onGenerateDraft={(custom) => handleGenerateDraft(custom)}
            patentDraft={patentDraft}
            isDrafting={isDrafting}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'routing' && (
          <FormAutoRouting intakeData={intakeData} currentUser={currentUser} />
        )}

        {activeTab === 'vault' && (
          <IpVault intakeData={intakeData} currentUser={currentUser} />
        )}

        {activeTab === 'explorer' && (
          <JuryShowcaseExplorer currentUser={currentUser} />
        )}
      </main>

      {/* Multilingual Voice Input Modal */}
      <VoiceInputModal 
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onTranscriptionComplete={handleVoiceTranscription}
        targetField={voiceTarget}
      />

      {/* Floating Bottom-Right IP Consultation Chat Overlay */}
      <ConsultationChat 
        onOpenVoiceModal={openVoiceModal}
        voiceTranscript={voiceTranscript}
        clearVoiceTranscript={() => setVoiceTranscript('')}
      />
    </div>
  );
}
