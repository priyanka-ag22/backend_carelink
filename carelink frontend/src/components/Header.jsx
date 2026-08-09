import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const NOTIFICATIONS = [
  {
    id: 'n-1', type: 'primary', unread: true,
    title: 'Claim #CLM-94021 Approved',
    detail: 'TPA Pre-Auth cleared ₹37,500 → Patient PAT-201 • 10 min ago',
  },
  {
    id: 'n-2', type: 'warning', unread: true,
    title: 'Registration Review Pending',
    detail: 'PAT-849201 record requires ABHA documentation • 35 min ago',
  },
  {
    id: 'n-3', type: 'success', unread: true,
    title: 'Nightly Backup Complete',
    detail: 'Encrypted DB snapshot synced to off-site • 2 h ago',
  },
  {
    id: 'n-4', type: 'danger', unread: false,
    title: 'Claim #CLM-77830 Rejected',
    detail: 'Insufficient documentation from provider • Yesterday',
  },
];

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery]     = useState('');
  const [bellOpen, setBellOpen]           = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [darkMode, setDarkMode]           = useState(() => localStorage.getItem('cl_dark_mode') === 'true');
  const bellRef                           = useRef(null);
  const searchRef                         = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const onOutsideClick = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const toggleDark = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.setAttribute('data-bs-theme', next ? 'dark' : 'light');
      localStorage.setItem('cl_dark_mode', next);
      return next;
    });
  }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/patients?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  return (
    <header
      className="app-header sticky-top bg-white border-bottom shadow-sm px-4 d-flex align-items-center justify-content-between gap-3"
      role="banner"
    >
      <form
        className="d-flex align-items-center flex-grow-1"
        style={{ maxWidth: '440px' }}
        onSubmit={handleSearch}
        role="search"
        aria-label="Global search"
      >
        <div className="input-group input-group-sm">
          <label htmlFor="global-search" className="visually-hidden">
            Search patients, claims, ICD codes
          </label>
          <span className="input-group-text bg-light border-end-0 text-muted" aria-hidden="true">
            <i className="bi bi-search" />
          </span>
          <input
            id="global-search"
            ref={searchRef}
            type="search"
            className="form-control bg-light border-start-0 ps-0 shadow-none"
            placeholder="Search patients, claims, ICD codes… (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
        </div>
      </form>

      <div className="d-flex align-items-center gap-3 flex-shrink-0">

        <div
          className="d-none d-lg-flex align-items-center gap-2 px-3 py-1 rounded-pill border bg-light text-secondary"
          style={{ fontSize: '0.8rem' }}
        >
          <i className="bi bi-hospital text-primary" aria-hidden="true" />
          <span className="fw-semibold">Sanjeevani Super Speciality Hospital</span>
        </div>

        <div
          className="d-none d-xl-flex align-items-center gap-1 px-2 py-1 rounded-pill border"
          style={{ fontSize: '0.75rem', background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}
        >
          <span
            className="rounded-circle bg-success d-inline-block"
            style={{ width: '7px', height: '7px' }}
            aria-hidden="true"
          />
          <span className="fw-semibold">All Systems Normal</span>
        </div>

        <div className="vr d-none d-sm-block" style={{ height: '24px', opacity: 0.2 }} aria-hidden="true" />

        <button
          type="button"
          className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center border"
          style={{ width: '40px', height: '40px' }}
          onClick={toggleDark}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          <i className={`bi bi-${darkMode ? 'sun-fill text-warning' : 'moon-stars-fill text-secondary'}`} style={{ fontSize: '1rem' }} aria-hidden="true" />
        </button>

        <div className="position-relative" ref={bellRef}>
          <button
            type="button"
            className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center border"
            style={{ width: '40px', height: '40px' }}
            onClick={() => setBellOpen((prev) => !prev)}
            aria-label={`Notifications — ${unreadCount} unread`}
            aria-expanded={bellOpen}
            aria-haspopup="true"
          >
            <i className="bi bi-bell-fill text-secondary" style={{ fontSize: '1rem' }} aria-hidden="true" />
            {unreadCount > 0 && (
              <span
                className="position-absolute badge rounded-pill bg-danger text-white d-flex align-items-center justify-content-center"
                style={{ top: '-4px', right: '-4px', minWidth: '18px', height: '18px', fontSize: '0.62rem', fontWeight: 700, padding: '0 4px', pointerEvents: 'none' }}
                aria-hidden="true"
              >
                {unreadCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div
              className="position-absolute end-0 mt-2 bg-white border rounded-3 shadow-lg overflow-hidden"
              style={{ width: '340px', zIndex: 1050 }}
              role="dialog"
              aria-label="Notifications panel"
            >
              <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom">
                <div>
                  <h6 className="fw-bold mb-0">Notifications</h6>
                  <small className="text-muted">{unreadCount} unread</small>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-primary fw-semibold text-decoration-none"
                    onClick={markAllRead}
                    aria-label="Mark all notifications as read"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <ul
                className="list-unstyled mb-0 overflow-auto"
                style={{ maxHeight: '280px' }}
                aria-label="Notification items"
              >
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`px-4 py-3 border-bottom border-start border-${n.type} border-3 ${
                      n.unread ? 'bg-light' : ''
                    }`}
                    style={{ fontSize: '0.83rem', transition: 'background 0.15s' }}
                  >
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <p className="fw-semibold mb-0 text-dark">{n.title}</p>
                      {n.unread && (
                        <span
                          className="rounded-circle bg-primary flex-shrink-0"
                          style={{ width: '8px', height: '8px', marginTop: '5px' }}
                          aria-label="Unread"
                        />
                      )}
                    </div>
                    <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.78rem' }}>{n.detail}</p>
                  </li>
                ))}
              </ul>

              <div className="px-4 py-2 text-center border-top bg-light">
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-secondary text-decoration-none"
                  onClick={() => setBellOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          className="d-flex align-items-center gap-2"
          role="button"
          tabIndex={0}
          aria-label="User menu — Dr. Kshitij Rajput"
          title="Dr. Kshitij Rajput · Chief Medical Director"
        >
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
            style={{
              width: '38px', height: '38px', fontSize: '0.82rem',
              background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
            }}
            aria-hidden="true"
          >
            KR
          </div>
          <div className="d-none d-xl-block" style={{ lineHeight: 1.3 }}>
            <p className="mb-0 fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Dr. Kshitij Rajput</p>
            <small className="text-muted" style={{ fontSize: '0.72rem' }}>Chief Medical Dir.</small>
          </div>
          <i className="bi bi-chevron-down text-muted d-none d-xl-block" style={{ fontSize: '0.7rem' }} aria-hidden="true" />
        </div>

      </div>
    </header>
  );
};

export default Header;
