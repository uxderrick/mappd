import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="landing">
      <div className="landing-content">
        <h1>Winston Demo</h1>
        <p className="tagline">
          A multi-screen React app for testing FlowCanvas navigation
        </p>
        <Link to="/login" className="btn btn-primary btn-lg">
          Get Started Now
        </Link>
      </div>
    </div>
  );
}
