import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  /** Shown in the console so a failure can be traced to its scene. */
  name: string;
  children: ReactNode;
  /** Rendered instead of the scene after a failure. Defaults to nothing. */
  fallback?: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * Contains a failure of ONE 3D scene. Without it, a scene's error — a WebGL
 * driver problem, or its code chunk failing to download — reaches the
 * app-wide ErrorBoundary, which replaces the entire site with an error page.
 *
 * Both scenes are layered over their own static fallback (HeroFallback,
 * UniverseFallback), so rendering nothing here leaves that fallback showing:
 * the visitor loses the animation, never the page.
 */
export class SceneBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Developer-facing only. Never rendered to the visitor.
    console.error(`[3D:${this.props.name}] scene failed; showing the static fallback`, error, info.componentStack);
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
