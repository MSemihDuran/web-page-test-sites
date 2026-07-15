import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck, MessageSquare, BadgePercent, ArrowRight, User, Briefcase, Mail, Phone, Lock, Eye, EyeOff, Globe } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

const Home = () => {
    const navigate = useNavigate();
    const { language, changeLanguage, t } = useLanguage();

    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [step, setStep] = useState(1); 
    const [showPassword, setShowPassword] = useState(false);
    const [wizardError, setWizardError] = useState('');
    const [loading, setLoading] = useState(false);

    const [role, setRole] = useState('BUYER'); 
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [about, setAbout] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5005'
        : 'https://rootwebcore-backend.onrender.com';

    const handleNextStep = () => {
        setWizardError('');
        if (step === 2) {
            if (!name || !email || !phone || !password) {
                setWizardError('Lütfen tüm temel kayıt alanlarını eksiksiz doldurun.');
                return;
            }
            if (password.length < 6) {
                setWizardError('Şifre en az 6 karakter olmalıdır.');
                return;
            }
        }
        setStep(prev => prev + 1);
    };

    const handlePrevStep = () => {
        setWizardError('');
        setStep(prev => prev - 1);
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setWizardError('');
        setLoading(true);

        if (!companyName) {
            setWizardError('Lütfen firma adınızı girin.');
            setLoading(false);
            return;
        }

        const payload = {
            email,
            password,
            name,
            companyName,
            phone,
            about,
            logoUrl: logoUrl || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=200',
            role
        };

        try {

            const regRes = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const regData = await regRes.json();

            if (!regRes.ok) {
                setWizardError(regData.error || 'Kayıt sırasında hata oluştu.');
                setLoading(false);
                return;
            }

            const logRes = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const logData = await logRes.json();

            if (logRes.ok) {
                localStorage.setItem('token', logData.token);
                localStorage.setItem('user', JSON.stringify(logData.user));
                localStorage.setItem('apex_show_onboarding', 'true');
                setIsWizardOpen(false);
                navigate('/');
            } else {
                navigate('/login');
            }
        } catch (err) {
            console.error(err);
            setWizardError('Sunucu bağlantı hatası.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden">

            {}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 py-4 px-6 border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20">
                            A
                        </div>
                        <div>
                            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900">APEX B2B</h1>
                            <span className="text-[9px] uppercase font-black tracking-widest text-indigo-600 block">FURNITURE MARKET</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold">
                        <button 
                            type="button"
                            onClick={() => changeLanguage(language === 'TR' ? 'EN' : 'TR')} 
                            className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer text-slate-500 font-black mr-2"
                        >
                            <Globe size={13} /> {language}
                        </button>
                        <Link to="/login" className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer">{t('home_btn_login')}</Link>
                        <button 
                            onClick={() => { setIsWizardOpen(true); setStep(1); }}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                        >
                            {t('home_btn_start').replace(' ➔', '')}
                        </button>
                    </div>
                </div>
            </header>

            {}
            <section className="py-16 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 text-center lg:text-left">
                    <span className="px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider border border-indigo-100 inline-block">
                        {t('home_hero_badge')}
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
                        {t('home_hero_title')}
                    </h2>
                    <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-semibold">
                        {t('home_hero_desc')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                        <button 
                            onClick={() => { setIsWizardOpen(true); setStep(1); }}
                            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                            {t('home_btn_start')}
                        </button>
                        <Link 
                            to="/login"
                            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-black text-xs uppercase tracking-widest transition-all text-center"
                        >
                            {t('home_btn_login')}
                        </Link>
                    </div>
                </div>

                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 aspect-[4/3] bg-slate-100 animate-float">
                    <img 
                        src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200" 
                        alt="B2B Mobilya"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
                </div>
            </section>

            {}
            <section className="py-16 bg-white border-t border-b border-slate-200/60 px-6">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{t('home_flow_title')}</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                            {language === 'TR' ? 'Hızlı, Kolay ve Şeffaf B2B Müzakere Akışı' : 'Fast, Easy and Transparent B2B Negotiation Flow'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4 hover:border-indigo-200 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">1</div>
                            <h3 className="text-base font-black text-slate-900">
                                {language === 'TR' ? 'Hesap Tipi Seçimi' : 'Role Selection'}
                            </h3>
                            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                {language === 'TR' 
                                    ? 'Satıcı firma (mobilya üreticisi) veya Alıcı (toptan alım yapacak mağaza sahibi) olarak sisteme anında kayıt oluşturun.' 
                                    : 'Register instantly as a Seller (furniture manufacturer) or Buyer (wholesale retail store owner).'}
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4 hover:border-indigo-200 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">2</div>
                            <h3 className="text-base font-black text-slate-900">
                                {language === 'TR' ? 'Teklif Talebi ve Müzakere' : 'Request & Negotiate'}
                            </h3>
                            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                {language === 'TR' 
                                    ? 'Alıcılar kataloğu gezer, beğendikleri mobilyalar için fiyatsız olarak "Teklif İste" butonuyla adet ve detayları ileterek müzakere başlatır.' 
                                    : 'Buyers browse the catalog and initiate price negotiations for items via the "Request Quote" button without upfront payment.'}
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4 hover:border-indigo-200 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">3</div>
                            <h3 className="text-base font-black text-slate-900">
                                {language === 'TR' ? 'Canlı Sohbet ve Onay' : 'Live Chat & Approval'}
                            </h3>
                            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                {language === 'TR' 
                                    ? 'Üretici özel fiyat teklifini iletir. İki taraf, teklife özel entegre canlı sohbet penceresinden nakliye ve detayları görüşüp teklifi onaylar.' 
                                    : 'The manufacturer sends a custom quote. Both parties negotiate shipping/terms via real-time chat and approve the deal.'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {}
            <section className="py-16 px-6 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
                        <div className="text-indigo-600 p-2 bg-indigo-50 rounded-xl"><ShieldCheck size={24} /></div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-black text-slate-900 uppercase">
                                {language === 'TR' ? 'Güvenilir Sektör Ağı' : 'Trusted Industry Network'}
                            </h4>
                            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                {language === 'TR' ? 'Sadece onaylı mobilya üreticileri ve perakende mağazaları bir araya gelir.' : 'Only approved furniture manufacturers and retail stores connect.'}
                            </p>
                        </div>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
                        <div className="text-indigo-600 p-2 bg-indigo-50 rounded-xl"><MessageSquare size={24} /></div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-black text-slate-900 uppercase">
                                {language === 'TR' ? 'Doğrudan Müzakere' : 'Direct Negotiations'}
                            </h4>
                            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                {language === 'TR' ? 'Arada aracı olmadan, WebSocket destekli anlık mesajlaşma ile hızlı ticaret.' : 'Fast trading with direct real-time chat and proposal adjustments.'}
                            </p>
                        </div>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
                        <div className="text-indigo-600 p-2 bg-indigo-50 rounded-xl"><BadgePercent size={24} /></div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-black text-slate-900 uppercase">
                                {language === 'TR' ? '%0 Komisyon Politikası' : '0% Commission Policy'}
                            </h4>
                            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                {language === 'TR' ? 'Komisyon ödemeden, kendi sunucunuzda bağımsız ticaret özgürlüğü.' : 'Trade freely on your own server without paying commission fees.'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {}
            <footer className="py-6 border-t border-slate-200/60 bg-white text-center text-[10px] font-bold text-slate-400 tracking-wider">
                &copy; 2026 Root Web Core B2B Business-to-Business Furniture Marketplace. All rights reserved.
            </footer>

            {}
            {isWizardOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-slate-100 max-h-[95vh] overflow-y-auto relative">

                        {}
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span className={step >= 1 ? "text-indigo-600" : ""}>
                                    {language === 'TR' ? 'ÜYELİK TİPİ' : 'ACCOUNT TYPE'}
                                </span>
                                <ChevronRight size={10} />
                                <span className={step >= 2 ? "text-indigo-600" : ""}>
                                    {language === 'TR' ? 'KİŞİSEL BİLGİLER' : 'PERSONAL DETAILS'}
                                </span>
                                <ChevronRight size={10} />
                                <span className={step >= 3 ? "text-indigo-600" : ""}>
                                    {language === 'TR' ? 'FİRMA DETAYLARI' : 'COMPANY DETAILS'}
                                </span>
                            </div>
                            <button 
                                onClick={() => setIsWizardOpen(false)}
                                className="text-slate-400 hover:text-slate-950 font-black text-xs cursor-pointer bg-slate-50 py-1 px-3 rounded-lg border border-slate-100"
                            >
                                {language === 'TR' ? 'İptal X' : 'Cancel X'}
                            </button>
                        </div>

                        {wizardError && (
                            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold text-center">
                                {wizardError}
                            </div>
                        )}

                        <form onSubmit={e => e.preventDefault()} className="text-xs font-semibold">

                            {}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h3 className="text-lg font-black text-slate-900">
                                            {language === 'TR' ? 'Apex B2B Ağına Nasıl Katılmak İstersiniz?' : 'How would you like to join the Apex B2B Network?'}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                                            {language === 'TR' ? 'Hizmet almak mı yoksa vermek mi istiyorsunuz?' : 'Do you want to buy products or sell them?'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div 
                                            onClick={() => setRole('BUYER')}
                                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-3 ${
                                                role === 'BUYER'
                                                    ? 'border-indigo-600 bg-indigo-50/20 shadow-md'
                                                    : 'border-slate-200 hover:border-indigo-300'
                                            }`}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">🛍️</div>
                                            <h4 className="text-sm font-black text-slate-950">
                                                {language === 'TR' ? 'Mobilya Alıcısı (Mağaza)' : 'Furniture Buyer (Store)'}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                                                {language === 'TR' 
                                                    ? 'Toptan mobilya üretici kataloglarını gezer, fiyat teklifi ister, pazarlık yapar.' 
                                                    : 'Browse wholesale manufacturer catalogs, request price quotes, and negotiate.'}
                                            </p>
                                        </div>

                                        <div 
                                            onClick={() => setRole('SELLER')}
                                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-3 ${
                                                role === 'SELLER'
                                                    ? 'border-amber-600 bg-amber-50/20 shadow-md'
                                                    : 'border-slate-200 hover:border-amber-300'
                                            }`}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl">🏭</div>
                                            <h4 className="text-sm font-black text-slate-950">
                                                {language === 'TR' ? 'Satıcı Firma (Üretici)' : 'Seller Company (Manufacturer)'}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                                                {language === 'TR' 
                                                    ? 'Kendi ürünlerini listeler, gelen teklifleri yanıtlar ve fiyat teklifi sunar.' 
                                                    : 'List your products, reply to incoming price requests, and propose quotes.'}
                                            </p>
                                        </div>
                                    </div>

                                    <button 
                                        type="button"
                                        onClick={handleNextStep}
                                        className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        {language === 'TR' ? 'İlerle' : 'Next'} <ArrowRight size={13} />
                                    </button>
                                </div>
                            )}

                            {}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <div className="text-center mb-4">
                                        <h3 className="text-lg font-black text-slate-900">
                                            {language === 'TR' ? 'Hesap Kayıt Bilgileri' : 'Account Registration Details'}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                                            {language === 'TR' ? 'Kişisel ve erişim bilgilerinizi tanımlayın' : 'Define your personal and login credentials'}
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-slate-500 font-bold">{t('wizard_field_name')}</label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><User size={15} /></span>
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                className="w-full py-3 pl-10 pr-4 rounded-xl premium-input text-xs"
                                                placeholder={language === 'TR' ? 'Örn: Ahmet Kaya' : 'e.g. John Doe'}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-slate-500 font-bold">{t('wizard_field_email')}</label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={15} /></span>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                className="w-full py-3 pl-10 pr-4 rounded-xl premium-input text-xs"
                                                placeholder="yetkili@firma.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-slate-500 font-bold">{t('wizard_field_phone')}</label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Phone size={15} /></span>
                                            <input
                                                type="text"
                                                required
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                className="w-full py-3 pl-10 pr-4 rounded-xl premium-input text-xs"
                                                placeholder={language === 'TR' ? 'Örn: 0555 123 4567' : 'e.g. 555 123 4567'}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-slate-500 font-bold">{t('wizard_field_password')}</label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={15} /></span>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="w-full py-3 pl-10 pr-10 rounded-xl premium-input text-xs"
                                                placeholder={language === 'TR' ? '•••••••• (En az 6 hane)' : '•••••••• (Min 6 characters)'}
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

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <button 
                                            type="button"
                                            onClick={handlePrevStep}
                                            className="py-3 rounded-xl border border-slate-200 text-slate-600 font-black uppercase text-xs hover:bg-slate-50 cursor-pointer"
                                        >
                                            {t('wizard_btn_prev')}
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={handleNextStep}
                                            className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1"
                                        >
                                            {language === 'TR' ? 'İlerle' : 'Next'} <ArrowRight size={13} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <div className="text-center mb-4">
                                        <h3 className="text-lg font-black text-slate-900">
                                            {language === 'TR' ? 'Marka ve Firma Bilgileri' : 'Brand and Company Details'}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                                            {language === 'TR' ? 'Müşterilerinize görünecek kurumsal detayları girin' : 'Enter commercial details visible to your buyers'}
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-slate-500 font-bold">{t('wizard_field_company')}</label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Briefcase size={15} /></span>
                                            <input
                                                type="text"
                                                required
                                                value={companyName}
                                                onChange={e => setCompanyName(e.target.value)}
                                                className="w-full py-3 pl-10 pr-4 rounded-xl premium-input text-xs"
                                                placeholder={language === 'TR' ? 'Örn: Lüks İpek Mobilya A.Ş.' : 'e.g. Deluxe Furniture Corp'}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-slate-500 font-bold">{t('wizard_field_logo')}</label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Globe size={15} /></span>
                                            <input
                                                type="url"
                                                value={logoUrl}
                                                onChange={e => setLogoUrl(e.target.value)}
                                                className="w-full py-3 pl-10 pr-4 rounded-xl premium-input text-xs"
                                                placeholder={language === 'TR' ? 'Resim URL (Boş bırakılırsa varsayılan atanır)' : 'Logo Image URL (Optional)'}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-slate-500 font-bold">{t('wizard_field_about')}</label>
                                        <textarea
                                            rows="3"
                                            value={about}
                                            onChange={e => setAbout(e.target.value)}
                                            className="w-full py-3 px-4 rounded-xl premium-input text-xs leading-relaxed"
                                            placeholder={language === 'TR' ? 'Üretim kapasiteniz, hizmet alanlarınız veya mağazanız hakkında kısa bilgi...' : 'Provide info about production capacities, services or store categories...'}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <button 
                                            type="button"
                                            onClick={handlePrevStep}
                                            className="py-3 rounded-xl border border-slate-200 text-slate-600 font-black uppercase text-xs hover:bg-slate-50 cursor-pointer"
                                        >
                                            {t('wizard_btn_prev')}
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={handleRegisterSubmit}
                                            disabled={loading}
                                            className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1"
                                        >
                                            {loading ? t('loading') : t('wizard_btn_finish')}
                                        </button>
                                    </div>
                                </div>
                            )}

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Home;
