import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { Button, Card } from '../ui';

interface Props {
  children: ReactNode;
  resetKey?: string;
  onDashboard?: () => void;
}

interface State {
  error: Error | null;
}

/**
 * Catches unexpected React render/lifecycle errors in the admin panel so a single
 * malformed record or view crash never turns the screen into a blank white page.
 */
export default class AdminErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[AdminErrorBoundary]', error, info.componentStack);
  }

  componentDidUpdate(prevProps: Props): void {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-[320px] flex items-center justify-center p-4 sm:p-6" role="alert">
        <Card className="max-w-lg w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Something went wrong on this page</h2>
            <p className="text-sm text-slate-600 mt-1 break-words">
              {error.message || 'An unexpected rendering error occurred.'}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Your unsaved or previous Firestore data was not deleted. Try reloading the view or returning to the dashboard.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <Button variant="secondary" icon={RotateCcw} onClick={this.reset}>
              Try again
            </Button>
            {this.props.onDashboard && (
              <Button
                icon={Home}
                onClick={() => {
                  this.reset();
                  this.props.onDashboard?.();
                }}
              >
                Back to Dashboard
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }
}

