import React, { useState, useEffect, useCallback } from 'react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [darkMode,  setDarkMode]  = useState(() => localStorage.getItem('cl_dark_mode') === 'true');
  const [profile,   setProfile]   = useState({
    firstName:    'Admin',
    lastName:     'User',
    email:        'admin@carelink.hms',
    phone:        '9876543210',
    role:         'Hospital Administrator',
    hospital:     'Carelink Multi-Specialty Hospital',
    city:         'Bengaluru',
    profilePicUrl:'',
  });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [notif,     setNotif]     = useState({ email: true, sms: false, pushQueue: true, claimAlerts: true, lowBed: true });
  const [saveMsg,   setSaveMsg]   = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('cl_dark_mode', darkMode);
  }, [darkMode]);

  const showSave = (msg = 'Settings saved successfully.') => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const pSet = (k, v) => setProfile((p) => ({ ...p, [k]: v }));
  const pwSet = (k, v) => setPasswords((p) => ({ ...p, [k]: v }));

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showSave('Profile updated successfully.');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      showSave('Error: New passwords do not match.');
      return;
    }
    if (passwords.newPass.length < 8) {
      showSave('Error: Password must be at least 8 characters.');
      return;
    }
    setPasswords({ current: '', newPass: '', confirm: '' });
    showSave('Password changed successfully.');
  };

  const TABS = [
    { id: 'profile',  label: 'Profile',       icon: 'person-circle'     },
    { id: 'security', label: 'Security',       icon: 'shield-lock-fill'  },
    { id: 'notif',    label: 'Notifications',  icon: 'bell-fill'         },
    { id: 'appear',   label: 'Appearance',     icon: 'palette-fill'      },
    { id: 'about',    label: 'About',          icon: 'info-circle-fill'  },
  ];

  return (
    <div>
      <div className="mb-4 pb-3 border-bottom">
        <h1 className="fw-extrabold text-dark mb-1" style={{ fontSize: '1.6rem' }}>
          <i className="bi bi-gear-fill me-2 text-primary" aria-hidden="true" />Settings
        </h1>
        <p className="text-muted mb-0 small">Manage your account, security, notification preferences, and interface appearance.</p>
      </div>

      {saveMsg && (
        <div className={`alert ${saveMsg.startsWith('Error') ? 'alert-danger' : 'alert-success'} py-2 mb-4 shadow-sm d-flex align-items-center gap-2`} role="status">
          <i className={`bi ${saveMsg.startsWith('Error') ? 'bi-exclamation-octagon-fill' : 'bi-check-circle-fill'}`} aria-hidden="true" />
          {saveMsg}
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-2">
              <nav aria-label="Settings navigation">
                <ul className="list-unstyled mb-0">
                  {TABS.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        className={`btn d-flex align-items-center gap-2 w-100 text-start rounded-2 px-3 py-2 mb-1 ${activeTab === t.id ? 'btn-primary' : 'btn-light border-0'}`}
                        style={{ fontSize: '0.875rem', fontWeight: activeTab === t.id ? 700 : 500 }}
                        onClick={() => setActiveTab(t.id)}
                        aria-current={activeTab === t.id ? 'page' : undefined}
                      >
                        <i className={`bi bi-${t.icon}`} aria-hidden="true" />{t.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-9">
          {activeTab === 'profile' && (
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-header bg-white py-3 border-bottom">
                <h2 className="h6 fw-bold mb-0"><i className="bi bi-person-circle me-2 text-primary" />Profile Information</h2>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSaveProfile} aria-label="Profile settings form">
                  <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
                    <div
                      className="avatar-initials flex-shrink-0"
                      style={{ width: '72px', height: '72px', fontSize: '1.5rem', background: 'linear-gradient(135deg,#0d6efd,#6610f2)', color: '#fff' }}
                      aria-label="Profile initials"
                    >
                      {profile.firstName[0]}{profile.lastName[0]}
                    </div>
                    <div>
                      <p className="fw-bold text-dark mb-1">{profile.firstName} {profile.lastName}</p>
                      <small className="text-muted d-block">{profile.role}</small>
                      <small className="text-muted">{profile.hospital}</small>
                    </div>
                  </div>
                  <div className="row g-3">
                    {[['firstName','First Name',profile.firstName],['lastName','Last Name',profile.lastName],['email','Email',profile.email,'email'],['phone','Phone',profile.phone,'tel'],['role','Role / Title',profile.role],['hospital','Hospital Name',profile.hospital]].map(([k,label,val,type='text'])=>(
                      <div key={k} className="col-12 col-md-6">
                        <label htmlFor={`set-${k}`} className="form-label fw-semibold text-secondary small">{label}</label>
                        <input id={`set-${k}`} type={type} className="form-control" value={val} onChange={(e)=>pSet(k,e.target.value)} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-top d-flex justify-content-end">
                    <button type="submit" id="save-profile-btn" className="btn btn-primary fw-bold px-4 shadow-sm">
                      <i className="bi bi-check2 me-1" />Save Profile
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-header bg-white py-3 border-bottom">
                <h2 className="h6 fw-bold mb-0"><i className="bi bi-shield-lock-fill me-2 text-primary" />Change Password</h2>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleChangePassword} aria-label="Password change form">
                  <div className="d-flex flex-column gap-3" style={{ maxWidth: '420px' }}>
                    {[['current','Current Password'],['newPass','New Password'],['confirm','Confirm New Password']].map(([k,label])=>(
                      <div key={k}>
                        <label htmlFor={`pw-${k}`} className="form-label fw-semibold text-secondary small">{label}</label>
                        <input id={`pw-${k}`} type="password" className="form-control" value={passwords[k]} onChange={(e)=>pwSet(k,e.target.value)} autoComplete={k==='current'?'current-password':'new-password'} />
                      </div>
                    ))}
                    <small className="text-muted">Password must be at least 8 characters and include numbers and letters.</small>
                    <div>
                      <button type="submit" id="change-password-btn" className="btn btn-primary fw-bold px-4">
                        <i className="bi bi-lock-fill me-1" />Change Password
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'notif' && (
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-header bg-white py-3 border-bottom">
                <h2 className="h6 fw-bold mb-0"><i className="bi bi-bell-fill me-2 text-primary" />Notification Preferences</h2>
              </div>
              <div className="card-body p-4">
                <div className="d-flex flex-column gap-4">
                  {[
                    ['email',       'Email Notifications',      'Receive activity summaries and alerts via email.'],
                    ['sms',         'SMS Alerts',               'Receive urgent alerts via text message.'],
                    ['pushQueue',   'Queue Updates',            'Live push notifications when the token queue advances.'],
                    ['claimAlerts', 'Claim Status Alerts',      'Notify when claim is approved, rejected, or requires review.'],
                    ['lowBed',      'Low Bed Occupancy Alerts', 'Alert when ICU or Emergency beds drop below 20%.'],
                  ].map(([k, title, desc]) => (
                    <div key={k} className="d-flex align-items-start gap-4">
                      <div className="flex-grow-1">
                        <p className="fw-semibold text-dark mb-0">{title}</p>
                        <small className="text-muted">{desc}</small>
                      </div>
                      <div className="form-check form-switch flex-shrink-0 mt-1">
                        <input
                          type="checkbox"
                          role="switch"
                          className="form-check-input"
                          id={`notif-${k}`}
                          checked={notif[k]}
                          onChange={(e) => setNotif((p) => ({ ...p, [k]: e.target.checked }))}
                          aria-label={`Toggle ${title}`}
                          style={{ width: '2.5rem', height: '1.25rem', cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-top d-flex justify-content-end">
                  <button type="button" className="btn btn-primary fw-bold px-4 shadow-sm" onClick={() => showSave('Notification preferences saved.')}>
                    <i className="bi bi-check2 me-1" />Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appear' && (
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-header bg-white py-3 border-bottom">
                <h2 className="h6 fw-bold mb-0"><i className="bi bi-palette-fill me-2 text-primary" />Appearance</h2>
              </div>
              <div className="card-body p-4">
                <div className="d-flex align-items-start gap-4 pb-4 border-bottom">
                  <div className="flex-grow-1">
                    <p className="fw-semibold text-dark mb-0">Dark Mode</p>
                    <small className="text-muted">Switch between light and dark interface theme. Setting is persisted across sessions.</small>
                  </div>
                  <div className="form-check form-switch flex-shrink-0">
                    <input
                      type="checkbox"
                      role="switch"
                      className="form-check-input"
                      id="dark-mode-toggle"
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                      aria-label="Toggle dark mode"
                      style={{ width: '2.5rem', height: '1.25rem', cursor: 'pointer' }}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="fw-semibold text-dark mb-3">Accent Color</p>
                  <div className="d-flex gap-3 flex-wrap">
                    {['#0d6efd','#6610f2','#198754','#dc3545','#fd7e14','#0dcaf0'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="rounded-circle border-0 shadow-sm"
                        style={{ width: '36px', height: '36px', background: color, cursor: 'pointer' }}
                        onClick={() => showSave('Accent color preference saved (requires theme rebuild to apply).')}
                        aria-label={`Select accent color ${color}`}
                      />
                    ))}
                  </div>
                  <small className="text-muted mt-2 d-block">Full custom theming requires a recompile of index.css CSS variables.</small>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-header bg-white py-3 border-bottom">
                <h2 className="h6 fw-bold mb-0"><i className="bi bi-info-circle-fill me-2 text-primary" />About Carelink HMS</h2>
              </div>
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-4 mb-4">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                    style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg,#0d6efd,#6610f2)' }}
                    aria-hidden="true"
                  >
                    <i className="bi bi-hospital-fill text-white" style={{ fontSize: '2rem' }} />
                  </div>
                  <div>
                    <h3 className="fw-extrabold text-dark mb-1" style={{ fontSize: '1.2rem' }}>Carelink HMS</h3>
                    <p className="text-muted small mb-0">Enterprise Hospital Management System</p>
                  </div>
                </div>
                <div className="row g-3">
                  {[
                    ['Version',    '2.0.0 (Phase 2 Release)'  ],
                    ['Frontend',   'React 18 + Vite 5 + Bootstrap 5'],
                    ['Backend',    'Java 17 + Spring Boot 3.x + MySQL 8'],
                    ['AI Module',  'Google Gemini 1.5 Flash API'],
                    ['License',    'Enterprise Internal Use Only'],
                    ['Developed',  'Full-Stack Architecture — 2026'],
                  ].map(([k,v])=>(
                    <div key={k} className="col-12 col-md-6">
                      <div className="p-3 rounded-3" style={{ background:'#f8fafc',border:'1px solid #e2e8f0' }}>
                        <p className="text-muted mb-0" style={{ fontSize:'0.72rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px' }}>{k}</p>
                        <p className="fw-semibold text-dark mb-0 small">{v}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
