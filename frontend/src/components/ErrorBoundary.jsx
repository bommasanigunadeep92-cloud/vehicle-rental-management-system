import React from 'react';
import { AlertTriangle, RotateCcw, Home, Trash2 } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DriveElite Frontend ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleResetAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-500/20">
              <AlertTriangle size={32} />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              DriveElite Client Alert
            </h1>
            <p className="text-sm text-slate-300 mb-6">
              A client-side interface error was safely intercepted. You can clear temporary browser cache or reload to continue.
            </p>

            {this.state.error && (
              <div className="text-left bg-slate-950/80 rounded-xl p-4 mb-6 border border-slate-800 text-xs font-mono text-red-300 overflow-x-auto max-h-40">
                <p className="font-bold text-red-400 mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="text-[11px] text-slate-400 whitespace-pre-wrap">
                    {this.state.error.stack.split('\n').slice(0, 4).join('\n')}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleResetAndReload}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm text-white transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <Trash2 size={16} />
                <span>Reset Cache & Home</span>
              </button>

              <button
                onClick={this.handleReload}
                className="py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 font-semibold text-sm text-slate-200 transition flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                <span>Reload</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
