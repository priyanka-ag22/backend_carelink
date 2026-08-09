import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught render error:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#f1f5f9',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1rem',
              padding: '3rem',
              maxWidth: '520px',
              width: '100%',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '2px solid rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2rem',
              }}
            >
              ⚠️
            </div>

            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '0.5rem',
                color: '#f1f5f9',
              }}
            >
              Something went wrong
            </h1>

            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Carelink HMS encountered an unexpected error and could not render this page.
              This is usually caused by a temporary module load issue.
            </p>

            <details
              style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <summary style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                Error details
              </summary>
              <code
                style={{
                  fontSize: '0.75rem',
                  color: '#f87171',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {this.state.error?.message || 'Unknown error'}
              </code>
            </details>

            <button
              onClick={this.handleReload}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 2rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                width: '100%',
              }}
              onMouseOver={(e) => (e.target.style.opacity = '0.85')}
              onMouseOut={(e) => (e.target.style.opacity = '1')}
            >
              🔄 Reload Application
            </button>
          </div>

          <p style={{ marginTop: '1.5rem', color: '#475569', fontSize: '0.8rem' }}>
            Carelink Enterprise HMS · If this persists, check the browser console for details.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
