import { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<{
  onError: (error: Error) => void;
  fallback: () => ReactNode;
  hasError: boolean;
}> {
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }
  render() {
    const { hasError, children, fallback } = this.props;
    return hasError ? fallback() : children;
  }
}
