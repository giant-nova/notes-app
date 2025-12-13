import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthModal from '../components/AuthModal'; // Import the new modal
import { Toaster } from 'react-hot-toast'; // Import toaster for landing page errors
import '../App.css';

function Landing() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('login'); // 'login' or 'register'

    const openModal = (mode) => {
        setModalMode(mode);
        setModalOpen(true);
    };

    return (
        <div className="landing-container">
            <Toaster position="top-center" />

            {/* Pass state to the Modal */}
            <AuthModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                initialMode={modalMode}
            />

            <nav className="landing-nav">
                <div className="logo">AI Notes</div>
                <div className="nav-links">
                    <button onClick={() => openModal('login')} className="btn btn-outline">
                        Login
                    </button>
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
                    <button onClick={() => openModal('register')} className="btn btn-primary btn-large">
                        Get Started
                    </button>
                </div>
            </main>
        </div>
    );
}

export default Landing;