import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render-time errors anywhere below it so a single failing component
 * (most likely a WebGL/3D scene on unusual hardware) can't blank the whole page.
 *
 * The user-facing message is deliberately generic — no stack traces, component
 * names, or internal paths. Details go to the console for developers only.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Developer-facing only. Never rendered to the visitor.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
        <p className="font-display text-lg font-semibold tracking-tight text-text">NEXYRONIX</p>
        <h1 className="mt-6 font-display text-2xl font-semibold uppercase text-text">
          Something went wrong.
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
          Sorry — this page didn't load correctly. Reloading usually fixes it.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-7 inline-flex h-11 items-center justify-center rounded-pill bg-accent-primary px-6 text-sm font-medium text-white transition-all duration-300 hover:brightness-110"
        >
          Reload the page
        </button>
      </div>
    );
  }
}
