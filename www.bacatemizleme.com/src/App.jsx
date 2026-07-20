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
  FiSearch
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import ChimneyClean3D from './components/ChimneyClean3D';

export default function App() {
  const [brushSpeed, setBrushSpeed] = useState(1);
  const [airDraft, setAirDraft] = useState(50);
  const [filterStatus, setFilterStatus] = useState(80);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Scroll tracking state
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');

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

  // Disable Right-Click and DevTools shortcuts to protect source code
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    
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

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const progress = window.scrollY / totalScroll;
      setScrollProgress(progress);

      // Section tracking
      const sections = ['hero', 'about', 'interactive', 'services', 'reports', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.4) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      setStatusMessage('Mesajınız başarıyla iletildi! Mühendislerimiz ve teknik ekiplerimiz en kısa sürede dönüş sağlayacaktır.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setUserCaptcha('');
      generateCaptcha();
    }, 1500);
  };

  const navLinks = [
    { id: 'hero', name: 'Ana Sayfa' },
    { id: 'about', name: 'Hakkımızda' },
    { id: 'interactive', name: '3D Simülatör' },
    { id: 'services', name: 'Hizmetlerimiz' },
    { id: 'reports', name: 'Baca Raporu' },
    { id: 'contact', name: 'İletişim' }
  ];

  const services = [
    { title: 'Apartman Bacası Temizleme', desc: 'Kat maliklerinin can ve mal güvenliği için apartman ve bina bacalarının periyodik temizliği ve kurum arındırması.', cat: 'baca' },
    { title: 'Havalandırma ve Yağlı Kanal Temizliği', desc: 'Lokanta, restaurant, otel ve yemekhane davlumbazları ile havalandırma kanallarında biriken yangın riski taşıyan yağların temizlenmesi.', cat: 'havalandirma' },
    { title: 'Restaurant ve Fırın Bacası Temizleme', desc: 'Yüksek ısıda çalışan fırın, ocakbaşı ve restaurant bacalarının karbon kalıntılarından mekanik fırçalarla temizlenmesi.', cat: 'baca' },
    { title: 'Doğalgaz ve Kombi Bacası Temizleme', desc: 'Doğalgaz yakıtlı merkezi sistem veya kombi bacalarının çekiş gücünü artıran karbonmonoksit sızıntısını önleyici temizlik.', cat: 'baca' },
    { title: 'Kazan ve Soba Bacası Temizleme', desc: 'Katı veya sıvı yakıtlı kalorifer kazanları ile soba bacalarının tıkanıklıklarının açılarak karbon salınımının azaltılması.', cat: 'baca' },
    { title: 'Şömine Temizliği ve Bakımı', desc: 'Odunlu veya doğalgazlı şömine haznelerinin temizliği, cam değişimi, fitil yenileme ve baca çekiş optimizasyonu.', cat: 'baca' },
    { title: 'İBB İtfaiye Yetkili Baca Raporu', desc: 'İş yeri açma ve çalışma ruhsatı başvurularında belediyelerce zorunlu tutulan İstanbul İtfaiyesi onaylı resmi rapor.', cat: 'rapor' },
    { title: 'İGDAŞ Baca Uygunluk Raporu', desc: 'Gaz açım ve gaz kullanım onaylarında İGDAŞ standartlarına uygunluk denetimi ve teknik uygunluk raporu tanzimi.', cat: 'rapor' },
    { title: 'Tıkalı Baca Açma Hizmeti', desc: 'Kuş yuvaları, harç kalıntıları veya yabancı maddeler nedeniyle tıkanan ve zehirlenme riski yaratan bacaların özel ekipmanla açılması.', cat: 'onarim' },
    { title: 'Baca Onarım ve Tadilatı', desc: 'Çatlayan, deforme olan veya sızdıran baca kanallarının çelik kılıf geçirme, sıva kaplama ve izolasyon işlemleri.', cat: 'onarim' },
    { title: 'Baca Rüzgar Gülü ve Teli Yapımı', desc: 'Rüzgarlı havalarda bacanın geri üflemesini engelleyen rüzgar gülü montajı ve kuşların yuva yapmasını önleyen tel kaplama.', cat: 'onarim' }
  ];

  const filteredServices = services.filter(
    s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
         s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen selection:bg-brand-accent selection:text-brand-bg">
      <div className="noise-overlay" />

      {/* 3D Animated Background */}
      <ChimneyClean3D 
        scrollProgress={scrollProgress}
        brushSpeed={brushSpeed}
        airDraft={airDraft}
        filterStatus={filterStatus}
      />

      {/* Header/Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
        <a href="#hero" className="flex items-center gap-2 text-brand-white font-outfit font-bold text-xl tracking-wider">
          <span className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center text-brand-bg font-black">ALP</span>
          <span>BACA <span className="text-brand-accent">TEMİZLEME</span></span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex gap-8 items-center">
          {navLinks.map(link => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`font-sans text-sm font-semibold tracking-wide uppercase transition-all duration-300 relative py-1 ${
                activeSection === link.id ? 'text-brand-accent' : 'text-brand-white/75 hover:text-brand-white'
              }`}
            >
              {link.name}
              {activeSection === link.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-accent"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </a>
          ))}
          <a
            href="tel:+905327674809"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-brand-accent bg-brand-accent text-brand-bg font-sans font-bold text-sm uppercase tracking-wider hover:shadow-[0_0_20px_rgba(255,90,0,0.4)] transition-all duration-300"
          >
            <FiPhone /> 0532 767 48 09
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-brand-white hover:text-brand-accent transition-colors"
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[68px] left-0 w-full h-auto glass-panel border-b border-white/5 py-8 px-6 z-40 flex flex-col gap-6 lg:hidden"
          >
            {navLinks.map(link => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-sans text-base font-semibold tracking-wide uppercase ${
                  activeSection === link.id ? 'text-brand-accent' : 'text-brand-white/80'
                }`}
              >
                {link.name}
              </a>
            ))}
            <a
              href="tel:+905327674809"
              className="w-full text-center py-3 rounded-xl bg-brand-accent text-brand-bg font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <FiPhone /> 0532 767 48 09
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Sections */}
      <main className="relative z-10 pt-20 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* HERO SECTION */}
        <section id="hero" className="min-h-[90vh] flex flex-col justify-center items-start pt-12 md:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-bold uppercase tracking-wider mb-6">
              <FiShield /> İBB İtfaiye Daire Başkanlığı Onaylı Yetkili Firma
            </div>
            <h1 className="font-outfit font-black text-4xl sm:text-6xl md:text-7xl leading-tight text-brand-white mb-6">
              İstanbul'un Güvenilir <br />
              <span className="text-clip-gradient bg-fluid-accent">Baca Temizleme Servisi</span>
            </h1>
            <p className="font-sans text-lg md:text-xl text-brand-white/70 leading-relaxed mb-8 max-w-2xl">
              1999'dan beri 25 yılı aşkın tecrübemiz ve İBB İtfaiye yetki belgemizle, apartmanlar, fırınlar, restaurant yağlı kanalları ve endüstriyel tesisler için profesyonel temizleme ve raporlama hizmetleri sunuyoruz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#interactive"
                className="px-8 py-4 rounded-xl bg-brand-accent text-brand-bg font-sans font-bold text-base uppercase tracking-wider hover:shadow-[0_0_30px_rgba(255,90,0,0.4)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                Hemen Keşfet <FiArrowDown className="animate-bounce" />
              </a>
              <a
                href="#contact"
                className="px-8 py-4 rounded-xl border border-white/10 hover:border-brand-accent hover:bg-brand-accent/5 transition-all duration-300 font-sans font-bold text-base uppercase tracking-wider text-center"
              >
                Ücretsiz Teklif Al
              </a>
            </div>
          </motion.div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-outfit font-black text-3xl sm:text-5xl text-brand-white mb-6 uppercase tracking-wide">
                Çeyrek Asırlık Güven <br />
                <span className="text-brand-accent text-glow-accent">Alp Baca Temizleme</span>
              </h2>
              <p className="font-sans text-brand-white/80 leading-relaxed mb-6">
                Firmamız kurulduğu <strong>03.05.1999</strong> tarihinden bu yana müşteri memnuniyetini temel ilke olarak benimseyerek önemli projelere imza atmaya devam etmektedir. Bizi işimizde lider yapan, hiçbir koşulda kaliteden ödün vermeden sürdürdüğümüz titiz çalışmalardır.
              </p>
              <p className="font-sans text-brand-white/70 leading-relaxed">
                Yangınların %20'sinin temizlenmeyen yağlı kanallardan ve tıkanmış bacalardan kaynaklandığı bilinciyle hareket ediyoruz. İstanbul genelinde, ruhsat başvurularınız için geçerli <strong>İtfaiye Yetkili Baca Raporunu</strong> hızlı ve yasal süreçlere tam uyumlu şekilde düzenliyoruz.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 blur-3xl rounded-full" />
              <h3 className="font-outfit font-bold text-xl text-brand-white mb-6 uppercase flex items-center gap-2">
                <FiZap className="text-brand-accent" /> Kalite Standartlarımız
              </h3>
              <ul className="space-y-4 font-sans text-brand-white/80">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2" />
                  <span><strong>Resmi İtfaiye Onayı:</strong> İBB İtfaiye Daire Başkanlığı tarafından verilen resmi Baca Temizleme Yetki Belgesine sahibiz.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2" />
                  <span><strong>Mekanik ve Kimyasal Temizlik:</strong> İleri teknoloji fırçalama makineleri ve çevre dostu yağ sökücü kimyasallar kullanıyoruz.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2" />
                  <span><strong>Zamanında Teslimat:</strong> İşletmenizin çalışma saatlerini engellemeyecek şekilde, gece veya sabah erken saat planlaması yapıyoruz.</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </section>

        {/* INTERACTIVE SIMULATOR SECTION */}
        <section id="interactive" className="py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-outfit font-black text-3xl sm:text-5xl text-brand-white mb-4 uppercase">
                BACA TEMİZLİK SİMÜLATÖRÜ
              </h2>
              <p className="font-sans text-brand-white/70 max-w-xl mx-auto">
                Arka plandaki 3D mekanik temizleme sistemini kontrol edin. Fırçalama hızını, çekiş gücünü ve filtre verimliliğini test edin.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-8 md:p-12 rounded-3xl border border-brand-accent/20 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-fluid-accent" />

              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <div>
                  <h3 className="font-outfit font-bold text-xl text-brand-white uppercase">Teknik Kontrol Odası</h3>
                  <p className="font-sans text-xs text-brand-white/50">Mekanik fırça devri ve çekiş debisi simülasyonu</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Brush Rotation Speed */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans font-semibold text-sm text-brand-white uppercase flex items-center gap-2">
                      <FiCpu className="text-brand-accent" /> Mekanik Fırça Dönüş Hızı
                    </span>
                    <span className="font-outfit font-bold text-brand-accent text-glow-accent">{brushSpeed}x Hız Çarpanı</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.2"
                    value={brushSpeed}
                    onChange={(e) => setBrushSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-brand-navy rounded-lg appearance-none cursor-pointer accent-brand-accent"
                  />
                  <div className="flex justify-between text-xs text-brand-white/30 mt-1">
                    <span>Yavaş Dönüş (0.2x)</span>
                    <span>Standart Temizlik (1.0x)</span>
                    <span>Yüksek Devirli Kazıma (3.0x)</span>
                  </div>
                </div>

                {/* Air Draft Power */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans font-semibold text-sm text-brand-white uppercase flex items-center gap-2">
                      <FiActivity className="text-brand-accent" /> Baca Çekiş Gücü (Draft Debisi)
                    </span>
                    <span className="font-outfit font-bold text-brand-accent text-glow-accent">{airDraft} Pa (Pascal)</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={airDraft}
                    onChange={(e) => setAirDraft(parseInt(e.target.value))}
                    className="w-full h-2 bg-brand-navy rounded-lg appearance-none cursor-pointer accent-brand-accent"
                  />
                  <div className="flex justify-between text-xs text-brand-white/30 mt-1">
                    <span>Zayıf Çekiş (10 Pa - Tıkalı)</span>
                    <span>İdeal Çekiş (50 Pa - Temiz)</span>
                    <span>Kuvvetli Çekiş (100 Pa - Maksimum)</span>
                  </div>
                </div>

                {/* Filter Cleanliness Status */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans font-semibold text-sm text-brand-white uppercase flex items-center gap-2">
                      <FiShield className="text-brand-accent" /> Baca Kurum ve Filtre Durumu
                    </span>
                    <span className="font-outfit font-bold text-brand-accent text-glow-accent">% {filterStatus} Temizlik</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(parseInt(e.target.value))}
                    className="w-full h-2 bg-brand-navy rounded-lg appearance-none cursor-pointer accent-brand-accent"
                  />
                  <div className="flex justify-between text-xs text-brand-white/30 mt-1">
                    <span>Aşırı Kurumlu (%20)</span>
                    <span>Düzenli Bakım (%80)</span>
                    <span>Sıfır Karbon Atığı (%100)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section id="services" className="py-24">
          <div className="text-center mb-16">
            <h2 className="font-outfit font-black text-3xl sm:text-5xl text-brand-white mb-4 uppercase">
              HİZMET YELPAZEMİZ
            </h2>
            <p className="font-sans text-brand-white/70 max-w-xl mx-auto mb-8">
              Binaların ısınma verimini artırmak ve yangın risklerini yok etmek amacıyla sunduğumuz tüm baca hizmetleri.
            </p>
            
            {/* Live Search Input */}
            <div className="max-w-md mx-auto relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hizmetlerde arayın... (Örn: Şömine, Yağlı Kanal)"
                className="w-full bg-brand-navy border border-white/10 rounded-full py-3.5 pl-12 pr-6 text-brand-white font-sans text-sm focus:border-brand-accent focus:outline-none transition-all duration-300"
              />
              <FiSearch className="absolute left-4 top-4 text-brand-white/40" size={18} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredServices.map((service, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -8 }}
                  className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between min-h-[280px]"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mb-6 font-bold font-outfit">
                      {index + 1}
                    </div>
                    <h3 className="font-outfit font-bold text-xl text-brand-white mb-3 uppercase">{service.title}</h3>
                    <p className="font-sans text-sm text-brand-white/70 leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                  <span className="font-outfit text-xs text-brand-accent font-semibold tracking-widest uppercase mt-4">
                    {service.cat === 'baca' ? 'Baca Hizmetleri' : service.cat === 'havalandirma' ? 'Kanal & Fan' : service.cat === 'rapor' ? 'Yasal Rapor' : 'Tadilat & Bakım'}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* REPORTS & CERTIFICATIONS SECTION */}
        <section id="reports" className="py-24">
          <div className="glass-panel p-8 md:p-16 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-accent/5 blur-[120px] rounded-full -z-10" />
            
            <div className="grid md:grid-cols-5 gap-12 items-center">
              <div className="md:col-span-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-semibold uppercase tracking-wider mb-6">
                  <FiFileText /> Ruhsat İşlemleri İçin Zorunlu Evraklar
                </div>
                <h2 className="font-outfit font-black text-3xl sm:text-5xl text-brand-white mb-6 uppercase leading-tight">
                  İtfaiye Yetkili <br />
                  <span className="text-brand-accent text-glow-accent">Baca Temizleme Raporu</span>
                </h2>
                <p className="font-sans text-brand-white/80 leading-relaxed mb-6">
                  Yeni iş yeri açma ruhsatı başvurularında, doğalgaz abonelik işlemlerinde veya periyodik denetimlerde belediyeler ve gaz dağıtım kuruluşları (İGDAŞ) İBB İtfaiye Daire Başkanlığı onaylı yetkili firmalardan alınmış baca raporunu şart koşmaktadır.
                </p>
                <p className="font-sans text-brand-white/70 leading-relaxed">
                  Alp Baca Temizleme olarak yörüngede test edilmiş temizlik standartlarımızla bacalarınızı temizliyor, gerekli testleri (sızdırmazlık, çekiş gücü ölçümü) yapıyor ve ruhsat başvurunuzda doğrudan kullanabileceğiniz <strong>Resmi İtfaiye Yetkili Baca Raporu</strong> belgesini aynı gün tanzim ediyoruz.
                </p>
              </div>
              
              <div className="md:col-span-2 space-y-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-brand-accent/15 flex items-center justify-center text-brand-accent shrink-0">
                    <FiShield size={24} />
                  </div>
                  <div>
                    <h4 className="font-outfit font-bold text-lg text-brand-white uppercase mb-1">Ruhsat Garantisi</h4>
                    <p className="font-sans text-sm text-brand-white/70 leading-relaxed">Düzenlediğimiz tüm raporlar İstanbul genelindeki 39 ilçe belediyesinde %100 geçerliliğe sahiptir.</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-brand-accent/15 flex items-center justify-center text-brand-accent shrink-0">
                    <FiFileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-outfit font-bold text-lg text-brand-white uppercase mb-1">İGDAŞ Akreditasyonu</h4>
                    <p className="font-sans text-sm text-brand-white/70 leading-relaxed">Doğalgazlı apartmanlar ve restaurant ocakları için İGDAŞ standartlarına tam uyumlu teknik rapor tanzimi.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="font-outfit font-black text-4xl sm:text-6xl text-brand-accent text-glow-accent mb-2">1999</h3>
              <p className="font-sans text-xs sm:text-sm uppercase tracking-wider text-brand-white/50">Kuruluş Yılımız</p>
            </div>
            <div>
              <h3 className="font-outfit font-black text-4xl sm:text-6xl text-brand-accent text-glow-accent mb-2">10k+</h3>
              <p className="font-sans text-xs sm:text-sm uppercase tracking-wider text-brand-white/50">Temizlenen Baca & Kanal</p>
            </div>
            <div>
              <h3 className="font-outfit font-black text-4xl sm:text-6xl text-brand-accent text-glow-accent mb-2">100%</h3>
              <p className="font-sans text-xs sm:text-sm uppercase tracking-wider text-brand-white/50">Ruhsat Geçerlilik Oranı</p>
            </div>
            <div>
              <h3 className="font-outfit font-black text-4xl sm:text-6xl text-brand-accent text-glow-accent mb-2">7/24</h3>
              <p className="font-sans text-xs sm:text-sm uppercase tracking-wider text-brand-white/50">Acil Keşif & Raporlama</p>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="py-24">
          <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-2">
              <h2 className="font-outfit font-black text-3xl sm:text-5xl text-brand-white mb-6 uppercase tracking-wide">
                Hemen Randevu <br />
                <span className="text-brand-accent text-glow-accent">ve Rapor Alın</span>
              </h2>
              <p className="font-sans text-brand-white/70 leading-relaxed mb-8">
                İstanbul'un tüm semtlerine gezici ekiplerimizle hizmet veriyoruz. Ücretsiz keşif talebi oluşturmak veya acil yetkili baca raporu almak için form doldurabilir ya da bizi arayabilirsiniz.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-accent">
                    <FiPhone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-white/50 font-medium">Bize Ulaşın (GSM)</p>
                    <a href="tel:+905327674809" className="text-brand-white hover:text-brand-accent transition-colors font-semibold text-lg">0532 767 48 09</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-accent">
                    <FiPhone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-white/50 font-medium">Sabit Telefonlar</p>
                    <a href="tel:+902122829394" className="text-brand-white hover:text-brand-accent transition-colors font-semibold">0212 282 93 94</a> / <a href="tel:+908503039394" className="text-brand-white hover:text-brand-accent transition-colors font-semibold">0850 303 93 94</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-accent">
                    <FiMail size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-white/50 font-medium">E-posta Adresi</p>
                    <a href="mailto:info@bacatemizleme.com" className="text-brand-white hover:text-brand-accent transition-colors font-semibold">info@bacatemizleme.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-accent shrink-0">
                    <FiMapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-white/50 font-medium">4. Levent Ofis (Beşiktaş)</p>
                    <span className="text-brand-white font-semibold text-sm">Konaklar Mah. Orgeneral İzzettin Aksalur Cad. No:29/B-1, Beşiktaş / İstanbul</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-accent shrink-0">
                    <FiMapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-white/50 font-medium">Şube (Kağıthane)</p>
                    <span className="text-brand-white font-semibold text-sm">Yeşilce Mah. Dalgıç Sok. No:25/8, Kağıthane / İstanbul</span>
                  </div>
                </div>
              </div>

              {/* Whatsapp */}
              <div className="mt-8">
                <a
                  href="https://wa.me/905327674809"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#25d366] text-white hover:bg-[#20ba5a] font-sans font-bold text-sm uppercase tracking-wider transition-colors shadow-lg"
                >
                  <FaWhatsapp size={20} /> WhatsApp Canlı Destek
                </a>
              </div>
            </div>

            {/* Secure Form Panel */}
            <div className="md:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-panel p-8 rounded-3xl border border-white/5"
              >
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Honeypot field (hidden from users) */}
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
                      <label className="block text-xs uppercase tracking-wider text-brand-white/60 mb-2 font-medium">Adınız Soyadınız *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-brand-navy border border-white/10 rounded-xl px-4 py-3.5 text-brand-white font-sans text-sm focus:border-brand-accent focus:outline-none transition-all duration-300"
                        placeholder="Örn: Burak Özkan"
                      />
                      {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-brand-white/60 mb-2 font-medium">E-posta Adresiniz *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-brand-navy border border-white/10 rounded-xl px-4 py-3.5 text-brand-white font-sans text-sm focus:border-brand-accent focus:outline-none transition-all duration-300"
                        placeholder="burak@sirketiniz.com"
                      />
                      {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-white/60 mb-2 font-medium">Konu *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full bg-brand-navy border border-white/10 rounded-xl px-4 py-3.5 text-brand-white font-sans text-sm focus:border-brand-accent focus:outline-none transition-all duration-300"
                      placeholder="Yağlı kanal temizliği, bina bacası raporu vb."
                    />
                    {formErrors.subject && <p className="text-red-400 text-xs mt-1">{formErrors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-brand-white/60 mb-2 font-medium">Mesajınız *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full bg-brand-navy border border-white/10 rounded-xl px-4 py-3.5 text-brand-white font-sans text-sm focus:border-brand-accent focus:outline-none transition-all duration-300 resize-none"
                      placeholder="Bacanızın/Kanalınızın durumu veya almak istediğiniz hizmetin detaylarını açıklayın."
                    />
                    {formErrors.message && <p className="text-red-400 text-xs mt-1">{formErrors.message}</p>}
                  </div>

                  {/* Math Captcha */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-brand-white/80 font-sans">
                      Güvenlik Kontrolü: <span className="font-bold text-brand-accent">{captcha.num1} + {captcha.num2} = ?</span>
                    </div>
                    <div className="flex gap-2 items-center w-full sm:w-auto">
                      <input
                        type="number"
                        value={userCaptcha}
                        onChange={(e) => setUserCaptcha(e.target.value)}
                        className="bg-brand-navy border border-white/10 rounded-xl px-4 py-2 text-brand-white font-sans text-sm focus:border-brand-accent focus:outline-none transition-all w-24 text-center"
                        placeholder="Sonuç"
                      />
                      <button
                        type="button"
                        onClick={generateCaptcha}
                        className="text-xs text-brand-accent underline hover:text-brand-accent-glow"
                      >
                        Yenile
                      </button>
                    </div>
                  </div>
                  {formErrors.captcha && <p className="text-red-400 text-xs mt-1">{formErrors.captcha}</p>}

                  <button
                    type="submit"
                    disabled={submitStatus === 'submitting'}
                    className="w-full py-4 rounded-xl bg-brand-accent text-brand-bg font-sans font-bold text-sm uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,90,0,0.3)] transition-all duration-300 disabled:opacity-50"
                  >
                    {submitStatus === 'submitting' ? 'Gönderiliyor...' : 'Randevu Formunu Gönder'}
                  </button>

                  {/* Feedback Message */}
                  {submitStatus === 'success' && (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
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
      <footer className="relative z-10 glass-panel border-t border-white/5 mt-20 py-8 px-6 md:px-12 text-center text-brand-white/40 font-sans text-xs">
        <p>© 2026 Alp Baca Temizleme Hizmetleri Ltd. Şti. Tüm Hakları Saklıdır.</p>
        <p className="mt-2 text-white/20">Bu sitenin kodları lisans korumalıdır. Yetkisiz kopyalanamaz.</p>
      </footer>
    </div>
  );
}
