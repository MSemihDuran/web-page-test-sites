import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, Clock, LogOut, Globe, HelpCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Header from '../components/Header';

const Quotes = () => {
    const navigate = useNavigate();
    const { language, changeLanguage, t } = useLanguage();
    const { user, token } = useAuth();
    const { socket } = useSocket();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5005'
        : 'https://rootwebcore-backend.onrender.com';

    const getCurrencySymbol = (currency) => {
        switch (currency) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'TRY':
            default: return '₺';
        }
    };

    const formatPrice = (amount, currency) => {
        if (amount === undefined || amount === null) return '';
        return `${amount.toLocaleString('tr-TR')} ${getCurrencySymbol(currency)}`;
    };

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
        }
    }, [token, user]);

    useEffect(() => {
        if (socket) {
            const handleNotification = () => {
                fetchQuotes();
            };
            socket.on('quote_notification', handleNotification);
            return () => {
                socket.off('quote_notification', handleNotification);
            };
        }
    }, [socket]);

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

            <Header activePage="my_quotes" />

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
                                             {q.proposedPrice ? formatPrice(q.proposedPrice, q.currency) : (language === 'TR' ? 'Pazarlık Sürüyor' : 'Negotiations Active')}
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
