import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <FiAlertTriangle size={48} className="error-icon" />
            <h2>Something went wrong</h2>
            <p>We're sorry for the inconvenience. The error has been logged.</p>
            <button 
              className="retry-button"
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload Page
            </button>
            <button 
              className="home-button"
              onClick={() => {
                this.props.navigate('/');
                this.setState({ hasError: false });
              }}
            >
              Go to Home
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error details</summary>
                <p>{this.state.error && this.state.error.toString()}</p>
                <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ErrorBoundaryWithRouter(props) {
  const navigate = useNavigate();
  return <ErrorBoundary {...props} navigate={navigate} />;
}