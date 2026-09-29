import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Globe, Check, AlertCircle, X } from 'lucide-react';

const INDIAN_LANGUAGES = [
  { code: 'en-IN', name: 'English (India)', label: 'English' },
  { code: 'hi-IN', name: 'हिन्दी (Hindi)', label: 'Hindi' },
  { code: 'ta-IN', name: 'தமிழ் (Tamil)', label: 'Tamil' },
  { code: 'te-IN', name: 'తెలుగు (Telugu)', label: 'Telugu' },
  { code: 'kn-IN', name: 'ಕನ್ನಡ (Kannada)', label: 'Kannada' },
  { code: 'ml-IN', name: 'മലയാളം (Malayalam)', label: 'Malayalam' },
  { code: 'mr-IN', name: 'मराठी (Marathi)', label: 'Marathi' },
  { code: 'bn-IN', name: 'বাংলা (Bengali)', label: 'Bengali' },
  { code: 'gu-IN', name: 'ગુજરાતી (Gujarati)', label: 'Gujarati' }
];

export default function VoiceInputModal({ isOpen, onClose, onTranscriptionComplete, targetField = "query" }) {
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access denied. Please grant microphone permissions.');
        } else if (event.error === 'no-speech') {
          // Keep listening or allow retry
        } else {
          setErrorMsg(`Voice recognition: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setErrorMsg('Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [selectedLang]);

  if (!isOpen) return null;

  const toggleListening = () => {
    setErrorMsg('');
    if (!recognitionRef.current) {
      setErrorMsg('Speech recognition engine not initialized.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = selectedLang;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setErrorMsg('Could not start microphone: ' + e.message);
        setIsListening(false);
      }
    }
  };

  const handleApply = () => {
    if (transcript.trim()) {
      onTranscriptionComplete(transcript.trim());
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card voice-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Mic className="modal-icon" size={22} />
            <div>
              <h3>Indian Language Voice Input</h3>
              <p>Speak naturally in your preferred language to populate the assistant</p>
            </div>
          </div>
          <button className="icon-btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Language Selector */}
        <div className="voice-lang-selector">
          <label className="field-label">
            <Globe size={15} /> Select Input Language:
          </label>
          <div className="lang-chips">
            {INDIAN_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className={`lang-chip ${selectedLang === lang.code ? 'selected' : ''}`}
                onClick={() => {
                  if (isListening && recognitionRef.current) {
                    recognitionRef.current.stop();
                    setIsListening(false);
                  }
                  setSelectedLang(lang.code);
                }}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Listening Circle / Audio Visualizer */}
        <div className="voice-mic-container">
          <button
            className={`mic-pulsing-button ${isListening ? 'active' : ''}`}
            onClick={toggleListening}
            title={isListening ? 'Click to pause' : 'Click to start speaking'}
          >
            {isListening ? <Mic size={36} /> : <MicOff size={36} />}
          </button>
          
          <div className="mic-status-text">
            {isListening ? (
              <span className="listening-pulse">Listening... Speak now ({INDIAN_LANGUAGES.find(l => l.code === selectedLang)?.label})</span>
            ) : (
              <span>Click microphone to speak</span>
            )}
          </div>

          {isListening && (
            <div className="sound-wave-bars">
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>
          )}
        </div>

        {/* Live Transcript Box */}
        <div className="transcript-box">
          <label className="transcript-label">Recognized Speech Transcript:</label>
          <div className="transcript-content">
            {transcript ? (
              <p>{transcript}</p>
            ) : (
              <p className="placeholder-text">
                "For example: 'I want to check patentability for a synergistic combination of Haridra and Maricha with 2000% higher absorption'..."
              </p>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="voice-error-banner">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => setTranscript('')} disabled={!transcript}>
            Clear Text
          </button>
          <button 
            className="btn-primary" 
            onClick={handleApply} 
            disabled={!transcript.trim()}
          >
            <Check size={16} /> Insert into Assistant Form
          </button>
        </div>
      </div>
    </div>
  );
}
