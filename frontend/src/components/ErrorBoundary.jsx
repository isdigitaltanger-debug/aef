import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7] p-8">
          <div className="card p-8 max-w-md text-center">
            <p className="font-serif text-2xl text-[#192A35] mb-3">Une erreur est survenue</p>
            <p className="text-sm text-[#192A35]/70 mb-6">Rechargez la page pour continuer votre visite.</p>
            <button onClick={() => window.location.reload()} className="btn-primary">Recharger</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
