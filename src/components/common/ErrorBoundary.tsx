import React, { Component, ErrorInfo, ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon, ReloadIcon } from '@hugeicons/core-free-icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <HugeiconsIcon 
                icon={AlertCircleIcon} 
                className="w-10 h-10 text-red-500" 
                strokeWidth={1.5} 
              />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 font-khmer">មានបញ្ហាបច្ចេកទេស</h1>
              <p className="text-gray-500 font-khmer">
                សូមអភ័យទោស កម្មវិធីបានជួបប្រទះបញ្ហាមិនរំពឹងទុក។ សូមព្យាយាមផ្ទុកកម្មវិធីឡើងវិញ។
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-50 p-4 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-red-600 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold font-khmer transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
              <HugeiconsIcon icon={ReloadIcon} className="w-5 h-5" />
              ផ្ទុកឡើងវិញ (Reload)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
