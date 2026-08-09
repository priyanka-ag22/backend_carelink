import React, { useState, useEffect, useCallback } from 'react';
import doctorService from '../services/doctorService';
import Spinner from '../components/Spinner';

const SPECIALTIES = ['Cardiology','Neurology','Orthopedics','Pediatrics','Oncology','Dermatology','Psychiatry','Radiology','Anesthesiology','General Surgery','Internal Medicine','Ophthalmology','ENT','Gynecology','Urology'];

const DoctorModal = ({ doctor, onClose, onSaved }) => {
  const isEdit = !!doctor;
  const blank = { firstName:'',lastName:'',email:'',phone:'',specialty:'',gender:'',experienceYears:'',qualification:'',department:'' };
  const [f, setF] = useState(isEdit ? { ...doctor, experienceYears: doctor.experienceYears ?? '' } : blank);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [srvErr, setSrvErr] = useState(null);

  const set = (k,v) => { setF((p)=>({...p,[k]:v})); setErrors((p)=>({...p,[k]:undefined})); };

  const validate = () => {
    const e = {};
    if (!f.firstName.trim())   e.firstName  = 'Required';
    if (!f.lastName.trim())    e.lastName   = 'Required';
    if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Valid email required';
    if (f.phone && !/^[0-9]{10}$/.test(f.phone)) e.phone = '10 digits';
    if (!f.specialty)          e.specialty  = 'Required';
    return e;
  };

  const handleSave = async () => {
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true); setSrvErr(null);
    try {
      const payload = { ...f, experienceYears: f.experienceYears === '' ? null : parseInt(f.experienceYears) };
      const result = isEdit ? await doctorService.updateDoctor(doctor.id, payload) : await doctorService.createDoctor(payload);
      onSaved(result, isEdit);
    } catch (err) {
      setSrvErr(err?.response?.data?.error ?? 'Save failed.');
    } finally { setSaving(false); }
  };

  const inp = (id, label, val, type = 'text', opts = {}) => (
    <div className={opts.full ? 'col-12' : 'col-12 col-md-6'}>
      <label htmlFor={`df-${id}`} className="form-label fw-semibold text-secondary small">{label}</label>
      <input id={`df-${id}`} type={type} className={`form-control${errors[id]?' is-invalid':''}`} value={val} onChange={(e)=>set(id,e.target.value)} maxLength={opts.max} />
      {errors[id] && <div className="invalid-feedback">{errors[id]}</div>}
    </div>
  );

  return (
    <div className="modal-overlay" style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem' }} onClick={onClose}>
      <div className="bg-white rounded-3 shadow-lg overflow-hidden" style={{ width:'100%',maxWidth:'640px',maxHeight:'90vh',display:'flex',flexDirection:'column' }} onClick={(e)=>e.stopPropagation()}>
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom" style={{ background:'linear-gradient(135deg,#0d6efd,#6610f2)' }}>
          <h2 className="h6 fw-bold text-white mb-0"><i className={`bi ${isEdit?'bi-pencil-square':'bi-person-badge-fill'} me-2`} />{isEdit?'Edit Doctor':'Add Doctor'}</h2>
          <button type="button" className="btn btn-link p-0 text-white" onClick={onClose} aria-label="Close"><i className="bi bi-x-lg fs-5" /></button>
        </div>
        <div className="overflow-auto p-4 flex-grow-1">
          {srvErr && <div className="alert alert-danger py-2 mb-3 small">{srvErr}</div>}
          <div className="row g-3">
            {inp('firstName','First Name',f.firstName)}
            {inp('lastName','Last Name',f.lastName)}
            {inp('email','Email',f.email,'email')}
            <div className="col-12 col-md-6">
              <label htmlFor="df-phone" className="form-label fw-semibold text-secondary small">Phone</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">+91</span>
                <input id="df-phone" type="tel" className={`form-control${errors.phone?' is-invalid':''}`} value={f.phone} onChange={(e)=>set('phone',e.target.value)} maxLength={10} />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="df-specialty" className="form-label fw-semibold text-secondary small">Specialty <span className="text-danger">*</span></label>
              <select id="df-specialty" className={`form-select${errors.specialty?' is-invalid':''}`} value={f.specialty} onChange={(e)=>set('specialty',e.target.value)}>
                <option value="">Select specialty</option>{SPECIALTIES.map((s)=><option key={s}>{s}</option>)}
              </select>
              {errors.specialty && <div className="invalid-feedback">{errors.specialty}</div>}
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="df-gender" className="form-label fw-semibold text-secondary small">Gender</label>
              <select id="df-gender" className="form-select" value={f.gender} onChange={(e)=>set('gender',e.target.value)}>
                <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            {inp('experienceYears','Experience (years)',f.experienceYears,'number')}
            {inp('qualification','Qualification',f.qualification)}
            {inp('department','Department',f.department)}
          </div>
        </div>
        <div className="px-4 py-3 border-top bg-light d-flex justify-content-end gap-2">
          <button className="btn btn-light border fw-semibold" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary fw-bold px-4" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : isEdit ? 'Update' : 'Add Doctor'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Doctors = () => {
  const [doctors,  setDoctors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [specF,    setSpecF]    = useState('');
  const [genderF,  setGenderF]  = useState('');
  const [modal,    setModal]    = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error,    setError]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setDoctors(await doctorService.getAllDoctors()); }
    catch { setError('Failed to load doctors.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = doctors.filter((d) => {
    const t = search.toLowerCase();
    const nm = d.fullName.toLowerCase().includes(t) || d.docId.toLowerCase().includes(t) || (d.email||'').toLowerCase().includes(t) || (d.specialty||'').toLowerCase().includes(t);
    return nm && (!specF || d.specialty === specF) && (!genderF || d.gender === genderF);
  });

  const handleSaved = (doc, isEdit) => {
    setDoctors((prev) => isEdit ? prev.map((d)=>d.id===doc.id?doc:d) : [doc,...prev]);
    setModal(null);
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Remove ${doc.fullName} from the system?`)) return;
    setDeleting(doc.id);
    try { await doctorService.deleteDoctor(doc.id); setDoctors((prev)=>prev.filter((d)=>d.id!==doc.id)); }
    catch { setError('Delete failed. Doctor may have linked appointments.'); }
    finally { setDeleting(null); }
  };

  return (
    <div>
      <div className="mb-4 pb-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 className="fw-extrabold text-dark mb-1" style={{ fontSize: '1.6rem' }}>
            <i className="bi bi-person-badge-fill me-2 text-primary" aria-hidden="true" />Doctor Management
          </h1>
          <p className="text-muted mb-0 small">Manage clinical staff, specialties, and department assignments.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-light border btn-sm fw-semibold" onClick={window.print} aria-label="Export to PDF"><i className="bi bi-printer me-1" />Export PDF</button>
          <button className="btn btn-light border btn-sm fw-semibold" onClick={load} disabled={loading}><i className={`bi bi-arrow-clockwise me-1 ${loading?'spin':''}`} />Refresh</button>
          <button className="btn btn-primary btn-sm fw-bold shadow-sm" onClick={()=>setModal({type:'add'})}><i className="bi bi-plus-circle-fill me-1" />Add Doctor</button>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2 mb-3 small d-flex justify-content-between align-items-center"><span>{error}</span><button className="btn-close btn-sm" onClick={()=>setError(null)} /></div>}

      <div className="card border-0 shadow-sm rounded-3 mb-3">
        <div className="card-body p-3">
          <div className="row g-2">
            <div className="col-12 col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-search" /></span>
                <input type="text" className="form-control bg-light border-start-0 shadow-none" placeholder="Search by name, specialty, ID…" value={search} onChange={(e)=>setSearch(e.target.value)} aria-label="Search doctors" />
              </div>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select form-select-sm bg-light" value={specF} onChange={(e)=>setSpecF(e.target.value)} aria-label="Filter by specialty">
                <option value="">All Specialties</option>{SPECIALTIES.map((s)=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select form-select-sm bg-light" value={genderF} onChange={(e)=>setGenderF(e.target.value)} aria-label="Filter by gender">
                <option value="">All Genders</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          {loading ? <div className="py-5"><Spinner size="lg" message="Loading clinical staff…" /></div> : (
            <div className="table-responsive">
              <table className="cl-table" aria-label="Doctor records">
                <thead>
                  <tr>
                    <th scope="col" className="ps-4">Doctor</th>
                    <th scope="col">ID</th>
                    <th scope="col">Specialty</th>
                    <th scope="col">Department</th>
                    <th scope="col">Experience</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={7} className="text-center py-5 text-muted"><i className="bi bi-person-x fs-2 d-block mb-2" />No doctors found.</td></tr>
                    : filtered.map((d) => (
                      <tr key={d.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar-initials" aria-hidden="true">{d.firstName?.[0]}{d.lastName?.[0]}</div>
                            <div>
                              <p className="fw-semibold text-dark mb-0" style={{ fontSize:'0.9rem' }}>{d.fullName}</p>
                              <small className="text-muted">{d.email}</small>
                            </div>
                          </div>
                        </td>
                        <td><code className="text-primary small fw-bold">{d.docId}</code></td>
                        <td>
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize:'0.75rem' }}>{d.specialty}</span>
                        </td>
                        <td className="text-secondary small">{d.department ?? '—'}</td>
                        <td className="text-secondary small">{d.experienceYears != null ? `${d.experienceYears} yrs` : '—'}</td>
                        <td>
                          <span className={`badge rounded-pill px-3 py-1 ${d.status==='Active'?'bg-success-subtle text-success':'bg-secondary-subtle text-secondary'}`} style={{ fontSize:'0.75rem' }}>
                            <span className={`rounded-circle d-inline-block me-1 ${d.status==='Active'?'bg-success':'bg-secondary'}`} style={{ width:'6px',height:'6px' }} aria-hidden="true" />
                            {d.status}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <div className="d-flex justify-content-end gap-1">
                            <button className="btn btn-sm btn-outline-primary" onClick={()=>setModal({type:'edit',doctor:d})} aria-label={`Edit ${d.fullName}`}><i className="bi bi-pencil-fill" /></button>
                            <button className="btn btn-sm btn-outline-danger" onClick={()=>handleDelete(d)} disabled={deleting===d.id} aria-label={`Delete ${d.fullName}`}>
                              {deleting===d.id?<span className="spinner-border spinner-border-sm" />:<i className="bi bi-trash3-fill" />}
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
        <div className="card-footer bg-white border-top py-3 text-end" style={{ fontSize:'0.8rem',color:'#64748b' }}>
          Showing <strong>{filtered.length}</strong> of <strong>{doctors.length}</strong> doctors
        </div>
      </div>

      {modal && <DoctorModal doctor={modal.type==='edit'?modal.doctor:null} onClose={()=>setModal(null)} onSaved={handleSaved} />}
    </div>
  );
};

export default Doctors;
