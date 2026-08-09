import React, { useState, useEffect, useCallback, useRef } from 'react';
import medicalRecordService from '../services/medicalRecordService';
import { usePatients } from '../context/PatientContext';
import doctorService from '../services/doctorService';
import Spinner from '../components/Spinner';

const FILE_ICONS = { 'application/pdf': 'bi-file-earmark-pdf-fill', 'image/png': 'bi-file-earmark-image-fill', 'image/jpeg': 'bi-file-earmark-image-fill', 'default': 'bi-file-earmark-fill' };

const RecordModal = ({ record, onClose, onSaved, patients, doctors }) => {
  const isEdit = !!record;
  const today = new Date().toISOString().split('T')[0];
  const [f, setF] = useState(isEdit ? {
    patientId: String(record.patientId), doctorId: record.doctorId ? String(record.doctorId) : '',
    diagnosis: record.diagnosis, prescription: record.prescription ?? '', notes: record.notes ?? '',
    recordDate: record.recordDate ?? today,
  } : { patientId:'', doctorId:'', diagnosis:'', prescription:'', notes:'', recordDate: today });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [srvErr, setSrvErr] = useState(null);

  const set = (k,v) => { setF((p)=>({...p,[k]:v})); setErrors((p)=>({...p,[k]:undefined})); };

  const validate = () => {
    const e = {};
    if (!f.patientId)            e.patientId  = 'Required';
    if (!f.diagnosis.trim())     e.diagnosis  = 'Required';
    if (!f.recordDate)           e.recordDate = 'Required';
    return e;
  };

  const handleSave = async () => {
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true); setSrvErr(null);
    try {
      const payload = { ...f, patientId: parseInt(f.patientId), doctorId: f.doctorId ? parseInt(f.doctorId) : null };
      const result = isEdit
        ? await medicalRecordService.updateRecord(record.id, payload, file)
        : await medicalRecordService.createRecord(payload, file);
      onSaved(result, isEdit);
    } catch (err) {
      setSrvErr(err?.response?.data?.error ?? 'Save failed.');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem' }} onClick={onClose}>
      <div className="bg-white rounded-3 shadow-lg overflow-hidden" style={{ width:'100%',maxWidth:'640px',maxHeight:'90vh',display:'flex',flexDirection:'column' }} onClick={(e)=>e.stopPropagation()}>
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom" style={{ background:'linear-gradient(135deg,#0d6efd,#6610f2)' }}>
          <h2 className="h6 fw-bold text-white mb-0"><i className={`bi ${isEdit?'bi-pencil-square':'bi-journal-medical'} me-2`} />{isEdit?'Edit Record':'Add Medical Record'}</h2>
          <button type="button" className="btn btn-link p-0 text-white" onClick={onClose} aria-label="Close"><i className="bi bi-x-lg fs-5" /></button>
        </div>
        <div className="overflow-auto p-4 flex-grow-1">
          {srvErr && <div className="alert alert-danger py-2 mb-3 small">{srvErr}</div>}
          <div className="row g-3">
            <div className="col-12">
              <label htmlFor="mr-patient" className="form-label fw-semibold text-secondary small">Patient <span className="text-danger">*</span></label>
              <select id="mr-patient" className={`form-select${errors.patientId?' is-invalid':''}`} value={f.patientId} onChange={(e)=>set('patientId',e.target.value)}>
                <option value="">Select patient…</option>
                {patients.map((p)=><option key={p.id} value={p.id}>{p.patId} — {p.fullName}</option>)}
              </select>
              {errors.patientId && <div className="invalid-feedback">{errors.patientId}</div>}
            </div>
            <div className="col-12">
              <label htmlFor="mr-doctor" className="form-label fw-semibold text-secondary small">Treating Doctor</label>
              <select id="mr-doctor" className="form-select" value={f.doctorId} onChange={(e)=>set('doctorId',e.target.value)}>
                <option value="">Select doctor (optional)…</option>
                {doctors.map((d)=><option key={d.id} value={d.id}>{d.fullName} — {d.specialty}</option>)}
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="mr-date" className="form-label fw-semibold text-secondary small">Record Date <span className="text-danger">*</span></label>
              <input id="mr-date" type="date" className={`form-control${errors.recordDate?' is-invalid':''}`} value={f.recordDate} onChange={(e)=>set('recordDate',e.target.value)} />
              {errors.recordDate && <div className="invalid-feedback">{errors.recordDate}</div>}
            </div>
            <div className="col-12">
              <label htmlFor="mr-diagnosis" className="form-label fw-semibold text-secondary small">Diagnosis <span className="text-danger">*</span></label>
              <input id="mr-diagnosis" type="text" className={`form-control${errors.diagnosis?' is-invalid':''}`} placeholder="Primary diagnosis / ICD code" value={f.diagnosis} onChange={(e)=>set('diagnosis',e.target.value)} />
              {errors.diagnosis && <div className="invalid-feedback">{errors.diagnosis}</div>}
            </div>
            <div className="col-12">
              <label htmlFor="mr-prescription" className="form-label fw-semibold text-secondary small">Prescription</label>
              <textarea id="mr-prescription" rows={2} className="form-control" placeholder="Medications, dosages, frequency…" value={f.prescription} onChange={(e)=>set('prescription',e.target.value)} />
            </div>
            <div className="col-12">
              <label htmlFor="mr-notes" className="form-label fw-semibold text-secondary small">Clinical Notes</label>
              <textarea id="mr-notes" rows={2} className="form-control" placeholder="Observations, follow-up instructions…" value={f.notes} onChange={(e)=>set('notes',e.target.value)} />
            </div>
            <div className="col-12">
              <label htmlFor="mr-file" className="form-label fw-semibold text-secondary small">Attach File (PDF / Image, max 20 MB)</label>
              <input id="mr-file" type="file" className="form-control" accept="application/pdf,image/*" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
              {isEdit && record.fileName && !file && (
                <small className="text-muted mt-1 d-block">
                  <i className="bi bi-paperclip me-1" />{record.fileName} (existing — upload new to replace)
                </small>
              )}
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-top bg-light d-flex justify-content-end gap-2">
          <button className="btn btn-light border fw-semibold" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary fw-bold px-4" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : isEdit?'Update Record':'Save Record'}
          </button>
        </div>
      </div>
    </div>
  );
};

const MedicalRecords = () => {
  const { patients } = usePatients();
  const [records,  setRecords]  = useState([]);
  const [doctors,  setDoctors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [patF,     setPatF]     = useState('');
  const [modal,    setModal]    = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error,    setError]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [recs, docs] = await Promise.all([medicalRecordService.getAllRecords(), doctorService.getAllDoctors()]);
      setRecords(recs); setDoctors(docs);
    } catch { setError('Failed to load medical records.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = records.filter((r) => {
    const t = search.toLowerCase();
    const nm = (`${r.patientFirstName} ${r.patientLastName}`).toLowerCase().includes(t) ||
               (r.diagnosis||'').toLowerCase().includes(t);
    const pMatch = !patF || String(r.patientId) === patF;
    return nm && pMatch;
  });

  const handleSaved = (rec, isEdit) => {
    setRecords((prev) => isEdit ? prev.map((r) => r.id===rec.id ? rec : r) : [rec, ...prev]);
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medical record?')) return;
    setDeleting(id);
    try { await medicalRecordService.deleteRecord(id); setRecords((prev)=>prev.filter((r)=>r.id!==id)); }
    catch { setError('Delete failed.'); }
    finally { setDeleting(null); }
  };

  return (
    <div>
      <div className="mb-4 pb-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 className="fw-extrabold text-dark mb-1" style={{ fontSize:'1.6rem' }}>
            <i className="bi bi-journal-medical me-2 text-primary" aria-hidden="true" />Medical Records
          </h1>
          <p className="text-muted mb-0 small">Electronic health records with diagnosis, prescriptions, and document attachments.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-light border btn-sm fw-semibold" onClick={load} disabled={loading}><i className={`bi bi-arrow-clockwise me-1 ${loading?'spin':''}`} />Refresh</button>
          <button className="btn btn-primary btn-sm fw-bold shadow-sm" onClick={()=>setModal({type:'add'})}><i className="bi bi-plus-circle-fill me-1" />Add Record</button>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2 mb-3 small d-flex justify-content-between"><span>{error}</span><button className="btn-close btn-sm" onClick={()=>setError(null)} /></div>}

      <div className="card border-0 shadow-sm rounded-3 mb-3">
        <div className="card-body p-3 d-flex gap-2 flex-wrap">
          <div className="input-group input-group-sm" style={{ maxWidth:'280px' }}>
            <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-search" /></span>
            <input type="text" className="form-control bg-light border-start-0 shadow-none" placeholder="Search patient or diagnosis…" value={search} onChange={(e)=>setSearch(e.target.value)} aria-label="Search records" />
          </div>
          <select className="form-select form-select-sm bg-light" style={{ maxWidth:'200px' }} value={patF} onChange={(e)=>setPatF(e.target.value)} aria-label="Filter by patient">
            <option value="">All Patients</option>
            {patients.map((p)=><option key={p.id} value={p.id}>{p.fullName}</option>)}
          </select>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          {loading ? <div className="py-5"><Spinner size="lg" message="Loading records…" /></div> : (
            <div className="table-responsive">
              <table className="cl-table" aria-label="Medical records">
                <thead>
                  <tr>
                    <th scope="col" className="ps-4">Patient</th>
                    <th scope="col">Doctor</th>
                    <th scope="col">Diagnosis</th>
                    <th scope="col">Date</th>
                    <th scope="col">Attachment</th>
                    <th scope="col" className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={6} className="text-center py-5 text-muted"><i className="bi bi-journal-x fs-2 d-block mb-2" />No records found.</td></tr>
                    : filtered.map((r) => (
                      <tr key={r.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-2">
                            <div className="avatar-initials" style={{ width:'32px',height:'32px',fontSize:'0.7rem' }} aria-hidden="true">
                              {r.patientFirstName?.[0]}{r.patientLastName?.[0]}
                            </div>
                            <span className="fw-semibold text-dark" style={{ fontSize:'0.87rem' }}>{r.patientFirstName} {r.patientLastName}</span>
                          </div>
                        </td>
                        <td style={{ fontSize:'0.85rem' }}>{r.doctorFirstName ? `Dr. ${r.doctorFirstName} ${r.doctorLastName}` : <span className="text-muted">—</span>}</td>
                        <td>
                          <span className="fw-semibold text-dark" style={{ fontSize:'0.87rem' }}>{r.diagnosis}</span>
                          {r.prescription && <small className="text-muted d-block text-truncate" style={{ maxWidth:'200px' }}>{r.prescription}</small>}
                        </td>
                        <td className="text-secondary small">{r.recordDate}</td>
                        <td>
                          {r.fileUrl
                            ? <a href={`http://localhost:8080${r.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline-secondary d-flex align-items-center gap-1" style={{ fontSize:'0.72rem',padding:'2px 8px',width:'fit-content' }}>
                                <i className={`bi ${FILE_ICONS[r.fileType] ?? FILE_ICONS.default}`} />View
                              </a>
                            : <span className="text-muted small">—</span>}
                        </td>
                        <td className="text-end pe-4">
                          <div className="d-flex justify-content-end gap-1">
                            <button className="btn btn-sm btn-outline-primary" onClick={()=>setModal({type:'edit',record:r})} aria-label="Edit record"><i className="bi bi-pencil-fill" /></button>
                            <button className="btn btn-sm btn-outline-danger" onClick={()=>handleDelete(r.id)} disabled={deleting===r.id} aria-label="Delete record">
                              {deleting===r.id?<span className="spinner-border spinner-border-sm" />:<i className="bi bi-trash3-fill" />}
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

      {modal && <RecordModal record={modal.type==='edit'?modal.record:null} onClose={()=>setModal(null)} onSaved={handleSaved} patients={patients} doctors={doctors} />}
    </div>
  );
};

export default MedicalRecords;
