import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class CrmErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("CRM render error", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="crm-error-boundary" role="alert">
          <h1>Devuko CRM</h1>
          <p>Something went wrong while rendering this screen.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
