import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Globe, HelpCircle, LogOut, ShoppingCart, Menu, X, Trash } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useBasket } from '../context/BasketContext';

const Header = ({ activePage = '' }) => {
    const navigate = useNavigate();
    const { language, changeLanguage, t } = useLanguage();
    const { user, token, logout } = useAuth();
    const { 
        basketItems, 
        isBasketOpen, 
        setIsBasketOpen, 
        basketNotes, 
        setBasketNotes, 
        basketCurrency, 
        setBasketCurrency, 
        basketVatRate, 
        setBasketVatRate, 
        updateBasketQuantity, 
        updateBasketColor, 
        removeFromBasket, 
        clearBasket 
    } = useBasket();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5005'
        : 'https://rootwebcore-backend.onrender.com';

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    const handleStartTour = () => {
        localStorage.setItem('apex_show_onboarding', 'true');
        setIsMobileMenuOpen(false);
        if (window.location.pathname === '/catalog') {
            window.location.reload();
        } else {
            navigate('/catalog');
        }
    };

    const handleBatchQuoteSubmit = async (e) => {
        e.preventDefault();
        if (basketItems.length === 0) return;

        const payload = {
            items: basketItems.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                color: item.color
            })),
            notes: basketNotes,
            currency: basketCurrency,
            vatRate: Number(basketVatRate)
        };

        try {
            const res = await fetch(`${API_BASE}/api/quotes/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert(language === 'TR' ? 'Toplu teklif talepleriniz üreticilere iletildi!' : 'Batch quote requests submitted to manufacturers!');
                clearBasket();
                setIsBasketOpen(false);
                setIsMobileMenuOpen(false);
                navigate('/quotes');
            } else {
                const data = await res.json();
                alert(data.error || 'Teklif talepleri gönderilemedi.');
            }
        } catch (err) {
            console.error(err);
            alert('Sunucu hatası.');
        }
    };

    const getCurrencySymbol = (curr) => {
        switch (curr) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'TRY':
            default: return '₺';
        }
    };

    return (
        <>
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 py-4 px-6 border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20">
                            A
                        </div>
                        <div>
                            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900">APEX B2B</h1>
                            <span className="text-[9px] uppercase font-black tracking-widest text-indigo-600 block">FURNITURE MARKET</span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-5 text-xs font-bold">
                        <button 
                            type="button"
                            onClick={() => changeLanguage(language === 'TR' ? 'EN' : 'TR')}
                            className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-pointer text-slate-500 font-black mr-1"
                        >
                            <Globe size={13} /> {language}
                        </button>
                        
                        {token && user ? (
                            <>
                                <Link 
                                    to="/catalog" 
                                    className={`transition-all ${activePage === 'catalog' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-0.5' : 'text-slate-500 hover:text-indigo-600'}`}
                                >
                                    {t('catalog')}
                                </Link>
                                <Link 
                                    to="/quotes" 
                                    className={`transition-all ${activePage === 'quotes' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-0.5' : 'text-slate-500 hover:text-indigo-600'}`}
                                >
                                    {t('my_quotes')}
                                </Link>
                                
                                {user.role === 'BUYER' && (
                                    <button
                                        onClick={() => setIsBasketOpen(true)}
                                        className="relative flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-all cursor-pointer font-bold border-none bg-none outline-none"
                                    >
                                        <ShoppingCart size={13} />
                                        <span>{language === 'TR' ? 'Sepetim' : 'Basket'}</span>
                                        {basketItems.length > 0 && (
                                            <span className="bg-indigo-600 text-white text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center animate-pulse ml-0.5">
                                                {basketItems.length}
                                            </span>
                                        )}
                                    </button>
                                )}

                                <button 
                                    onClick={handleStartTour}
                                    className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all cursor-pointer"
                                    title={language === 'TR' ? 'Rehberi Başlat' : 'Start Guide'}
                                >
                                    <HelpCircle size={15} />
                                </button>
                                
                                <span className="text-slate-300">|</span>
                                
                                <Link to="/settings" className="flex items-center gap-3 hover:text-indigo-600 transition-colors cursor-pointer" title={t('settings')}>
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl.startsWith('/') ? `${API_BASE}${user.avatarUrl}` : user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-extrabold text-xs border border-indigo-200">
                                            {user.name?.charAt(0).toUpperCase()}
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
                                    onClick={handleLogout}
                                    className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                                    title={language === 'TR' ? 'Çıkış Yap' : 'Log Out'}
                                >
                                    <LogOut size={15} />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer">{t('home_btn_login')}</Link>
                                <button 
                                    onClick={() => navigate('/register')}
                                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                                >
                                    {language === 'TR' ? 'Hemen Başlayın' : 'Get Started'}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Hamburger Menu Button */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile Slide-down Navigation Panel */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden mt-4 pt-4 border-t border-slate-200 flex flex-col gap-4 text-xs font-bold text-slate-700 animate-[slideDown_0.2s_ease-out]">
                        <button 
                            type="button"
                            onClick={() => changeLanguage(language === 'TR' ? 'EN' : 'TR')}
                            className="flex items-center gap-1.5 hover:text-indigo-600 py-2 border-b border-slate-100 text-left font-black"
                        >
                            <Globe size={14} /> {language === 'TR' ? 'Dil Seçimi: ' : 'Language: '} {language}
                        </button>

                        {token && user ? (
                            <>
                                <Link 
                                    to="/catalog" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`py-2 border-b border-slate-100 ${activePage === 'catalog' ? 'text-indigo-600 font-black' : ''}`}
                                >
                                    {t('catalog')}
                                </Link>
                                <Link 
                                    to="/quotes" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`py-2 border-b border-slate-100 ${activePage === 'quotes' ? 'text-indigo-600 font-black' : ''}`}
                                >
                                    {t('my_quotes')}
                                </Link>
                                
                                {user.role === 'BUYER' && (
                                    <button
                                        onClick={() => { setIsMobileMenuOpen(false); setIsBasketOpen(true); }}
                                        className="flex items-center gap-2 py-2 border-b border-slate-100 text-left font-bold text-slate-700 hover:text-indigo-600"
                                    >
                                        <ShoppingCart size={14} />
                                        <span>{language === 'TR' ? 'Sepetim' : 'Basket'}</span>
                                        {basketItems.length > 0 && (
                                            <span className="bg-indigo-600 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 ml-1 animate-pulse">
                                                {basketItems.length}
                                            </span>
                                        )}
                                    </button>
                                )}

                                <button 
                                    onClick={handleStartTour}
                                    className="flex items-center gap-2 py-2 border-b border-slate-100 text-left text-slate-700 hover:text-indigo-600"
                                >
                                    <HelpCircle size={14} />
                                    <span>{language === 'TR' ? 'Tur Rehberi' : 'Tour Guide'}</span>
                                </button>

                                <Link 
                                    to="/settings" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-2 py-2 border-b border-slate-100 text-slate-700 hover:text-indigo-600"
                                >
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl.startsWith('/') ? `${API_BASE}${user.avatarUrl}` : user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover border" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span>{user.name} ({user.companyName})</span>
                                </Link>

                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 py-2 text-red-600 text-left"
                                >
                                    <LogOut size={14} />
                                    <span>{language === 'TR' ? 'Çıkış Yap' : 'Log Out'}</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-slate-100">{t('home_btn_login')}</Link>
                                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="py-2 bg-indigo-600 text-white rounded-xl text-center">{language === 'TR' ? 'Hemen Kaydol' : 'Register Now'}</Link>
                            </>
                        )}
                    </div>
                )}
            </header>

            {/* Global RFQ Basket Modal (for Buyer) */}
            {isBasketOpen && user && user.role === 'BUYER' && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                        <ShoppingCart size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900">
                                            {language === 'TR' ? 'Toplu Fiyat Teklif Sepetim' : 'My RFQ Basket'}
                                        </h2>
                                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                                            {language === 'TR' ? 'Üreticilere Toplu Teklif Gönderme Paneli' : 'Submit multiple requests at once'}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsBasketOpen(false)} 
                                    className="text-slate-400 hover:text-slate-950 font-black text-xs cursor-pointer bg-slate-50 py-1 px-3 rounded-lg border border-slate-100"
                                >
                                    {t('close')}
                                </button>
                            </div>

                            {basketItems.length === 0 ? (
                                <div className="py-16 text-center text-slate-400 text-xs font-semibold flex flex-col items-center">
                                    <ShoppingCart size={40} className="text-slate-200 mb-2" />
                                    <span>{language === 'TR' ? 'Sepetiniz henüz boş. Kataloğu gezerek ürün ekleyebilirsiniz.' : 'Your basket is empty. Browse catalog to add items.'}</span>
                                </div>
                            ) : (
                                <form onSubmit={handleBatchQuoteSubmit} className="space-y-6 text-xs font-semibold">
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                        {basketItems.map(item => {
                                            const uniqueColors = item.product.colorImages && item.product.colorImages.length > 0
                                                ? [...new Set(item.product.colorImages.map(img => img.color))]
                                                : [item.product.color || 'Varsayılan'];

                                            return (
                                                <div key={item.product.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-150 gap-4">
                                                    <div className="flex gap-3 items-center">
                                                        <img src={item.product.imageUrl.startsWith('/') ? `${API_BASE}${item.product.imageUrl}` : item.product.imageUrl} className="w-12 h-12 rounded-xl object-cover" />
                                                        <div>
                                                            <h4 className="text-slate-900 font-extrabold">{item.product.title}</h4>
                                                            <p className="text-[9px] text-slate-400 font-bold uppercase">{item.product.seller?.companyName}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                                        {/* Color Select */}
                                                        <select
                                                            value={item.color}
                                                            onChange={e => updateBasketColor(item.product.id, e.target.value)}
                                                            className="py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black cursor-pointer text-slate-800"
                                                        >
                                                            {uniqueColors.map((col, i) => (
                                                                <option key={i} value={col}>{col}</option>
                                                            ))}
                                                        </select>

                                                        {/* Quantity Input */}
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-slate-400 text-[10px] uppercase font-bold mr-1">{language === 'TR' ? 'Adet:' : 'Qty:'}</span>
                                                            <input 
                                                                type="number"
                                                                required
                                                                min={1}
                                                                value={item.quantity}
                                                                onChange={e => updateBasketQuantity(item.product.id, Number(e.target.value))}
                                                                className="w-12 text-center py-1 bg-white border border-slate-200 rounded-lg font-bold"
                                                            />
                                                        </div>

                                                        {/* Remove Button */}
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => removeFromBasket(item.product.id, e)}
                                                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 hover:border-red-100 cursor-pointer transition-all"
                                                        >
                                                            <Trash size={13} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* RFQ Parameters */}
                                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-slate-500 font-bold">{language === 'TR' ? 'Tercih Edilen Para Birimi' : 'Preferred Currency'}</label>
                                            <select
                                                value={basketCurrency}
                                                onChange={e => setBasketCurrency(e.target.value)}
                                                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold cursor-pointer text-slate-800"
                                            >
                                                <option value="TRY">TRY (₺)</option>
                                                <option value="USD">USD ($)</option>
                                                <option value="EUR">EUR (€)</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block text-slate-500 font-bold">{language === 'TR' ? 'Varsayılan KDV Oranı' : 'Default VAT Rate'}</label>
                                            <select
                                                value={basketVatRate}
                                                onChange={e => setBasketVatRate(Number(e.target.value))}
                                                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold cursor-pointer text-slate-800"
                                            >
                                                <option value={0}>%0 KDV</option>
                                                <option value={10}>%10 KDV</option>
                                                <option value={20}>%20 KDV</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-slate-500 font-bold">
                                            {language === 'TR' ? 'Toplu Talep Notu / Açıklama' : 'Bulk RFQ Notes / Instructions'}
                                        </label>
                                        <textarea
                                            required
                                            rows="3"
                                            value={basketNotes}
                                            onChange={e => setBasketNotes(e.target.value)}
                                            className="w-full py-2.5 px-3 rounded-xl premium-input leading-relaxed"
                                            placeholder={language === 'TR' 
                                                ? 'Örn: Seçtiğimiz renk ve adetlerde İstanbul teslimatlı üretim fiyat tekliflerinizi bekliyoruz.' 
                                                : 'e.g. Please provide production pricing for our selected colors & quantities.'}
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                                    >
                                        {language === 'TR' ? 'Toplu Teklif Taleplerini Gönder ➔' : 'Submit Batch RFQ ➔'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Animation support style */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </>
    );
};

export default Header;
