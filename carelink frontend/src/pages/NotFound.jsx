import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <main
    className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3 py-5"
    role="main"
    aria-labelledby="error-heading"
  >
    <article
      className="text-center bg-white rounded-4 shadow-sm border p-5"
      style={{ maxWidth: '520px', width: '100%' }}
      role="alert"
      aria-live="polite"
    >
      <div
        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
        style={{
          width: '88px', height: '88px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        }}
        aria-hidden="true"
      >
        <i className="bi bi-hospital text-primary" style={{ fontSize: '2.4rem' }} />
      </div>

      <h1
        id="error-heading"
        className="fw-extrabold text-primary mb-0"
        style={{ fontSize: '5rem', letterSpacing: '-4px', lineHeight: 1 }}
        aria-label="Error 404"
      >
        404
      </h1>

      <h2 className="fw-bold text-dark mt-2 mb-3" style={{ fontSize: '1.3rem' }}>
        Hospital Resource Not Found
      </h2>

      <p className="text-muted mb-5" style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
        The clinical route, patient record link, or insurance page you requested does not exist or has been
        moved within Carelink HMS. This incident has been logged for the IT team.
      </p>

      <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
        <Link
          to="/dashboard"
          className="btn btn-primary px-4 py-2 fw-bold shadow-sm d-inline-flex align-items-center justify-content-center gap-2"
        >
          <i className="bi bi-house-door-fill" aria-hidden="true" />
          Return to Dashboard
        </Link>
        <a
          href="mailto:it-support@carelink-hms.internal"
          className="btn btn-outline-secondary px-4 py-2 fw-semibold d-inline-flex align-items-center justify-content-center gap-2"
        >
          <i className="bi bi-life-preserver" aria-hidden="true" />
          Contact IT Support
        </a>
      </div>

      <p className="mt-4 mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
        Error code 404 · {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} · Carelink HMS v2.4
      </p>
    </article>
  </main>
);

export default NotFound;
