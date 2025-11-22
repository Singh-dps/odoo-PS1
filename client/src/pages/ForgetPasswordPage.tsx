
import { Link } from 'react-router-dom';
import { Box } from 'lucide-react';

const ForgetPasswordPage = () => {
    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-purple/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-md bg-dark-surface border border-dark-border rounded-2xl p-8 relative z-10 shadow-2xl shadow-black/50">

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-dark-bg border border-dark-border rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-neon-purple/20">
                        <Box className="w-8 h-8 text-neon-pink" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-wider">Reset Password</h1>
                    <p className="text-slate-400 mt-2 text-center">Enter your email to receive reset instructions</p>
                </div>

                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Email ID</label>
                        <input
                            type="email"
                            className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-purple transition-colors"
                            placeholder="name@example.com"
                        />
                    </div>

                    <button
                        type="button"
                        className="w-full bg-neon-purple hover:bg-neon-pink text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-neon-purple/25 hover:shadow-neon-pink/40"
                    >
                        SEND RESET LINK
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-slate-400 hover:text-white transition-colors text-sm">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgetPasswordPage;
