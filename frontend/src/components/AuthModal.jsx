import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';
import '../App.css';

function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Reset mode whenever the modal opens or initialMode changes
    useEffect(() => {
        setIsLogin(initialMode === 'login');
        setUsername('');
        setPassword('');
    }, [initialMode, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? '/auth/login' : '/auth/register';

        try {
            await api.post(endpoint, { username, password });

            if (isLogin) {
                toast.success('Welcome back! 👋');
                navigate('/dashboard');
            } else {
                toast.success('Account created! Logging you in...');
                await api.post('/auth/login', { username, password });
                navigate('/dashboard');
            }
            onClose();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data || 'Something went wrong';
            toast.error(msg);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <FaTimes />
                </button>

                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                    {isLogin ? 'Login' : 'Create Account'}
                </h2>

                <form onSubmit={handleSubmit} className="note-form" style={{ padding: 0, boxShadow: 'none' }}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="form-input"
                        required
                        autoFocus
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="form-input"
                        required
                    />

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                {/* --- TOGGLE LINK SECTION --- */}
                <p className="auth-switch">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="btn-link"
                    >
                        {isLogin ? 'Register here' : 'Login here'}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default AuthModal;