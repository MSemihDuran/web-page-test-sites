import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Lock, Mail, User, Briefcase, Eye, EyeOff, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Register = () => {
    const navigate = useNavigate();
    const { language, changeLanguage, t } = useLanguage();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('BUYER'); 
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:5005'
            : 'https://rootwebcore-backend.onrender.com';

        try {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, companyName, role })
            });
            const data = await res.json();
            if (res.ok) {
                alert(language === 'TR' ? 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.' : 'Registration successful! You can now log in.');
                localStorage.setItem('apex_show_onboarding', 'true');
                navigate('/login');
            } else {
                setError(data.error || (language === 'TR' ? 'Kayıt yapılamadı.' : 'Registration failed.'));
            }
        } catch (err) {
            console.error(err);
            setError(language === 'TR' ? 'Sunucu bağlantı hatası.' : 'Server connection error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {}
            <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-100 relative z-10">

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
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">
                        {language === 'TR' ? 'YENİ ÜYELİK' : 'CREATE ACCOUNT'}
                    </h1>
                    <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 mt-1">
                        {t('register_subtitle')}
                    </span>
                </div>

                {error && (
                    <div className="p-3 mb-5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
                    <div className="space-y-1.5">
                        <label className="block text-slate-500 font-bold">{t('register_name')}</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><User size={15} /></span>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full py-3 pl-10 pr-4 rounded-xl premium-input text-xs"
                                placeholder={language === 'TR' ? 'Örn: Selim Şahin' : 'e.g. John Doe'}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-slate-500 font-bold">{t('register_company')}</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Briefcase size={15} /></span>
                            <input
                                type="text"
                                required
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                className="w-full py-3 pl-10 pr-4 rounded-xl premium-input text-xs"
                                placeholder={language === 'TR' ? 'Örn: Moda Mobilya Ltd.' : 'e.g. Trend Furniture Ltd.'}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-slate-500 font-bold">{t('register_email')}</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={15} /></span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full py-3 pl-10 pr-4 rounded-xl premium-input text-xs"
                                placeholder="mail@sirketiniz.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-slate-500 font-bold">{language === 'TR' ? 'Üyelik Tipi' : 'Account Type'}</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole('BUYER')}
                                className={`py-3 rounded-xl border font-bold text-xs uppercase transition-all cursor-pointer ${
                                    role === 'BUYER'
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                        : 'bg-white text-indigo-600 border-slate-200 hover:border-indigo-300'
                                }`}
                            >
                                {language === 'TR' ? 'Alıcı (Mağaza)' : 'Buyer (Store)'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('SELLER')}
                                className={`py-3 rounded-xl border font-bold text-xs uppercase transition-all cursor-pointer ${
                                    role === 'SELLER'
                                        ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                                        : 'bg-white text-amber-600 border-slate-200 hover:border-amber-300'
                                }`}
                            >
                                {language === 'TR' ? 'Satıcı (Üretici)' : 'Seller (Manufacturer)'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-slate-500 font-bold">{t('register_password')}</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={15} /></span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full py-3 pl-10 pr-10 rounded-xl premium-input text-xs"
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
                        <UserPlus size={15} />
                        {loading ? t('loading') : t('register_btn')}
                    </button>
                </form>

                <div className="mt-8 text-center text-[10px] font-bold text-slate-400">
                    {t('register_has_acc')}{' '}
                    <Link to="/login" className="text-indigo-600 hover:underline">
                        {t('register_login_link')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
