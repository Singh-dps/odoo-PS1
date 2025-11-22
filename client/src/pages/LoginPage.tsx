import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box } from 'lucide-react';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                login(data.token, data.user);
                navigate('/');
            } else {
                // Requirement: "If Creds does not match thrw an error msg, 'Invalid Login Id or Password'"
                setError('Invalid Login Id or Password');
            }
        } catch (err) {
            setError('Failed to connect to server');
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-purple/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-md bg-dark-surface border border-dark-border rounded-2xl p-8 relative z-10 shadow-2xl shadow-black/50">

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-dark-bg border border-dark-border rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-neon-purple/20">
                        <Box className="w-8 h-8 text-neon-pink" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-wider">NEXUS<span className="text-neon-cyan">IMS</span></h1>
                    <p className="text-slate-400 mt-2">Sign in to your account</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Login ID</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-purple transition-colors"
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-purple transition-colors"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-neon-purple hover:bg-neon-pink text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-neon-purple/25 hover:shadow-neon-pink/40 mt-4"
                    >
                        SIGN IN
                    </button>
                </form>

                <div className="mt-8 flex items-center justify-between text-sm">
                    <Link to="/forget-password" className="text-slate-400 hover:text-neon-cyan transition-colors">
                        Forgot Password?
                    </Link>
                    <Link to="/register" className="text-neon-cyan hover:text-white transition-colors font-medium">
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
