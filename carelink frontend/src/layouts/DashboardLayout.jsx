import React, { Suspense, useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header  from '../components/Header';
import Spinner from '../components/Spinner';

const DashboardLayout = () => {
  const location  = useLocation();
  const mainRef   = useRef(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="app-container">
      <Sidebar />

      <div className="app-main-wrapper">

        <Header />

        <main
          id="main-content"
          className="app-content"
          ref={mainRef}
          tabIndex={-1}
          aria-label="Main content area"
        >
          <Suspense
            fallback={
              <Spinner
                size="lg"
                variant="block"
                message="Loading Carelink workspace…"
              />
            }
          >
            <div key={location.pathname} className="page-enter">
              <Outlet />
            </div>
          </Suspense>
        </main>

        <footer
          className="bg-white border-top d-flex flex-wrap align-items-center justify-content-between px-4 py-2 gap-2"
          style={{ fontSize: '0.78rem', color: '#64748b', flexShrink: 0 }}
          role="contentinfo"
        >
          <span>
            <strong className="text-secondary">Carelink Enterprise HMS</strong>
            &nbsp;© {new Date().getFullYear()} Carelink Health Systems Pvt. Ltd.
          </span>
          <div className="d-flex align-items-center gap-3">
            <span className="d-none d-md-inline">
              <i className="bi bi-shield-check text-success me-1" aria-hidden="true" />
              ABDM Compliant · NABH Accredited · DISHA Compliant
            </span>
            <span
              className="badge bg-light border text-secondary"
              title="Mock API latency badge"
            >
              API Latency: &lt;30 ms
            </span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default DashboardLayout;
