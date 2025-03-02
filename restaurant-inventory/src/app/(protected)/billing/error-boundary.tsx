"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FiAlertTriangle } from "react-icons/fi";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to console
    console.error("Billing page error:", error);
    console.error("Error info:", errorInfo);

    // Update state to include error info
    this.setState({
      errorInfo,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="container py-6">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <FiAlertTriangle className="mr-2" />
                Billing Page Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>We encountered an error</AlertTitle>
                <AlertDescription>
                  The billing page encountered an unexpected error.
                </AlertDescription>
              </Alert>

              <div className="mt-4">
                <h3 className="font-medium mb-2">Error Details:</h3>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-[300px] text-sm font-mono">
                  {this.state.error?.toString()}
                  {this.state.errorInfo && (
                    <div className="mt-2">
                      <div>Component Stack:</div>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-2">Possible Solutions:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Try refreshing the page</li>
                  <li>Clear your browser cache</li>
                  <li>If the problem persists, please contact support</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}
