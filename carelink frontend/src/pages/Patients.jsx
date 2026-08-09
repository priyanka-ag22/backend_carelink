import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePatients } from '../context/PatientContext';
import { useSearchParams } from 'react-router-dom';
import patientService from '../services/patientService';
import Spinner from '../components/Spinner';

const GENDERS     = ['Male', 'Female', 'Other', 'Prefer not to say'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const StatusPill = ({ s }) => {
  const active = s === 'Active';
  return (
    <span
      className={`badge rounded-pill px-3 py-1 ${active ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}
      style={{ fontSize: '0.75rem' }}
    >
      <span className={`rounded-circle d-inline-block me-1 ${active ? 'bg-success' : 'bg-secondary'}`} style={{ width: '6px', height: '6px' }} aria-hidden="true" />
      {s}
    </span>
  );
};

const PatientFormModal = ({ patient, onClose, onSaved }) => {
  const isEdit = !!patient;
  const [fields, setFields] = useState(
    isEdit ? {
      firstName: patient.firstName, lastName: patient.lastName, email: patient.email,
      dateOfBirth: patient.dateOfBirth ?? '', gender: patient.gender ?? '',
      bloodGroup: patient.bloodGroup ?? '', contactNumber: patient.contactNumber ?? '',
      emergencyContact: patient.emergencyContact ?? '', address: patient.address ?? '',
    } : { firstName:'',lastName:'',email:'',dateOfBirth:'',gender:'',bloodGroup:'',contactNumber:'',emergencyContact:'',address:'' }
  );
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [srvErr,  setSrvErr]  = useState(null);

  const set = (k, v) => {
    setFields((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!fields.firstName.trim())  e.firstName  = 'Required';
    if (!fields.lastName.trim())   e.lastName   = 'Required';
    if (!fields.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) e.email = 'Valid email required';
    if (!fields.dateOfBirth)       e.dateOfBirth = 'Required';
    if (!fields.gender)            e.gender      = 'Required';
    if (!fields.bloodGroup)        e.bloodGroup  = 'Required';
    if (!/^[0-9]{10}$/.test(fields.contactNumber))   e.contactNumber   = '10 digits required';
    if (!/^[0-9]{10}$/.test(fields.emergencyContact)) e.emergencyContact = '10 digits required';
    if (fields.address.trim().length < 10)             e.address         = 'Min 10 characters';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true); setSrvErr(null);
    try {
      const result = isEdit
        ? await patientService.updatePatient(patient.id, fields)
        : (await patientService.registerPatient(fields)).data;
      onSaved(result, isEdit);
    } catch (err) {
      setSrvErr(err?.response?.data?.error ?? 'Save failed. Please retry.');
    } finally { setSaving(false); }
  };

  const f = (id, label, val, type = 'text', prefix = null) => (
    <div className="col-12 col-md-6">
      <label htmlFor={`pf-${id}`} className="form-label fw-semibold text-secondary small">{label}</label>
      <div className={prefix ? 'input-group' : undefined}>
        {prefix && <span className="input-group-text bg-light text-muted">{prefix}</span>}
        <input
          id={`pf-${id}`} type={type}
          className={`form-control${errors[id] ? ' is-invalid' : ''}`}
          value={val} onChange={(e) => set(id, e.target.value)}
          maxLength={type === 'tel' ? 10 : undefined}
        />
        {errors[id] && <div className="invalid-feedback">{errors[id]}</div>}
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem' }} onClick={onClose}>
      <div className="bg-white rounded-3 shadow-lg overflow-hidden" style={{ width:'100%',maxWidth:'680px',maxHeight:'90vh',display:'flex',flexDirection:'column' }} onClick={(e) => e.stopPropagation()}>
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom" style={{ background:'linear-gradient(135deg,#0d6efd,#6610f2)' }}>
          <h2 className="h6 fw-bold text-white mb-0"><i className={`bi ${isEdit?'bi-pencil-square':'bi-person-plus-fill'} me-2`} aria-hidden="true" />{isEdit ? 'Edit Patient' : 'Add New Patient'}</h2>
          <button type="button" className="btn btn-link p-0 text-white" onClick={onClose} aria-label="Close modal"><i className="bi bi-x-lg fs-5" /></button>
        </div>
        <div className="overflow-auto p-4 flex-grow-1">
          {srvErr && <div className="alert alert-danger py-2 mb-3 small">{srvErr}</div>}
          <div className="row g-3">
            {f('firstName','First Name',fields.firstName)}
            {f('lastName','Last Name',fields.lastName)}
            {f('email','Email',fields.email,'email')}
            {f('dateOfBirth','Date of Birth',fields.dateOfBirth,'date')}
            <div className="col-12 col-md-6">
              <label htmlFor="pf-gender" className="form-label fw-semibold text-secondary small">Gender</label>
              <select id="pf-gender" className={`form-select${errors.gender?' is-invalid':''}`} value={fields.gender} onChange={(e)=>set('gender',e.target.value)}>
                <option value="">Select</option>{GENDERS.map((g)=><option key={g}>{g}</option>)}
              </select>
              {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="pf-bg" className="form-label fw-semibold text-secondary small">Blood Group</label>
              <select id="pf-bg" className={`form-select${errors.bloodGroup?' is-invalid':''}`} value={fields.bloodGroup} onChange={(e)=>set('bloodGroup',e.target.value)}>
                <option value="">Select</option>{BLOOD_GROUPS.map((b)=><option key={b}>{b}</option>)}
              </select>
              {errors.bloodGroup && <div className="invalid-feedback">{errors.bloodGroup}</div>}
            </div>
            {f('contactNumber','Contact Number',fields.contactNumber,'tel','+91')}
            {f('emergencyContact','Emergency Contact',fields.emergencyContact,'tel','+91')}
            <div className="col-12">
              <label htmlFor="pf-address" className="form-label fw-semibold text-secondary small">Address</label>
              <textarea id="pf-address" rows={2} className={`form-control${errors.address?' is-invalid':''}`} value={fields.address} onChange={(e)=>set('address',e.target.value)} />
              {errors.address && <div className="invalid-feedback">{errors.address}</div>}
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-top bg-light d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-light border fw-semibold" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="button" className="btn btn-primary fw-bold px-4" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : isEdit ? 'Update Patient' : 'Register Patient'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Patients = () => {
  const { patients, patientsLoading, addPatientToState, refreshPatients } = usePatients();
  const [searchParams] = useSearchParams();
  const [search,     setSearch]     = useState(searchParams.get('q') ?? '');
  const [genderF,    setGenderF]    = useState('');
  const [bgF,        setBgF]        = useState('');
  const [modal,      setModal]      = useState(null);
  const [deleting,   setDeleting]   = useState(null);
  const [deleteErr,  setDeleteErr]  = useState(null);
  const [localList,  setLocalList]  = useState(patients);

  useEffect(() => { setLocalList(patients); }, [patients]);

  const filtered = localList.filter((p) => {
    const t = search.toLowerCase();
    const nameMatch = p.fullName.toLowerCase().includes(t) || p.patId.toLowerCase().includes(t) || (p.email||'').toLowerCase().includes(t);
    const gMatch = !genderF || p.gender === genderF;
    const bMatch = !bgF    || p.bloodGroup === bgF;
    return nameMatch && gMatch && bMatch;
  });

  const handlePrint = () => window.print();

  const handleSaved = (patient, isEdit) => {
    if (isEdit) {
      setLocalList((prev) => prev.map((p) => p.id === patient.id ? patient : p));
    } else {
      addPatientToState(patient);
      setLocalList((prev) => [patient, ...prev]);
    }
    setModal(null);
  };

  const handleDelete = async (patient) => {
    if (!window.confirm(`Delete patient ${patient.fullName}? This cannot be undone.`)) return;
    setDeleting(patient.id); setDeleteErr(null);
    try {
      await patientService.deletePatient(patient.id);
      setLocalList((prev) => prev.filter((p) => p.id !== patient.id));
    } catch {
      setDeleteErr('Delete failed. Patient may have linked records.');
    } finally { setDeleting(null); }
  };

  return (
    <div>
      <div className="mb-4 pb-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 className="fw-extrabold text-dark mb-1" style={{ fontSize: '1.6rem' }}>
            <i className="bi bi-people-fill me-2 text-primary" aria-hidden="true" />Patient Management
          </h1>
          <p className="text-muted mb-0 small">Manage patient records, demographic data, and clinical profiles.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-light border btn-sm fw-semibold d-flex align-items-center gap-2" onClick={handlePrint}>
            <i className="bi bi-printer" aria-hidden="true" />Export PDF
          </button>
          <button className="btn btn-light border btn-sm fw-semibold d-flex align-items-center gap-2" onClick={refreshPatients} disabled={patientsLoading}>
            <i className={`bi bi-arrow-clockwise ${patientsLoading?'spin':''}`} aria-hidden="true" />Refresh
          </button>
          <button className="btn btn-primary btn-sm fw-bold d-flex align-items-center gap-2 shadow-sm" onClick={() => setModal({ type: 'add' })}>
            <i className="bi bi-plus-circle-fill" aria-hidden="true" />Add Patient
          </button>
        </div>
      </div>

      {deleteErr && <div className="alert alert-danger py-2 mb-3 small d-flex justify-content-between align-items-center"><span>{deleteErr}</span><button className="btn-close btn-sm" onClick={()=>setDeleteErr(null)} /></div>}

      <div className="card border-0 shadow-sm rounded-3 mb-3">
        <div className="card-body p-3">
          <div className="row g-2">
            <div className="col-12 col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-search" /></span>
                <input type="text" className="form-control bg-light border-start-0 shadow-none" placeholder="Search by name, ID, or email…" value={search} onChange={(e)=>setSearch(e.target.value)} aria-label="Search patients" />
              </div>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select form-select-sm bg-light" value={genderF} onChange={(e)=>setGenderF(e.target.value)} aria-label="Filter by gender">
                <option value="">All Genders</option>{GENDERS.map((g)=><option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select form-select-sm bg-light" value={bgF} onChange={(e)=>setBgF(e.target.value)} aria-label="Filter by blood group">
                <option value="">All Blood Groups</option>{BLOOD_GROUPS.map((b)=><option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-header bg-white py-3 border-bottom">
          <span className="small text-muted fw-semibold">
            Showing <strong className="text-dark">{filtered.length}</strong> of <strong className="text-dark">{localList.length}</strong> patients
          </span>
        </div>
        <div className="card-body p-0">
          {patientsLoading ? (
            <div className="py-5"><Spinner size="lg" message="Loading patient records…" /></div>
          ) : (
            <div className="table-responsive">
              <table className="cl-table" aria-label="Patient records">
                <thead>
                  <tr>
                    <th scope="col" className="ps-4">Patient</th>
                    <th scope="col">Patient ID</th>
                    <th scope="col">Gender</th>
                    <th scope="col">Blood Group</th>
                    <th scope="col">Contact</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-5 text-muted"><i className="bi bi-person-x fs-2 d-block mb-2" />No patients match your search.</td></tr>
                  ) : filtered.map((p) => (
                    <tr key={p.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-initials" aria-hidden="true">{p.firstName?.[0]}{p.lastName?.[0]}</div>
                          <div>
                            <p className="fw-semibold text-dark mb-0" style={{ fontSize: '0.9rem' }}>{p.fullName}</p>
                            <small className="text-muted">{p.email}</small>
                          </div>
                        </div>
                      </td>
                      <td><code className="text-primary small fw-bold">{p.patId}</code></td>
                      <td className="text-secondary small">{p.gender ?? '—'}</td>
                      <td>
                        {p.bloodGroup
                          ? <span className="badge" style={{ background:'#fee2e2',color:'#991b1b',fontSize:'0.75rem' }}>{p.bloodGroup}</span>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td className="text-secondary small">{p.contactNumber ?? '—'}</td>
                      <td><StatusPill s={p.status ?? 'Active'} /></td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-1">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => setModal({ type: 'edit', patient: p })} aria-label={`Edit ${p.fullName}`}>
                            <i className="bi bi-pencil-fill" />
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p)} disabled={deleting === p.id} aria-label={`Delete ${p.fullName}`}>
                            {deleting === p.id ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-trash3-fill" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <PatientFormModal
          patient={modal.type === 'edit' ? modal.patient : null}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default Patients;
