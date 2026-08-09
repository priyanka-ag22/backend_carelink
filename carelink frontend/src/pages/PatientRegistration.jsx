import React, { useReducer, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import patientService from '../services/patientService';
import { usePatients } from '../context/PatientContext';
import Spinner from '../components/Spinner';

const INITIAL_FIELDS = {
  firstName:        '',
  lastName:         '',
  dateOfBirth:      '',
  gender:           '',
  bloodGroup:       '',
  contactNumber:    '',
  email:            '',
  emergencyContact: '',
  address:          '',
};

const fieldReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return { ...INITIAL_FIELDS };
    default:
      return state;
  }
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9]{10}$/;

const validate = (fields) => {
  const e = {};

  if (!fields.firstName.trim())
    e.firstName = 'First Name is required.';
  else if (fields.firstName.trim().length < 2)
    e.firstName = 'First Name must be at least 2 characters.';

  if (!fields.lastName.trim())
    e.lastName = 'Last Name is required.';
  else if (fields.lastName.trim().length < 2)
    e.lastName = 'Last Name must be at least 2 characters.';

  if (!fields.dateOfBirth)
    e.dateOfBirth = 'Date of Birth is required.';
  else if (new Date(fields.dateOfBirth) >= new Date())
    e.dateOfBirth = 'Date of Birth must be a past date.';

  if (!fields.gender)
    e.gender = 'Please select a gender.';

  if (!fields.bloodGroup)
    e.bloodGroup = 'Please select a blood group.';

  if (!fields.contactNumber.trim())
    e.contactNumber = 'Contact Number is required.';
  else if (!PHONE_RE.test(fields.contactNumber.trim()))
    e.contactNumber = 'Contact Number must be exactly 10 digits.';

  if (!fields.email.trim())
    e.email = 'Email address is required.';
  else if (!EMAIL_RE.test(fields.email.trim()))
    e.email = 'Please enter a valid email (e.g. name@domain.com).';

  if (!fields.emergencyContact.trim())
    e.emergencyContact = 'Emergency Contact is required.';
  else if (!PHONE_RE.test(fields.emergencyContact.trim()))
    e.emergencyContact = 'Emergency Contact must be exactly 10 digits.';

  if (!fields.address.trim())
    e.address = 'Home Address is required.';
  else if (fields.address.trim().length < 10)
    e.address = 'Address must be at least 10 characters.';

  return e;
};

const FormField = ({
  id, label, type = 'text', name, value, placeholder = '',
  error, required = true, maxLength, prefix, onChange,
}) => (
  <div className={prefix ? 'input-group has-validation' : undefined}>
    {prefix && (
      <span className="input-group-text bg-light text-muted">{prefix}</span>
    )}
    <input
      id={id}
      type={type}
      name={name}
      className={`form-control${error ? ' is-invalid' : ''}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      aria-required={required}
      aria-describedby={error ? `${id}-error` : undefined}
      aria-invalid={!!error}
      maxLength={maxLength}
      autoComplete="off"
    />
    {error && (
      <div id={`${id}-error`} className="invalid-feedback" role="alert">
        {error}
      </div>
    )}
  </div>
);

const PatientRegistration = () => {
  const navigate = useNavigate();
  const { addPatientToState } = usePatients();

  const [fields,       dispatch]      = useReducer(fieldReducer, INITIAL_FIELDS);
  const [errors,       setErrors]     = useState({});
  const [isSubmitting, setSubmitting] = useState(false);
  const [successData,  setSuccessData] = useState(null);
  const [serverError,  setServerError] = useState(null);
  const [copied,       setCopied]     = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    dispatch({ type: 'SET_FIELD', field: name, value });
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
    setErrors({});
    setServerError(null);
    setSuccessData(null);
    setCopied(false);
  }, []);

  const handleDismissSuccess = useCallback(() => {
    setSuccessData(null);
    setCopied(false);
    dispatch({ type: 'RESET' });
  }, []);

  const handleCopyId = useCallback(async () => {
    if (!successData) return;
    try {
      await navigator.clipboard.writeText(successData.data.patId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = successData.data.patId;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [successData]);

  const handleProceedToClaim = useCallback(() => {
    if (!successData) return;
    navigate(`/submit-claim?patientId=${successData.data.id}`);
  }, [successData, navigate]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSuccessData(null);
    setServerError(null);
    setCopied(false);

    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstKey = Object.keys(validationErrors)[0];
      document.getElementById(firstKey)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const response = await patientService.registerPatient(fields);
      setSuccessData(response);
      addPatientToState(response.data);
    } catch (err) {
      const apiError = err?.response?.data?.fieldErrors
        ? Object.values(err.response.data.fieldErrors).join(' ')
        : err?.response?.data?.error ?? 'Registration failed. Please try again or contact IT support.';
      setServerError(apiError);
    } finally {
      setSubmitting(false);
    }
  }, [fields, addPatientToState]);

  return (
    <div>
      <div className="mb-4 pb-3 border-bottom">
        <h1 className="fw-extrabold text-dark mb-1" style={{ fontSize: '1.6rem' }}>
          <i className="bi bi-person-plus-fill me-2 text-primary" aria-hidden="true" />
          Patient Intake Registration
        </h1>
        <p className="text-muted mb-0 small">
          Enter official demographic, contact, and clinical details to register a new patient in Carelink HMS.
        </p>
      </div>

      {successData && (
        <div
          className="mb-4 rounded-3 overflow-hidden shadow-sm border border-success border-opacity-25"
          role="alert"
          aria-live="assertive"
        >
          <div
            className="d-flex align-items-center justify-content-between px-4 py-3"
            style={{ background: 'linear-gradient(135deg, #0d9f4f 0%, #059669 100%)' }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle bg-white"
                style={{ width: '44px', height: '44px', flexShrink: 0 }}
                aria-hidden="true"
              >
                <i className="bi bi-check-circle-fill text-success fs-4" />
              </div>
              <div>
                <h5 className="fw-bold text-white mb-0" style={{ fontSize: '1rem' }}>
                  Patient Registered Successfully!
                </h5>
                <p className="mb-0 text-white opacity-75 small">
                  {successData.data.firstName} {successData.data.lastName} is now active in the system.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-link p-1 text-white opacity-75"
              onClick={handleDismissSuccess}
              aria-label="Dismiss success message"
              title="Dismiss"
            >
              <i className="bi bi-x-lg fs-5" />
            </button>
          </div>

          <div className="bg-white px-4 py-4">
            <div className="row g-3 align-items-center">
              <div className="col-12 col-md-6">
                <p className="text-muted small fw-semibold mb-1 text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  Assigned Patient ID
                </p>
                <div className="d-flex align-items-center gap-3">
                  <span
                    className="fw-extrabold text-dark d-inline-flex align-items-center gap-2"
                    style={{ fontSize: '1.6rem', fontFamily: 'monospace', letterSpacing: '1px' }}
                  >
                    <i className="bi bi-person-badge-fill text-primary" style={{ fontSize: '1.4rem' }} aria-hidden="true" />
                    {successData.data.patId}
                  </span>
                </div>
                <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.78rem' }}>
                  <i className="bi bi-info-circle me-1" aria-hidden="true" />
                  Save this ID — it is required for claim submissions and appointments.
                </p>
              </div>

              <div className="col-12 col-md-6">
                <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                  <button
                    type="button"
                    id="copy-patient-id-btn"
                    className={`btn fw-semibold d-flex align-items-center gap-2 ${copied ? 'btn-success' : 'btn-outline-secondary'}`}
                    onClick={handleCopyId}
                    style={{ minWidth: '130px' }}
                    aria-label={`Copy patient ID ${successData.data.patId} to clipboard`}
                  >
                    <i className={`bi ${copied ? 'bi-check2' : 'bi-clipboard'}`} aria-hidden="true" />
                    {copied ? 'Copied!' : 'Copy ID'}
                  </button>

                  <button
                    type="button"
                    id="proceed-to-claim-btn"
                    className="btn btn-primary fw-bold d-flex align-items-center gap-2 shadow-sm"
                    onClick={handleProceedToClaim}
                    aria-label="Proceed to submit insurance claim for this patient"
                  >
                    <i className="bi bi-file-earmark-medical-fill" aria-hidden="true" />
                    Proceed to Submit Claim
                    <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
                  </button>
                </div>

                <div className="d-flex gap-3 justify-content-md-end mt-2">
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-muted text-decoration-none"
                    onClick={handleDismissSuccess}
                    style={{ fontSize: '0.8rem' }}
                  >
                    <i className="bi bi-plus-circle me-1" aria-hidden="true" />
                    Register Another Patient
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {serverError && (
        <div className="alert alert-danger shadow-sm mb-4" role="alert" aria-live="assertive">
          <i className="bi bi-exclamation-octagon-fill me-2" aria-hidden="true" />
          {serverError}
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-header bg-white py-3 border-bottom">
          <h2 className="h6 fw-bold mb-0 text-dark">Demographics &amp; Clinical Profile</h2>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate aria-label="Patient registration form">
            <div className="row g-3">

              <div className="col-12 col-md-6">
                <label htmlFor="firstName" className="form-label fw-semibold text-secondary small">
                  First Name <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <FormField
                  id="firstName" name="firstName" type="text"
                  placeholder="e.g. Aarav"
                  value={fields.firstName} error={errors.firstName} onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="lastName" className="form-label fw-semibold text-secondary small">
                  Last Name <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <FormField
                  id="lastName" name="lastName" type="text"
                  placeholder="e.g. Sharma"
                  value={fields.lastName} error={errors.lastName} onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-4">
                <label htmlFor="dateOfBirth" className="form-label fw-semibold text-secondary small">
                  Date of Birth <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <FormField
                  id="dateOfBirth" name="dateOfBirth" type="date"
                  value={fields.dateOfBirth} error={errors.dateOfBirth} onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-4">
                <label htmlFor="gender" className="form-label fw-semibold text-secondary small">
                  Gender <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <select
                  id="gender" name="gender"
                  className={`form-select${errors.gender ? ' is-invalid' : ''}`}
                  value={fields.gender} onChange={handleChange}
                  aria-required="true" aria-invalid={!!errors.gender}
                  aria-describedby={errors.gender ? 'gender-error' : undefined}
                >
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
                {errors.gender && (
                  <div id="gender-error" className="invalid-feedback" role="alert">{errors.gender}</div>
                )}
              </div>

              <div className="col-12 col-md-4">
                <label htmlFor="bloodGroup" className="form-label fw-semibold text-secondary small">
                  Blood Group <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <select
                  id="bloodGroup" name="bloodGroup"
                  className={`form-select${errors.bloodGroup ? ' is-invalid' : ''}`}
                  value={fields.bloodGroup} onChange={handleChange}
                  aria-required="true" aria-invalid={!!errors.bloodGroup}
                  aria-describedby={errors.bloodGroup ? 'bloodGroup-error' : undefined}
                >
                  <option value="">Select blood group</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg}>{bg}</option>
                  ))}
                </select>
                {errors.bloodGroup && (
                  <div id="bloodGroup-error" className="invalid-feedback" role="alert">{errors.bloodGroup}</div>
                )}
              </div>

              <div className="col-12 col-md-4">
                <label htmlFor="contactNumber" className="form-label fw-semibold text-secondary small">
                  Contact Number <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <FormField
                  id="contactNumber" name="contactNumber" type="tel"
                  placeholder="10-digit mobile number" prefix="+91"
                  maxLength={10}
                  value={fields.contactNumber} error={errors.contactNumber} onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-4">
                <label htmlFor="email" className="form-label fw-semibold text-secondary small">
                  Email Address <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <FormField
                  id="email" name="email" type="email"
                  placeholder="patient@example.com"
                  value={fields.email} error={errors.email} onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-4">
                <label htmlFor="emergencyContact" className="form-label fw-semibold text-secondary small">
                  Emergency Contact <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <FormField
                  id="emergencyContact" name="emergencyContact" type="tel"
                  placeholder="10-digit phone" prefix="+91"
                  maxLength={10}
                  value={fields.emergencyContact} error={errors.emergencyContact} onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label htmlFor="address" className="form-label fw-semibold text-secondary small">
                  Home Residential Address <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="address" name="address" rows={3}
                  className={`form-control${errors.address ? ' is-invalid' : ''}`}
                  placeholder="Flat / House No., Street, Locality, City, State, PIN Code…"
                  value={fields.address} onChange={handleChange}
                  aria-required="true" aria-invalid={!!errors.address}
                  aria-describedby={errors.address ? 'address-error' : undefined}
                />
                {errors.address && (
                  <div id="address-error" className="invalid-feedback" role="alert">{errors.address}</div>
                )}
              </div>

            </div>

            <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
              <button
                type="button"
                className="btn btn-light border px-4 fw-semibold"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Reset Form
              </button>

              <button
                type="submit"
                id="complete-registration-btn"
                className="btn btn-primary px-4 shadow-sm fw-bold d-flex align-items-center gap-2"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting
                  ? <Spinner variant="inline" size="sm" message="Registering…" />
                  : <><i className="bi bi-person-check-fill" aria-hidden="true" /> Complete Registration</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistration;
