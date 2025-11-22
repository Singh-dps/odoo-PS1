import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box } from 'lucide-react';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Frontend Validation
        if (username.length < 6 || username.length > 12) {
            setError('Login ID must be between 6-12 characters');
            return;
        }

        // Password Complexity Check
        // > 8 chars, small case, large case, special char
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{9,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must be > 8 characters and contain a lowercase, uppercase, and special character');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                login(data.token, data.user);
                navigate('/');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Failed to connect to server');
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-md bg-dark-surface border border-dark-border rounded-2xl p-8 relative z-10 shadow-2xl shadow-black/50">

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-dark-bg border border-dark-border rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-neon-purple/20">
                        <Box className="w-8 h-8 text-neon-pink" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-wider">NEXUS<span className="text-neon-cyan">IMS</span></h1>
                    <p className="text-slate-400 mt-2">Create your account</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Login ID</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-purple transition-colors"
                            placeholder="6-12 characters"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email ID</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-purple transition-colors"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-purple transition-colors"
                            placeholder="Strong password"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Re-Enter Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-purple transition-colors"
                            placeholder="Confirm password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-neon-purple hover:bg-neon-pink text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-neon-purple/25 hover:shadow-neon-pink/40 mt-2"
                    >
                        SIGN UP
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-slate-400 mr-2">Already have an account?</span>
                    <Link to="/login" className="text-neon-cyan hover:text-white transition-colors font-medium">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
