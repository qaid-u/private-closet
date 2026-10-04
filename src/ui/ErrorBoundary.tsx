import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected rendering error occurred.',
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In compliance with privacy rules: never send or log personal data externally
    if (process.env.NODE_ENV === 'development') {
      console.warn('ErrorBoundary caught error:', error.message, errorInfo.componentStack);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.href = '/';
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-[50vh] p-6 flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-4"
        >
          <div className="w-14 h-14 rounded-full bg-danger/10 text-danger flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-text-primary">
              Something went wrong
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Your data remains safe and secure on your device. The app ran into an unexpected state while displaying this view.
            </p>
          </div>

          {this.state.errorMessage && (
            <div className="p-3 bg-surface-alt border border-border rounded-control font-mono text-[11px] text-text-secondary max-w-md w-full overflow-x-auto text-left">
              {this.state.errorMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              onClick={this.handleReset}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload App</span>
            </Button>

            <Button
              variant="outline"
              onClick={this.handleGoHome}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Go to Today</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
