import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { claimService } from '../services/claimService';
import Spinner from '../components/Spinner';

const KPI_CONFIG = [
  { key: 'totalPatients',    label: 'Total Patients',    icon: 'people-fill',              accentColor: 'primary', trend: '+12.5% this month', trendColor: 'text-success', trendIcon: 'graph-up-arrow' },
  { key: 'activeClaims',     label: 'Active Claims',     icon: 'file-earmark-check-fill',  accentColor: 'info',    trend: '94% clearance rate', trendColor: 'text-info',    trendIcon: 'shield-check' },
  { key: 'pendingApprovals', label: 'Pending Approvals', icon: 'clock-history',            accentColor: 'warning', trend: 'Action required',    trendColor: 'text-warning', trendIcon: 'exclamation-circle' },
  { key: 'revenue',          label: 'Revenue (YTD)',     icon: 'currency-rupee',           accentColor: 'success', trend: '+8.4% vs target',    trendColor: 'text-success', trendIcon: 'arrow-up-right-circle' },
];

const OCCUPANCY = [
  { label: 'ICU',                    pct: 82, color: 'danger'  },
  { label: 'General Ward',           pct: 64, color: 'primary' },
  { label: 'Emergency Beds',         pct: 35, color: 'success' },
  { label: 'Surgical Theatre Queue', pct: 55, color: 'warning' },
];

const MONTHLY_DATA = [
  { month: 'Mar', value: 38 }, { month: 'Apr', value: 52 }, { month: 'May', value: 61 },
  { month: 'Jun', value: 45 }, { month: 'Jul', value: 73 }, { month: 'Aug', value: 58 },
];

const TODAY_SCHEDULE = [
  { time: '09:00', patient: 'Aarav Sharma',  doctor: 'Dr. Mehta',  type: 'OPD',       status: 'Confirmed' },
  { time: '09:30', patient: 'Priya Patel',   doctor: 'Dr. Iyer',   type: 'Follow-up', status: 'Waiting'   },
  { time: '10:15', patient: 'Vikram Nair',   doctor: 'Dr. Sharma', type: 'ICU Review',status: 'In Progress'},
  { time: '11:00', patient: 'Meera Iyer',    doctor: 'Dr. Mehta',  type: 'OPD',       status: 'Scheduled' },
  { time: '11:45', patient: 'Rajesh Gupta',  doctor: 'Dr. Bose',   type: 'Surgery',   status: 'Scheduled' },
];

const maxBarValue = Math.max(...MONTHLY_DATA.map((d) => d.value));

const KpiCardWidget = ({ card, value }) => (
  <div className="col-12 col-sm-6 col-xl-3">
    <article
      className={`stat-card card shadow-sm h-100 border-start border-${card.accentColor} border-4`}
      aria-label={`${card.label}: ${value ?? '—'}`}
    >
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="text-uppercase fw-bold mb-1 text-muted" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
              {card.label}
            </p>
            <h2 className="fw-extrabold mb-0 text-dark" style={{ fontSize: '2rem' }}>
              {value ?? <span className="placeholder col-5 rounded" aria-hidden="true" />}
            </h2>
          </div>
          <div className={`icon-shape bg-${card.accentColor}-subtle text-${card.accentColor}`} aria-hidden="true">
            <i className={`bi bi-${card.icon}`} />
          </div>
        </div>
        <p className={`mt-3 mb-0 fw-semibold small ${card.trendColor}`}>
          <i className={`bi bi-${card.trendIcon} me-1`} aria-hidden="true" />
          {card.trend}
        </p>
      </div>
    </article>
  </div>
);

const StatusBadge = ({ status }) => {
  const MAP = {
    Completed:   { bg: 'success', icon: 'check-circle-fill',  label: 'Completed' },
    Pending:     { bg: 'warning', icon: 'hourglass-split',    label: 'Pending',   textDark: true },
    Rejected:    { bg: 'danger',  icon: 'x-circle-fill',      label: 'Rejected'  },
    Confirmed:   { bg: 'primary', icon: 'check-circle-fill',  label: 'Confirmed' },
    Waiting:     { bg: 'warning', icon: 'hourglass-split',    label: 'Waiting',   textDark: true },
    Scheduled:   { bg: 'secondary',icon: 'calendar-check',   label: 'Scheduled' },
    'In Progress':{ bg: 'info',   icon: 'activity',           label: 'In Progress'},
  };
  const cfg = MAP[status] ?? { bg: 'secondary', icon: 'dash-circle', label: status };
  return (
    <span className={`badge bg-${cfg.bg}${cfg.textDark ? ' text-dark' : ''} bg-gradient px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1`} aria-label={`Status: ${cfg.label}`}>
      <i className={`bi bi-${cfg.icon}`} aria-hidden="true" />{cfg.label}
    </span>
  );
};

const useDashboardData = () => {
  const [metrics,    setMetrics]    = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, a] = await Promise.all([claimService.getDashboardMetrics(), claimService.getRecentActivity()]);
      setMetrics(m);
      setActivities(a);
    } catch {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { metrics, activities, loading, error, refresh: load };
};

const Dashboard = () => {
  const { metrics, activities, loading, error, refresh } = useDashboardData();
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm,   setSearchTerm]   = useState('');

  const filteredRows = activities.filter(({ patientName, action, id, status }) => {
    const term = searchTerm.toLowerCase();
    const matchesTerm =
      patientName.toLowerCase().includes(term) ||
      action.toLowerCase().includes(term) ||
      id.toLowerCase().includes(term);
    const matchesStatus = filterStatus === 'All' || status === filterStatus;
    return matchesTerm && matchesStatus;
  });

  if (loading) return <Spinner size="lg" message="Synthesising operational metrics…" />;

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-3 shadow-sm" role="alert">
        <i className="bi bi-exclamation-triangle-fill fs-3" aria-hidden="true" />
        <div>
          <h5 className="alert-heading mb-1">Data Fetch Error</h5>
          <p className="mb-2">{error}</p>
          <button className="btn btn-sm btn-outline-danger" onClick={refresh}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom gap-3">
        <div>
          <h1 className="fw-extrabold text-dark mb-1" style={{ fontSize: '1.6rem' }}>Clinical Operations Dashboard</h1>
          <p className="text-muted mb-0 small">Real-time hospital performance indicators, active insurance claims, and patient activity.</p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          <span className="badge bg-white text-dark border shadow-sm px-3 py-2 d-flex align-items-center gap-2">
            <i className="bi bi-calendar3 text-primary" aria-hidden="true" />
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button className="btn btn-primary btn-sm d-flex align-items-center gap-1 px-3 shadow-sm" onClick={refresh} aria-label="Refresh dashboard data">
            <i className="bi bi-arrow-clockwise" aria-hidden="true" />Refresh
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {KPI_CONFIG.map((card) => (
          <KpiCardWidget key={card.key} card={card} value={metrics?.[card.key]} />
        ))}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
              <h2 className="h6 fw-bold mb-0"><i className="bi bi-bar-chart-fill text-primary me-2" aria-hidden="true" />Monthly Appointments</h2>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle">2026</span>
            </div>
            <div className="card-body p-4">
              <div className="d-flex align-items-end gap-3 justify-content-between" style={{ height: '140px' }} role="img" aria-label="Monthly appointments bar chart">
                {MONTHLY_DATA.map(({ month, value }) => (
                  <div key={month} className="d-flex flex-column align-items-center gap-1 flex-grow-1">
                    <small className="fw-bold text-primary" style={{ fontSize: '0.72rem' }}>{value}</small>
                    <div
                      className="w-100 rounded-2 bg-primary"
                      style={{
                        height: `${(value / maxBarValue) * 120}px`,
                        minHeight: '8px',
                        opacity: month === 'Aug' ? 1 : 0.45,
                        transition: 'height 0.6s ease',
                      }}
                      aria-label={`${month}: ${value} appointments`}
                    />
                    <small className="text-muted" style={{ fontSize: '0.72rem' }}>{month}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
              <h2 className="h6 fw-bold mb-0"><i className="bi bi-activity text-primary me-2" aria-hidden="true" />Unit Occupancy</h2>
              <span className="badge bg-danger-subtle text-danger border border-danger-subtle">Live</span>
            </div>
            <div className="card-body p-4">
              <div className="d-flex flex-column gap-3">
                {OCCUPANCY.map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="d-flex justify-content-between mb-1">
                      <small className="fw-semibold text-secondary">{label}</small>
                      <small className={`fw-bold text-${color}`}>{pct}%</small>
                    </div>
                    <div className="progress rounded-pill" style={{ height: '8px' }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${label} ${pct}%`}>
                      <div className={`progress-bar bg-${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-white py-3 border-bottom d-flex flex-column flex-md-row justify-content-between gap-2 align-items-md-center">
              <div>
                <h2 className="h6 fw-bold mb-0"><i className="bi bi-clock-history me-2 text-primary" aria-hidden="true" />Recent System Activity</h2>
                <small className="text-muted">Audit log of registrations, claim submissions, and clinical actions.</small>
              </div>
              <div className="d-flex gap-2">
                <label htmlFor="activity-search" className="visually-hidden">Search activity</label>
                <input id="activity-search" type="text" className="form-control form-control-sm bg-light" placeholder="Filter by name or action…" style={{ width: '200px' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <label htmlFor="status-filter" className="visually-hidden">Filter by status</label>
                <select id="status-filter" className="form-select form-select-sm bg-light" style={{ width: '130px' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All">All statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="cl-table" aria-label="Recent activity log">
                  <thead>
                    <tr>
                      <th scope="col" className="ps-4">Patient</th>
                      <th scope="col">Action Performed</th>
                      <th scope="col">Date</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length > 0
                      ? filteredRows.map((row) => (
                          <tr key={row.id}>
                            <td className="ps-4">
                              <div className="d-flex align-items-center gap-3">
                                <div className="avatar-initials" aria-hidden="true">
                                  {row.patientName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                  <p className="fw-semibold text-dark mb-0" style={{ fontSize: '0.9rem' }}>{row.patientName}</p>
                                  <small className="text-muted">{row.id}</small>
                                </div>
                              </div>
                            </td>
                            <td className="text-secondary fw-medium" style={{ fontSize: '0.87rem' }}>{row.action}</td>
                            <td className="text-muted" style={{ fontSize: '0.85rem' }}>{row.date}</td>
                            <td><StatusBadge status={row.status} /></td>
                          </tr>
                        ))
                      : (
                        <tr>
                          <td colSpan={4} className="text-center py-5 text-muted">
                            <i className="bi bi-inbox fs-2 d-block mb-2" aria-hidden="true" />No activity records match your filter.
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer bg-white border-top text-end py-3" style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Showing <strong>{filteredRows.length}</strong> of <strong>{activities.length}</strong> records
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
              <h2 className="h6 fw-bold mb-0"><i className="bi bi-calendar-day text-primary me-2" aria-hidden="true" />Today's Schedule</h2>
              <span className="badge bg-success-subtle text-success border border-success-subtle">{TODAY_SCHEDULE.length} appts</span>
            </div>
            <div className="card-body p-0">
              <ul className="list-unstyled mb-0">
                {TODAY_SCHEDULE.map((appt, i) => (
                  <li key={i} className="px-4 py-3 border-bottom d-flex align-items-start gap-3" style={{ fontSize: '0.83rem' }}>
                    <div className="flex-shrink-0 text-center" style={{ minWidth: '44px' }}>
                      <span className="fw-bold text-primary d-block" style={{ fontSize: '0.8rem' }}>{appt.time}</span>
                      <small className="text-muted" style={{ fontSize: '0.68rem' }}>AM</small>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="fw-semibold text-dark mb-0 text-truncate">{appt.patient}</p>
                      <small className="text-muted d-block">{appt.doctor} · {appt.type}</small>
                    </div>
                    <StatusBadge status={appt.status} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-footer bg-white border-top py-3 text-center">
              <Link to="/appointments" className="btn btn-sm btn-outline-primary fw-semibold">
                <i className="bi bi-calendar3 me-1" aria-hidden="true" />View Full Schedule
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        className="card border-0 rounded-3 text-white shadow-sm"
        style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)' }}
      >
        <div className="card-body p-4 d-flex flex-column flex-md-row align-items-md-center gap-4">
          <div className="flex-grow-1">
            <span className="badge bg-white text-primary fw-bold mb-2 d-inline-flex">QUICK ACTIONS</span>
            <h3 className="fw-bold h5 mb-1">Patient Intake Portal</h3>
            <p className="small mb-0 opacity-75">Register walk-in patients or process urgent ER admissions immediately.</p>
          </div>
          <div className="d-flex gap-2 flex-wrap flex-shrink-0">
            <Link to="/register-patient" className="btn btn-light text-primary fw-bold shadow-sm">
              <i className="bi bi-person-plus-fill me-1" aria-hidden="true" />Register Patient
            </Link>
            <Link to="/submit-claim" className="btn btn-outline-light fw-bold">
              <i className="bi bi-file-earmark-medical-fill me-1" aria-hidden="true" />Submit Claim
            </Link>
            <Link to="/appointments" className="btn btn-outline-light fw-bold">
              <i className="bi bi-calendar-plus me-1" aria-hidden="true" />Book Appointment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
