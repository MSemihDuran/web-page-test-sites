import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, XCircle, Clock, Globe, LogOut, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const QuoteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { language, changeLanguage, t } = useLanguage();
    const { user, token } = useAuth();
    const { socket } = useSocket();
    const messagesEndRef = useRef(null);

    const [quote, setQuote] = useState(null);
    const [priceInput, setPriceInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');

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

    const fetchQuoteDetails = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/api/quotes/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setQuote(data);
                setMessages(data.messages || []);
                if (data.proposedPrice) {
                    setPriceInput(data.proposedPrice.toString());
                }
            } else {
                navigate('/quotes');
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (token && user) {
            fetchQuoteDetails();
        }
    }, [token, user, id]);

    useEffect(() => {
        if (socket) {
            socket.emit('join_quote', Number(id));

            const handleNewMessage = (msg) => {
                setMessages(prev => [...prev, msg]);
            };

            const handleQuoteUpdate = (updatedQuote) => {
                setQuote(prev => ({
                    ...prev,
                    status: updatedQuote.status,
                    proposedPrice: updatedQuote.proposedPrice,
                    lastProposerId: updatedQuote.lastProposerId,
                    trackingStage: updatedQuote.trackingStage
                }));
            };

            socket.on('new_message', handleNewMessage);
            socket.on('quote_update', handleQuoteUpdate);

            return () => {
                socket.off('new_message', handleNewMessage);
                socket.off('quote_update', handleQuoteUpdate);
            };
        }
    }, [socket, id]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendOffer = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/quotes/${id}/offer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ proposedPrice: Number(priceInput) })
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Teklif gönderilemedi.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateStatus = async (status) => {
        const actionText = status === 'APPROVED' 
            ? (language === 'TR' ? 'kabul etmek' : 'accept') 
            : (language === 'TR' ? 'reddetmek' : 'reject');
        const confirmMsg = language === 'TR' 
            ? `Bu fiyat teklifini ${actionText} istediğinize emin misiniz?` 
            : `Are you sure you want to ${actionText} this price proposal?`;
        if (!confirm(confirmMsg)) return;

        try {
            const res = await fetch(`${API_BASE}/api/quotes/${id}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'İşlem başarısız.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateTrackingStage = async (stage) => {
        try {
            const res = await fetch(`${API_BASE}/api/quotes/${id}/tracking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ trackingStage: stage })
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Takip durumu güncellenemedi.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        try {
            const res = await fetch(`${API_BASE}/api/quotes/${id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: messageInput })
            });
            if (res.ok) {
                setMessageInput('');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return 'border-amber-200 text-amber-700 bg-amber-50';
            case 'OFFERED': return 'border-indigo-200 text-indigo-700 bg-indigo-50';
            case 'APPROVED': return 'border-emerald-200 text-emerald-700 bg-emerald-50';
            case 'REJECTED': return 'border-red-200 text-red-700 bg-red-50';
            default: return 'border-slate-200 text-slate-700 bg-slate-50';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING': return 'Müşteri Talebi (Fiyat Bekleniyor)';
            case 'OFFERED': return 'Fiyat Teklifi İletildi';
            case 'APPROVED': return 'Teklif Onaylandı (Anlaşma Sağlandı)';
            case 'REJECTED': return 'Teklif Reddedildi';
            default: return status;
        }
    };

    if (!user || !quote) return null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">

            {}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 py-4 px-6 border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
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
                        <Link to="/catalog" className="text-slate-500 hover:text-indigo-600 transition-all">{t('catalog')}</Link>
                        <Link to="/quotes" className="text-slate-500 hover:text-indigo-600 transition-all">{t('my_quotes')}</Link>
                        <button 
                            onClick={() => { localStorage.setItem('apex_show_onboarding', 'true'); navigate('/catalog'); }}
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
                            onClick={() => { localStorage.clear(); navigate('/'); }}
                            className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                            title={language === 'TR' ? 'Çıkış Yap' : 'Log Out'}
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>
            </header>

            {}
            <main className="flex-grow max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

                <button onClick={() => navigate('/quotes')} className="text-xs text-indigo-600 hover:underline font-bold flex items-center gap-1.5 self-start">
                    <ArrowLeft size={14} /> {t('back_to_quotes')}
                </button>

                {/* Visual Production & Order Timeline */}
                {quote && quote.status === 'APPROVED' && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-black text-slate-900">
                                    {language === 'TR' ? 'Üretim ve Sevkiyat Takip Süreci' : 'Production & Logistics Tracking'}
                                </h3>
                                <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-1 tracking-wider">
                                    {language === 'TR' ? 'Sipariş Durumu Aşamaları' : 'Order Status Stages'}
                                </p>
                            </div>
                            {(user.role === 'SELLER' || user.role === 'SUPER_ADMIN') && (
                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 py-1 px-3 rounded-xl uppercase tracking-wider animate-pulse">
                                    {language === 'TR' ? 'Üretici Yetkisi: Durumu Güncelleyebilirsiniz' : 'Manufacturer Control: Click stages to update'}
                                </span>
                            )}
                        </div>

                        {/* Timeline Track */}
                        <div className="relative flex justify-between items-center w-full px-4 sm:px-10 mt-2">
                            {/* Connector line */}
                            <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0">
                                <div 
                                    className="h-full bg-indigo-600 transition-all duration-500" 
                                    style={{
                                        width: 
                                            quote.trackingStage === 'RECEIVED' ? '0%' :
                                            quote.trackingStage === 'PRODUCTION' ? '25%' :
                                            quote.trackingStage === 'QUALITY' ? '50%' :
                                            quote.trackingStage === 'SHIPPED' ? '75%' :
                                            '100%'
                                    }}
                                />
                            </div>

                            {/* Stages */}
                            {[
                                { stage: 'RECEIVED', labelTr: 'Sipariş Alındı', labelEn: 'Order Received' },
                                { stage: 'PRODUCTION', labelTr: 'Üretimde', labelEn: 'In Production' },
                                { stage: 'QUALITY', labelTr: 'Kalite Kontrol', labelEn: 'Quality Control' },
                                { stage: 'SHIPPED', labelTr: 'Kargoda', labelEn: 'Shipped' },
                                { stage: 'DELIVERED', labelTr: 'Teslim Edildi', labelEn: 'Delivered' }
                            ].map((item, idx) => {
                                const stageOrder = ['RECEIVED', 'PRODUCTION', 'QUALITY', 'SHIPPED', 'DELIVERED'];
                                const currentIndex = stageOrder.indexOf(quote.trackingStage || 'RECEIVED');
                                const isCompleted = idx < currentIndex;
                                const isActive = idx === currentIndex;
                                const isInteractive = user.role === 'SELLER' || user.role === 'SUPER_ADMIN';

                                return (
                                    <div 
                                        key={item.stage} 
                                        onClick={() => isInteractive && handleUpdateTrackingStage(item.stage)}
                                        className={`flex flex-col items-center gap-2.5 z-10 relative ${isInteractive ? 'cursor-pointer group' : ''}`}
                                    >
                                        <div 
                                            className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 border-2 ${
                                                isCompleted 
                                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                                                    : isActive 
                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110' 
                                                        : 'bg-white border-slate-300 text-slate-400 group-hover:border-slate-400'
                                            }`}
                                        >
                                            {isCompleted ? '✓' : idx + 1}
                                        </div>
                                        <span className={`text-[10px] font-black tracking-tight text-center ${
                                            isActive ? 'text-indigo-600' : isCompleted ? 'text-emerald-600 font-bold' : 'text-slate-400'
                                        }`}>
                                            {language === 'TR' ? item.labelTr : item.labelEn}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {}
                    <div className="lg:col-span-5 flex flex-col gap-6">

                        {}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-4">
                            <div className="h-44 rounded-2xl overflow-hidden relative bg-slate-100">
                                <img src={quote.product?.imageUrl} className="w-full h-full object-cover" />
                                <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-xl bg-white/90 text-indigo-600 text-[10px] font-black uppercase tracking-wider border border-slate-100 shadow-sm">
                                    {quote.product?.category}
                                </span>
                            </div>

                            <div>
                                <h2 className="text-xl font-black text-slate-900 leading-tight">{quote.product?.title}</h2>
                                <p className="text-slate-400 text-[10px] font-extrabold mt-1.5 uppercase tracking-wider">
                                    {user.role === 'SELLER' 
                                        ? `${language === 'TR' ? 'Alıcı Firma:' : 'Buyer Company:'} ${quote.buyer?.companyName}` 
                                        : `${language === 'TR' ? 'Üretici Firma:' : 'Manufacturer Company:'} ${quote.seller?.companyName}`}
                                </p>
                            </div>

                            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                {quote.product?.description}
                            </p>

                            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                <div>{t('detail_dimensions')}: <span className="text-slate-950 font-bold block mt-0.5">{quote.product?.dimensions || 'N/A'}</span></div>
                                <div>{language === 'TR' ? 'Renk:' : 'Color:'} <span className="text-slate-950 font-bold block mt-0.5">{quote.product?.color || 'N/A'}</span></div>
                            </div>
                        </div>

                        {}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                {language === 'TR' ? 'Alıcı Sipariş Detayları & Talebi' : 'Buyer Order Details & Notes'}
                            </h3>
                            <p className="text-xs text-slate-700 bg-slate-50 border border-slate-100 p-4 rounded-xl leading-relaxed font-semibold">
                                {quote.notes || (language === 'TR' ? 'Detay veya not eklenmemiş.' : 'No notes provided.')}
                            </p>
                        </div>

                        {}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('qdetail_sidebar_status')}</span>
                                <span className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider ${getStatusStyle(quote.status)}`}>
                                    {getStatusLabel(quote.status)}
                                </span>
                            </div>

                            <div className="flex flex-col border-t border-slate-100 pt-4 gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                        {language === 'TR' ? 'Birim Fiyat Teklifi' : 'Unit Price Proposal'}
                                    </span>
                                    <span className="text-xl font-black text-amber-600">
                                        {quote.proposedPrice ? formatPrice(quote.proposedPrice, quote.currency) : (language === 'TR' ? 'Pazarlık Sürüyor' : 'Bargaining Active')}
                                    </span>
                                </div>
                                {quote.proposedPrice && (
                                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-1.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                                        <div className="flex justify-between text-slate-800">
                                            <span>{language === 'TR' ? 'Adet Miktarı:' : 'Quantity:'}</span>
                                            <span className="text-slate-900">{quote.quantity}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-800">
                                            <span>{language === 'TR' ? 'KDV Oranı:' : 'VAT Rate:'}</span>
                                            <span className="text-slate-900">%{quote.vatRate}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-slate-200/60 pt-1 text-slate-800">
                                            <span>{language === 'TR' ? 'Ara Toplam (KDV Hariç):' : 'Subtotal (Excl. VAT):'}</span>
                                            <span className="text-slate-900">{formatPrice(quote.proposedPrice * quote.quantity, quote.currency)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-800">
                                            <span>{language === 'TR' ? `KDV (%${quote.vatRate}):` : `VAT (%${quote.vatRate}):`}</span>
                                            <span className="text-slate-900">{formatPrice((quote.proposedPrice * quote.quantity) * (quote.vatRate / 100), quote.currency)}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-indigo-100 pt-1 text-xs font-black text-indigo-600">
                                            <span>{language === 'TR' ? 'Genel Toplam (KDV Dahil):' : 'Total (Incl. VAT):'}</span>
                                            <span>{formatPrice((quote.proposedPrice * quote.quantity) * (1 + quote.vatRate / 100), quote.currency)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {(quote.status === 'PENDING' || quote.status === 'OFFERED') && (
                                <form onSubmit={handleSendOffer} className="border-t border-slate-100 pt-4 space-y-3">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                        {language === 'TR' ? `Birim Fiyat Öner (${quote.currency})` : `Propose Unit Price (${quote.currency})`}
                                    </label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="number"
                                            value={priceInput}
                                            onChange={e => setPriceInput(e.target.value)}
                                            required
                                            placeholder={language === 'TR' ? 'Fiyat teklifi girin (Örn: 24500)' : 'Enter price proposal (e.g. 24500)'}
                                            className="flex-grow py-2.5 px-3 rounded-xl premium-input text-xs font-semibold"
                                        />
                                        <button 
                                            type="submit"
                                            className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-600/10 transition-all cursor-pointer active:scale-98"
                                        >
                                            {language === 'TR' ? 'Fiyat Öner' : 'Propose Price'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {quote.status === 'OFFERED' && quote.lastProposerId && quote.lastProposerId !== user.id && (
                                <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => handleUpdateStatus('APPROVED')}
                                        className="py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                                    >
                                        <CheckCircle size={15} /> {language === 'TR' ? 'Kabul Et' : 'Accept'}
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateStatus('REJECTED')}
                                        className="py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-600/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                                    >
                                        <XCircle size={15} /> {language === 'TR' ? 'Reddet' : 'Reject'}
                                    </button>
                                </div>
                            )}

                            {}
                            {quote.status === 'APPROVED' && (
                                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold text-center">
                                    {language === 'TR' ? '🎉 Teklif onaylandı, anlaşma sağlandı! Sipariş üretime aktarıldı.' : '🎉 Quote approved, deal struck! Order moved to production.'}
                                </div>
                            )}

                            {quote.status === 'REJECTED' && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-bold text-center">
                                    {language === 'TR' ? '❌ Bu fiyat teklif talebi reddedildi.' : '❌ This price quote request has been rejected.'}
                                </div>
                            )}
                        </div>

                    </div>

                    {}
                    <div className="lg:col-span-7 bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 min-h-[550px] flex flex-col justify-between">

                        {}
                        <div className="bg-slate-50 border-b border-slate-200/80 p-4 flex justify-between items-center select-none">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></div>
                                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                                    {language === 'TR' ? 'Toptan Pazarlık Canlı Sohbet' : 'Wholesale Bargaining Live Chat'}
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Real-time WebSocket</span>
                        </div>

                        {}
                        <div className="flex-grow p-6 overflow-y-auto space-y-4 max-h-[450px]">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col justify-center items-center text-center text-slate-400 text-xs font-semibold px-8 leading-relaxed">
                                    {language === 'TR' 
                                        ? '💬 Müzakereyi başlatmak için mesaj yazın. Nakliye süresi, ödeme vadeleri veya mobilya adet detaylarını buradan doğrudan üreticiyle görüşebilirsiniz.'
                                        : '💬 Type a message to start negotiation. Discuss shipping times, payment terms, or custom quantities directly with the manufacturer here.'}
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isMe = msg.senderId === user.id;
                                    return (
                                        <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase mb-0.5 tracking-wider">
                                                {isMe ? (language === 'TR' ? 'Siz' : 'You') : msg.sender?.name} ({msg.sender?.role === 'SELLER' ? t('seller') : t('buyer')})
                                            </span>
                                            <div className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
                                                isMe 
                                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/40'
                                            }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {}
                        <form onSubmit={handleSendMessage} className="border-t border-slate-200/80 p-4 flex gap-2 bg-slate-50/50">
                            <input 
                                type="text"
                                value={messageInput}
                                onChange={e => setMessageInput(e.target.value)}
                                placeholder={language === 'TR' ? 'Mesajınızı veya pazarlık detaylarını yazın...' : 'Type your message or bargaining details...'}
                                className="flex-grow py-3 px-4 rounded-xl premium-input text-xs font-semibold"
                                disabled={quote.status === 'APPROVED' || quote.status === 'REJECTED'}
                            />
                            <button 
                                type="submit"
                                className="px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-600/10 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                                disabled={quote.status === 'APPROVED' || quote.status === 'REJECTED'}
                            >
                                <Send size={15} />
                            </button>
                        </form>

                    </div>

                </div>

            </main>

            {}
            <footer className="py-6 border-t border-slate-200/60 bg-white text-center text-[10px] font-bold text-slate-400 tracking-wider">
                &copy; 2026 Root Web Core B2B Business-to-Business Furniture Marketplace. All rights reserved.
            </footer>

        </div>
    );
};

export default QuoteDetail;
