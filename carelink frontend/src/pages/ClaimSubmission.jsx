import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePatients } from '../context/PatientContext';
import { claimService } from '../services/claimService';
import Spinner from '../components/Spinner';

const AUTO_APPROVE_LIMIT = 10000;

const BloodGroupBadge = ({ group }) => {
  if (!group) return null;
  return (
    <span
      className="badge rounded-pill px-3 py-1 fw-bold"
      style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.78rem' }}
    >
      <i className="bi bi-droplet-fill me-1" aria-hidden="true" />
      {group}
    </span>
  );
};

const StatusIndicator = ({ amount }) => {
  const num = parseFloat(amount);
  if (!amount || isNaN(num) || num <= 0) {
    return (
      <div
        className="rounded-3 px-3 py-2 d-flex align-items-center gap-2"
        style={{ background: '#f1f5f9', fontSize: '0.83rem' }}
      >
        <i className="bi bi-info-circle text-muted" aria-hidden="true" />
        <span className="text-muted">Enter an amount to see approval forecast</span>
      </div>
    );
  }
  const autoApproved = num <= AUTO_APPROVE_LIMIT;
  return (
    <div
      className="rounded-3 px-3 py-2 d-flex align-items-center gap-2"
      style={{
        background: autoApproved ? '#f0fdf4' : '#fffbeb',
        border: `1px solid ${autoApproved ? '#bbf7d0' : '#fde68a'}`,
        fontSize: '0.83rem',
      }}
      role="status"
      aria-live="polite"
    >
      <i
        className={`bi ${autoApproved ? 'bi-lightning-charge-fill text-success' : 'bi-hourglass-split text-warning'}`}
        aria-hidden="true"
      />
      <span className={`fw-semibold ${autoApproved ? 'text-success' : 'text-warning'}`}>
        {autoApproved
          ? `Auto-Approved — Amount ≤ ₹${AUTO_APPROVE_LIMIT.toLocaleString('en-IN')}`
          : `Manual Review Required — Amount > ₹${AUTO_APPROVE_LIMIT.toLocaleString('en-IN')}`}
      </span>
    </div>
  );
};

export default function ClaimSubmission() {
  const [searchParams] = useSearchParams();
  const { patients, patientsLoading, refreshPatients } = usePatients();

  const [patientSearch,    setPatientSearch]    = useState('');
  const [selectedId,       setSelectedId]       = useState('');
  const [dropdownOpen,     setDropdownOpen]      = useState(false);
  const [amount,           setAmount]            = useState('');
  const [diagnosisCode,    setDiagnosisCode]     = useState('');
  const [errors,           setErrors]            = useState({});
  const [claimResult,      setClaimResult]       = useState(null);
  const [isLoading,        setIsLoading]         = useState(false);

  const dropdownRef = useRef(null);

  const selectedPatient = patients.find((p) => String(p.id) === String(selectedId)) ?? null;

  const filteredPatients = patients.filter((p) => {
    if (!patientSearch.trim()) return true;
    const term = patientSearch.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(term) ||
      p.patId.toLowerCase().includes(term) ||
      (p.email || '').toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    const urlId = searchParams.get('patientId');
    if (urlId && patients.length > 0) {
      const match = patients.find((p) => String(p.id) === String(urlId));
      if (match) {
        setSelectedId(String(match.id));
        setPatientSearch('');
      }
    }
  }, [searchParams, patients]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSelectPatient = useCallback((patient) => {
    setSelectedId(String(patient.id));
    setPatientSearch('');
    setDropdownOpen(false);
    setErrors((prev) => ({ ...prev, patient: undefined }));
  }, []);

  const handleAmountChange = useCallback((e) => {
    setAmount(e.target.value);
    setErrors((prev) => ({ ...prev, amount: undefined }));
  }, []);

  const handleDiagnosisChange = useCallback((e) => {
    setDiagnosisCode(e.target.value);
    setErrors((prev) => ({ ...prev, diagnosisCode: undefined }));
  }, []);

  const validate = useCallback(() => {
    const errs = {};
    if (!selectedId) errs.patient = 'Please select a patient.';
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
      errs.amount = 'Please enter a valid positive amount.';
    if (!diagnosisCode.trim())
      errs.diagnosisCode = 'Diagnosis code is required.';
    return errs;
  }, [selectedId, amount, diagnosisCode]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setClaimResult(null);

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsLoading(true);
    try {
      const response = await claimService.submitClaim({
        patientId:       parseInt(selectedId, 10),
        requestedAmount: parseFloat(amount),
        diagnosisCode:   diagnosisCode.trim(),
      });
      setClaimResult({ type: 'success', data: response.data });
      setAmount('');
      setDiagnosisCode('');
    } catch (err) {
      const msg =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        'Error processing claim. Please verify the backend connection.';
      setClaimResult({ type: 'danger', msg });
    } finally {
      setIsLoading(false);
    }
  }, [selectedId, amount, diagnosisCode, validate]);

  const handleReset = useCallback(() => {
    setSelectedId('');
    setPatientSearch('');
    setAmount('');
    setDiagnosisCode('');
    setErrors({});
    setClaimResult(null);
  }, []);

  return (
    <div>
      <div className="mb-4 pb-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <div>
          <h1 className="fw-extrabold text-dark mb-1" style={{ fontSize: '1.6rem' }}>
            <i className="bi bi-file-earmark-medical-fill me-2 text-primary" aria-hidden="true" />
            Submit Insurance Claim
          </h1>
          <p className="text-muted mb-0 small">
            Select a registered patient and submit their insurance or cashless claim for processing.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-light border btn-sm d-flex align-items-center gap-2"
          onClick={refreshPatients}
          disabled={patientsLoading}
          aria-label="Refresh patient list"
        >
          <i className={`bi bi-arrow-clockwise ${patientsLoading ? 'spin' : ''}`} aria-hidden="true" />
          Refresh Patients
        </button>
      </div>

      {claimResult?.type === 'success' && (
        <div
          className="mb-4 rounded-3 overflow-hidden shadow-sm border border-success border-opacity-25"
          role="alert"
          aria-live="assertive"
        >
          <div
            className="px-4 py-3 d-flex align-items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #0d9f4f 0%, #059669 100%)' }}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-white flex-shrink-0"
              style={{ width: '40px', height: '40px' }}
              aria-hidden="true"
            >
              <i className="bi bi-check-circle-fill text-success fs-5" />
            </div>
            <div>
              <h5 className="fw-bold text-white mb-0" style={{ fontSize: '0.95rem' }}>
                Claim Submitted Successfully!
              </h5>
              <p className="text-white opacity-75 mb-0 small">
                Claim ID:&nbsp;
                <strong>CLM-{String(claimResult.data?.id ?? '—').padStart(6, '0')}</strong>
                &nbsp;·&nbsp;
                Status:&nbsp;
                <strong>{claimResult.data?.status ?? '—'}</strong>
              </p>
            </div>
            <button
              type="button"
              className="btn btn-link ms-auto p-1 text-white opacity-75"
              onClick={() => setClaimResult(null)}
              aria-label="Dismiss"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
          <div className="bg-white px-4 py-3 d-flex flex-wrap gap-3">
            <div>
              <p className="mb-0 text-muted" style={{ fontSize: '0.78rem' }}>Requested Amount</p>
              <p className="mb-0 fw-bold text-dark">
                ₹{parseFloat(claimResult.data?.requestedAmount ?? 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="mb-0 text-muted" style={{ fontSize: '0.78rem' }}>Diagnosis Code</p>
              <p className="mb-0 fw-bold text-dark">{claimResult.data?.diagnosisCode ?? '—'}</p>
            </div>
            <div className="ms-auto d-flex align-items-center">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm fw-semibold"
                onClick={handleReset}
              >
                <i className="bi bi-plus-circle me-1" aria-hidden="true" />
                Submit Another Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {claimResult?.type === 'danger' && (
        <div className="alert alert-danger shadow-sm mb-4 d-flex align-items-start gap-3" role="alert">
          <i className="bi bi-exclamation-octagon-fill fs-4 flex-shrink-0" aria-hidden="true" />
          <div>
            <h6 className="alert-heading fw-bold mb-1">Claim Submission Failed</h6>
            <p className="mb-0 small">{claimResult.msg}</p>
          </div>
          <button
            type="button"
            className="btn-close ms-auto flex-shrink-0"
            onClick={() => setClaimResult(null)}
            aria-label="Dismiss error"
          />
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white py-3 border-bottom">
              <h2 className="h6 fw-bold mb-0 text-dark">
                <i className="bi bi-person-circle me-2 text-primary" aria-hidden="true" />
                Patient Selection
              </h2>
            </div>
            <div className="card-body p-4">
              <div ref={dropdownRef} className="position-relative mb-3">
                <label htmlFor="patient-search-input" className="form-label fw-semibold text-secondary small">
                  Search Patient <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <div className={`input-group ${errors.patient ? 'is-invalid-group' : ''}`}>
                  <span className="input-group-text bg-light border-end-0 text-muted" aria-hidden="true">
                    <i className="bi bi-search" />
                  </span>
                  <input
                    id="patient-search-input"
                    type="text"
                    className={`form-control bg-light border-start-0 ps-0 shadow-none${errors.patient ? ' is-invalid' : ''}`}
                    placeholder="Search by name, ID, or email…"
                    value={patientSearch}
                    onChange={(e) => { setPatientSearch(e.target.value); setDropdownOpen(true); }}
                    onFocus={() => setDropdownOpen(true)}
                    autoComplete="off"
                    aria-haspopup="listbox"
                    aria-expanded={dropdownOpen}
                    aria-label="Search patients"
                  />
                </div>
                {errors.patient && (
                  <div className="invalid-feedback d-block" role="alert" style={{ marginTop: '4px' }}>
                    {errors.patient}
                  </div>
                )}

                {dropdownOpen && (
                  <div
                    className="position-absolute bg-white border rounded-3 shadow-lg mt-1 overflow-hidden"
                    style={{ width: '100%', zIndex: 1000, maxHeight: '260px', overflowY: 'auto' }}
                    role="listbox"
                    aria-label="Patient search results"
                  >
                    {patientsLoading ? (
                      <div className="p-3 text-center">
                        <Spinner size="sm" variant="inline" message="Loading patients…" />
                      </div>
                    ) : filteredPatients.length === 0 ? (
                      <div className="px-4 py-3 text-muted small text-center">
                        <i className="bi bi-person-x me-1" aria-hidden="true" />
                        {patients.length === 0
                          ? 'No patients registered yet. Register a patient first.'
                          : 'No patients match your search.'}
                      </div>
                    ) : (
                      filteredPatients.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          role="option"
                          aria-selected={String(p.id) === selectedId}
                          className={`d-flex align-items-center gap-3 w-100 text-start px-4 py-2 border-0 bg-transparent ${
                            String(p.id) === selectedId ? 'bg-primary-subtle' : ''
                          }`}
                          style={{
                            fontSize: '0.87rem',
                            transition: 'background 0.1s',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleSelectPatient(p)}
                          onMouseEnter={(e) => { if (String(p.id) !== selectedId) e.currentTarget.style.background = '#f8fafc'; }}
                          onMouseLeave={(e) => { if (String(p.id) !== selectedId) e.currentTarget.style.background = ''; }}
                        >
                          <div
                            className="avatar-initials flex-shrink-0"
                            aria-hidden="true"
                          >
                            {p.firstName?.[0]}{p.lastName?.[0]}
                          </div>
                          <div className="overflow-hidden">
                            <p className="fw-semibold text-dark mb-0 text-truncate">{p.fullName}</p>
                            <small className="text-muted">{p.patId} · {p.gender ?? '—'} · {p.bloodGroup ?? '—'}</small>
                          </div>
                          {String(p.id) === selectedId && (
                            <i className="bi bi-check2 text-primary ms-auto" aria-hidden="true" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {selectedPatient ? (
                <div
                  className="rounded-3 p-3 mt-2"
                  style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', border: '1px solid #bfdbfe' }}
                >
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="avatar-initials flex-shrink-0"
                      style={{ width: '48px', height: '48px', fontSize: '1rem' }}
                      aria-hidden="true"
                    >
                      {selectedPatient.firstName?.[0]}{selectedPatient.lastName?.[0]}
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="fw-bold text-dark mb-1" style={{ fontSize: '0.95rem' }}>
                        {selectedPatient.fullName}
                      </p>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.73rem' }}>
                          {selectedPatient.patId}
                        </span>
                        <BloodGroupBadge group={selectedPatient.bloodGroup} />
                        {selectedPatient.gender && (
                          <span className="badge bg-light text-secondary border" style={{ fontSize: '0.73rem' }}>
                            {selectedPatient.gender}
                          </span>
                        )}
                      </div>
                      <p className="mb-0 text-muted" style={{ fontSize: '0.78rem' }}>
                        <i className="bi bi-envelope me-1" aria-hidden="true" />
                        {selectedPatient.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-muted flex-shrink-0"
                      onClick={() => { setSelectedId(''); setPatientSearch(''); }}
                      aria-label="Clear selected patient"
                      title="Change patient"
                    >
                      <i className="bi bi-x-circle" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-3 p-4 text-center mt-2"
                  style={{ background: '#f8fafc', border: '2px dashed #e2e8f0' }}
                >
                  <i className="bi bi-person-circle fs-2 text-muted d-block mb-2" aria-hidden="true" />
                  <p className="text-muted mb-0 small">
                    Search for and select a registered patient above.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white py-3 border-bottom">
              <h2 className="h6 fw-bold mb-0 text-dark">
                <i className="bi bi-clipboard2-pulse me-2 text-primary" aria-hidden="true" />
                Claim Details
              </h2>
            </div>

            <div className="card-body p-4">
              <form id="claim-submission-form" onSubmit={handleSubmit} noValidate aria-label="Claim submission form">
                <div className="mb-4">
                  <label htmlFor="claim-amount" className="form-label fw-semibold text-secondary small">
                    Requested Amount (INR) <span className="text-danger" aria-hidden="true">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light fw-bold text-muted">₹</span>
                    <input
                      id="claim-amount"
                      type="number"
                      min="1"
                      step="0.01"
                      className={`form-control${errors.amount ? ' is-invalid' : ''}`}
                      placeholder="e.g. 9500"
                      value={amount}
                      onChange={handleAmountChange}
                      aria-required="true"
                      aria-describedby={errors.amount ? 'amount-error' : 'amount-hint'}
                    />
                    <span className="input-group-text bg-light text-muted">INR</span>
                    {errors.amount && (
                      <div id="amount-error" className="invalid-feedback" role="alert">
                        {errors.amount}
                      </div>
                    )}
                  </div>
                  <div id="amount-hint" className="mt-2">
                    <StatusIndicator amount={amount} />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="diagnosis-code" className="form-label fw-semibold text-secondary small">
                    Diagnosis / ICD Code <span className="text-danger" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="diagnosis-code"
                    type="text"
                    className={`form-control${errors.diagnosisCode ? ' is-invalid' : ''}`}
                    placeholder="e.g. ICD-10-J01.0, ICD-10-K92.1"
                    value={diagnosisCode}
                    onChange={handleDiagnosisChange}
                    aria-required="true"
                    aria-describedby={errors.diagnosisCode ? 'diagnosis-error' : undefined}
                  />
                  {errors.diagnosisCode && (
                    <div id="diagnosis-error" className="invalid-feedback" role="alert">
                      {errors.diagnosisCode}
                    </div>
                  )}
                  <small className="text-muted mt-1 d-block">
                    Enter the primary diagnosis ICD-10 code as provided by the treating physician.
                  </small>
                </div>

                <div
                  className="rounded-3 p-3 mb-4"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  <h3 className="h6 fw-semibold text-secondary mb-2" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Auto-Approval Engine
                  </h3>
                  <div className="d-flex gap-2 flex-wrap">
                    <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-2" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <i className="bi bi-lightning-charge-fill text-success small" aria-hidden="true" />
                      <span className="small text-success fw-semibold">≤ ₹10,000 → Instant Approval</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-2" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                      <i className="bi bi-hourglass-split text-warning small" aria-hidden="true" />
                      <span className="small text-warning fw-semibold">&gt; ₹10,000 → Manual Review</span>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-3 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-light border fw-semibold"
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    id="submit-claim-btn"
                    className="btn btn-primary flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                    disabled={isLoading || !selectedId}
                    aria-busy={isLoading}
                    aria-label="Submit insurance claim"
                  >
                    {isLoading
                      ? <Spinner variant="inline" size="sm" message="Processing…" />
                      : <>
                          <i className="bi bi-send-fill" aria-hidden="true" />
                          Submit Claim
                        </>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}