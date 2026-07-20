import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, MessageSquare, ListCollapse, Plus, Search, Tag, ExternalLink, Shield, Trash2, LogOut, ChevronRight, HelpCircle, Sparkles, Globe, ShoppingCart, Trash } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useBasket } from '../context/BasketContext';
import Header from '../components/Header';

const Dashboard = () => {
    const navigate = useNavigate();
    const { language, changeLanguage, t } = useLanguage();
    const { user, token, logout } = useAuth();
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [sortBy, setSortBy] = useState('newest');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        title: '',
        description: '',
        category: 'Living Room',
        dimensions: ''
    });

    const [colorInputName, setColorInputName] = useState('');
    const [activeFormColor, setActiveFormColor] = useState('');
    const [formColorVariants, setFormColorVariants] = useState({}); 

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quoteNotes, setQuoteNotes] = useState('');
    const [quoteQuantity, setQuoteQuantity] = useState(1);
    const [quoteCurrency, setQuoteCurrency] = useState('TRY');
    const [quoteVatRate, setQuoteVatRate] = useState(20.0);

    const {
        basketItems,
        isBasketOpen,
        setIsBasketOpen,
        addToBasket
    } = useBasket();

    const [isOnboardingActive, setIsOnboardingActive] = useState(false);
    const [onboardingStep, setOnboardingStep] = useState(1); 

    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5005'
        : 'https://rootwebcore-backend.onrender.com';

    useEffect(() => {
        const shouldShowOnboarding = localStorage.getItem('apex_show_onboarding');
        if (shouldShowOnboarding === 'true') {
            localStorage.removeItem('apex_show_onboarding');
            setIsOnboardingActive(true);
            setOnboardingStep(1);
        }
    }, []);

    const fetchProducts = async () => {
        if (!token) return;
        setLoadingProducts(true);
        try {
            const url = user?.role === 'SELLER'
                ? `${API_BASE}/api/products?sellerId=${user.id}`
                : `${API_BASE}/api/products`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingProducts(false);
        }
    };

    const [quotesCount, setQuotesCount] = useState(0);

    const fetchQuotesCount = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/api/quotes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setQuotesCount(data.length);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (token && user) {
            fetchProducts();
            fetchQuotesCount();
        }
    }, [token, user]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleAddColor = () => {
        if (!colorInputName.trim()) return;
        const colorName = colorInputName.trim();
        if (!formColorVariants[colorName]) {
            setFormColorVariants(prev => ({
                ...prev,
                [colorName]: []
            }));
            setActiveFormColor(colorName);
        }
        setColorInputName('');
    };

    const handleRemoveColor = (colorName, e) => {
        e.stopPropagation();
        setFormColorVariants(prev => {
            const updated = { ...prev };
            delete updated[colorName];
            return updated;
        });
        if (activeFormColor === colorName) {
            setActiveFormColor('');
        }
    };

    const handleImageUpload = async (e) => {
        if (!activeFormColor) {
            alert('Lütfen resim yüklemeden önce bir renk varyantı ekleyin ve seçin.');
            return;
        }
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        for (const file of files) {
            const formData = new FormData();
            formData.append('image', file);
            try {
                const res = await fetch(`${API_BASE}/api/products/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                if (res.ok) {
                    const data = await res.json();
                    setFormColorVariants(prev => {
                        const current = prev[activeFormColor] || [];
                        return {
                            ...prev,
                            [activeFormColor]: [...current, data.imageUrl]
                        };
                    });
                } else {
                    alert('Görsel yüklenemedi.');
                }
            } catch (err) {
                console.error(err);
                alert('Görsel yüklenirken hata oluştu.');
            }
        }
    };

    const handleRemoveFormImage = (colorName, imgUrl) => {
        setFormColorVariants(prev => {
            const current = prev[colorName] || [];
            return {
                ...prev,
                [colorName]: current.filter(url => url !== imgUrl)
            };
        });
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();

        const colorKeys = Object.keys(formColorVariants);
        if (colorKeys.length === 0) {
            alert('Lütfen en az bir renk seçeneği ekleyin ve ona ait görselleri yükleyin.');
            return;
        }

        const colorImages = [];
        let defaultColor = '';
        let defaultImageUrl = '';

        for (const colorKey of colorKeys) {
            const images = formColorVariants[colorKey];
            if (images.length === 0) {
                alert(`Lütfen ${colorKey} rengi için en az bir resim yükleyin.`);
                return;
            }
            if (!defaultColor) {
                defaultColor = colorKey;
                defaultImageUrl = images[0];
            }
            images.forEach(img => {
                colorImages.push({ color: colorKey, imageUrl: img });
            });
        }

        const productPayload = {
            title: newProduct.title,
            description: newProduct.description,
            category: newProduct.category,
            dimensions: newProduct.dimensions,
            color: defaultColor,
            imageUrl: defaultImageUrl,
            colorImages
        };

        try {
            const res = await fetch(`${API_BASE}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productPayload)
            });
            if (res.ok) {
                setIsAddModalOpen(false);
                setNewProduct({ title: '', description: '', category: 'Living Room', dimensions: '' });
                setFormColorVariants({});
                setActiveFormColor('');
                fetchProducts();
            } else {
                const data = await res.json();
                alert(data.error || 'İlan eklenemedi.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRequestQuote = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/quotes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: selectedProduct.id,
                    notes: quoteNotes
                })
            });
            if (res.ok) {
                alert('Fiyat teklif talebi üreticiye iletildi! Süreci "Teklif Taleplerim" sayfasından takip edebilirsiniz.');
                setSelectedProduct(null);
                setQuoteNotes('');
                navigate('/quotes');
            } else {
                const data = await res.json();
                alert(data.error || 'Talep gönderilemedi.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteProduct = async (productId, e) => {
        e.stopPropagation();
        if (!confirm('Bu ürünü kataloğunuzdan silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`${API_BASE}/api/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchProducts();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const finishOnboarding = () => {
        setIsOnboardingActive(false);
    };

    const restartOnboarding = () => {
        localStorage.setItem('apex_show_onboarding', 'true');
        navigate('/catalog');
        setIsOnboardingActive(true);
        setOnboardingStep(1);
    };

    if (!user) return null;

    const sortedProducts = [...products]
        .filter(p => {
            const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
            const matchesSearch = searchQuery === '' || 
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.seller?.companyName && p.seller.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCategory && matchesSearch;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'alpha-asc') return a.title.localeCompare(b.title, language === 'TR' ? 'tr' : 'en');
            if (sortBy === 'alpha-desc') return b.title.localeCompare(a.title, language === 'TR' ? 'tr' : 'en');
            return 0;
        });

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between relative">

            {isOnboardingActive && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-40 transition-all duration-300 pointer-events-auto"></div>
            )}

            <Header activePage="catalog" />

            {isOnboardingActive && onboardingStep === 1 && (
                <div className="fixed right-6 top-20 w-80 bg-white rounded-2xl p-5 shadow-2xl border border-slate-100 z-50 animate-float text-slate-800">
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block mb-1">{t('tour_step1_badge')}</span>
                    <h4 className="text-xs font-black text-slate-950 mb-1.5">{t('tour_step1_title')}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mb-4">
                        {t('tour_step1_desc')}
                    </p>
                    <button 
                        onClick={() => setOnboardingStep(2)}
                        className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                    >
                        {language === 'TR' ? 'Sonraki Adım ➔' : 'Next Step ➔'}
                    </button>
                </div>
            )}

            <main className="flex-grow max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-8">

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 flex justify-between items-center border border-slate-200/80 shadow-sm">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{t('dash_stats_products')}</span>
                            <span className="text-3xl font-black text-slate-900 mt-1 block">{products.length} {language === 'TR' ? 'Adet' : 'Items'}</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">🛋️</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 flex justify-between items-center border border-slate-200/80 shadow-sm">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{t('dash_stats_role')}</span>
                            <span className="text-3xl font-black text-indigo-600 mt-1 block">
                                {user.role === 'SELLER' ? t('dash_stats_role_seller') : user.role === 'SUPER_ADMIN' ? t('dash_stats_role_admin') : t('dash_stats_role_buyer')}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">🏭</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 flex justify-between items-center border border-slate-200/80 shadow-sm">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{t('dash_stats_quotes')}</span>
                            <span className="text-3xl font-black text-amber-600 mt-1 block">{quotesCount} {language === 'TR' ? 'Görüşme' : 'Negotiations'}</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">💬</div>
                    </div>
                </div>

                <div className={`flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm transition-all duration-300 relative ${
                    isOnboardingActive && onboardingStep === 2 
                        ? 'z-50 relative ring-4 ring-indigo-600/30' 
                        : ''
                }`}>
                    <div className="flex flex-wrap gap-4 items-center flex-grow">
                        <div className="relative w-full sm:w-72">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Search size={15} /></span>
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder={t('dash_search_placeholder')}
                                className="w-full py-2.5 pl-10 pr-4 rounded-xl premium-input text-xs font-semibold"
                            />
                        </div>

                        <select 
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-xs font-black text-indigo-600 cursor-pointer focus:outline-none focus:border-indigo-600 transition-colors"
                        >
                            <option value="All">{t('dash_category_all')}</option>
                            <option value="Living Room">{t('dash_category_living')}</option>
                            <option value="Dining Room">{t('dash_category_dining')}</option>
                            <option value="Bedroom">{t('dash_category_bedroom')}</option>
                            <option value="Office">{t('dash_category_office')}</option>
                        </select>

                        <select 
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-600 cursor-pointer focus:outline-none focus:border-indigo-600 transition-colors"
                        >
                            <option value="newest">{language === 'TR' ? 'Sırala: Yeniden Eskiye' : 'Sort: Newest First'}</option>
                            <option value="oldest">{language === 'TR' ? 'Sırala: Eskiden Yeniye' : 'Sort: Oldest First'}</option>
                            <option value="alpha-asc">{language === 'TR' ? 'Sırala: A-Z' : 'Sort: A-Z'}</option>
                            <option value="alpha-desc">{language === 'TR' ? 'Sırala: Z-A' : 'Sort: Z-A'}</option>
                        </select>
                    </div>

                    {user.role === 'SELLER' && (
                        <button 
                            onClick={() => navigate('/settings', { state: { tab: 'my_products' } })}
                            className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-wider shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                            <Package size={14} /> {t('dash_manage_listings')}
                        </button>
                    )}

                    {isOnboardingActive && onboardingStep === 2 && (
                        <div className="absolute left-6 top-24 w-80 bg-white rounded-2xl p-5 shadow-2xl border border-slate-100 z-50 animate-float text-slate-800 text-left">
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block mb-1">{t('tour_step2_badge')}</span>
                            <h4 className="text-xs font-black text-slate-950 mb-1.5">{t('tour_step2_title')}</h4>
                            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mb-4">
                                {t('tour_step2_desc')}
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setOnboardingStep(1)}
                                    className="w-1/3 py-2 rounded-xl border border-slate-200 text-slate-500 font-black text-[10px] uppercase cursor-pointer"
                                >
                                    {t('wizard_btn_prev')}
                                </button>
                                <button 
                                    onClick={() => setOnboardingStep(3)}
                                    className="w-2/3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                                >
                                    {language === 'TR' ? 'Sonraki Adım ➔' : 'Next Step ➔'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-300 relative ${
                    isOnboardingActive && onboardingStep === 3 
                        ? 'z-50 relative ring-4 ring-indigo-600/30 bg-slate-50/80 p-4 rounded-3xl' 
                        : ''
                }`}>
                    {loadingProducts ? (
                        Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm flex flex-col justify-between h-[420px]">
                                <div className="h-56 skeleton w-full"></div>
                                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                                    <div className="space-y-3">
                                        <div className="h-5 skeleton rounded-lg w-2/3"></div>
                                        <div className="h-3 skeleton rounded-lg w-1/3"></div>
                                        <div className="space-y-2 mt-2">
                                            <div className="h-3 skeleton rounded-lg w-full"></div>
                                            <div className="h-3 skeleton rounded-lg w-5/6"></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <div className="h-10 skeleton rounded-xl flex-grow"></div>
                                        <div className="h-10 skeleton rounded-xl flex-grow"></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : sortedProducts.length === 0 ? (
                        <div className="col-span-full bg-white rounded-3xl p-16 text-center text-slate-400 border border-slate-200/60 font-semibold text-xs shadow-sm">
                            {language === 'TR' ? 'Aradığınız kriterlere uygun mobilya kataloğu bulunamadı.' : 'No furniture found matching your criteria.'}
                        </div>
                    ) : (
                        sortedProducts.map(p => (
                            <div 
                                key={p.id}
                                onClick={() => navigate(`/products/${p.id}`)}
                                className="premium-card rounded-3xl overflow-hidden flex flex-col justify-between relative group cursor-pointer"
                            >
                                <div className="h-56 rounded-t-2xl overflow-hidden relative bg-slate-100">
                                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-xl bg-white/95 text-indigo-600 text-[10px] font-black uppercase tracking-wider border border-slate-100 shadow-sm">
                                        {p.category}
                                    </span>

                                    {(user.role === 'SUPER_ADMIN' || (user.role === 'SELLER' && p.sellerId === user.id)) && (
                                        <button 
                                            onClick={(e) => handleDeleteProduct(p.id, e)}
                                            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-xl bg-white hover:bg-red-50 border border-slate-100 hover:border-red-200 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all cursor-pointer shadow-sm"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>

                                <div className="p-6 flex-grow flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-black text-slate-900 leading-tight">
                                            {p.title}
                                        </h3>
                                        <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wide">
                                            {language === 'TR' ? 'Üretici:' : 'Manufacturer:'} <span className="text-indigo-600 font-black">{p.seller?.companyName || (language === 'TR' ? 'Bilinmeyen Üretici' : 'Unknown Manufacturer')}</span>
                                        </p>
                                        <p className="text-xs text-slate-500 font-semibold leading-relaxed line-clamp-2">
                                            {p.description}
                                        </p>
                                    </div>

                                    <div className="border-t border-slate-100 mt-6 pt-4 flex flex-col gap-3">
                                        <div className="flex justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                            <span>📐 {p.dimensions || 'N/A'}</span>
                                            <span>🎨 {p.color || 'N/A'}</span>
                                        </div>

                                        {user.role === 'BUYER' ? (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/products/${p.id}`);
                                                    }}
                                                    className="flex-grow py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center"
                                                >
                                                    {language === 'TR' ? 'Detaylar' : 'Details'}
                                                </button>
                                                <button 
                                                    onClick={(e) => addToBasket(p, e)}
                                                    className="flex-grow py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider shadow-md shadow-indigo-600/10 transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-98"
                                                >
                                                    <ShoppingCart size={13} />
                                                    {language === 'TR' ? 'Sepete' : 'Basket'}
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/products/${p.id}`);
                                                }}
                                                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-600/10 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                                            >
                                                {language === 'TR' ? 'Detayları ve Renkleri İncele' : 'View Details & Colors'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {}
                    {isOnboardingActive && onboardingStep === 3 && (
                        <div className="absolute left-1/2 top-10 -translate-x-1/2 w-80 bg-white rounded-2xl p-5 shadow-2xl border border-slate-100 z-50 animate-float text-slate-800 text-left">
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block mb-1">
                                {language === 'TR' ? 'Adım 3/3: Teklif İsteme & İlan Verme' : 'Step 3/3: Request Quote & Add Listings'}
                            </span>
                            <h4 className="text-xs font-black text-slate-950 mb-1.5">
                                {language === 'TR' ? 'Müzakereleri Başlatın' : 'Start Negotiations'}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mb-4">
                                {user.role === 'BUYER' 
                                    ? (language === 'TR' 
                                        ? "Beğendiğiniz mobilyaların altındaki 'Fiyat Teklifi İste' butonuna basarak adet ve teslimat şartları ileterek anlık teklif isteyebilirsiniz."
                                        : "Click 'Request Price' below items to negotiate quantities and delivery options.")
                                    : (language === 'TR' 
                                        ? "Sağ üstteki 'Yeni İlan Ekle' butonunu kullanarak yeni tasarımlarınızı fiyatsız olarak B2B kataloğunuza ekleyebilirsiniz."
                                        : "Use the 'Add New Listing' button to publish new designs to your catalog with hidden prices.")}
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setOnboardingStep(2)}
                                    className="w-1/3 py-2 rounded-xl border border-slate-200 text-slate-500 font-black text-[10px] uppercase cursor-pointer"
                                >
                                    {t('wizard_btn_prev')}
                                </button>
                                <button 
                                    onClick={() => setOnboardingStep(4)}
                                    className="w-2/3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                                >
                                    {language === 'TR' ? 'Turu Tamamla ➔' : 'Complete Tour ➔'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </main>

            {}
            <footer className="py-6 border-t border-slate-200/60 bg-white text-center text-[10px] font-bold text-slate-400 tracking-wider">
                &copy; 2026 Root Web Core B2B Business-to-Business Furniture Marketplace. All rights reserved.
            </footer>

            {}
            {isOnboardingActive && onboardingStep === 4 && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-100 text-center space-y-6 relative overflow-hidden">
                        {}
                        <div className="absolute -top-12 -left-12 w-24 h-24 bg-indigo-100 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-amber-100 rounded-full blur-2xl"></div>

                        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-md border border-emerald-100">
                            ✓
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-950 flex items-center justify-center gap-1.5">
                                <Sparkles className="text-amber-500" size={20} /> 
                                {language === 'TR' ? 'Tebrikler, Kurulum Tamamlandı!' : 'Congratulations, Setup Complete!'}
                            </h3>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                {language === 'TR' ? 'APEX B2B KULLANIMA HAZIR' : 'APEX B2B IS READY TO USE'}
                            </p>
                        </div>

                        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                            {language === 'TR' 
                                ? 'B2B Mobilya Pazaryeriniz artık tamamen aktif. Toptancı kataloglarını incelemeye başlayabilir, fiyatsız ilanlar ekleyebilir veya Socket.io destekli anlık sohbet panelinden toptan pazarlıklara hemen katılabilirsiniz!'
                                : 'Your B2B Furniture Marketplace is fully operational. Start browsing wholesale catalogs, add quote-only listings, or join live chat negotiations instantly!'}
                        </p>

                        <button 
                            onClick={finishOnboarding}
                            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/10 cursor-pointer transition-all active:scale-98"
                        >
                            {language === 'TR' ? 'Kullanmaya Başla!' : 'Get Started!'}
                        </button>
                    </div>
                </div>
            )}

            {}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-xl rounded-3xl p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Kataloğa Yeni Mobilya Ekle</h2>
                                <span className="text-[10px] uppercase font-black text-indigo-600 tracking-wider">Ürünler teklif yöntemiyle pazarlık edilecektir</span>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-950 font-black text-xs cursor-pointer bg-slate-50 py-1 px-3 rounded-lg border border-slate-100">Kapat X</button>
                        </div>

                        <form onSubmit={handleAddProduct} className="space-y-4 text-xs font-semibold">
                            <div className="space-y-1.5">
                                <label className="block text-slate-500 font-bold">Ürün Adı</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newProduct.title}
                                    onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                                    className="w-full py-3 px-4 rounded-xl premium-input"
                                    placeholder="Örn: Chester İtalyan İkili Koltuk"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-slate-500 font-bold">Kategori</label>
                                <select 
                                    value={newProduct.category}
                                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                                    className="w-full py-3 px-4 rounded-xl bg-white border border-slate-200 text-indigo-600 font-black focus:outline-none focus:border-indigo-600 cursor-pointer"
                                >
                                    <option value="Living Room">Oturma Odası (Living Room)</option>
                                    <option value="Dining Room">Yemek Odası (Dining Room)</option>
                                    <option value="Bedroom">Yatak Odası (Bedroom)</option>
                                    <option value="Office">Ofis Mobilyaları (Office)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-slate-500 font-bold">Açıklama & Malzeme Özellikleri</label>
                                <textarea 
                                    required
                                    rows="3"
                                    value={newProduct.description}
                                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                                    className="w-full py-3 px-4 rounded-xl premium-input"
                                    placeholder="Üretim malzemeleri, sünger ve kumaş cinsi..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-slate-500 font-bold">Boyutlar (Genişlik x Derinlik x Yükseklik)</label>
                                <input 
                                    type="text" 
                                    value={newProduct.dimensions}
                                    onChange={e => setNewProduct({...newProduct, dimensions: e.target.value})}
                                    className="w-full py-3 px-4 rounded-xl premium-input"
                                    placeholder="Örn: 220x95x75 cm"
                                />
                            </div>

                            {}
                            <div className="space-y-3 border-t border-slate-100 pt-4">
                                <label className="block text-slate-500 font-bold">Renk Seçenekleri Ekle</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        value={colorInputName}
                                        onChange={e => setColorInputName(e.target.value)}
                                        placeholder="Renk adı girin (Örn: Haki Yeşil)"
                                        className="flex-grow py-2.5 px-3 rounded-xl premium-input text-xs font-semibold"
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleAddColor}
                                        className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                                    >
                                        Renk Ekle
                                    </button>
                                </div>

                                {}
                                {Object.keys(formColorVariants).length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Eklenen Renkler (Resim yüklemek için üzerine tıklayın):</span>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.keys(formColorVariants).map((colorKey) => (
                                                <button
                                                    key={colorKey}
                                                    type="button"
                                                    onClick={() => setActiveFormColor(colorKey)}
                                                    className={`px-3 py-1.5 rounded-xl border text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                                                        activeFormColor === colorKey
                                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                                                    }`}
                                                >
                                                    {colorKey}
                                                    <span 
                                                        onClick={(e) => handleRemoveColor(colorKey, e)}
                                                        className="hover:text-red-300 ml-1 font-bold"
                                                    >
                                                        ✕
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {}
                            {activeFormColor && (
                                <div className="space-y-3 border-t border-slate-100 pt-4 bg-slate-50 p-4 rounded-2xl">
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">
                                        🎨 {activeFormColor} Rengi İçin Resim Yönetimi
                                    </span>

                                    <div className="space-y-1">
                                        <label className="block text-slate-500 font-bold text-xs">Bilgisayardan Resim Seçin</label>
                                        <input 
                                            type="file" 
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-600 file:hover:bg-indigo-100 cursor-pointer"
                                        />
                                        <span className="text-[9px] text-slate-400 block font-semibold">
                                            * Aynı anda birden fazla resim seçip yükleyebilirsiniz.
                                        </span>
                                    </div>

                                    {}
                                    {(formColorVariants[activeFormColor] || []).length > 0 && (
                                        <div className="space-y-1.5">
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Yüklenen Ön İzlemeler:</span>
                                            <div className="grid grid-cols-5 gap-2">
                                                {(formColorVariants[activeFormColor] || []).map((imgUrl, idx) => (
                                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                                        <img src={imgUrl} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFormImage(activeFormColor, imgUrl)}
                                                            className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 hover:bg-red-700 text-white text-[9px] font-black flex items-center justify-center cursor-pointer shadow-sm"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button 
                                type="submit"
                                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-600/15 transition-all cursor-pointer mt-4"
                            >
                                Ürünü Kataloğa Kaydet
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-100">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Teklif Talebi Gönder</h2>
                                <span className="text-[10px] uppercase font-black text-indigo-600 tracking-wider">Ürün: {selectedProduct.title}</span>
                            </div>
                            <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-slate-950 font-black text-xs cursor-pointer bg-slate-50 py-1 px-3 rounded-lg border border-slate-100">İptal X</button>
                        </div>

                        <form onSubmit={handleRequestQuote} className="space-y-4 text-xs font-semibold">
                            <div className="space-y-1.5">
                                <label className="block text-slate-500 font-bold">Talebiniz, Adet ve Özel İstekleriniz</label>
                                <textarea 
                                    required
                                    rows="4"
                                    value={quoteNotes}
                                    onChange={e => setQuoteNotes(e.target.value)}
                                    className="w-full py-3 px-4 rounded-xl premium-input leading-relaxed"
                                    placeholder="Örn: Bu üründen 15 adet satın almak istiyoruz. Kumaş rengi antrasit olabilir mi? Sevkiyat Bursa'ya yapılacak..."
                                />
                            </div>

                            <button 
                                type="submit"
                                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                            >
                                Fiyat Teklif Talebini Gönder
                            </button>
                        </form>
                    </div>
                </div>
            )}



        </div>
    );
};

export default Dashboard;
