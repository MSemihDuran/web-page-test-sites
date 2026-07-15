import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Tag, Eye, Layers, Globe, LogOut, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { language, changeLanguage, t } = useLanguage();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState('');
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedColor, setSelectedColor] = useState('');

    const [activeImage, setActiveImage] = useState('');

    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [quoteNotes, setQuoteNotes] = useState('');

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

        setUser(JSON.parse(storedUser));
        setToken(storedToken);
    }, [navigate]);

    useEffect(() => {
        const fetchProductDetail = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${API_BASE}/api/products/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);

                    if (data.colorImages && data.colorImages.length > 0) {
                        const firstColor = data.colorImages[0].color;
                        setSelectedColor(firstColor);
                        setActiveImage(data.colorImages[0].imageUrl);
                    } else {
                        setSelectedColor(data.color || 'Varsayılan');
                        setActiveImage(data.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800');
                    }
                } else {
                    navigate('/');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchProductDetail();
        }
    }, [token, id]);

    const handleColorChange = (colorName) => {
        setSelectedColor(colorName);
        const imagesForColor = product.colorImages.filter(img => img.color === colorName);
        if (imagesForColor.length > 0) {
            setActiveImage(imagesForColor[0].imageUrl);
        } else {
            setActiveImage(product.imageUrl);
        }
    };

    const handleRequestQuoteSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/quotes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: product.id,
                    notes: `Seçilen Renk: ${selectedColor}\n\n${quoteNotes}`
                })
            });
            if (res.ok) {
                alert('Tebrikler! Fiyat teklif talebiniz başarıyla oluşturuldu ve satıcı firmaya iletildi.');
                setIsQuoteModalOpen(false);
                setQuoteNotes('');
                navigate('/quotes');
            } else {
                const errorData = await res.json();
                alert(errorData.error || 'Talep iletilemedi.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading || !product) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('loading')}</span>
            </div>
        );
    }

    const uniqueColors = product.colorImages && product.colorImages.length > 0
        ? [...new Set(product.colorImages.map(img => img.color))]
        : [product.color || 'Varsayılan'];

    const currentGalleryImages = product.colorImages && product.colorImages.length > 0
        ? product.colorImages.filter(img => img.color === selectedColor)
        : [{ id: 'default', color: selectedColor, imageUrl: product.imageUrl }];

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
                        <button onClick={() => navigate('/')} className="text-slate-500 hover:text-indigo-600 transition-all cursor-pointer">{t('catalog')}</button>
                        <button onClick={() => navigate('/quotes')} className="text-slate-500 hover:text-indigo-600 transition-all cursor-pointer">{t('my_quotes')}</button>
                        <button 
                            onClick={() => { navigate('/'); setTimeout(() => window.dispatchEvent(new Event('start_tour')), 300); }}
                            className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all cursor-pointer"
                            title={language === 'TR' ? 'Rehberi Başlat' : 'Start Guide'}
                        >
                            <HelpCircle size={15} />
                        </button>
                        <span className="text-slate-300">|</span>
                        <Link to="/settings" className="flex items-center gap-3 hover:text-indigo-600 transition-colors cursor-pointer" title={t('settings')}>
                            {user?.avatarUrl ? (
                                <img src={`${API_BASE}${user.avatarUrl}`} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-extrabold text-xs border border-indigo-200">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex flex-col items-end text-right">
                                <span className="text-slate-800 font-extrabold leading-none block mb-0.5">{user?.name}</span>
                                <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider leading-none">
                                    {user?.companyName} ({user?.role === 'SELLER' ? t('seller') : t('buyer')})
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
            <main className="flex-grow max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

                <button onClick={() => navigate('/')} className="text-xs text-indigo-600 hover:underline font-bold flex items-center gap-1.5 self-start">
                    <ArrowLeft size={14} /> {t('back_to_catalog')}
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">

                    {}
                    <div className="lg:col-span-7 flex flex-col gap-4">

                        {}
                        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative">
                            <img 
                                src={activeImage.startsWith('/') ? `${API_BASE}${activeImage}` : activeImage} 
                                alt={product.title} 
                                className="w-full h-full object-cover transition-all duration-300"
                            />
                            <span className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider">
                                {selectedColor} Galeri Görseli
                            </span>
                        </div>

                        {}
                        {currentGalleryImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-1">
                                {currentGalleryImages.map((img, idx) => (
                                    <div 
                                        key={img.id || idx}
                                        onClick={() => setActiveImage(img.imageUrl)}
                                        className={`w-20 h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all flex-shrink-0 ${
                                            activeImage === img.imageUrl 
                                                ? 'border-indigo-600 ring-2 ring-indigo-600/20' 
                                                : 'border-slate-100 hover:border-slate-300'
                                        }`}
                                    >
                                        <img src={img.imageUrl.startsWith('/') ? `${API_BASE}${img.imageUrl}` : img.imageUrl} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                    {}
                    <div className="lg:col-span-5 flex flex-col justify-between gap-6">

                        <div className="space-y-5">
                            <div className="flex justify-between items-start gap-4">
                                <span className="px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                                    {product.category}
                                </span>
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-slate-950 leading-tight">{product.title}</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {t('detail_manufacturer')}: <span className="text-indigo-600">{product.seller?.companyName}</span>
                                </p>
                            </div>

                            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                {product.description}
                            </p>

                            <div className="border-t border-b border-slate-100 py-4 grid grid-cols-2 gap-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                <div>{t('detail_dimensions')}: <span className="text-slate-900 block mt-0.5">{product.dimensions || 'N/A'}</span></div>
                                <div>{t('detail_collection')}: <span className="text-indigo-600 block mt-0.5">{product.category} B2B</span></div>
                            </div>

                            {}
                            <div className="space-y-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                    {t('detail_variants_title')}
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueColors.map((colorName, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleColorChange(colorName)}
                                            className={`px-4 py-2 rounded-xl border text-xs font-black uppercase transition-all cursor-pointer ${
                                                selectedColor === colorName
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            {colorName}
                                        </button>
                                    ))}
                                </div>
                                <span className="text-[9px] text-slate-400 block font-semibold leading-relaxed">
                                    {t('detail_variants_note')}
                                </span>
                            </div>

                        </div>

                        {}
                        <div className="pt-4 border-t border-slate-100">
                            {user?.role === 'BUYER' ? (
                                <button 
                                    onClick={() => setIsQuoteModalOpen(true)}
                                    className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                                >
                                    <MessageSquare size={16} /> {t('detail_btn_request_quote')}
                                </button>
                            ) : (
                                <div className="w-full py-3 px-4 rounded-xl bg-slate-50 border border-slate-200/60 text-[10px] font-black text-indigo-600 text-center uppercase tracking-wider">
                                    {t('detail_negotiation_info')}
                                </div>
                            )}
                        </div>

                    </div>

                </div>

            </main>

            {}
            <footer className="py-6 border-t border-slate-200/60 bg-white text-center text-[10px] font-bold text-slate-400 tracking-wider">
                &copy; 2026 Root Web Core B2B Business-to-Business Furniture Marketplace. All rights reserved.
            </footer>

            {}
            {isQuoteModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-100">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">{t('detail_modal_title')}</h2>
                                <span className="text-[10px] uppercase font-black text-indigo-600 tracking-wider">
                                    {language === 'TR' ? 'Seçilen Renk:' : 'Selected Color:'} {selectedColor}
                                </span>
                            </div>
                            <button onClick={() => setIsQuoteModalOpen(false)} className="text-slate-400 hover:text-slate-950 font-black text-xs cursor-pointer bg-slate-50 py-1 px-3 rounded-lg border border-slate-100">
                                {t('close')}
                            </button>
                        </div>

                        <form onSubmit={handleRequestQuoteSubmit} className="space-y-4 text-xs font-semibold">
                            <div className="space-y-1.5">
                                <label className="block text-slate-500 font-bold">{t('detail_modal_notes_label')}</label>
                                <textarea 
                                    required
                                    rows="4"
                                    value={quoteNotes}
                                    onChange={e => setQuoteNotes(e.target.value)}
                                    className="w-full py-3 px-4 rounded-xl premium-input leading-relaxed"
                                    placeholder={t('detail_modal_notes_placeholder')}
                                />
                            </div>

                            <button 
                                type="submit"
                                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                            >
                                {t('detail_modal_btn_send')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProductDetail;
