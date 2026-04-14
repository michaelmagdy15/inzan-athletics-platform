import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hammer,
  Crown,
  Zap,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useBranding } from "../context/BrandingContext";

export default function AuthPage() {
  const { config } = useBranding();
  const [isLogin, setIsLogin] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
      // Redirect handled by AuthContext listener
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) {
          if (error.message.includes("Email not confirmed")) {
            await handleResend();
            setIsVerifying(true);
            setError("Identity unconfirmed. New link transmitted.");
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
              full_name: cleanEmail.split("@")[0],
              avatar_url: `https://i.pravatar.cc/150?u=${cleanEmail}`,
              role: "member",
              membership_status: "pending",
              membership_tier: "Standard",
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            await handleResend();
            setIsVerifying(true);
            setError("Identity recognized. Fresh validation required.");
            return;
          }
          throw error;
        }

        // Automatic transition for elite UX
        setIsVerifying(true);
        setTimeout(() => {
          // The AuthContext listener will handle the actual state change
          // This just shows the nice 'Verifying' UI for a moment
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [cooldown, setCooldown] = useState(0);

  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: cleanEmail,
      });
      if (error) throw error;
      setCooldown(60);
      setError("New signal transmitted to your identity.");
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
        type: "signup",
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
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-gold/5 blur-[120px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          rotate: [0, -90, 0],
          opacity: [0.2, 0.4, 0.2],
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
          <h1 className="text-5xl font-heading font-light tracking-tight text-white mb-3 leading-tight">
            I N
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-gold/30" />
            <p className="text-[10px] tracking-[0.4em] font-medium uppercase text-white/40">
              {config.tagline}
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
                  onClick={() => {
                    setIsLogin(true);
                    setError(null);
                  }}
                  className={`flex-1 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] rounded-xl transition-all duration-500 ${isLogin ? "bg-gold text-black shadow-lg shadow-gold/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                >
                  Access
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError(null);
                  }}
                  className={`flex-1 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] rounded-xl transition-all duration-500 ${!isLogin ? "bg-gold text-black shadow-lg shadow-gold/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                >
                  Initialize
                </button>
              </div>
              
              {/* Google Sign In */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl py-4.5 px-4 flex items-center justify-center gap-3 transition-all duration-300 group disabled:opacity-50"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] transition-colors group-hover:text-gold">Continue with Google</span>
                </button>
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[9px] uppercase tracking-[0.2em]">
                  <span className="bg-[#050505] px-4 text-white/20">or system sync via credentials</span>
                </div>
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
                  {!isLogin && (
                    <div className="flex items-start gap-3 pt-2">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          id="terms"
                          className="w-4 h-4 rounded border-white/20 bg-black/40 text-gold focus:ring-gold focus:ring-offset-black accent-gold cursor-pointer"
                          required
                        />
                      </div>
                      <label htmlFor="terms" className="text-[10px] text-white/50 leading-relaxed cursor-pointer pr-4">
                        By initializing your core identity, you agree to our <span className="text-gold font-bold">Terms of Service</span>, <span className="text-gold font-bold">Privacy Policy</span>, and consent to performance data processing.
                      </label>
                    </div>
                  )}
                  {isLogin && (
                    <div className="flex justify-end pt-2">
                      <Link
                        to="/reset-password"
                        className="text-[10px] text-white/40 hover:text-gold uppercase tracking-[0.15em] font-bold transition-colors"
                      >
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
                        {isLogin ? "Sign In" : "Sign Up"}
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
                <h3 className="text-2xl font-heading text-white mb-3">
                  Establishing Neural Link
                </h3>
                <p className="text-[11px] text-white/40 uppercase tracking-widest leading-loose">
                  Stabilizing connection for <br />
                  <span className="text-gold font-bold">{email}</span>
                </p>
              </div>

              <div className="py-12 flex flex-col items-center justify-center space-y-8">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 rounded-full border-t-2 border-r-2 border-gold/30"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gold" />
                  </div>
                </div>
                <p className="text-[10px] text-gold/40 uppercase tracking-[0.3em] font-bold animate-pulse">
                  Synchronizing Platform Data...
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-[9px] text-white/50 text-center uppercase tracking-widest font-bold">
                  Activation signal transmitted.
                </p>
                <p className="text-[9px] text-white/20 text-center uppercase tracking-widest">
                  Please check your inbox to verify <br />
                  your identity and activate the link.
                </p>
              </div>

              <div className="flex flex-col gap-5 pt-4">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading || cooldown > 0}
                  className="w-full py-3.5 text-[10px] text-gold/60 hover:text-gold uppercase tracking-[0.2em] font-bold transition-all border border-gold/10 hover:border-gold/30 rounded-xl disabled:opacity-50"
                >
                  {cooldown > 0 ? `Resend Available in ${cooldown}s` : "Resend Link"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] mb-2"
                >
                  Back to Login
                </button>
              </div>
            </motion.div>
          )}

          <div className="mt-12 pt-10 border-t border-white/5 flex items-center justify-center gap-12">
            <motion.div
              whileHover={{ y: -2 }}
              className="text-center group cursor-help"
            >
              <Zap className="w-5 h-5 text-white/10 mx-auto mb-2 group-hover:text-gold transition-colors duration-300" />
              <p className="text-[8px] uppercase tracking-widest text-white/10 group-hover:text-gold/50 transition-colors">
                Sync
              </p>
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              className="text-center group cursor-help"
            >
              <Hammer className="w-5 h-5 text-white/10 mx-auto mb-2 group-hover:text-gold transition-colors duration-300" />
              <p className="text-[8px] uppercase tracking-widest text-white/10 group-hover:text-gold/50 transition-colors">
                Craft
              </p>
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              className="text-center group cursor-help"
            >
              <ShieldCheck className="w-5 h-5 text-white/10 mx-auto mb-2 group-hover:text-gold transition-colors duration-300" />
              <p className="text-[8px] uppercase tracking-widest text-white/10 group-hover:text-gold/50 transition-colors">
                Secure
              </p>
            </motion.div>
          </div>
        </div>

        <div className="text-center mt-12 opacity-30">
          <p className="text-[9px] uppercase tracking-[0.4em] text-white font-medium">
            &copy; {new Date().getFullYear()} {config.name} • CREATED BY MICHAEL MITRY
          </p>
        </div>
      </motion.div>
    </div>
  );
}
