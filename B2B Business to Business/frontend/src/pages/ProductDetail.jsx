import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Tag, Eye, Layers, Globe, LogOut, HelpCircle, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useBasket } from '../context/BasketContext';
import Header from '../components/Header';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { language, changeLanguage, t } = useLanguage();
    const { user, token } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedColor, setSelectedColor] = useState('');
    const [activeImage, setActiveImage] = useState('');
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [quoteNotes, setQuoteNotes] = useState('');
    const [quoteQuantity, setQuoteQuantity] = useState(1);
    const [quoteCurrency, setQuoteCurrency] = useState('TRY');
    const [quoteVatRate, setQuoteVatRate] = useState(20.0);

    const { addToBasket: globalAddToBasket } = useBasket();

    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5005'
        : 'https://rootwebcore-backend.onrender.com';

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
                    navigate('/catalog');
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

    const addToBasket = () => {
        globalAddToBasket(product, 1, selectedColor);
        alert(language === 'TR' ? 'Ürün teklif sepetinize eklendi!' : 'Product added to RFQ basket!');
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
                    notes: quoteNotes,
                    quantity: Number(quoteQuantity),
                    color: selectedColor,
                    currency: quoteCurrency,
                    vatRate: Number(quoteVatRate)
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
            <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
                <Header activePage="" />
                <main className="flex-grow max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
                    <div className="h-4 skeleton rounded-lg w-28"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
                        <div className="lg:col-span-7 flex flex-col gap-4">
                            <div className="w-full aspect-[4/3] rounded-2xl skeleton"></div>
                            <div className="flex gap-3">
                                <div className="w-20 h-16 rounded-xl skeleton"></div>
                                <div className="w-20 h-16 rounded-xl skeleton"></div>
                                <div className="w-20 h-16 rounded-xl skeleton"></div>
                            </div>
                        </div>
                        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                            <div className="space-y-5">
                                <div className="h-6 skeleton rounded-full w-24"></div>
                                <div className="space-y-2">
                                    <div className="h-8 skeleton rounded-lg w-3/4"></div>
                                    <div className="h-3 skeleton rounded-lg w-1/2"></div>
                                </div>
                                <div className="space-y-2 pt-4">
                                    <div className="h-3 skeleton rounded-lg w-full"></div>
                                    <div className="h-3 skeleton rounded-lg w-full"></div>
                                    <div className="h-3 skeleton rounded-lg w-4/5"></div>
                                </div>
                                <div className="h-12 skeleton rounded-xl w-full mt-4"></div>
                            </div>
                            <div className="h-14 skeleton rounded-xl w-full"></div>
                        </div>
                    </div>
                </main>
                <footer className="py-6 border-t border-slate-200/60 bg-white text-center text-[10px] font-bold text-slate-400">
                    &copy; 2026 Root Web Core B2B Business-to-Business Furniture Marketplace. All rights reserved.
                </footer>
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

            <Header activePage="" />


            {}
            <main className="flex-grow max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

                <button onClick={() => navigate('/catalog')} className="text-xs text-indigo-600 hover:underline font-bold flex items-center gap-1.5 self-start">
                    <ArrowLeft size={14} /> {t('back_to_catalog')}
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">

                    {}
                    <div className="lg:col-span-7 flex flex-col gap-4">

                        <div 
                            onClick={() => setIsLightboxOpen(true)}
                            className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative cursor-zoom-in group"
                        >
                            <img 
                                src={activeImage.startsWith('/') ? `${API_BASE}${activeImage}` : activeImage} 
                                alt={product.title} 
                                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-101"
                            />
                            <span className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider">
                                {selectedColor} {language === 'TR' ? 'Galeri Görseli (Yakınlaştır)' : 'Gallery Image (Zoom)'}
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
                                <div className="flex gap-4">
                                    <button 
                                        onClick={addToBasket}
                                        className="flex-1 py-4 rounded-xl border-2 border-indigo-600 hover:bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 bg-white"
                                    >
                                        <ShoppingCart size={16} /> {language === 'TR' ? 'Sepete Ekle' : 'Add to Basket'}
                                    </button>
                                    <button 
                                        onClick={() => setIsQuoteModalOpen(true)}
                                        className="flex-1 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                                    >
                                        <MessageSquare size={16} /> {t('detail_btn_request_quote')}
                                    </button>
                                </div>
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
                                <label className="block text-slate-500 font-bold">{language === 'TR' ? 'Talep Edilen Adet' : 'Requested Quantity'}</label>
                                <input 
                                    type="number"
                                    required
                                    min={1}
                                    value={quoteQuantity}
                                    onChange={e => setQuoteQuantity(Number(e.target.value))}
                                    className="w-full py-3 px-4 rounded-xl premium-input font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-slate-500 font-bold">{language === 'TR' ? 'Para Birimi' : 'Currency'}</label>
                                    <select
                                        value={quoteCurrency}
                                        onChange={e => setQuoteCurrency(e.target.value)}
                                        className="w-full py-3 px-4 rounded-xl bg-slate-50 border border-slate-200 font-bold cursor-pointer text-slate-800"
                                    >
                                        <option value="TRY">TRY (₺)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-slate-500 font-bold">{language === 'TR' ? 'KDV Oranı' : 'VAT Rate'}</label>
                                    <select
                                        value={quoteVatRate}
                                        onChange={e => setQuoteVatRate(Number(e.target.value))}
                                        className="w-full py-3 px-4 rounded-xl bg-slate-50 border border-slate-200 font-bold cursor-pointer text-slate-800"
                                    >
                                        <option value={0}>%0 KDV</option>
                                        <option value={10}>%10 KDV</option>
                                        <option value={20}>%20 KDV</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-slate-500 font-bold">{t('detail_modal_notes_label')}</label>
                                <textarea 
                                    required
                                    rows="3"
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

            {isLightboxOpen && (
                <div 
                    onClick={() => setIsLightboxOpen(false)}
                    className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col justify-center items-center p-4 cursor-zoom-out select-none animate-[fadeIn_0.2s_ease-out]"
                >
                    <div className="absolute top-6 right-6 flex items-center gap-3">
                        <span className="text-white text-xs font-black bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                            {selectedColor}
                        </span>
                        <button 
                            onClick={() => setIsLightboxOpen(false)}
                            className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl transition-all border border-white/15 cursor-pointer font-black text-xs"
                        >
                            {language === 'TR' ? 'Kapat X' : 'Close X'}
                        </button>
                    </div>
                    
                    <div className="max-w-4xl w-full max-h-[80vh] flex items-center justify-center p-2" onClick={e => e.stopPropagation()}>
                        <img 
                            src={activeImage.startsWith('/') ? `${API_BASE}${activeImage}` : activeImage} 
                            alt="" 
                            className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/5 animate-[scaleIn_0.25s_cubic-bezier(0.16,1,0.3,1)] select-none"
                        />
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}} />

        </div>
    );
};

export default ProductDetail;
