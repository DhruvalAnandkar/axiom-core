import { Component } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Error state is already derived in getDerivedStateFromError.
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, info: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-screen items-center justify-center bg-axiom-bg p-8">
          <div className="axiom-glass max-w-md rounded-2xl border border-axiom-border p-8 text-center">
            <AlertOctagon className="mx-auto h-10 w-10 text-amber-400" />
            <h2 className="mt-4 text-lg font-semibold text-axiom-text">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-axiom-muted">
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-axiom-green to-axiom-green-dim px-5 py-2.5 text-sm font-semibold text-axiom-bg transition hover:brightness-110"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
