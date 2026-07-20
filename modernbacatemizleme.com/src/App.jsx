import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCpu, 
  FiMail, 
  FiArrowDown, 
  FiActivity, 
  FiPhone,
  FiMapPin,
  FiMenu,
  FiX,
  FiZap,
  FiGlobe,
  FiShield,
  FiFileText,
  FiSearch,
  FiDollarSign,
  FiChevronRight,
  FiInfo
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive Calculator State
  const [calcType, setCalcType] = useState('apartman');
  const [calcSize, setCalcSize] = useState(5); // Floors or meters
  const [calcUnits, setCalcUnits] = useState(1);
  const [calcTotal, setCalcTotal] = useState(0);

  // Gallery Modal state
  const [activeImage, setActiveImage] = useState(null);

  // Secure Form State
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');
  
  // Math CAPTCHA
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, sum: 0 });
  const [userCaptcha, setUserCaptcha] = useState('');

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 8) + 2; // 2-9
    const num2 = Math.floor(Math.random() * 8) + 2; // 2-9
    setCaptcha({ num1, num2, sum: num1 + num2 });
    setUserCaptcha('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Calculate pricing based on inputs
  useEffect(() => {
    let basePrice = 0;
    let sizeMultiplier = 0;

    if (calcType === 'apartman') {
      basePrice = 1200; // base charge
      sizeMultiplier = 250; // per floor
    } else if (calcType === 'somine') {
      basePrice = 1500; // flat charge
      sizeMultiplier = 0;
    } else if (calcType === 'yaglikanal') {
      basePrice = 2000;
      sizeMultiplier = 350; // per meter
    } else if (calcType === 'kazan') {
      basePrice = 2500;
      sizeMultiplier = 400; // per floor/meter
    }

    const estimatedTotal = (basePrice + (sizeMultiplier * calcSize)) * calcUnits;
    setCalcTotal(estimatedTotal);
  }, [calcType, calcSize, calcUnits]);

  // Disable Right-Click and DevTools shortcuts
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.keyCode === 123) e.preventDefault();
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) e.preventDefault();
      if (e.ctrlKey && e.shiftKey && e.keyCode === 74) e.preventDefault();
      if (e.ctrlKey && e.keyCode === 85) e.preventDefault();
      if (e.ctrlKey && e.shiftKey && e.keyCode === 67) e.preventDefault();
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const hasProfanity = (text) => {
    if (!text) return false;
    const blacklist = [
      'amk', 'aq', 'pic', 'got', 'orospu', 'yavsak', 'ibne', 'serefsiz', 
      'amcik', 'gerizekali', 'pezevenk', 'gavat', 'kahpe', 'siktir', 'yarrak'
    ];
    
    const normalized = text.toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
      
    const words = normalized.split(/[\s,.\-_!?]+/);
    return words.some(w => blacklist.includes(w) || blacklist.some(b => w === b + 'lar' || w === b + 'ler' || w === b + 'si' || w === b + 'yi' || w === b + 'ye'));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Adınız soyadınız gereklidir.';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Adınız en az 2 karakter olmalıdır.';
    } else if (hasProfanity(formData.name)) {
      errors.name = 'Adınız uygunsuz içerik içeremez.';
    }

    if (!formData.email.trim()) {
      errors.email = 'E-posta adresiniz gereklidir.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Geçerli bir e-posta adresi giriniz.';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Konu alanı gereklidir.';
    } else if (hasProfanity(formData.subject)) {
      errors.subject = 'Konu uygunsuz içerik içeremez.';
    }

    if (!formData.message.trim()) {
      errors.message = 'Mesajınız gereklidir.';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Mesajınız en az 10 karakter olmalıdır.';
    } else if (hasProfanity(formData.message)) {
      errors.message = 'Mesajınız uygunsuz veya argo içerik barındıramaz.';
    }

    if (!userCaptcha) {
      errors.captcha = 'Lütfen güvenlik sorusunu yanıtlayın.';
    } else if (parseInt(userCaptcha, 10) !== captcha.sum) {
      errors.captcha = 'Güvenlik sorusu cevabı yanlış.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (honeypot) {
      setSubmitStatus('success');
      setStatusMessage('Talebiniz başarıyla alınmıştır.');
      return;
    }

    setSubmitStatus('submitting');

    setTimeout(() => {
      setSubmitStatus('success');
      setStatusMessage('Talebiniz başarıyla oluşturuldu! Teknik ekiplerimiz en kısa sürede keşif planlaması için sizi arayacaktır.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setUserCaptcha('');
      generateCaptcha();
    }, 1500);
  };

  const navLinks = [
    { id: 'hero', name: 'Ana Sayfa' },
    { id: 'about', name: 'Kurumsal' },
    { id: 'calculator', name: 'Fiyat Hesapla' },
    { id: 'services', name: 'Hizmetlerimiz' },
    { id: 'gallery', name: 'Uygulamalar' },
    { id: 'contact', name: 'İletişim' }
  ];

  const categories = [
    { id: 'all', name: 'Tüm Hizmetler' },
    { id: 'baca', name: 'Baca Temizleme' },
    { id: 'havalandirma', name: 'Kanal & Havalandırma' },
    { id: 'rapor', name: 'Resmi Raporlar' },
    { id: 'onarim', name: 'Bakım & Onarım' }
  ];

  const services = [
    { title: 'Apartman Bacası Temizleme', desc: 'Can ve mal güvenliğiniz için apartman ve bina ortak bacalarının kurum temizliği ve çekiş kontrolleri.', cat: 'baca' },
    { title: 'Havalandırma ve Yağlı Kanal Temizliği', desc: 'Ticari mutfak davlumbazları ile egzoz fan kanallarında biriken yangın tehlikesi taşıyan yağ katmanlarının kazınması.', cat: 'havalandirma' },
    { title: 'Restaurant ve Fırın Bacası Temizleme', desc: 'Yüksek ısıda sürekli çalışan pide, lahmacun ve ocakbaşı bacalarının mekanik fırçalarla kurumdan arındırılması.', cat: 'baca' },
    { title: 'Doğalgaz ve Kombi Bacası Temizleme', desc: 'Merkezi ısıtma doğalgaz kazan bacaları ile kombi havalandırma hatlarının zehirlenmeleri önleyici periyodik bakımı.', cat: 'baca' },
    { title: 'Kazan ve Soba Bacası Temizleme', desc: 'Katı, sıvı yakıt kalorifer kazan boruları ve klasik soba bacalarının tıkanıklığının giderilerek verimlilik artışı sağlanması.', cat: 'baca' },
    { title: 'Şömine Temizliği ve Bakımı', desc: 'Lüks şömine haznelerinin temizliği, cam ve fitil değişimi, çekiş gücünü engelleyen kurumların temizlenmesi.', cat: 'baca' },
    { title: 'İBB İtfaiye Yetkili Baca Raporu', desc: 'Belediye iş yeri açma ve çalışma ruhsatı başvurularında zorunlu olan resmi onaylı baca raporunun tanzimi.', cat: 'rapor' },
    { title: 'İGDAŞ Baca Uygunluk Raporu', desc: 'Doğalgaz abonelik açılışlarında İGDAŞ standartlarına göre sızdırmazlık testleri ve teknik uygunluk onay belgesi.', cat: 'rapor' },
    { title: 'Tıkalı Baca Açma Hizmeti', desc: 'Kuş yuvaları, sıva döküntüleri veya yabancı cisimlerle tıkanan tehlikeli bacaların profesyonel açılması.', cat: 'onarim' },
    { title: 'Baca Onarım ve Tadilatı', desc: 'Yıpranmış, sızdıran veya çatlayan bacaların çelik boru kılıflaması, sıva kaplaması ve izolasyonu.', cat: 'onarim' },
    { title: 'Baca Rüzgar Gülü ve Teli Yapımı', desc: 'Rüzgarlı havalarda lodos tepmesini önleyen rüzgar gülleri ve kuş girmesini engelleyen koruyucu kafes yapımı.', cat: 'onarim' }
  ];

  const filteredServices = services.filter(service => {
    const matchesCategory = activeCategory === 'all' || service.cat === activeCategory;
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const galleryImages = [
    { src: './assets/hero.png', title: 'Baca Kanalı Teşhis & Kontrolü', desc: 'Modern kameralı cihazlarla baca sızdırmazlık testi.' },
    { src: './assets/grease_hood.png', title: 'Restaurant Yağlı Kanal Temizliği', desc: 'Davlumbaz içi yağ katmanlarının temizlenmesi.' },
    { src: './assets/fireplace.png', title: 'Şömine Hazne & Cam Bakımı', desc: 'Modern şöminelerin kurum temizliği ve cam fitil değişimi.' },
    { src: './assets/sweeping.png', title: 'Mekanik Fırçalama Uygulaması', desc: 'Rotary fırçalarla çelik baca kanallarının kazınması.' }
  ];

  return (
    <div className="relative min-h-screen bg-brand-bg text-brand-text selection:bg-brand-accent selection:text-white font-sans">
      
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-brand-border py-4 px-6 md:px-12 flex justify-between items-center shadow-sm">
        <a href="#hero" className="flex items-center gap-2 font-outfit font-bold text-xl tracking-wider text-brand-dark">
          <span className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center text-white font-black text-sm">ALP</span>
          <span>BACA <span className="text-brand-accent">KONTROL</span></span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-8 items-center">
          {navLinks.map(link => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="font-sans text-sm font-semibold tracking-wide uppercase text-brand-dark/80 hover:text-brand-accent transition-colors duration-300 relative py-1"
            >
              {link.name}
            </a>
          ))}
          <a
            href="tel:+905327674809"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent text-white font-sans font-bold text-sm uppercase tracking-wider hover:bg-orange-600 transition-all duration-300 shadow-md shadow-orange-500/10"
          >
            <FiPhone /> 0532 767 48 09
          </a>
        </nav>

        {/* Mobile menu button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-brand-dark hover:text-brand-accent transition-colors"
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </header>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[68px] left-0 w-full bg-white border-b border-brand-border py-8 px-6 z-40 flex flex-col gap-6 lg:hidden shadow-lg"
          >
            {navLinks.map(link => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-sans text-base font-bold tracking-wide uppercase text-brand-dark hover:text-brand-accent"
              >
                {link.name}
              </a>
            ))}
            <a
              href="tel:+905327674809"
              className="w-full text-center py-3 rounded-xl bg-brand-accent text-white font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              <FiPhone /> 0532 767 48 09
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 pt-24 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* HERO SECTION */}
        <section id="hero" className="min-h-[85vh] flex items-center py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-brand-accent text-xs font-bold uppercase tracking-wider mb-6">
                <FiShield /> Resmi İtfaiye Onaylı & Yetki Belgeli
              </div>
              <h1 className="font-outfit font-black text-4xl sm:text-5xl md:text-6xl leading-tight text-brand-dark mb-6">
                Güvenli Yuvalar, <br />
                <span className="text-brand-accent text-glow-accent">Temiz Bacalar</span>
              </h1>
              <p className="font-sans text-base md:text-lg text-brand-text leading-relaxed mb-8 max-w-xl">
                1999 yılından bu yana çeyrek asırlık tecrübemiz, profesyonel temizleme donanımımız ve uzman mühendis kadromuzla apartmanlardan fırınlara kadar tüm baca sistemlerini yetki belgemizle temizliyoruz.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#calculator"
                  className="px-8 py-4 rounded-xl bg-brand-accent text-white font-sans font-bold text-base uppercase tracking-wider hover:bg-orange-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                  Fiyat Hesapla <FiChevronRight />
                </a>
                <a
                  href="#services"
                  className="px-8 py-4 rounded-xl border border-brand-border bg-white text-brand-dark hover:border-brand-accent hover:bg-orange-50/50 transition-all duration-300 font-sans font-bold text-base uppercase tracking-wider text-center"
                >
                  Hizmetlerimiz
                </a>
              </div>
            </motion.div>

            {/* Hero Image Frame */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-accent/20 to-brand-blue/20 rounded-3xl blur-3xl -z-10" />
              <img 
                src="./assets/hero.png" 
                alt="Alp Baca Temizleme"
                className="w-full h-auto rounded-3xl border-4 border-white shadow-2xl object-cover aspect-[4/3]"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-xl border border-brand-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-brand-accent">
                  <FiZap size={20} />
                </div>
                <div>
                  <h4 className="font-outfit font-bold text-sm text-brand-dark uppercase">25+ Yıllık</h4>
                  <p className="font-sans text-xs text-brand-text">Sektör Lideri Tecrübe</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ABOUT / CORPORATE SECTION */}
        <section id="about" className="py-24 border-t border-brand-border bg-white/50 -mx-6 md:-mx-12 px-6 md:px-12">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-outfit font-black text-3xl sm:text-4xl text-brand-dark mb-6 uppercase tracking-wide">
                Hakkımızda <br />
                <span className="text-brand-accent">Alp Baca Temizleme Hizmetleri</span>
              </h2>
              <p className="font-sans text-brand-text leading-relaxed mb-6">
                Alp Baca Temizliği, kurulduğu <strong>03.05.1999</strong> tarihinden bu yana müşteri memnuniyetini temel ilke olarak benimseyerek İstanbul genelinde profesyonel hizmet sunmaktadır. 
              </p>
              <p className="font-sans text-brand-text leading-relaxed">
                Yönetmeliklere uygun baca temizliği yapılmaması halinde karbonmonoksit sızıntıları ve kanal için biriken yağ katmanlarının tutuşmasıyla oluşan yangınlar büyük can ve mal kayıplarına yol açar. Alp Baca olarak, İstanbul İtfaiyesi yetki lisansımızla standartlara tam uyumlu mühendislik hizmeti veriyoruz.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-3xl border border-brand-border shadow-md"
            >
              <h3 className="font-outfit font-bold text-xl text-brand-dark mb-6 uppercase flex items-center gap-2">
                <FiShield className="text-brand-accent" /> Neden Alp Baca?
              </h3>
              <div className="space-y-6 font-sans">
                <div className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-brand-accent shrink-0 font-bold text-sm">1</span>
                  <div>
                    <h5 className="font-bold text-brand-dark mb-1">Garantili ve Yasal Raporlama</h5>
                    <p className="text-sm text-brand-text">İş yeri ruhsatı başvurusu ve İGDAŞ gaz açılımlarında geçerli yasal yetkili raporları aynı gün teslim ediyoruz.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-brand-accent shrink-0 font-bold text-sm">2</span>
                  <div>
                    <h5 className="font-bold text-brand-dark mb-1">Modern Kameralı Teşhis</h5>
                    <p className="text-sm text-brand-text">Bacalarınızın içini yüksek çözünürlüklü endoskopi kameraları ile tarayıp hasarlı alanları tam tespit ediyoruz.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-brand-accent shrink-0 font-bold text-sm">3</span>
                  <div>
                    <h5 className="font-bold text-brand-dark mb-1">7/24 Kesintisiz Keşif</h5>
                    <p className="text-sm text-brand-text">Restoranlar ve oteller için mutfak faaliyetlerini aksatmayacak esnek çalışma saatleri ve acil destek hattı.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* INTERACTIVE PRICE CALCULATOR SECTION */}
        <section id="calculator" className="py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-outfit font-black text-3xl sm:text-4xl text-brand-dark mb-4 uppercase">
                ANLIK FİYAT HESAPLAMA
              </h2>
              <p className="font-sans text-brand-text max-w-xl mx-auto">
                Bacanızın türüne ve yüksekliğine göre ortalama temizlik maliyetinizi hemen hesaplayın ve online keşif randevusu oluşturun.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 md:p-12 rounded-3xl border border-brand-border shadow-lg grid md:grid-cols-5 gap-8 items-center"
            >
              {/* Controls Column */}
              <div className="md:col-span-3 space-y-6">
                {/* Type selection */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-brand-dark/70 mb-2 font-bold">Baca Türünü Seçin</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'apartman', name: 'Apartman Bacası' },
                      { id: 'somine', name: 'Ev Şöminesi' },
                      { id: 'yaglikanal', name: 'Yağlı Kanal (Kanal)' },
                      { id: 'kazan', name: 'Kazan / Doğalgaz' }
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          setCalcType(type.id);
                          if (type.id === 'somine') setCalcSize(1);
                        }}
                        className={`py-3 px-4 rounded-xl font-sans text-xs font-bold uppercase border tracking-wider text-center transition-all ${
                          calcType === type.id 
                            ? 'bg-brand-accent text-white border-brand-accent shadow-md shadow-orange-500/10' 
                            : 'border-brand-border bg-white text-brand-dark hover:border-brand-accent'
                        }`}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size input */}
                {calcType !== 'somine' && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs uppercase tracking-wider text-brand-dark/70 font-bold">
                        {calcType === 'yaglikanal' ? 'Kanal Uzunluğu (Metre)' : 'Bina Kat Sayısı'}
                      </label>
                      <span className="font-outfit font-black text-brand-accent text-lg">
                        {calcSize} {calcType === 'yaglikanal' ? 'Metre' : 'Kat'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={calcSize}
                      onChange={(e) => setCalcSize(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                    />
                  </div>
                )}

                {/* Count input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs uppercase tracking-wider text-brand-dark/70 font-bold">Adet / Baca Sayısı</label>
                    <span className="font-outfit font-black text-brand-accent text-lg">{calcUnits} Adet</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={calcUnits}
                    onChange={(e) => setCalcUnits(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                  />
                </div>
              </div>

              {/* Price display Column */}
              <div className="md:col-span-2 bg-slate-50 p-8 rounded-2xl border border-brand-border text-center flex flex-col justify-between h-full">
                <div>
                  <h4 className="font-outfit font-bold text-sm text-brand-dark uppercase mb-1">Tahmini Maliyet</h4>
                  <p className="text-xs text-brand-text/60 mb-6">KDV Hariç Ortalama</p>
                  <div className="font-outfit font-black text-3xl md:text-4xl text-brand-accent mb-2">
                    {calcTotal.toLocaleString('tr-TR')} TL
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-brand-text/70">
                    <FiInfo className="text-brand-blue" />
                    <span>Ön keşif ile fiyat değişebilir.</span>
                  </div>
                  <a
                    href="#contact"
                    className="block w-full py-3 rounded-xl bg-brand-dark text-white font-bold text-xs uppercase tracking-wider hover:bg-brand-accent transition-colors shadow-md"
                  >
                    Keşif & Randevu İste
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section id="services" className="py-24 border-t border-brand-border">
          <div className="text-center mb-16">
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-brand-dark mb-4 uppercase">
              BACA HİZMET KATALOGUMUZ
            </h2>
            <p className="font-sans text-brand-text max-w-xl mx-auto mb-10">
              İstanbul genelinde 25 yıldır can ve yangın güvenliğinizi koruyan geniş teknik hizmet portföyümüz.
            </p>

            {/* Categories and Search bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-brand-border pb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg font-sans text-xs font-bold uppercase tracking-wider transition-all ${
                      activeCategory === cat.id 
                        ? 'bg-brand-accent text-white shadow-md' 
                        : 'bg-white border border-brand-border text-brand-dark hover:border-brand-accent'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Katalogda arama yapın..."
                  className="w-full bg-white border border-brand-border rounded-xl py-2.5 pl-10 pr-4 text-brand-dark font-sans text-sm focus:border-brand-accent focus:outline-none transition-all"
                />
                <FiSearch className="absolute left-3.5 top-3.5 text-brand-text/40" size={16} />
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredServices.map((service, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-8 rounded-3xl border border-brand-border hover-card-effect flex flex-col justify-between h-[280px]"
                >
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-brand-accent flex items-center justify-center font-outfit font-black text-sm mb-6">
                      {index + 1}
                    </div>
                    <h3 className="font-outfit font-bold text-lg text-brand-dark mb-3 uppercase tracking-wide">{service.title}</h3>
                    <p className="font-sans text-sm text-brand-text leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                  <span className="font-outfit text-xs text-brand-blue font-bold uppercase tracking-wider mt-4">
                    {service.cat === 'baca' ? 'Baca Temizliği' : service.cat === 'havalandirma' ? 'Kanal & Havalandırma' : service.cat === 'rapor' ? 'Akredite Rapor' : 'Bakım & Onarım'}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* WORK GALLERY SECTION */}
        <section id="gallery" className="py-24 border-t border-brand-border">
          <div className="text-center mb-16">
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-brand-dark mb-4 uppercase">
              UYGULAMA GÖRSELLERİMİZ
            </h2>
            <p className="font-sans text-brand-text max-w-xl mx-auto">
              Sahada gerçekleştirdiğimiz baca kontrolü, şömine temizliği ve yağlı kanal bakımı uygulamalarımızdan kesitler.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryImages.map((img, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveImage(img)}
                className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className="overflow-hidden aspect-[4/3] relative">
                  <img 
                    src={img.src} 
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-brand-dark/20 group-hover:bg-brand-dark/0 transition-colors" />
                </div>
                <div className="p-5">
                  <h4 className="font-outfit font-bold text-sm text-brand-dark uppercase mb-1">{img.title}</h4>
                  <p className="font-sans text-xs text-brand-text leading-relaxed">{img.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* LIGHTBOX MODAL */}
        <AnimatePresence>
          {activeImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveImage(null)}
              className="fixed inset-0 bg-brand-dark/85 z-50 flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full border border-brand-border shadow-2xl relative"
              >
                <button 
                  onClick={() => setActiveImage(null)}
                  className="absolute top-4 right-4 bg-white/95 text-brand-dark hover:text-brand-accent p-2 rounded-full shadow-md z-10 transition-colors"
                >
                  <FiX size={20} />
                </button>
                <img 
                  src={activeImage.src} 
                  alt={activeImage.title}
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
                <div className="p-8 bg-white">
                  <h3 className="font-outfit font-black text-xl text-brand-dark uppercase mb-2">{activeImage.title}</h3>
                  <p className="font-sans text-sm text-brand-text leading-relaxed">{activeImage.desc}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CERTIFICATION TRUST BADGE SECTION */}
        <section className="py-24 border-t border-brand-border">
          <div className="bg-slate-50 border border-brand-border p-8 md:p-12 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex gap-4 items-start max-w-xl">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-brand-accent shrink-0">
                <FiFileText size={24} />
              </div>
              <div>
                <h3 className="font-outfit font-black text-xl text-brand-dark uppercase mb-2">Belediye ve İtfaiye Denetimlerine Hazırlık</h3>
                <p className="font-sans text-sm text-brand-text leading-relaxed">
                  İstanbul genelindeki ruhsat denetimlerinde İBB İtfaiye Daire Başkanlığı yetkisine sahip olmayan firmaların raporları geçersiz sayılmaktadır. Ceza ve ruhsat iptallerini engellemek için yasal akredite firmaları tercih edin.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full sm:w-auto">
              <a
                href="#contact"
                className="px-6 py-3 rounded-xl bg-brand-dark text-white font-bold text-xs uppercase tracking-wider hover:bg-brand-accent transition-colors text-center shadow-md"
              >
                Rapor Talebi
              </a>
              <a
                href="https://wa.me/905327674809"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl border border-brand-border bg-white text-brand-dark font-bold text-xs uppercase tracking-wider hover:border-brand-accent hover:text-brand-accent transition-all text-center flex items-center justify-center gap-2"
              >
                <FaWhatsapp /> Yetki Sorgula
              </a>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="py-24 border-t border-brand-border">
          <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-2">
              <h2 className="font-outfit font-black text-3xl sm:text-4xl text-brand-dark mb-6 uppercase tracking-wide">
                Hemen Ücretsiz <br />
                <span className="text-brand-accent">Keşif Planlayın</span>
              </h2>
              <p className="font-sans text-brand-text leading-relaxed mb-8">
                Tesisinizde veya konutunuzda baca çekiş problemleri, yağlı kanal kokuları veya yasal ruhsat denetim gereksinimleriniz için bizimle irtibata geçin.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-brand-border flex items-center justify-center text-brand-accent">
                    <FiPhone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-text/60 font-semibold">Mobil Destek</p>
                    <a href="tel:+905327674809" className="text-brand-dark hover:text-brand-accent transition-colors font-bold text-lg">0532 767 48 09</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-brand-border flex items-center justify-center text-brand-accent">
                    <FiPhone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-text/60 font-semibold">Ofis Sabit Hat</p>
                    <a href="tel:+902122829394" className="text-brand-dark hover:text-brand-accent transition-colors font-bold">0212 282 93 94</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-brand-border flex items-center justify-center text-brand-accent">
                    <FiMail size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-text/60 font-semibold">Kurumsal E-posta</p>
                    <a href="mailto:info@bacatemizleme.com" className="text-brand-dark hover:text-brand-accent transition-colors font-bold">info@bacatemizleme.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-brand-border flex items-center justify-center text-brand-accent shrink-0">
                    <FiMapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-text/60 font-semibold">Merkez Ofis (Beşiktaş)</p>
                    <span className="text-brand-dark font-bold text-sm">Konaklar Mah. Orgeneral İzzettin Aksalur Cad. No:29/B-1, Beşiktaş / İstanbul</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-brand-border flex items-center justify-center text-brand-accent shrink-0">
                    <FiMapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-text/60 font-semibold">Operasyon Depo (Kağıthane)</p>
                    <span className="text-brand-dark font-bold text-sm">Yeşilce Mah. Dalgıç Sok. No:25/8, Kağıthane / İstanbul</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="mt-8">
                <a
                  href="https://wa.me/905327674809"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#25d366] text-white hover:bg-[#20ba5a] font-sans font-bold text-sm uppercase tracking-wider transition-colors shadow-lg shadow-green-500/10"
                >
                  <FaWhatsapp size={20} /> WhatsApp Canlı Destek
                </a>
              </div>
            </div>

            {/* Secure Booking Form */}
            <div className="md:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-3xl border border-brand-border shadow-md"
              >
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Honeypot spam guard */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="hidden"
                    autoComplete="off"
                  />

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-brand-dark/70 mb-2 font-bold">Adınız Soyadınız *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-brand-border rounded-xl px-4 py-3.5 text-brand-dark font-sans text-sm focus:border-brand-accent focus:bg-white focus:outline-none transition-all duration-300"
                        placeholder="Örn: Hasan Yılmaz"
                      />
                      {formErrors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-brand-dark/70 mb-2 font-bold">E-posta Adresiniz *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-brand-border rounded-xl px-4 py-3.5 text-brand-dark font-sans text-sm focus:border-brand-accent focus:bg-white focus:outline-none transition-all duration-300"
                        placeholder="hasan@sirket.com"
                      />
                      {formErrors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-dark/70 mb-2 font-bold">Konu / Hizmet Talebi *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-brand-border rounded-xl px-4 py-3.5 text-brand-dark font-sans text-sm focus:border-brand-accent focus:bg-white focus:outline-none transition-all duration-300"
                      placeholder="Şömine kurum temizliği, restaurant havalandırma bakımı vb."
                    />
                    {formErrors.subject && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-dark/70 mb-2 font-bold">Talebiniz / Adres Detayı *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full bg-slate-50 border border-brand-border rounded-xl px-4 py-3.5 text-brand-dark font-sans text-sm focus:border-brand-accent focus:bg-white focus:outline-none transition-all duration-300 resize-none"
                      placeholder="Lütfen temizlik veya raporlama yapılacak binanın detaylarını ve konumunu girin."
                    />
                    {formErrors.message && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.message}</p>}
                  </div>

                  {/* Math CAPTCHA */}
                  <div className="bg-slate-50 border border-brand-border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-brand-dark font-sans font-semibold">
                      Güvenlik Sorusu: <span className="text-brand-accent font-black">{captcha.num1} + {captcha.num2} = ?</span>
                    </div>
                    <div className="flex gap-2 items-center w-full sm:w-auto">
                      <input
                        type="number"
                        value={userCaptcha}
                        onChange={(e) => setUserCaptcha(e.target.value)}
                        className="bg-white border border-brand-border rounded-xl px-4 py-2 text-brand-dark font-sans text-sm focus:border-brand-accent focus:outline-none transition-all w-24 text-center"
                        placeholder="Cevap"
                      />
                      <button
                        type="button"
                        onClick={generateCaptcha}
                        className="text-xs text-brand-accent underline hover:text-orange-700 font-bold"
                      >
                        Değiştir
                      </button>
                    </div>
                  </div>
                  {formErrors.captcha && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.captcha}</p>}

                  <button
                    type="submit"
                    disabled={submitStatus === 'submitting'}
                    className="w-full py-4 rounded-xl bg-brand-accent hover:bg-orange-600 text-white font-sans font-bold text-sm uppercase tracking-widest transition-all duration-300 disabled:opacity-50 shadow-lg shadow-orange-500/20"
                  >
                    {submitStatus === 'submitting' ? 'Talebiniz Alınıyor...' : 'Ücretsiz Keşif Randevusu Al'}
                  </button>

                  {/* Feedback Message */}
                  {submitStatus === 'success' && (
                    <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
                      {statusMessage}
                    </div>
                  )}
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-brand-border mt-20 py-8 px-6 md:px-12 text-center text-brand-text/50 font-sans text-xs shadow-sm">
        <p>© 2026 Alp Baca Kontrol & Temizleme Sistemleri. Tüm Hakları Saklıdır.</p>
        <p className="mt-2 text-brand-text/30">Bu sitenin tasarımları ve kodları lisans korumalıdır. Kopyalanması yasaktır.</p>
      </footer>
    </div>
  );
}
