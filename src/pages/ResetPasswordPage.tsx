import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Mail, Lock, Loader2, ArrowRight, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react';

type ResetStep = 'request' | 'verify' | 'newPassword' | 'success';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<ResetStep>('request');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // Check if user arrived here via a recovery link (hash fragment)
    useEffect(() => {
        const hash = window.location.hash;
        if (hash && hash.includes('type=recovery')) {
            setStep('newPassword');
            setMessage('Recovery link verified. Set your new password.');
        }
    }, []);

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const cleanEmail = email.trim().toLowerCase();

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
                redirectTo: `${window.location.origin}/reset-password`
            });
            if (error) throw error;
            setStep('verify');
            setMessage('Recovery signal transmitted. Check your email.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const cleanEmail = email.trim().toLowerCase();

        try {
            const { error } = await supabase.auth.verifyOtp({
                email: cleanEmail,
                token: otp,
                type: 'recovery'
            });
            if (error) throw error;
            setStep('newPassword');
            setMessage('Identity confirmed. Set your new password.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });
            if (error) throw error;
            // Sign out so user logs in with new password
            await supabase.auth.signOut();
            setStep('success');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendRecovery = async () => {
        setLoading(true);
        setError(null);
        const cleanEmail = email.trim().toLowerCase();
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
                redirectTo: `${window.location.origin}/reset-password`
            });
            if (error) throw error;
            setMessage('Fresh recovery signal transmitted.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const stepConfig = {
        request: {
            icon: <Mail className="w-6 h-6 text-[#FFB800]" />,
            iconBg: 'bg-[#FFB800]/10 border-[#FFB800]/20',
            title: 'Recovery Protocol',
            subtitle: 'Enter your identity to receive a recovery signal.'
        },
        verify: {
            icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
            iconBg: 'bg-emerald-500/10 border-emerald-500/20',
            title: 'Verify Recovery',
            subtitle: `A recovery code was sent to ${email}. Input code to proceed.`
        },
        newPassword: {
            icon: <KeyRound className="w-6 h-6 text-blue-400" />,
            iconBg: 'bg-blue-400/10 border-blue-400/20',
            title: 'New Password',
            subtitle: 'Set a new passphrase for your identity.'
        },
        success: {
            icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
            iconBg: 'bg-emerald-500/10 border-emerald-500/20',
            title: 'Protocol Updated',
            subtitle: 'Your passphrase has been reset. You may now log in.'
        }
    };

    const current = stepConfig[step];

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Orbs */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#FFB800]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#FFB800]/10 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl mb-6">
                        <Crown className="w-8 h-8 text-[#FFB800]" />
                    </div>
                    <h1 className="text-4xl font-light tracking-tight uppercase text-white mb-2">
                        Inzan <span className="font-bold text-[#FFB800]">Athletics</span>
                    </h1>
                    <p className="text-[10px] tracking-[0.3em] font-bold uppercase text-white/40">
                        High Performance Protocol
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {(['request', 'verify', 'newPassword', 'success'] as ResetStep[]).map((s, i) => (
                            <React.Fragment key={s}>
                                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${step === s ? 'bg-[#FFB800] scale-125 shadow-[0_0_8px_rgba(255,184,0,0.4)]' :
                                    (['request', 'verify', 'newPassword', 'success'].indexOf(step) > i ? 'bg-[#FFB800]/50' : 'bg-white/10')
                                    }`} />
                                {i < 3 && (
                                    <div className={`w-8 h-0.5 transition-all duration-300 ${(['request', 'verify', 'newPassword', 'success'].indexOf(step) > i ? 'bg-[#FFB800]/30' : 'bg-white/5'
                                    )}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Step Header */}
                            <div className="text-center mb-6">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full border mb-4 ${current.iconBg}`}>
                                    {current.icon}
                                </div>
                                <h1 className="text-3xl font-heading tracking-[0.2em] uppercase text-white mb-2">Password Recovery</h1>
                                <p className="text-[10px] tracking-[0.4em] uppercase text-gold/60 font-medium">Initiate Password Reset</p>
                            </div>

                            {/* Step 1: Request Reset */}
                            {step === 'request' && (
                                <form onSubmit={handleRequestReset} className="space-y-6">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                        <input
                                            type="email"
                                            placeholder="IDENTITY@PROTOCOL.COM"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-[#FFB800]/50 transition-all uppercase tracking-wider"
                                            required
                                        />
                                    </div>

                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-[10px] uppercase tracking-widest font-bold text-red-500 text-center">
                                            {error}
                                        </div>
                                    )}
                                    {message && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-[10px] uppercase tracking-widest font-bold text-emerald-400 text-center">
                                            {message}
                                        </div>
                                    )}

                                    <button
                                        disabled={loading}
                                        className="w-full bg-[#FFB800] hover:bg-[#FFB800]/90 disabled:opacity-50 text-black py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,184,0,0.2)] transition-all active:scale-[0.98]"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                            <>Transmit Recovery Signal <ArrowRight className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Step 2: Verify OTP */}
                            {step === 'verify' && (
                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <input
                                        type="text"
                                        maxLength={8}
                                        placeholder="••••••••"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-6 text-center text-3xl font-mono tracking-[0.3em] text-[#FFB800] focus:outline-none focus:border-[#FFB800]/50 transition-all"
                                        required
                                    />

                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-[10px] uppercase tracking-widest font-bold text-red-500 text-center">
                                            {error}
                                        </div>
                                    )}
                                    {message && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-[10px] uppercase tracking-widest font-bold text-emerald-400 text-center">
                                            {message}
                                        </div>
                                    )}

                                    <button
                                        disabled={loading}
                                        className="w-full bg-[#FFB800] hover:bg-[#FFB800]/90 disabled:opacity-50 text-black py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,184,0,0.2)] transition-all"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Recovery Code'}
                                    </button>

                                    <div className="flex flex-col gap-4">
                                        <button
                                            type="button"
                                            onClick={handleResendRecovery}
                                            disabled={loading}
                                            className="w-full py-2 text-[10px] text-[#FFB800] hover:text-[#FFB800]/80 uppercase tracking-widest font-bold transition-colors border border-[#FFB800]/20 rounded-lg backdrop-blur-sm"
                                        >
                                            Resend Signal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setStep('request'); setError(null); setMessage(null); setOtp(''); }}
                                            className="w-full text-[10px] text-white/20 hover:text-white uppercase tracking-widest font-bold transition-colors"
                                        >
                                            Cancel & Return
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Step 3: New Password */}
                            {step === 'newPassword' && (
                                <form onSubmit={handleUpdatePassword} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                            <input
                                                type="password"
                                                placeholder="NEW PASSPHRASE"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-[#FFB800]/50 transition-all uppercase tracking-wider"
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                        <div className="relative">
                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                            <input
                                                type="password"
                                                placeholder="CONFIRM PASSPHRASE"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-[#FFB800]/50 transition-all uppercase tracking-wider"
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </div>

                                    {/* Password strength hints */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className={`text-[8px] uppercase tracking-wider font-bold p-2 rounded-lg border text-center ${newPassword.length >= 6 ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-white/20 border-white/5 bg-white/[0.02]'
                                            }`}>
                                            6+ Characters
                                        </div>
                                        <div className={`text-[8px] uppercase tracking-wider font-bold p-2 rounded-lg border text-center ${/\d/.test(newPassword) ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-white/20 border-white/5 bg-white/[0.02]'
                                            }`}>
                                            Number
                                        </div>
                                        <div className={`text-[8px] uppercase tracking-wider font-bold p-2 rounded-lg border text-center ${/[A-Z]/.test(newPassword) ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-white/20 border-white/5 bg-white/[0.02]'
                                            }`}>
                                            Uppercase
                                        </div>
                                        <div className={`text-[8px] uppercase tracking-wider font-bold p-2 rounded-lg border text-center ${newPassword === confirmPassword && confirmPassword.length > 0 ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-white/20 border-white/5 bg-white/[0.02]'
                                            }`}>
                                            Match
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-[10px] uppercase tracking-widest font-bold text-red-500 text-center">
                                            {error}
                                        </div>
                                    )}
                                    {message && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-[10px] uppercase tracking-widest font-bold text-emerald-400 text-center">
                                            {message}
                                        </div>
                                    )}

                                    <button
                                        disabled={loading}
                                        className="w-full bg-[#FFB800] hover:bg-[#FFB800]/90 disabled:opacity-50 text-black py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,184,0,0.2)] transition-all active:scale-[0.98]"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                            <>Update Password <ArrowRight className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Step 4: Success */}
                            {step === 'success' && (
                                <div className="space-y-6 text-center">
                                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-6">
                                        <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
                                            Your passphrase has been successfully updated.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => navigate('/auth')}
                                        className="w-full bg-[#FFB800] hover:bg-[#FFB800]/90 text-black py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,184,0,0.2)] transition-all active:scale-[0.98]"
                                    >
                                        Return to Access Terminal <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="text-center mt-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/5 whitespace-nowrap">Inzan Athletics | Premium Excellence</p>
                </div>
            </motion.div>
        </div>
    );
}
