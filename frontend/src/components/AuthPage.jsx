import React, { useState } from 'react';
import {
  Leaf,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Scale,
  Award,
  Database,
  FileCheck
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AuthPage({ onEnterJuryMode, onAuthSuccess }) {
  const [mode, setMode] = useState('signin'); // 'signin', 'signup', or 'forgot'

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [verificationPending, setVerificationPending] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  // Clear messages when switching tabs
  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
    setVerificationPending(false);
  };

  // Sign In Handler (Email + Password)
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setVerificationPending(true);
          setErrorMsg('Your email is not verified yet. Please check your inbox or click "Resend Verification Email" below.');
        } else {
          setErrorMsg(error.message);
        }
        setLoading(false);
        return;
      }

      if (data?.session) {
        setSuccessMsg('Authentication successful! Loading your isolated workspace...');
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(data.session);
        }, 500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Handler (Username + Email + Password)
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) return;

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            username: username.trim(),
            full_name: username.trim()
          }
        }
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // Check if session returned immediately (auto-confirm) or verification is required
      if (data?.session) {
        setSuccessMsg(`Welcome, ${username}! Your secure database partition has been created.`);
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(data.session);
        }, 600);
      } else {
        // Supabase requires email verification
        setVerificationPending(true);
        setSuccessMsg(`Account created for ${username}! A verification email has been dispatched to ${email.trim()}. Please verify your email to access your personal database.`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred during account creation.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Verification Email
  const handleResendVerification = async () => {
    if (!email.trim()) return;
    setResendingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim()
      });
      if (error) {
        setErrorMsg('Resend failed: ' + error.message);
      } else {
        setSuccessMsg(`A fresh verification link has been sent to ${email.trim()}.`);
      }
    } catch (err) {
      setErrorMsg('Could not resend verification email: ' + err.message);
    } finally {
      setResendingEmail(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(`Password reset instructions sent to ${email.trim()}. Please check your email.`);
      }
    } catch (err) {
      setErrorMsg('Password reset error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-portal-wrapper">
      {/* Decorative ambient background elements */}
      <div className="ambient-glow glow-1" />
      <div className="ambient-glow glow-2" />

      {/* Top Bar with Brand & Guest Quick Access */}
      <header className="auth-top-bar">
        <div className="auth-brand">
          <div className="auth-logo-badge">
            <Leaf size={22} />
          </div>
          <div className="auth-brand-text">
            <span className="auth-brand-title">VEDHA MIND</span>
            <span className="auth-brand-subtitle">Ayurvedic IP & Patent Intelligence</span>
          </div>
        </div>

        <button
          type="button"
          className="jury-quick-pill"
          onClick={onEnterJuryMode}
          title="Instant sandbox evaluation without credentials"
        >
          <ShieldCheck size={16} />
          <span>Jury Mode (Guest Access)</span>
        </button>
      </header>

      {/* Main Centered Authentication Container */}
      <main className="auth-centered-container">
        {/* Centered Brand Title & Subtitle */}
        <div className="auth-center-header">
          <h2 className="auth-center-title">
            VEDHA MIND LOGIN
          </h2>
        </div>

        {/* Centered Register / Sign In Card */}
        <div className="auth-form-card centered">
          {/* Tab Switcher */}
          <div className="auth-tabs-row">
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('signin')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('signup')}
            >
              Create Account
            </button>
          </div>

          {/* Error / Success Notifications */}
          {errorMsg && (
            <div className="auth-alert error">
              <AlertCircle size={18} className="alert-icon" />
              <div className="alert-body">
                <span>{errorMsg}</span>
                {verificationPending && (
                  <button
                    type="button"
                    className="btn-resend-inline"
                    onClick={handleResendVerification}
                    disabled={resendingEmail}
                  >
                    {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert success">
              <CheckCircle2 size={18} className="alert-icon" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Email Verification Pending Notice */}
          {verificationPending && mode === 'signup' && (
            <div className="verification-banner-box">
              <Mail size={28} className="banner-icon" />
              <h4>Check Your Email for Verification Link</h4>
              <p>
                A confirmation link has been sent to <strong>{email}</strong> via Supabase Auth. Please click the link to activate your isolated user partition.
              </p>
              <div className="banner-actions">
                <button
                  type="button"
                  className="btn-banner-action"
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                >
                  {resendingEmail ? <RefreshCw size={14} className="spinner-icon" /> : <RefreshCw size={14} />}
                  <span>{resendingEmail ? 'Resending...' : 'Resend Verification Email'}</span>
                </button>
                <button
                  type="button"
                  className="btn-banner-secondary"
                  onClick={() => handleSwitchMode('signin')}
                >
                  Go to Sign In
                </button>
              </div>
            </div>
          )}

          {/* SIGN IN FORM: Email & Password */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="auth-form-body">
              <div className="form-header-intro">
                <h3>Sign in to your account</h3>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <div className="label-with-link">
                  <label className="auth-label">Password</label>
                  <button
                    type="button"
                    className="forgot-link-btn"
                    onClick={() => handleSwitchMode('forgot')}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="input-with-icon">
                  <Lock size={18} className="field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading || !email.trim() || !password}
              >
                {loading ? (
                  <>
                    <RefreshCw size={17} className="spinner-icon" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <div className="auth-switch-note">
                <span>Don't have an account?</span>
                <button
                  type="button"
                  className="switch-link-btn"
                  onClick={() => handleSwitchMode('signup')}
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* SIGN UP FORM: Username, Email & Password */}
          {mode === 'signup' && !verificationPending && (
            <form onSubmit={handleSignUp} className="auth-form-body">
              <div className="form-header-intro">
                <h3>Create your account</h3>
                <p>Set up your username and dedicated Supabase database storage.</p>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Username / Innovator Name</label>
                <div className="input-with-icon">
                  <User size={18} className="field-icon" />
                  <input
                    type="text"
                    className="auth-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Dr. V. Sharma or Arya Phyto"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span className="input-help-text">Password must be at least 6 characters long.</span>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading || !username.trim() || !email.trim() || !password}
              >
                {loading ? (
                  <>
                    <RefreshCw size={17} className="spinner-icon" />
                    <span>Creating Account in Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Verify</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <div className="auth-switch-note">
                <span>Already have an account?</span>
                <button
                  type="button"
                  className="switch-link-btn"
                  onClick={() => handleSwitchMode('signin')}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="auth-form-body">
              <div className="form-header-intro">
                <h3>Reset your password</h3>
                <p>Enter your account email to receive reset instructions from Supabase.</p>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading || !email.trim()}
              >
                {loading ? (
                  <>
                    <RefreshCw size={17} className="spinner-icon" />
                    <span>Sending reset email...</span>
                  </>
                ) : (
                  <>
                    <span>Send Password Reset Email</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <div className="auth-switch-note">
                <button
                  type="button"
                  className="switch-link-btn"
                  onClick={() => handleSwitchMode('signin')}
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Or Divider & Guest Jury Button */}
          <div className="auth-divider">
            <span>OR EVALUATE WITHOUT CREDENTIALS</span>
          </div>

          <div className="guest-jury-portal-card">
            <button
              type="button"
              className="btn-guest-jury-full"
              onClick={onEnterJuryMode}
            >
              <div className="guest-btn-content">
                <ShieldCheck size={20} className="shield-emerald" />
                <div className="guest-btn-texts">
                  <span className="guest-btn-title">Jury Mode (Guest Access)</span>
                  <span className="guest-btn-desc">Instant access mode with pre-Ayurvedic case studies</span>
                </div>
              </div>
              <ArrowRight size={18} className="arrow-icon" />
            </button>
          </div>

          {/* Privacy & Legal Footer */}
          <div className="auth-card-footer">
            <span>Protected by DPDP Act 2023 • CSIR-TKDL Verified • Encrypted User Partition</span>
          </div>
        </div>
      </main>
    </div>
  );
}
