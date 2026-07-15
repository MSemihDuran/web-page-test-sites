import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, Clock, LogOut, Globe, HelpCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import { useLanguage } from '../context/LanguageContext';

const Quotes = () => {
    const navigate = useNavigate();
    const { language, changeLanguage, t } = useLanguage();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState('');
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5005'
        : 'https://rootwebcore-backend.onrender.com';

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (!storedUser || !storedToken) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
    }, [navigate]);

    const fetchQuotes = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/api/quotes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setQuotes(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && user) {
            fetchQuotes();

            const socket = io(API_BASE);
            socket.emit('join_user', user.id);

            socket.on('quote_notification', (data) => {
                fetchQuotes();
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [token, user]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING':
                return 'border-amber-200 text-amber-700 bg-amber-50';
            case 'OFFERED':
                return 'border-indigo-200 text-indigo-700 bg-indigo-50';
            case 'APPROVED':
                return 'border-emerald-200 text-emerald-700 bg-emerald-50';
            case 'REJECTED':
                return 'border-red-200 text-red-700 bg-red-50';
            default:
                return 'border-slate-200 text-slate-700 bg-slate-50';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING':
                return language === 'TR' ? 'Müşteri Talebi (Fiyat Bekleniyor)' : 'Buyer Request (Awaiting Quote)';
            case 'OFFERED':
                return language === 'TR' ? 'Fiyat Teklifi Verildi' : 'Price Quote Offered';
            case 'APPROVED':
                return language === 'TR' ? 'Teklif Onaylandı (Anlaşma Sağlandı)' : 'Quote Approved (Deal Struck)';
            case 'REJECTED':
                return language === 'TR' ? 'Teklif Reddedildi' : 'Quote Rejected';
            default:
                return status;
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">

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

                    <div className="flex items-center gap-5 text-xs font-bold">
                        <button 
                            type="button"
                            onClick={() => changeLanguage(language === 'TR' ? 'EN' : 'TR')}
                            className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-pointer text-slate-500 font-black mr-1"
                        >
                            <Globe size={13} /> {language}
                        </button>
                        <Link to="/" className="text-slate-500 hover:text-indigo-600 transition-all">{t('catalog')}</Link>
                        <Link to="/quotes" className="text-indigo-600 border-b-2 border-indigo-600 pb-0.5 transition-all">{t('my_quotes')}</Link>
                        <button 
                            onClick={() => { navigate('/'); setTimeout(() => window.dispatchEvent(new Event('start_tour')), 300); }}
                            className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all cursor-pointer"
                            title={language === 'TR' ? 'Rehberi Başlat' : 'Start Guide'}
                        >
                            <HelpCircle size={15} />
                        </button>
                        <span className="text-slate-300">|</span>
                        <Link to="/settings" className="flex items-center gap-3 hover:text-indigo-600 transition-colors cursor-pointer" title={t('settings')}>
                            {user.avatarUrl ? (
                                <img src={`${API_BASE}${user.avatarUrl}`} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-extrabold text-xs border border-indigo-200">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex flex-col items-end text-right">
                                <span className="text-slate-800 font-extrabold leading-none block mb-0.5">{user.name}</span>
                                <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider leading-none">
                                    {user.companyName} ({user.role === 'SELLER' ? t('seller') : t('buyer')})
                                </span>
                            </div>
                        </Link>
                        <button 
                            onClick={() => { localStorage.clear(); navigate('/login'); }}
                            className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                            title={language === 'TR' ? 'Çıkış Yap' : 'Log Out'}
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>
            </header>

            {}
            <main className="flex-grow max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-950">{t('quotes_title')}</h2>
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1 block">{t('quotes_subtitle')}</span>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-3xl p-16 text-center text-slate-400 border border-slate-200/60 font-semibold text-xs shadow-sm">
                        {t('loading')}
                    </div>
                ) : quotes.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center text-slate-400 border border-slate-200/60 font-semibold text-xs shadow-sm">
                        {t('quotes_no_data')}
                    </div>
                ) : (
                    <div className="space-y-4">
                         {quotes.map(q => (
                             <div 
                                 key={q.id}
                                 onClick={() => navigate(`/quotes/${q.id}`)}
                                 className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer group"
                             >
                                 <div className="flex gap-4 items-center">
                                     <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                         <img src={q.product?.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800'} alt="" className="w-full h-full object-cover" />
                                     </div>
                                     <div>
                                         <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                             {q.product?.title}
                                         </h3>
                                         <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                             <span>{user.role === 'SELLER' ? `${t('buyer')}: ${q.buyer?.companyName}` : `${t('detail_manufacturer')}: ${q.seller?.companyName}`}</span>
                                             <span>•</span>
                                             <span className="flex items-center gap-1"><Clock size={11} /> {new Date(q.updatedAt).toLocaleDateString('tr-TR')}</span>
                                         </div>
                                     </div>
                                 </div>

                                 <div className="flex items-center gap-4 self-end sm:self-auto">
                                     <div className="text-right">
                                         <span className="block text-[8px] text-slate-400 font-black uppercase tracking-widest">
                                             {language === 'TR' ? 'ÖNERİLEN TEKLİF' : 'PROPOSED PRICE'}
                                         </span>
                                         <span className="text-sm font-black text-slate-950 block mt-0.5">
                                             {q.proposedPrice ? `${q.proposedPrice.toLocaleString()} TRY` : (language === 'TR' ? 'Pazarlık Sürüyor' : 'Negotiations Active')}
                                         </span>
                                     </div>
                                     <span className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider ${getStatusStyle(q.status)}`}>
                                         {getStatusLabel(q.status)}
                                     </span>
                                     <span className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"><ArrowRight size={16} /></span>
                                 </div>
                             </div>
                         ))}
                     </div>
                )}

            </main>

            {}
            <footer className="py-6 border-t border-slate-200/60 bg-white text-center text-[10px] font-bold text-slate-400 tracking-wider">
                &copy; 2026 Root Web Core B2B Business-to-Business Furniture Marketplace. All rights reserved.
            </footer>

        </div>
    );
};

export default Quotes;
