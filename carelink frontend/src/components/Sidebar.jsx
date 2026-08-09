import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const PRIMARY_NAV = [
  { to: '/dashboard',        icon: 'grid-1x2-fill',             label: 'Dashboard'          },
  { to: '/register-patient', icon: 'person-plus-fill',           label: 'Register Patient'   },
  { to: '/submit-claim',     icon: 'file-earmark-medical-fill',  label: 'Submit Claim'       },
];

const PATIENT_NAV = [
  { to: '/patients',         icon: 'people-fill',               label: 'Patients'           },
  { to: '/doctors',          icon: 'person-badge-fill',          label: 'Doctors'            },
  { to: '/appointments',     icon: 'calendar3',                  label: 'Appointments'       },
  { to: '/medical-records',  icon: 'journal-medical',            label: 'Medical Records'    },
];

const ADVANCED_NAV = [
  { to: '/ai-analyzer',      icon: 'robot',                      label: 'AI Symptom Analyzer'},
];

const SETTINGS_NAV = [
  { to: '/settings',         icon: 'gear-fill',                  label: 'Settings'           },
];

const SectionLabel = ({ label }) => (
  <p
    className="px-3 mb-2 text-uppercase fw-bold"
    style={{ fontSize: '0.68rem', letterSpacing: '1.3px', color: '#475569' }}
  >
    {label}
  </p>
);

const NavGroup = ({ items, ariaLabel }) => (
  <nav aria-label={ariaLabel}>
    {items.map(({ to, icon, label }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) => `sidebar-nav-link${isActive ? ' active' : ''}`}
        aria-label={`Navigate to ${label}`}
      >
        <i className={`bi bi-${icon}`} aria-hidden="true" />
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
);

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside
      className="app-sidebar p-3 d-flex flex-column"
      aria-label="Primary Navigation"
      role="navigation"
    >
      <div className="d-flex align-items-center gap-3 px-1 py-3 mb-3" style={{ borderBottom: '1px solid #1e293b' }}>
        <div
          className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
          style={{
            width: '40px', height: '40px',
            background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
            boxShadow: '0 4px 14px rgba(13,110,253,0.4)',
          }}
          aria-hidden="true"
        >
          <i className="bi bi-heart-pulse-fill text-white" style={{ fontSize: '1.1rem' }} />
        </div>
        <div>
          <h1 className="fw-extrabold tracking-wide mb-0 text-white" style={{ fontSize: '1.05rem' }}>
            Carelink
          </h1>
          <small style={{ fontSize: '0.65rem', color: '#475569', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Enterprise HMS · v2.0
          </small>
        </div>
      </div>

      <div className="overflow-auto flex-grow-1" style={{ scrollbarWidth: 'none' }}>
        <div className="mb-3">
          <SectionLabel label="Main Menu" />
          <NavGroup items={PRIMARY_NAV} ariaLabel="Main menu" />
        </div>

        <div className="mb-3">
          <SectionLabel label="Clinical Management" />
          <NavGroup items={PATIENT_NAV} ariaLabel="Clinical management" />
        </div>

        <div className="mb-3">
          <SectionLabel label="Advanced Tools" />
          <NavGroup items={ADVANCED_NAV} ariaLabel="Advanced tools" />
        </div>

        <div className="mb-3">
          <SectionLabel label="System" />
          <NavGroup items={SETTINGS_NAV} ariaLabel="System settings" />
        </div>
      </div>

      <div
        className="mt-auto pt-3 d-flex align-items-center justify-content-between"
        style={{ borderTop: '1px solid #1e293b' }}
      >
        <div className="d-flex align-items-center gap-2 overflow-hidden">
          <div className="position-relative flex-shrink-0">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white"
              style={{
                width: '38px', height: '38px', fontSize: '0.8rem',
                background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
              }}
              aria-hidden="true"
            >
              AU
            </div>
            <span
              className="position-absolute bg-success border border-dark rounded-circle"
              style={{ width: '10px', height: '10px', bottom: '1px', right: '1px' }}
              title="Status: Online"
              aria-label="Online"
            />
          </div>

          <div className="overflow-hidden" style={{ lineHeight: 1.3 }}>
            <p className="mb-0 fw-semibold text-white text-truncate" style={{ fontSize: '0.85rem' }}>
              Admin User
            </p>
            <small className="text-truncate d-block" style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Hospital Administrator
            </small>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-link p-1 ms-1 flex-shrink-0"
          style={{ color: '#64748b' }}
          aria-label="Sign out of Carelink"
          title="Sign out"
          onClick={() => {
            if (window.confirm('Sign out of Carelink HMS?')) {
              navigate('/dashboard');
            }
          }}
        >
          <i className="bi bi-box-arrow-right fs-5" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
