import React, { useState, useCallback, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SEVERITY_CONFIG = {
  Low:      { color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', icon: 'emoji-smile',          badge: 'success'  },
  Moderate: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: 'emoji-neutral',         badge: 'warning'  },
  High:     { color: '#dc2626', bg: '#fff1f2', border: '#fecdd3', icon: 'emoji-frown',           badge: 'danger'   },
  Critical: { color: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe', icon: 'exclamation-diamond-fill', badge: 'purple' },
};

const SAMPLE_SYMPTOMS = [
  'Severe chest pain', 'Shortness of breath', 'Persistent cough (3 weeks)',
  'High fever (104°F)', 'Sudden severe headache', 'Confusion and disorientation',
  'Blurred vision', 'Swollen abdomen', 'Blood in urine',
];

const Spinner = () => (
  <div className="d-flex align-items-center justify-content-center gap-3 py-5">
    <div className="spinner-border text-primary" style={{ width:'2rem',height:'2rem' }} role="status"><span className="visually-hidden">Analyzing…</span></div>
    <div>
      <p className="fw-bold text-dark mb-0">Gemini AI is analyzing symptoms…</p>
      <small className="text-muted">Generating differential diagnosis and recommendations</small>
    </div>
  </div>
);

const ResultSection = ({ title, icon, content, color = '#0f172a' }) => (
  <div className="mb-4">
    <h3 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize:'0.95rem', color }}>
      <i className={`bi bi-${icon}`} aria-hidden="true" />{title}
    </h3>
    <div className="text-secondary" style={{ fontSize:'0.9rem', lineHeight:'1.7', whiteSpace:'pre-wrap' }}>{content}</div>
  </div>
);

const AISymptomAnalyzer = () => {
  const [symptoms,  setSymptoms]  = useState('');
  const [age,       setAge]       = useState('');
  const [gender,    setGender]    = useState('');
  const [history,   setHistory]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState(null);
  const resultRef = useRef(null);

  const addSample = (s) => setSymptoms((prev) => prev ? `${prev}, ${s}` : s);
  const clear = () => { setSymptoms(''); setAge(''); setGender(''); setHistory(''); setResult(null); setError(null); };

  const buildPrompt = () => {
    return `You are a board-certified AI clinical assistant with expertise in emergency medicine, internal medicine, and differential diagnosis. Analyze the following patient presentation and provide a structured medical assessment.

**PATIENT PRESENTATION:**
- Chief Complaint / Symptoms: ${symptoms}
- Patient Age: ${age || 'Not specified'}
- Patient Gender: ${gender || 'Not specified'}
- Medical History / Comorbidities: ${history || 'Not specified'}

**INSTRUCTIONS:** Respond with a detailed yet concise structured JSON with the following exact keys:
{
  "severity": "Low|Moderate|High|Critical",
  "urgency": "Can Wait|See Doctor Soon|Urgent|Emergency (Call 108)",
  "top_diagnoses": ["Diagnosis 1", "Diagnosis 2", "Diagnosis 3"],
  "recommended_tests": ["Test 1", "Test 2", "Test 3"],
  "immediate_actions": "Single paragraph of what the patient should do immediately.",
  "specialist_referral": "Which type of specialist to consult and why.",
  "red_flags": ["Red flag 1", "Red flag 2"],
  "disclaimer": "Short standard medical disclaimer."
}
Return ONLY the raw JSON object, no markdown fences or extra text.`;
  };

  const handleAnalyze = useCallback(async () => {
    if (!symptoms.trim()) { setError('Please describe the patient symptoms before analyzing.'); return; }
    setLoading(true); setError(null); setResult(null);

    try {
      const res = await fetch(`http://localhost:8080/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms, age, gender, history
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setError(err.message || 'AI analysis failed. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  }, [symptoms, age, gender, history]);

  const severity = result?.severity;
  const severityCfg = severity ? SEVERITY_CONFIG[severity] : null;

  return (
    <div>
      <div className="mb-4 pb-3 border-bottom">
        <div className="d-flex align-items-start gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
            style={{ width:'48px',height:'48px', background:'linear-gradient(135deg,#0d6efd,#6610f2)' }}
            aria-hidden="true"
          >
            <i className="bi bi-robot text-white fs-4" />
          </div>
          <div>
            <h1 className="fw-extrabold text-dark mb-1" style={{ fontSize:'1.6rem' }}>AI Symptom Analyzer</h1>
            <p className="text-muted mb-0 small">
              Gemini AI-powered differential diagnosis engine. Input patient symptoms for an instant clinical assessment, severity grading, and specialist referral recommendation.
            </p>
          </div>
        </div>
        <div className="alert alert-warning border-warning-subtle mt-3 mb-0 py-2 px-3" role="note" style={{ fontSize:'0.8rem' }}>
          <i className="bi bi-exclamation-triangle-fill me-2" aria-hidden="true" />
          <strong>Clinical Disclaimer:</strong> This tool provides AI-generated informational guidance only. It does NOT replace professional medical diagnosis, clinical judgment, or doctor consultation. Always defer to a licensed physician for treatment decisions.
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white py-3 border-bottom">
              <h2 className="h6 fw-bold mb-0"><i className="bi bi-clipboard2-pulse me-2 text-primary" />Patient Symptom Input</h2>
            </div>
            <div className="card-body p-4">
              <div className="mb-4">
                <label htmlFor="symptoms-input" className="form-label fw-semibold text-secondary small">
                  Chief Complaints &amp; Symptoms <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="symptoms-input"
                  rows={5}
                  className="form-control"
                  placeholder="Describe all symptoms in detail. E.g.: severe chest pain radiating to left arm since 2 hours, shortness of breath, sweating, dizziness…"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  aria-required="true"
                />
                <div className="mt-2 d-flex flex-wrap gap-1">
                  {SAMPLE_SYMPTOMS.map((s) => (
                    <button key={s} type="button" className="btn btn-xs border rounded-pill px-2 py-1 text-muted" style={{ fontSize:'0.7rem' }} onClick={() => addSample(s)}>
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-6">
                  <label htmlFor="patient-age" className="form-label fw-semibold text-secondary small">Patient Age</label>
                  <input id="patient-age" type="number" min={0} max={120} className="form-control" placeholder="e.g. 45" value={age} onChange={(e)=>setAge(e.target.value)} />
                </div>
                <div className="col-6">
                  <label htmlFor="patient-gender-ai" className="form-label fw-semibold text-secondary small">Gender</label>
                  <select id="patient-gender-ai" className="form-select" value={gender} onChange={(e)=>setGender(e.target.value)}>
                    <option value="">Not specified</option><option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="col-12">
                  <label htmlFor="medical-history" className="form-label fw-semibold text-secondary small">Medical History / Comorbidities</label>
                  <input id="medical-history" type="text" className="form-control" placeholder="e.g. Diabetes T2, Hypertension, COPD…" value={history} onChange={(e)=>setHistory(e.target.value)} />
                </div>
              </div>

              {error && (
                <div className="alert alert-danger py-2 mb-3 d-flex align-items-start gap-2" role="alert" style={{ fontSize:'0.85rem' }}>
                  <i className="bi bi-exclamation-octagon-fill flex-shrink-0 mt-1" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <div className="d-flex gap-2">
                <button type="button" className="btn btn-light border fw-semibold" onClick={clear} disabled={loading}>Clear</button>
                <button
                  type="button"
                  id="analyze-symptoms-btn"
                  className="btn btn-primary flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  onClick={handleAnalyze}
                  disabled={loading || !symptoms.trim()}
                  aria-busy={loading}
                  aria-label="Analyze symptoms with AI"
                >
                  {loading ? <><span className="spinner-border spinner-border-sm" />Analyzing…</> : <><i className="bi bi-cpu-fill" aria-hidden="true" />Analyze with Gemini AI</>}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7" ref={resultRef} tabIndex={-1}>
          {loading && <div className="card border-0 shadow-sm rounded-3"><div className="card-body"><Spinner /></div></div>}

          {result && !loading && (
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
              {severityCfg && (
                <div
                  className="px-4 py-4"
                  style={{ background: severityCfg.bg, borderBottom: `2px solid ${severityCfg.border}` }}
                >
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div>
                      <p className="text-muted small fw-semibold mb-1 text-uppercase" style={{ letterSpacing:'0.5px',fontSize:'0.7rem' }}>AI Assessment Result</p>
                      <h2 className="fw-extrabold mb-1" style={{ fontSize:'1.4rem', color: severityCfg.color }}>
                        <i className={`bi bi-${severityCfg.icon} me-2`} aria-hidden="true" />
                        {severity} Severity
                      </h2>
                      <p className="mb-0 fw-semibold" style={{ color: severityCfg.color }}>
                        Urgency: {result.urgency}
                      </p>
                    </div>
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                      style={{ width:'60px',height:'60px', background: severityCfg.border }}
                      aria-hidden="true"
                    >
                      <i className={`bi bi-${severityCfg.icon} fs-2`} style={{ color: severityCfg.color }} />
                    </div>
                  </div>
                </div>
              )}

              {result.raw ? (
                <div className="card-body p-4">
                  <p className="fw-semibold text-dark mb-2">Raw AI Response:</p>
                  <pre className="bg-light rounded-3 p-3 text-secondary small" style={{ whiteSpace:'pre-wrap' }}>{result.raw}</pre>
                </div>
              ) : (
                <div className="card-body p-4">
                  {result.top_diagnoses?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark" style={{ fontSize:'0.95rem' }}>
                        <i className="bi bi-list-stars text-primary" aria-hidden="true" />Probable Diagnoses
                      </h3>
                      <ol className="ps-4 mb-0">
                        {result.top_diagnoses.map((d,i)=>(
                          <li key={i} className="fw-semibold text-dark mb-1" style={{ fontSize:'0.9rem' }}>{d}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {result.recommended_tests?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark" style={{ fontSize:'0.95rem' }}>
                        <i className="bi bi-eyedropper text-primary" aria-hidden="true" />Recommended Tests
                      </h3>
                      <div className="d-flex flex-wrap gap-2">
                        {result.recommended_tests.map((t,i)=>(
                          <span key={i} className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill" style={{ fontSize:'0.8rem' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.immediate_actions && <ResultSection title="Immediate Actions" icon="lightning-charge-fill" content={result.immediate_actions} color="#0d6efd" />}
                  {result.specialist_referral && <ResultSection title="Specialist Referral" icon="person-vcard-fill" content={result.specialist_referral} color="#059669" />}

                  {result.red_flags?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize:'0.95rem',color:'#dc2626' }}>
                        <i className="bi bi-flag-fill" aria-hidden="true" />Critical Red Flags
                      </h3>
                      <ul className="list-unstyled mb-0">
                        {result.red_flags.map((f,i)=>(
                          <li key={i} className="d-flex align-items-start gap-2 mb-2" style={{ fontSize:'0.9rem' }}>
                            <i className="bi bi-exclamation-circle-fill text-danger flex-shrink-0 mt-1" aria-hidden="true" />
                            <span className="text-secondary">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.disclaimer && (
                    <div className="rounded-3 p-3 mt-2" style={{ background:'#f8fafc',border:'1px solid #e2e8f0',fontSize:'0.78rem',color:'#64748b' }}>
                      <i className="bi bi-info-circle me-1" aria-hidden="true" />{result.disclaimer}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="card border-0 shadow-sm rounded-3 h-100 d-flex align-items-center justify-content-center" style={{ minHeight:'400px' }}>
              <div className="text-center p-5">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                  style={{ width:'80px',height:'80px',background:'linear-gradient(135deg,#eff6ff,#f5f3ff)' }}
                  aria-hidden="true"
                >
                  <i className="bi bi-robot" style={{ fontSize:'2.5rem',color:'#6610f2' }} />
                </div>
                <h3 className="fw-bold text-dark mb-2" style={{ fontSize:'1.1rem' }}>Ready to Analyze</h3>
                <p className="text-muted small mb-0">Enter patient symptoms on the left and click <strong>Analyze with Gemini AI</strong> to generate a clinical assessment.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISymptomAnalyzer;