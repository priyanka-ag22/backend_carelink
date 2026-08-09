import React, { useState, useEffect, useCallback, useMemo } from 'react';
import appointmentService from '../services/appointmentService';
import { usePatients } from '../context/PatientContext';
import doctorService from '../services/doctorService';
import Spinner from '../components/Spinner';

const STATUS_CONFIG = {
  SCHEDULED:  { color: 'secondary', icon: 'calendar-check',  label: 'Scheduled'  },
  CONFIRMED:  { color: 'primary',   icon: 'check-circle',    label: 'Confirmed'  },
  COMPLETED:  { color: 'success',   icon: 'check-circle-fill',label: 'Completed' },
  CANCELLED:  { color: 'danger',    icon: 'x-circle-fill',   label: 'Cancelled'  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? { color: 'secondary', icon: 'dash-circle', label: status };
  return (
    <span className={`badge bg-${cfg.color}-subtle text-${cfg.color} border border-${cfg.color}-subtle rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1`} style={{ fontSize: '0.75rem' }}>
      <i className={`bi bi-${cfg.icon}`} aria-hidden="true" />{cfg.label}
    </span>
  );
};

const APPT_TYPES = ['OPD', 'Follow-up', 'Emergency', 'Surgery', 'ICU Review', 'Lab', 'Radiology', 'Teleconsult'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const BookingModal = ({ onClose, onBooked, patients, doctors }) => {
  const today = new Date().toISOString().split('T')[0];
  const [f, setF] = useState({ patientId:'', doctorId:'', appointmentDate: today, timeSlot:'09:00', type:'OPD', notes:'' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [srvErr, setSrvErr] = useState(null);

  const set = (k,v) => { setF((p)=>({...p,[k]:v})); setErrors((p)=>({...p,[k]:undefined})); };

  const validate = () => {
    const e = {};
    if (!f.patientId) e.patientId = 'Select a patient';
    if (!f.doctorId)  e.doctorId  = 'Select a doctor';
    if (!f.appointmentDate) e.appointmentDate = 'Required';
    if (!f.type)      e.type      = 'Required';
    return e;
  };

  const handleBook = async () => {
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true); setSrvErr(null);
    try {
      const payload = { ...f, patientId: parseInt(f.patientId), doctorId: parseInt(f.doctorId) };
      const result = await appointmentService.createAppointment(payload);
      onBooked(result);
    } catch (err) {
      setSrvErr(err?.response?.data?.error ?? 'Booking failed. Please retry.');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem' }} onClick={onClose}>
      <div className="bg-white rounded-3 shadow-lg overflow-hidden" style={{ width:'100%',maxWidth:'600px',maxHeight:'90vh',display:'flex',flexDirection:'column' }} onClick={(e)=>e.stopPropagation()}>
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom" style={{ background:'linear-gradient(135deg,#0d6efd,#6610f2)' }}>
          <h2 className="h6 fw-bold text-white mb-0"><i className="bi bi-calendar-plus-fill me-2" />Book Appointment</h2>
          <button type="button" className="btn btn-link p-0 text-white" onClick={onClose} aria-label="Close"><i className="bi bi-x-lg fs-5" /></button>
        </div>
        <div className="overflow-auto p-4 flex-grow-1">
          {srvErr && <div className="alert alert-danger py-2 mb-3 small">{srvErr}</div>}
          <div className="row g-3">
            <div className="col-12">
              <label htmlFor="appt-patient" className="form-label fw-semibold text-secondary small">Patient <span className="text-danger">*</span></label>
              <select id="appt-patient" className={`form-select${errors.patientId?' is-invalid':''}`} value={f.patientId} onChange={(e)=>set('patientId',e.target.value)}>
                <option value="">Select patient…</option>
                {patients.map((p)=><option key={p.id} value={p.id}>{p.patId} — {p.fullName}</option>)}
              </select>
              {errors.patientId && <div className="invalid-feedback">{errors.patientId}</div>}
            </div>
            <div className="col-12">
              <label htmlFor="appt-doctor" className="form-label fw-semibold text-secondary small">Doctor <span className="text-danger">*</span></label>
              <select id="appt-doctor" className={`form-select${errors.doctorId?' is-invalid':''}`} value={f.doctorId} onChange={(e)=>set('doctorId',e.target.value)}>
                <option value="">Select doctor…</option>
                {doctors.map((d)=><option key={d.id} value={d.id}>{d.fullName} — {d.specialty}</option>)}
              </select>
              {errors.doctorId && <div className="invalid-feedback">{errors.doctorId}</div>}
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="appt-date" className="form-label fw-semibold text-secondary small">Date <span className="text-danger">*</span></label>
              <input id="appt-date" type="date" min={today} className={`form-control${errors.appointmentDate?' is-invalid':''}`} value={f.appointmentDate} onChange={(e)=>set('appointmentDate',e.target.value)} />
              {errors.appointmentDate && <div className="invalid-feedback">{errors.appointmentDate}</div>}
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="appt-time" className="form-label fw-semibold text-secondary small">Time Slot</label>
              <input id="appt-time" type="time" className="form-control" value={f.timeSlot} onChange={(e)=>set('timeSlot',e.target.value)} />
            </div>
            <div className="col-12">
              <label htmlFor="appt-type" className="form-label fw-semibold text-secondary small">Type <span className="text-danger">*</span></label>
              <select id="appt-type" className={`form-select${errors.type?' is-invalid':''}`} value={f.type} onChange={(e)=>set('type',e.target.value)}>
                {APPT_TYPES.map((t)=><option key={t}>{t}</option>)}
              </select>
              {errors.type && <div className="invalid-feedback">{errors.type}</div>}
            </div>
            <div className="col-12">
              <label htmlFor="appt-notes" className="form-label fw-semibold text-secondary small">Notes</label>
              <textarea id="appt-notes" rows={2} className="form-control" placeholder="Any special instructions or clinical notes…" value={f.notes} onChange={(e)=>set('notes',e.target.value)} />
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-top bg-light d-flex justify-content-end gap-2">
          <button className="btn btn-light border fw-semibold" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary fw-bold px-4" onClick={handleBook} disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Booking…</> : 'Book Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Appointments = () => {
  const { patients } = usePatients();
  const [appointments, setAppointments] = useState([]);
  const [doctors,      setDoctors]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [view,         setView]         = useState('list');
  const [modal,        setModal]        = useState(false);
  const [search,       setSearch]       = useState('');
  const [statusF,      setStatusF]      = useState('');
  const [error,        setError]        = useState(null);
  const [calYear,      setCalYear]      = useState(new Date().getFullYear());
  const [calMonth,     setCalMonth]     = useState(new Date().getMonth());

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [appts, docs] = await Promise.all([appointmentService.getAllAppointments(), doctorService.getAllDoctors()]);
      setAppointments(appts);
      setDoctors(docs);
    } catch { setError('Failed to load appointments.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = appointments.filter((a) => {
    const t = search.toLowerCase();
    const nm = (`${a.patientFirstName} ${a.patientLastName}`).toLowerCase().includes(t) ||
               (`${a.doctorFirstName} ${a.doctorLastName}`).toLowerCase().includes(t) ||
               (a.type||'').toLowerCase().includes(t);
    return nm && (!statusF || a.status === statusF);
  });

  const calDays = useMemo(() => {
    const days = [];
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [calYear, calMonth]);

  const calApptMap = useMemo(() => {
    const map = {};
    appointments.forEach((a) => {
      if (!a.appointmentDate) return;
      const d = new Date(a.appointmentDate);
      if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(a);
      }
    });
    return map;
  }, [appointments, calYear, calMonth]);

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await appointmentService.updateStatus(id, status);
      setAppointments((prev) => prev.map((a) => a.id === id ? updated : a));
    } catch { setError('Status update failed.'); }
  };

  const handleBooked = (appt) => {
    setAppointments((prev) => [appt, ...prev]);
    setModal(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentService.deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch { setError('Delete failed.'); }
  };

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear((y)=>y-1); } else setCalMonth((m)=>m-1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear((y)=>y+1); } else setCalMonth((m)=>m+1); };

  const today = new Date();

  return (
    <div>
      <div className="mb-4 pb-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 className="fw-extrabold text-dark mb-1" style={{ fontSize: '1.6rem' }}>
            <i className="bi bi-calendar3 me-2 text-primary" aria-hidden="true" />Appointments
          </h1>
          <p className="text-muted mb-0 small">Schedule, manage, and track all outpatient and inpatient appointments.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <div className="btn-group btn-group-sm" role="group" aria-label="View toggle">
            <button className={`btn ${view==='list'?'btn-primary':'btn-light border'} fw-semibold`} onClick={()=>setView('list')}><i className="bi bi-list-ul me-1" />List</button>
            <button className={`btn ${view==='calendar'?'btn-primary':'btn-light border'} fw-semibold`} onClick={()=>setView('calendar')}><i className="bi bi-calendar3 me-1" />Calendar</button>
          </div>
          <button className="btn btn-primary btn-sm fw-bold shadow-sm" onClick={()=>setModal(true)}><i className="bi bi-plus-circle-fill me-1" />Book Appointment</button>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2 mb-3 small d-flex justify-content-between"><span>{error}</span><button className="btn-close btn-sm" onClick={()=>setError(null)} /></div>}

      {loading ? <div className="py-5"><Spinner size="lg" message="Loading appointments…" /></div> : (
        view === 'list' ? (
          <>
            <div className="card border-0 shadow-sm rounded-3 mb-3">
              <div className="card-body p-3 d-flex gap-2 flex-wrap">
                <div className="input-group input-group-sm" style={{ maxWidth:'280px' }}>
                  <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-search" /></span>
                  <input type="text" className="form-control bg-light border-start-0 shadow-none" placeholder="Search patient, doctor, type…" value={search} onChange={(e)=>setSearch(e.target.value)} aria-label="Search appointments" />
                </div>
                <select className="form-select form-select-sm bg-light" style={{ maxWidth:'160px' }} value={statusF} onChange={(e)=>setStatusF(e.target.value)} aria-label="Filter by status">
                  <option value="">All Statuses</option>
                  {Object.entries(STATUS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="cl-table" aria-label="Appointments list">
                    <thead>
                      <tr>
                        <th scope="col" className="ps-4">Patient</th>
                        <th scope="col">Doctor</th>
                        <th scope="col">Date & Time</th>
                        <th scope="col">Type</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0
                        ? <tr><td colSpan={6} className="text-center py-5 text-muted"><i className="bi bi-calendar-x fs-2 d-block mb-2" />No appointments found.</td></tr>
                        : filtered.map((a) => (
                          <tr key={a.id}>
                            <td className="ps-4">
                              <div className="d-flex align-items-center gap-2">
                                <div className="avatar-initials" style={{ width:'32px',height:'32px',fontSize:'0.7rem' }} aria-hidden="true">
                                  {a.patientFirstName?.[0]}{a.patientLastName?.[0]}
                                </div>
                                <span className="fw-semibold text-dark" style={{ fontSize:'0.87rem' }}>{a.patientFirstName} {a.patientLastName}</span>
                              </div>
                            </td>
                            <td style={{ fontSize:'0.87rem' }}>
                              <span className="fw-medium">Dr. {a.doctorFirstName} {a.doctorLastName}</span>
                              <small className="text-muted d-block">{a.doctorSpecialty}</small>
                            </td>
                            <td style={{ fontSize:'0.85rem' }}>
                              <span className="text-dark fw-semibold">{a.appointmentDate}</span>
                              {a.timeSlot && <small className="text-muted d-block">{a.timeSlot}</small>}
                            </td>
                            <td>
                              <span className="badge bg-light text-secondary border" style={{ fontSize:'0.75rem' }}>{a.type}</span>
                            </td>
                            <td><StatusBadge status={a.status} /></td>
                            <td className="text-end pe-4">
                              <div className="d-flex justify-content-end gap-1 flex-wrap">
                                {a.status === 'SCHEDULED' && <button className="btn btn-xs btn-outline-primary" style={{ fontSize:'0.72rem',padding:'2px 8px' }} onClick={()=>handleStatusChange(a.id,'CONFIRMED')}>Confirm</button>}
                                {(a.status === 'SCHEDULED' || a.status === 'CONFIRMED') && <button className="btn btn-xs btn-outline-success" style={{ fontSize:'0.72rem',padding:'2px 8px' }} onClick={()=>handleStatusChange(a.id,'COMPLETED')}>Complete</button>}
                                {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && <button className="btn btn-xs btn-outline-danger" style={{ fontSize:'0.72rem',padding:'2px 8px' }} onClick={()=>handleDelete(a.id)}>Cancel</button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer bg-white border-top py-3 text-end" style={{ fontSize:'0.8rem',color:'#64748b' }}>
                Showing <strong>{filtered.length}</strong> of <strong>{appointments.length}</strong> appointments
              </div>
            </div>
          </>
        ) : (
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
              <button className="btn btn-light border btn-sm" onClick={prevMonth} aria-label="Previous month"><i className="bi bi-chevron-left" /></button>
              <h2 className="h6 fw-bold mb-0 text-dark">{MONTHS[calMonth]} {calYear}</h2>
              <button className="btn btn-light border btn-sm" onClick={nextMonth} aria-label="Next month"><i className="bi bi-chevron-right" /></button>
            </div>
            <div className="card-body p-3">
              <div className="d-grid mb-2" style={{ gridTemplateColumns:'repeat(7,1fr)' }}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d)=>(
                  <div key={d} className="text-center fw-bold text-muted py-2" style={{ fontSize:'0.73rem',letterSpacing:'0.5px' }}>{d}</div>
                ))}
              </div>
              <div className="d-grid gap-1" style={{ gridTemplateColumns:'repeat(7,1fr)' }}>
                {calDays.map((day, i) => {
                  const appts = day ? (calApptMap[day] ?? []) : [];
                  const isToday = day && today.getDate()===day && today.getMonth()===calMonth && today.getFullYear()===calYear;
                  return (
                    <div key={i} className="rounded-2 p-2" style={{ minHeight:'80px', background: isToday ? '#eff6ff' : day ? '#f8fafc' : 'transparent', border: isToday ? '2px solid #0d6efd' : '1px solid #e2e8f0' }}>
                      {day && (
                        <>
                          <div className={`fw-bold mb-1 ${isToday?'text-primary':'text-dark'}`} style={{ fontSize:'0.82rem' }}>{day}</div>
                          {appts.slice(0,3).map((a)=>(
                            <div key={a.id} className={`rounded-1 px-1 mb-1 text-truncate`} style={{ fontSize:'0.65rem', background: STATUS_CONFIG[a.status]?.color === 'success' ? '#dcfce7' : STATUS_CONFIG[a.status]?.color === 'danger' ? '#fee2e2' : STATUS_CONFIG[a.status]?.color === 'primary' ? '#dbeafe' : '#f1f5f9', color:'#1e293b' }}>
                              {a.patientFirstName} — {a.type}
                            </div>
                          ))}
                          {appts.length > 3 && <small className="text-muted" style={{ fontSize:'0.65rem' }}>+{appts.length-3} more</small>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      )}

      {modal && <BookingModal onClose={()=>setModal(false)} onBooked={handleBooked} patients={patients} doctors={doctors} />}
    </div>
  );
};

export default Appointments;
