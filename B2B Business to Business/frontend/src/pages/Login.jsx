import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Lock, Mail, Eye, EyeOff, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
    const navigate = useNavigate();
    const { language, changeLanguage, t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [twoFactorUserId, setTwoFactorUserId] = useState('');

    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5005'
        : 'https://rootwebcore-backend.onrender.com';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                if (data.twoFactorRequired) {
                    setTwoFactorRequired(true);
                    setTwoFactorUserId(data.userId);
                } else {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    navigate('/');
                }
            } else {
                setError(data.error || (language === 'TR' ? 'Giriş yapılamadı.' : 'Login failed.'));
            }
        } catch (err) {
            console.error(err);
            setError(language === 'TR' ? 'Sunucu bağlantı hatası.' : 'Server connection error.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/auth/verify-2fa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: twoFactorUserId, code: twoFactorCode })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/');
            } else {
                setError(data.error || (language === 'TR' ? 'Doğrulama kodu geçersiz.' : 'Invalid verification code.'));
            }
        } catch (err) {
            console.error(err);
            setError(language === 'TR' ? 'Doğrulama sırasında hata oluştu.' : 'An error occurred during verification.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {}
            <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-100 relative z-10 transition-all duration-300">

                {}
                <div className="absolute top-6 right-6">
                    <button 
                        type="button"
                        onClick={() => changeLanguage(language === 'TR' ? 'EN' : 'TR')}
                        className="flex items-center gap-1 hover:text-indigo-600 transition-colors text-[10px] font-black text-slate-400 cursor-pointer"
                    >
                        <Globe size={11} /> {language}
                    </button>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-600/20 mb-4 animate-float">
                        A
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">APEX B2B</h1>
                    <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 mt-1">
                        {t('login_subtitle')}
                    </span>
                </div>

                {error && (
                    <div className="p-3 mb-5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold text-center">
                        {error}
                    </div>
                )}

                {!twoFactorRequired ? (
                    <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold">
                        <div className="space-y-1.5">
                            <label className="block text-slate-500 font-bold">{t('login_email')}</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={15} /></span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full py-3.5 pl-10 pr-4 rounded-xl premium-input text-xs"
                                    placeholder="mail@sirketiniz.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-slate-500 font-bold">{t('login_password')}</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={15} /></span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full py-3.5 pl-10 pr-10 rounded-xl premium-input text-xs"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-600/10 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            <LogIn size={15} />
                            {loading ? t('loading') : t('login_btn')}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerify2FA} className="space-y-5 text-xs font-semibold">
                        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-indigo-900 text-xs leading-relaxed font-semibold">
                            🔒 <strong>{t('login_2fa_title')}</strong>
                            <p className="mt-1 text-[10px] text-slate-500">{t('login_2fa_subtitle')}</p>
                            <p className="mt-1 text-[9px] text-slate-400 italic font-bold">{t('login_2fa_code_placeholder')}</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-slate-500 font-bold">{t('login_2fa_code')}</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={15} /></span>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={twoFactorCode}
                                    onChange={e => setTwoFactorCode(e.target.value)}
                                    className="w-full py-3.5 pl-10 pr-4 rounded-xl premium-input text-center text-sm font-bold tracking-widest"
                                    placeholder="------"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-600/10 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('loading') : t('login_2fa_btn')}
                        </button>

                        <button
                            type="button"
                            onClick={() => setTwoFactorRequired(false)}
                            className="w-full text-center text-slate-400 hover:text-indigo-600 font-bold transition-all mt-1"
                        >
                            {t('login_2fa_cancel')}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center text-[10px] font-bold text-slate-400">
                    {t('login_no_acc')}{' '}
                    <Link to="/register" className="text-indigo-600 hover:underline">
                        {t('login_register_link')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
