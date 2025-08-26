// src/app/admin/components/error/ErrorBoundary.tsx
/**
 * ErrorBoundary Component
 * Catches and handles errors in the component tree.
 */
"use client";

import React from 'react';
import { BsArrowCounterclockwise, BsExclamationTriangle } from 'react-icons/bs';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorDisplay error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorDisplayProps {
  error: Error | null;
  onReset: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onReset }) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white p-6 rounded-lg shadow-sm text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-red-100">
            <BsExclamationTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Wystąpił błąd
        </h3>

        <div className="text-gray-600 mb-6">
          <p className="mb-2">
            Przepraszamy, ale coś poszło nie tak podczas przetwarzania Twojego żądania.
          </p>
          {error && process.env.NODE_ENV === 'development' && (
            <div className="mt-4">
              <p className="text-sm font-mono bg-gray-100 p-4 rounded-lg overflow-auto text-left">
                {error.message}
              </p>
              {error.stack && (
                <details className="mt-2 text-left">
                  <summary className="text-sm cursor-pointer hover:text-indigo-600">
                    Stack trace
                  </summary>
                  <pre className="mt-2 text-xs font-mono bg-gray-100 p-4 rounded-lg overflow-auto">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <BsArrowCounterclockwise className="mr-2 h-4 w-4" />
            Odśwież stronę
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    </div>
  );
};
