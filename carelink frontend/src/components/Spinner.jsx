import React from 'react';

const Spinner = ({ size = 'md', variant = 'block', message = '', color = 'primary' }) => {
  const spinnerSize  = size === 'sm' ? 'spinner-border-sm' : '';
  const spinnerColor = `text-${color}`;

  const spinnerEl = (
    <div
      className={`spinner-border ${spinnerSize} ${spinnerColor}`}
      role="status"
      aria-live="polite"
      style={size === 'lg' ? { width: '3rem', height: '3rem' } : {}}
    >
      <span className="visually-hidden">Loading…</span>
    </div>
  );

  if (variant === 'inline') {
    return (
      <span className="d-inline-flex align-items-center gap-2" aria-busy="true">
        {spinnerEl}
        {message && <span className="fw-medium">{message}</span>}
      </span>
    );
  }

  if (variant === 'overlay') {
    return (
      <div
        className="position-absolute inset-0 d-flex flex-column align-items-center justify-content-center"
        style={{ inset: 0, background: 'rgba(255,255,255,0.75)', zIndex: 10 }}
        aria-busy="true"
        role="status"
      >
        {spinnerEl}
        {message && <p className="mt-3 mb-0 fw-medium text-muted small">{message}</p>}
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center w-100 py-5"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {spinnerEl}
      {message && (
        <p className="mt-3 mb-0 text-muted fw-medium" style={{ fontSize: '0.9rem' }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Spinner;
