import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer, Crown, Zap, Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const cleanEmail = email.trim().toLowerCase();

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: cleanEmail,
                    password
                });
                if (error) {
                    if (error.message.includes('Email not confirmed')) {
                        await handleResend();
                        setIsVerifying(true);
                        setError('Identity unconfirmed. New code transmitted.');
                        return;
                    }
                    throw error;
                }
            } else {
                const { error } = await supabase.auth.signUp({
                    email: cleanEmail,
                    password,
                    options: {
                        data: {
                            full_name: cleanEmail.split('@')[0],
                            avatar_url: `https://i.pravatar.cc/150?u=${cleanEmail}`
                        }
                    }
                });

                if (error) {
                    if (error.message.includes('already registered')) {
                        await handleResend();
                        setIsVerifying(true);
                        setError('Identity recognized. Fresh verification required.');
                        return;
                    }
                    throw error;
                }
                setIsVerifying(true);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        const cleanEmail = email.trim().toLowerCase();
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: cleanEmail
            });
            if (error) throw error;
            setError('New signal transmitted to your identity.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'signup'
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden selection:bg-gold/30">
            {/* Liquid Background */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-gold/5 blur-[120px] rounded-full pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    rotate: [0, -90, 0],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-gold/10 blur-[120px] rounded-full pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                <div className="mb-12 text-center">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl mb-8 shadow-2xl relative group overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Crown className="w-10 h-10 text-gold relative z-10 drop-shadow-[0_0_10px_rgba(202,138,4,0.5)]" />
                    </motion.div>
                    <h1 className="text-5xl font-heading font-light tracking-tight text-white mb-3">
                        INZAN <span className="text-gold italic font-medium">Athletics</span>
                    </h1>
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-px w-8 bg-gold/30" />
                        <p className="text-[10px] tracking-[0.4em] font-medium uppercase text-white/40">
                            Elite Performance Protocol
                        </p>
                        <div className="h-px w-8 bg-gold/30" />
                    </div>
                </div>

                <div className="glass-card rounded-[2.5rem] p-10 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {!isVerifying ? (
                        <>
                            <div className="flex gap-2 mb-10 p-1.5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                                <button
                                    onClick={() => { setIsLogin(true); setError(null); }}
                                    className={`flex-1 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] rounded-xl transition-all duration-500 ${isLogin ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    Access
                                </button>
                                <button
                                    onClick={() => { setIsLogin(false); setError(null); }}
                                    className={`flex-1 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] rounded-xl transition-all duration-500 ${!isLogin ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    Initialize
                                </button>
                            </div>

                            <form onSubmit={handleAuth} className="space-y-8">
                                <div className="space-y-5">
                                    <div className="group relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="w-4 h-4 text-white/20 group-focus-within:text-gold transition-colors duration-300" />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="EMAIL ADDRESS"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-gold/40 focus:bg-black/60 transition-all duration-300 tracking-wider"
                                            required
                                        />
                                    </div>
                                    <div className="group relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="w-4 h-4 text-white/20 group-focus-within:text-gold transition-colors duration-300" />
                                        </div>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-gold/40 focus:bg-black/60 transition-all duration-300"
                                            required
                                        />
                                    </div>
                                    {isLogin && (
                                        <div className="flex justify-end pt-2">
                                            <Link to="/reset-password" className="text-[10px] text-white/40 hover:text-gold uppercase tracking-[0.15em] font-bold transition-colors">
                                                Forgot Password?
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-[10px] uppercase tracking-widest font-bold text-red-400 text-center"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    disabled={loading}
                                    className="premium-button w-full h-16 rounded-2xl flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-black" />
                                    ) : (
                                        <>
                                            <span className="text-black font-bold uppercase tracking-[0.2em] text-xs">
                                                {isLogin ? 'Sign In' : 'Sign Up'}
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h3 className="text-2xl font-heading text-white mb-3">Verify Email</h3>
                                <p className="text-[11px] text-white/40 uppercase tracking-widest leading-loose">
                                    Verification active for <br />
                                    <span className="text-gold font-bold">{email}</span>
                                </p>
                            </div>

                            <form onSubmit={handleVerify} className="space-y-8">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gold/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                                    <input
                                        type="text"
                                        maxLength={8}
                                        placeholder="••••••••"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-8 text-center text-4xl font-mono tracking-[0.4em] text-gold focus:outline-none focus:border-gold/50 focus:bg-black/60 transition-all relative z-10 shadow-2xl"
                                        required
                                    />
                                </div>

                                <button
                                    disabled={loading}
                                    className="premium-button w-full h-16 rounded-2xl flex items-center justify-center"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : (
                                        <span className="text-black font-bold uppercase tracking-[0.2em] text-xs">Verify Code</span>
                                    )}
                                </button>

                                <div className="flex flex-col gap-5 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={loading}
                                        className="w-full py-3.5 text-[10px] text-gold/60 hover:text-gold uppercase tracking-[0.2em] font-bold transition-all border border-gold/10 hover:border-gold/30 rounded-xl"
                                    >
                                        Resend Code
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsVerifying(false)}
                                        className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] mb-2"
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    <div className="mt-12 pt-10 border-t border-white/5 flex items-center justify-center gap-12">
                        <motion.div whileHover={{ y: -2 }} className="text-center group cursor-help">
                            <Zap className="w-5 h-5 text-white/10 mx-auto mb-2 group-hover:text-gold transition-colors duration-300" />
                            <p className="text-[8px] uppercase tracking-widest text-white/10 group-hover:text-gold/50 transition-colors">Sync</p>
                        </motion.div>
                        <motion.div whileHover={{ y: -2 }} className="text-center group cursor-help">
                            <Hammer className="w-5 h-5 text-white/10 mx-auto mb-2 group-hover:text-gold transition-colors duration-300" />
                            <p className="text-[8px] uppercase tracking-widest text-white/10 group-hover:text-gold/50 transition-colors">Craft</p>
                        </motion.div>
                        <motion.div whileHover={{ y: -2 }} className="text-center group cursor-help">
                            <ShieldCheck className="w-5 h-5 text-white/10 mx-auto mb-2 group-hover:text-gold transition-colors duration-300" />
                            <p className="text-[8px] uppercase tracking-widest text-white/10 group-hover:text-gold/50 transition-colors">Secure</p>
                        </motion.div>
                    </div>
                </div>

                <div className="text-center mt-12 opacity-30">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-white font-medium">
                        &copy; 2026 INZAN ATHLETICS • CREATED BY MICHAEL MITRY
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

