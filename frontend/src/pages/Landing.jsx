import { Link } from 'react-router-dom';
import '../App.css';

function Landing() {
    return (
        <div className="landing-container">
            <nav className="landing-nav">
                <div className="logo">AI Notes</div>
                <div className="nav-links">
                    <Link to="/register" className="btn btn-primary">Get Started</Link>
                </div>
            </nav>

            <main className="hero-section">
                <h1 className="hero-title">
                    Capture Your Thoughts, <br />
                    <span className="highlight">Unleash Your Creativity.</span>
                </h1>
                <p className="hero-subtitle">
                    The secure, minimal, and smart way to organize your ideas.
                    Sync across devices and keep your mind clear.
                </p>
                <div className="hero-buttons">
                    <Link to="/login" className="btn btn-outline btn-large">
                        Login to Account
                    </Link>
                </div>

                {/* Optional: Add a visual element or abstract shape here later */}
            </main>
        </div>
    );
}

export default Landing;