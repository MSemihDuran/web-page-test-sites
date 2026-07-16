import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
    ArrowLeft, Save, Shield, Bell, User, Mail, Phone, 
    CheckCircle, XCircle, Settings as SettingsIcon, Package, 
    Plus, Trash2, Edit, Check, AlertTriangle, ToggleLeft, ToggleRight, Camera, Globe, Info, LogOut, HelpCircle
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

const Settings = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { language, changeLanguage, t } = useLanguage();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('personal');

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    const [companyName, setCompanyName] = useState('');
    const [about, setAbout] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [phoneInput, setPhoneInput] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    const [companyEmail, setCompanyEmail] = useState('');
    const [companyPhone, setCompanyPhone] = useState('');
    const [companyEmailVerified, setCompanyEmailVerified] = useState(false);
    const [companyPhoneVerified, setCompanyPhoneVerified] = useState(false);

    const [verificationModal, setVerificationModal] = useState(null); 
    const [verificationCode, setVerificationCode] = useState('');

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [soundAlerts, setSoundAlerts] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(true);

    const [pendingApprovals, setPendingApprovals] = useState([]);

    const [myProducts, setMyProducts] = useState([]);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); 

    const [productForm, setProductForm] = useState({
        title: '',
        description: '',
        category: 'Living Room',
        dimensions: ''
    });
    const [colorInputName, setColorInputName] = useState('');
    const [activeFormColor, setActiveFormColor] = useState('');
    const [formColorVariants, setFormColorVariants] = useState({}); 

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

        const localSound = localStorage.getItem('apex_sound_alerts') !== 'false';
        const localEmail = localStorage.getItem('apex_email_alerts') !== 'false';
        setSoundAlerts(localSound);
        setEmailAlerts(localEmail);
    }, [navigate]);

    const fetchUserProfile = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/api/auth/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setCompanyName(data.companyName || '');
                setLogoUrl(data.logoUrl || '');
                setAbout(data.about || '');
                setEmailInput(data.email || '');
                setPhoneInput(data.phone || '');
                setAvatarUrl(data.avatarUrl || '');
                setTwoFactorEnabled(data.twoFactorEnabled || false);
                setCompanyEmail(data.companyEmail || '');
                setCompanyPhone(data.companyPhone || '');
                setCompanyEmailVerified(data.companyEmailVerified || false);
                setCompanyPhoneVerified(data.companyPhoneVerified || false);

                localStorage.setItem('user', JSON.stringify(data));

                if (data.role === 'SUPER_ADMIN') {
                    fetchPendingApprovals();
                }

                if (data.role === 'SELLER' || data.role === 'SUPER_ADMIN') {
                    fetchMyProducts(data.id);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyProducts = async (sellerId) => {
        try {
            const res = await fetch(`${API_BASE}/api/products?sellerId=${sellerId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMyProducts(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPendingApprovals = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/auth/pending-approvals`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPendingApprovals(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUserProfile();
        }
    }, [token]);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

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

                await fetch(`${API_BASE}/api/auth/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ avatarUrl: data.imageUrl })
                });
                alert('Profil resminiz güncellendi!');
                fetchUserProfile();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

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
                setLogoUrl(data.imageUrl);
                alert('Firma logo resmi yüklendi! Lütfen firma kurumsal bilgilerini kaydetmeyi unutmayın.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveProfile = async (e) => {
        if (e) e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    companyName,
                    logoUrl,
                    about,
                    email: emailInput,
                    phone: phoneInput,
                    companyEmail,
                    companyPhone,
                    twoFactorEnabled
                })
            });
            if (res.ok) {
                alert('Bilgileriniz kaydedildi! Kişisel e-posta/telefon değişikliği yapıldıysa yönetici onayına sunuldu.');
                fetchUserProfile();
            } else {
                const errData = await res.json();
                alert(errData.error || 'Kaydetme hatası.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggle2FA = async () => {
        const nextVal = !twoFactorEnabled;
        setTwoFactorEnabled(nextVal);
        try {
            await fetch(`${API_BASE}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ twoFactorEnabled: nextVal })
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleSound = () => {
        const nextVal = !soundAlerts;
        setSoundAlerts(nextVal);
        localStorage.setItem('apex_sound_alerts', nextVal ? 'true' : 'false');
    };

    const handleToggleEmailAlert = () => {
        const nextVal = !emailAlerts;
        setEmailAlerts(nextVal);
        localStorage.setItem('apex_email_alerts', nextVal ? 'true' : 'false');
    };

    const triggerVerificationCode = (type) => {
        setVerificationModal(type);
        setVerificationCode('');
        alert(`Test onay kodunuz SMS/E-posta ile gönderildi! Test Kodu: 123456`);
    };

    const handleVerifyMockCode = async (e) => {
        e.preventDefault();
        if (verificationCode !== '123456') {
            alert('Hatalı kod girdiniz! Lütfen test kodu olarak 123456 girin.');
            return;
        }

        const isEmail = verificationModal === 'email';
        const updatePayload = isEmail 
            ? { companyEmailVerified: true } 
            : { companyPhoneVerified: true };

        try {
            const res = await fetch(`${API_BASE}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatePayload)
            });
            if (res.ok) {
                alert(`${isEmail ? 'Firma E-Postası' : 'Firma Telefonu'} başarıyla doğrulandı!`);
                setVerificationModal(null);
                fetchUserProfile();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleProductActive = async (product) => {
        try {
            const res = await fetch(`${API_BASE}/api/products/${product.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !product.isActive })
            });
            if (res.ok) {
                fetchMyProducts(user.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Bu ilanı tamamen silmek istediğinize emin misiniz?')) return;
        try {
            const res = await fetch(`${API_BASE}/api/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert('İlan başarıyla silindi.');
                fetchMyProducts(user.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openProductForm = (prod = null) => {
        if (prod) {

            setEditingProduct(prod);
            setProductForm({
                title: prod.title || '',
                description: prod.description || '',
                category: prod.category || 'Living Room',
                dimensions: prod.dimensions || ''
            });

            const reconstructed = {};
            if (Array.isArray(prod.colorImages)) {
                prod.colorImages.forEach(img => {
                    if (!reconstructed[img.color]) {
                        reconstructed[img.color] = [];
                    }
                    reconstructed[img.color].push(img.imageUrl);
                });
            }
            setFormColorVariants(reconstructed);
            const colorKeys = Object.keys(reconstructed);
            setActiveFormColor(colorKeys.length > 0 ? colorKeys[0] : '');
        } else {

            setEditingProduct(null);
            setProductForm({
                title: '',
                description: '',
                category: 'Living Room',
                dimensions: ''
            });
            setFormColorVariants({});
            setActiveFormColor('');
        }
        setIsProductModalOpen(true);
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

    const handleProductImageUpload = async (e) => {
        if (!activeFormColor) {
            alert('Lütfen görsel seçmeden önce bir renk ekleyin ve seçin.');
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
                }
            } catch (err) {
                console.error(err);
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

    const handleSaveProduct = async (e) => {
        e.preventDefault();

        const colorKeys = Object.keys(formColorVariants);
        if (colorKeys.length === 0) {
            alert('Lütfen en az bir renk seçeneği ekleyin ve resim yükleyin.');
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

        const payload = {
            title: productForm.title,
            description: productForm.description,
            category: productForm.category,
            dimensions: productForm.dimensions,
            color: defaultColor,
            imageUrl: defaultImageUrl,
            colorImages
        };

        const isEdit = !!editingProduct;
        const url = isEdit 
            ? `${API_BASE}/api/products/${editingProduct.id}` 
            : `${API_BASE}/api/products`;
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setIsProductModalOpen(false);
                setEditingProduct(null);
                alert(isEdit ? 'İlan başarıyla güncellendi!' : 'İlan başarıyla kataloğa eklendi!');
                fetchMyProducts(user.id);
            } else {
                const data = await res.json();
                alert(data.error || 'İlan kaydedilemedi.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleApprove = async (targetUserId) => {
        try {
            const res = await fetch(`${API_BASE}/api/auth/approve-profile/${targetUserId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Değişiklik onaylandı.');
                fetchPendingApprovals();
                fetchUserProfile();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReject = async (targetUserId) => {
        try {
            const res = await fetch(`${API_BASE}/api/auth/reject-profile/${targetUserId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Talep reddedildi.');
                fetchPendingApprovals();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('loading')}</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">

            {}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 py-4 px-6 border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/catalog" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20">
                            A
                        </div>
                        <div>
                            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900">APEX B2B</h1>
                            <span className="text-[9px] uppercase font-black tracking-widest text-indigo-600 block">FURNITURE MARKET</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-6 text-xs font-bold">
                        <button 
                            type="button"
                            onClick={() => changeLanguage(language === 'TR' ? 'EN' : 'TR')}
                            className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-pointer text-slate-500 font-black mr-1"
                        >
                            <Globe size={13} /> {language}
                        </button>
                        <Link to="/catalog" className="text-slate-500 hover:text-indigo-600 transition-all cursor-pointer">{t('catalog')}</Link>
                        <Link to="/quotes" className="text-slate-500 hover:text-indigo-600 transition-all cursor-pointer">{t('my_quotes')}</Link>
                        <button 
                            onClick={() => { localStorage.setItem('apex_show_onboarding', 'true'); navigate('/catalog'); }}
                            className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all cursor-pointer"
                            title={language === 'TR' ? 'Rehberi Başlat' : 'Start Guide'}
                        >
                            <HelpCircle size={15} />
                        </button>

                        <span className="text-slate-300">|</span>

                        <Link to="/settings" className="flex items-center gap-3 hover:text-indigo-600 transition-all cursor-pointer" title={t('settings')}>
                            {user.avatarUrl ? (
                                <img src={`${API_BASE}${user.avatarUrl}`} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-indigo-600/30" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-extrabold text-xs border border-indigo-200">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex flex-col items-end text-right">
                                <span className="text-slate-800 font-extrabold leading-none block mb-0.5">{user.name}</span>
                                <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider leading-none">
                                    {user.companyName || (language === 'TR' ? 'Bireysel' : 'Individual')} ({user.role === 'SELLER' ? t('seller') : t('buyer')})
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

                <button onClick={() => navigate('/catalog')} className="text-xs text-indigo-600 hover:underline font-bold flex items-center gap-1.5 self-start">
                    <ArrowLeft size={14} /> {t('back_to_catalog')}
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {}
                    <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            {user.avatarUrl ? (
                                <img src={`${API_BASE}${user.avatarUrl}`} alt={user.name} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 font-black text-lg flex items-center justify-center border border-indigo-100">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-black text-slate-900 leading-none">{user.name}</h4>
                                <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">
                                    {user.role === 'SELLER' 
                                        ? (language === 'TR' ? 'Satıcı / Üretici' : 'Seller / Manufacturer') 
                                        : (language === 'TR' ? 'Alıcı / Perakendeci' : 'Buyer / Retailer')}
                                </span>
                            </div>
                        </div>

                        <nav className="flex flex-col gap-1.5 text-xs font-bold">
                            <button 
                                onClick={() => setActiveTab('personal')}
                                className={`w-full py-3 px-4 rounded-xl text-left transition-all flex items-center gap-2 cursor-pointer ${
                                    activeTab === 'personal'
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <User size={15} /> {t('settings_tab_personal')}
                            </button>

                            <button 
                                onClick={() => setActiveTab('company')}
                                className={`w-full py-3 px-4 text-left transition-all flex items-center gap-2 cursor-pointer ${
                                    activeTab === 'company'
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <Globe size={15} /> {t('settings_tab_company')}
                            </button>

                            {(user.role === 'SELLER' || user.role === 'SUPER_ADMIN') && (
                                <button 
                                    onClick={() => setActiveTab('my_products')}
                                    className={`w-full py-3 px-4 rounded-xl text-left transition-all flex items-center gap-2 cursor-pointer ${
                                        activeTab === 'my_products'
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <Package size={15} /> {t('settings_tab_listings')}
                                </button>
                            )}

                            {user.role === 'SUPER_ADMIN' && (
                                <button 
                                    onClick={() => setActiveTab('admin_approvals')}
                                    className={`w-full py-3 px-4 rounded-xl text-left transition-all flex items-center gap-2 cursor-pointer ${
                                        activeTab === 'admin_approvals'
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <CheckCircle size={15} /> {t('settings_tab_admin')} ({pendingApprovals.length})
                                </button>
                            )}
                        </nav>
                    </div>

                    {}
                    <div className="lg:col-span-9">

                        {}
                        {activeTab === 'personal' && (
                            <div className="space-y-6">
                                {}
                                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900">{t('settings_title')}</h2>
                                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">{t('settings_subtitle')}</span>
                                    </div>

                                    {}
                                    <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <div className="relative">
                                            {user.avatarUrl ? (
                                                <img src={`${API_BASE}${user.avatarUrl}`} alt="Avatar" className="w-20 h-20 rounded-full object-cover border border-slate-200" />
                                            ) : (
                                                <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 font-black text-2xl flex items-center justify-center">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center cursor-pointer shadow-sm">
                                                <Camera size={13} />
                                                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                            </label>
                                        </div>
                                        <div className="space-y-1 text-center sm:text-left">
                                            <span className="text-xs font-bold text-slate-700 block">{t('settings_avatar_label')}</span>
                                            <span className="text-[10px] text-slate-400 font-semibold block">{t('settings_avatar_desc')}</span>
                                        </div>
                                    </div>

                                    {}
                                    {(user.pendingEmail || user.pendingPhone) && (
                                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold space-y-1">
                                            <span className="block font-black uppercase tracking-wider">{t('settings_pending_box_title')}</span>
                                            {user.pendingEmail && <span className="block">• {t('settings_pending_email')}: {user.pendingEmail}</span>}
                                            {user.pendingPhone && <span className="block">• {t('settings_pending_phone')}: {user.pendingPhone}</span>}
                                            <span className="block text-[9px] text-slate-400 mt-1 italic">{t('settings_pending_note')}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold">
                                        <div className="space-y-1.5">
                                            <label className="block text-slate-400 font-bold">{t('settings_field_name')}</label>
                                            <input 
                                                type="text"
                                                value={user.name}
                                                disabled
                                                className="w-full py-3 px-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 cursor-not-allowed font-bold"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="block text-slate-500 font-bold">{t('settings_field_email')}</label>
                                                <div className="relative">
                                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={14} /></span>
                                                    <input 
                                                        type="email"
                                                        value={emailInput}
                                                        onChange={e => setEmailInput(e.target.value)}
                                                        className="w-full py-3 pl-10 pr-4 rounded-xl premium-input"
                                                        placeholder="mail@hesabiniz.com"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="block text-slate-500 font-bold">{t('settings_field_phone')}</label>
                                                <div className="relative">
                                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Phone size={14} /></span>
                                                    <input 
                                                        type="text"
                                                        value={phoneInput}
                                                        onChange={e => setPhoneInput(e.target.value)}
                                                        className="w-full py-3 pl-10 pr-4 rounded-xl premium-input"
                                                        placeholder="0555 123 4567"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            type="submit"
                                            className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <Save size={14} /> {t('settings_btn_save_personal')}
                                        </button>
                                    </form>
                                </div>

                                {}
                                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900">{t('settings_sec_title')}</h2>
                                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">{t('settings_sec_subtitle')}</span>
                                    </div>

                                    <div className="space-y-4 text-xs font-bold">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <div>
                                                <span className="text-slate-900 block">{t('settings_2fa_label')}</span>
                                                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{t('settings_2fa_desc')}</span>
                                            </div>
                                            <button onClick={handleToggle2FA} className="text-indigo-600 hover:text-indigo-700">
                                                {twoFactorEnabled ? <ToggleRight size={36} /> : <ToggleLeft size={36} className="text-slate-300" />}
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <div>
                                                <span className="text-slate-900 block">{t('settings_sound_label')}</span>
                                                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{t('settings_sound_desc')}</span>
                                            </div>
                                            <button onClick={handleToggleSound} className="text-indigo-600 hover:text-indigo-700">
                                                {soundAlerts ? <ToggleRight size={36} /> : <ToggleLeft size={36} className="text-slate-300" />}
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center py-2">
                                            <div>
                                                <span className="text-slate-900 block">{t('settings_email_alerts_label')}</span>
                                                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{t('settings_email_alerts_desc')}</span>
                                            </div>
                                            <button onClick={handleToggleEmailAlert} className="text-indigo-600 hover:text-indigo-700">
                                                {emailAlerts ? <ToggleRight size={36} /> : <ToggleLeft size={36} className="text-slate-300" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {}
                        {activeTab === 'company' && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">{t('settings_tab_company')}</h2>
                                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">{t('settings_company_subtitle')}</span>
                                </div>

                                {}
                                <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <div className="relative">
                                        {logoUrl ? (
                                            <img src={`${API_BASE}${logoUrl}`} alt="Firma Logo" className="w-20 h-16 object-contain bg-white border border-slate-200 rounded-xl" />
                                        ) : (
                                            <div className="w-20 h-16 rounded-xl bg-slate-200 text-slate-400 font-extrabold text-[10px] flex items-center justify-center uppercase text-center p-2">
                                                {language === 'TR' ? 'Logo Yok' : 'No Logo'}
                                            </div>
                                        )}
                                        <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center cursor-pointer shadow-sm">
                                            <Camera size={11} />
                                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                        </label>
                                    </div>
                                    <div className="space-y-1 text-center sm:text-left">
                                        <span className="text-xs font-bold text-slate-700 block">{t('settings_logo_label')}</span>
                                        <span className="text-[10px] text-slate-400 font-semibold block">{t('settings_logo_desc')}</span>
                                    </div>
                                </div>

                                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold">
                                    <div className="space-y-1.5">
                                        <label className="block text-slate-500 font-bold">{t('settings_company_name_label')}</label>
                                        <input 
                                            type="text"
                                            value={companyName}
                                            onChange={e => setCompanyName(e.target.value)}
                                            className="w-full py-3 px-4 rounded-xl premium-input"
                                            placeholder="Örn: Lüks Orman Mobilya A.Ş."
                                        />
                                    </div>

                                    {}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        {}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <label className="text-slate-500 font-bold">{t('settings_company_email_label')}</label>
                                                {companyEmailVerified ? (
                                                    <span className="text-[8px] font-black uppercase text-emerald-600 tracking-wider">✓ {t('settings_badge_verified')}</span>
                                                ) : (
                                                    <span className="text-[8px] font-black uppercase text-red-500 tracking-wider">⚠️ {t('settings_badge_unverified')}</span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="email"
                                                    value={companyEmail}
                                                    onChange={e => {
                                                        setCompanyEmail(e.target.value);
                                                        setCompanyEmailVerified(false); 
                                                    }}
                                                    className="flex-grow py-3 px-4 rounded-xl premium-input"
                                                    placeholder="firma@sirketiniz.com"
                                                />
                                                {companyEmail && !companyEmailVerified && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => triggerVerificationCode('email')}
                                                        className="px-3.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                                                    >
                                                        {t('settings_btn_verify')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <label className="text-slate-500 font-bold">{t('settings_company_phone_label')}</label>
                                                {companyPhoneVerified ? (
                                                    <span className="text-[8px] font-black uppercase text-emerald-600 tracking-wider">✓ {t('settings_badge_verified')}</span>
                                                ) : (
                                                    <span className="text-[8px] font-black uppercase text-red-500 tracking-wider">⚠️ {t('settings_badge_unverified')}</span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text"
                                                    value={companyPhone}
                                                    onChange={e => {
                                                        setCompanyPhone(e.target.value);
                                                        setCompanyPhoneVerified(false); 
                                                    }}
                                                    className="flex-grow py-3 px-4 rounded-xl premium-input"
                                                    placeholder="0212 123 4567"
                                                />
                                                {companyPhone && !companyPhoneVerified && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => triggerVerificationCode('phone')}
                                                        className="px-3.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                                                    >
                                                        {t('settings_btn_verify')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-slate-500 font-bold">{t('settings_company_about_label')}</label>
                                        <textarea 
                                            rows="5"
                                            value={about}
                                            onChange={e => setAbout(e.target.value)}
                                            className="w-full py-3 px-4 rounded-xl premium-input leading-relaxed"
                                            placeholder={t('settings_company_about_placeholder')}
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        <Save size={14} /> {t('settings_btn_save_company')}
                                    </button>
                                </form>
                            </div>
                        )}

                        {}
                        {activeTab === 'my_products' && (user.role === 'SELLER' || user.role === 'SUPER_ADMIN') && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900">{t('settings_listings_title')}</h2>
                                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">{t('settings_listings_subtitle')}</span>
                                    </div>
                                    <button 
                                        onClick={() => openProductForm(null)}
                                        className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Plus size={14} /> {t('settings_listings_btn_add')}
                                    </button>
                                </div>

                                {myProducts.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400 border border-slate-100 rounded-2xl bg-slate-50 font-semibold text-xs">
                                        {t('settings_listings_no_data')}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {myProducts.map(product => (
                                            <div key={product.id} className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden group">

                                                {}
                                                <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-white shadow-sm ${
                                                    product.isActive ? 'bg-emerald-600' : 'bg-slate-400'
                                                }`}>
                                                    {product.isActive ? (language === 'TR' ? 'Yayında' : 'Active') : (language === 'TR' ? 'Pasif' : 'Inactive')}
                                                </span>

                                                <div className="flex gap-4">
                                                    <img 
                                                        src={product.imageUrl.startsWith('/') ? `${API_BASE}${product.imageUrl}` : product.imageUrl} 
                                                        alt={product.title} 
                                                        className="w-20 h-20 rounded-xl object-cover border border-slate-100 flex-shrink-0" 
                                                    />
                                                    <div className="space-y-1 min-w-0">
                                                        <span className="text-[8px] font-black uppercase tracking-wider text-indigo-600 block">{product.category}</span>
                                                        <h4 className="text-xs font-black text-slate-900 truncate">{product.title}</h4>
                                                        <p className="text-[10px] text-slate-400 font-semibold line-clamp-2 leading-relaxed">{product.description}</p>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                                                    <span className="text-[9px] text-slate-400 font-bold">
                                                        {language === 'TR' ? 'Renkler:' : 'Colors:'} {[...new Set((product.colorImages || []).map(img => img.color))].join(', ') || product.color}
                                                    </span>
                                                    <div className="flex gap-1.5">
                                                        {}
                                                        <button 
                                                            onClick={() => handleToggleProductActive(product)}
                                                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                                                product.isActive 
                                                                    ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' 
                                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                                            }`}
                                                            title={product.isActive 
                                                                ? (language === 'TR' ? 'Pasife Al (Katalogda gizle)' : 'Deactivate (Hide in catalog)') 
                                                                : (language === 'TR' ? 'Yayına Al (Katalogda göster)' : 'Activate (Show in catalog)')}
                                                        >
                                                            {product.isActive ? <XCircle size={13} /> : <Check size={13} />}
                                                        </button>

                                                        {}
                                                        <button 
                                                            onClick={() => openProductForm(product)}
                                                            className="p-1.5 rounded-lg border bg-slate-50 text-indigo-600 border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
                                                            title={language === 'TR' ? 'İlanı Düzenle' : 'Edit Listing'}
                                                        >
                                                            <Edit size={13} />
                                                        </button>

                                                        {}
                                                        <button 
                                                            onClick={() => handleDeleteProduct(product.id)}
                                                            className="p-1.5 rounded-lg border bg-red-50 text-red-600 border-red-100 hover:bg-red-100 transition-all cursor-pointer"
                                                            title={language === 'TR' ? 'İlanı Sil' : 'Delete Listing'}
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {}
                        {activeTab === 'admin_approvals' && user.role === 'SUPER_ADMIN' && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">{t('settings_admin_title')}</h2>
                                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">{t('settings_admin_subtitle')}</span>
                                </div>

                                {pendingApprovals.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 font-semibold text-xs border border-slate-100 rounded-2xl bg-slate-50">
                                        {t('settings_admin_no_data')}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingApprovals.map(approval => (
                                            <div key={approval.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-bold">
                                                <div className="space-y-1">
                                                    <span className="text-slate-900 block font-black">{approval.name} ({approval.companyName || (language === 'TR' ? 'Firma Yok' : 'No Company')})</span>
                                                    <div className="text-[10px] text-slate-500 font-semibold space-y-0.5 mt-1">
                                                        {approval.pendingEmail && (
                                                            <span className="block">
                                                                {language === 'TR' ? 'E-Posta Değişimi:' : 'Email Change:'} <span className="text-slate-400 line-through">{approval.email}</span> ➔ <span className="text-indigo-600 font-bold">{approval.pendingEmail}</span>
                                                            </span>
                                                        )}
                                                        {approval.pendingPhone && (
                                                            <span className="block">
                                                                {language === 'TR' ? 'Telefon Değişimi:' : 'Phone Change:'} <span className="text-slate-400 line-through">{approval.phone || 'Girilmemiş'}</span> ➔ <span className="text-indigo-600 font-bold">{approval.pendingPhone}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 self-end sm:self-auto">
                                                    <button 
                                                        onClick={() => handleApprove(approval.id)}
                                                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase flex items-center gap-1.5 cursor-pointer shadow-sm animate-pulse"
                                                    >
                                                        <CheckCircle size={13} /> {language === 'TR' ? 'Onayla' : 'Approve'}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(approval.id)}
                                                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase flex items-center gap-1.5 cursor-pointer shadow-sm"
                                                    >
                                                        <XCircle size={13} /> {language === 'TR' ? 'Reddet' : 'Reject'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                </div>

            </main>

            {}
            {verificationModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleVerifyMockCode} className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl border border-slate-100 text-xs font-semibold space-y-5">
                        <div className="space-y-1">
                            <h3 className="text-sm font-black text-slate-900 uppercase">
                                {language === 'TR' ? 'Firma Kimlik Doğrulaması' : 'Company Verification'}
                            </h3>
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">
                                {language === 'TR' ? 'Güvenlik SMS & E-Posta Doğrulama Sistemi' : 'Secure SMS & Email Verification System'}
                            </span>
                        </div>

                        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-indigo-900 leading-relaxed space-y-1">
                            <span>📞 <strong>{language === 'TR' ? 'Doğrulama Kodu Gönderildi!' : 'Verification Code Sent!'}</strong></span>
                            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                                {verificationModal === 'email' 
                                    ? (language === 'TR' ? 'firma@sirketiniz.com e-posta adresinize' : 'to your firma@sirketiniz.com email address') 
                                    : (language === 'TR' ? 'Firma telefonunuza' : 'to your company phone')} {language === 'TR' ? '6 haneli geçici bir onay kodu iletilmiştir.' : 'a temporary 6-digit verification code has been sent.'}
                            </p>
                            <span className="block text-[9px] text-slate-400 font-black italic mt-1">
                                * {language === 'TR' ? 'Test kodu: 123456' : 'Test code: 123456'}
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-slate-500 font-bold">{language === 'TR' ? 'Onay Kodunu Girin' : 'Enter Verification Code'}</label>
                            <input 
                                type="text"
                                required
                                maxLength={6}
                                value={verificationCode}
                                onChange={e => setVerificationCode(e.target.value)}
                                className="w-full py-3 px-4 rounded-xl premium-input text-center text-sm font-black tracking-widest"
                                placeholder="------"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button 
                                type="button"
                                onClick={() => setVerificationModal(null)}
                                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold uppercase tracking-wider cursor-pointer"
                            >
                                {t('close')}
                            </button>
                            <button 
                                type="submit"
                                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-wider cursor-pointer"
                            >
                                {language === 'TR' ? 'Onayla' : 'Approve'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-xl rounded-3xl p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">
                                    {editingProduct ? (language === 'TR' ? 'İlanı Düzenle' : 'Edit Listing') : (language === 'TR' ? 'Kataloğa Yeni Mobilya Ekle' : 'Add New Furniture to Catalog')}
                                </h2>
                                <span className="text-[10px] uppercase font-black text-indigo-600 tracking-wider">
                                    {language === 'TR' ? 'Müşterileriniz fiyat teklifi isteyebilecektir' : 'Your customers will be able to request price quotes'}
                                </span>
                            </div>
                            <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-950 font-black text-xs cursor-pointer bg-slate-50 py-1 px-3 rounded-lg border border-slate-100">
                                {t('close')}
                            </button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-semibold">
                            <div className="space-y-1.5">
                                <label className="block text-slate-500 font-bold">{language === 'TR' ? 'Ürün Adı' : 'Product Title'}</label>
                                <input 
                                    type="text" 
                                    required
                                    value={productForm.title}
                                    onChange={e => setProductForm({...productForm, title: e.target.value})}
                                    className="w-full py-3 px-4 rounded-xl premium-input"
                                    placeholder="Chester Sofa..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-slate-500 font-bold">{language === 'TR' ? 'Kategori' : 'Category'}</label>
                                <select 
                                    value={productForm.category}
                                    onChange={e => setProductForm({...productForm, category: e.target.value})}
                                    className="w-full py-3 px-4 rounded-xl bg-white border border-slate-200 text-indigo-600 font-black focus:outline-none focus:border-indigo-600 cursor-pointer"
                                >
                                    <option value="Living Room">{language === 'TR' ? 'Oturma Odası (Living Room)' : 'Living Room'}</option>
                                    <option value="Dining Room">{language === 'TR' ? 'Yemek Odası (Dining Room)' : 'Dining Room'}</option>
                                    <option value="Bedroom">{language === 'TR' ? 'Yatak Odası (Bedroom)' : 'Bedroom'}</option>
                                    <option value="Office">{language === 'TR' ? 'Ofis Mobilyaları (Office)' : 'Office Furniture'}</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-slate-500 font-bold">{language === 'TR' ? 'Açıklama & Malzeme Özellikleri' : 'Description & Material Specs'}</label>
                                <textarea 
                                    required
                                    rows="3"
                                    value={productForm.description}
                                    onChange={e => setProductForm({...productForm, description: e.target.value})}
                                    className="w-full py-3 px-4 rounded-xl premium-input"
                                    placeholder="..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-slate-500 font-bold">{language === 'TR' ? 'Boyutlar (Genişlik x Derinlik x Yükseklik)' : 'Dimensions (Width x Depth x Height)'}</label>
                                <input 
                                    type="text" 
                                    value={productForm.dimensions}
                                    onChange={e => setProductForm({...productForm, dimensions: e.target.value})}
                                    className="w-full py-3 px-4 rounded-xl premium-input"
                                    placeholder="Örn: 220x95x75 cm"
                                />
                            </div>

                            {}
                            <div className="space-y-3 border-t border-slate-100 pt-4">
                                <label className="block text-slate-500 font-bold">{language === 'TR' ? 'Renk Seçenekleri Ekle' : 'Add Color Options'}</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        value={colorInputName}
                                        onChange={e => setColorInputName(e.target.value)}
                                        placeholder={language === 'TR' ? 'Renk adı girin (Örn: Haki Yeşil)' : 'Enter color name (e.g. Olive Green)'}
                                        className="flex-grow py-2.5 px-3 rounded-xl premium-input text-xs font-semibold"
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleAddColor}
                                        className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                                    >
                                        {language === 'TR' ? 'Renk Ekle' : 'Add Color'}
                                    </button>
                                </div>

                                {Object.keys(formColorVariants).length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                            {language === 'TR' ? 'Eklenen Renkler:' : 'Added Colors:'}
                                        </span>
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
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block font-bold">
                                        🎨 {activeFormColor} {language === 'TR' ? 'Rengi İçin Resim Yönetimi' : 'Color Image Management'}
                                    </span>

                                    <div className="space-y-1">
                                        <label className="block text-slate-500 font-bold text-xs">{language === 'TR' ? 'Bilgisayardan Resim Seçin' : 'Select Images from PC'}</label>
                                        <input 
                                            type="file" 
                                            multiple
                                            accept="image/*"
                                            onChange={handleProductImageUpload}
                                            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-600 file:hover:bg-indigo-100 cursor-pointer"
                                        />
                                    </div>

                                    {(formColorVariants[activeFormColor] || []).length > 0 && (
                                        <div className="space-y-1.5">
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{language === 'TR' ? 'Yüklenen Resimler:' : 'Uploaded Images:'}</span>
                                            <div className="grid grid-cols-5 gap-2">
                                                {(formColorVariants[activeFormColor] || []).map((imgUrl, idx) => (
                                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                                        <img src={`${API_BASE}${imgUrl}`} className="w-full h-full object-cover" />
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
                                {language === 'TR' ? 'İlanı Kaydet' : 'Save Listing'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {}
            <footer className="py-6 border-t border-slate-200/60 bg-white text-center text-[10px] font-bold text-slate-400 tracking-wider">
                &copy; 2026 Root Web Core B2B Business-to-Business Furniture Marketplace. All rights reserved.
            </footer>

        </div>
    );
};

export default Settings;
