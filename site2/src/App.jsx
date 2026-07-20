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
  FiDroplet,
  FiEye,
  FiHeart
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import BioSyncTower3D from './components/BioSyncTower3D';

export default function App() {
  const [lightSpectrum, setLightSpectrum] = useState('full'); // 'full' | 'redblue' | 'uv'
  const [nutrientFlow, setNutrientFlow] = useState(50);
  const [humidity, setHumidity] = useState(60);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      const sections = ['hero', 'about', 'interactive', 'solutions', 'stats', 'contact'];
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
      setStatusMessage('Talebiniz başarıyla oluşturuldu! Tarım uzmanlarımız sizinle en kısa sürede iletişime geçecektir.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setUserCaptcha('');
      generateCaptcha();
    }, 1500);
  };

  const navLinks = [
    { id: 'hero', name: 'Ana Sayfa' },
    { id: 'about', name: 'Hakkımızda' },
    { id: 'interactive', name: 'Biyo-Kontrol' },
    { id: 'solutions', name: 'Çözümler' },
    { id: 'stats', name: 'Verimlilik' },
    { id: 'contact', name: 'İletişim' }
  ];

  return (
    <div className="relative min-h-screen selection:bg-brand-accent selection:text-brand-bg">
      <div className="noise-overlay" />

      {/* 3D Animated Background */}
      <BioSyncTower3D 
        scrollProgress={scrollProgress}
        lightSpectrum={lightSpectrum}
        nutrientFlow={nutrientFlow}
        humidity={humidity}
      />

      {/* Header/Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
        <a href="#hero" className="flex items-center gap-2 text-brand-white font-outfit font-bold text-xl tracking-wider">
          <FiHeart className="text-brand-accent animate-pulse" size={24} />
          <span>BIOSYNC <span className="text-brand-accent">LABS</span></span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 items-center">
          {navLinks.map(link => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`font-sans text-sm font-medium tracking-wide uppercase transition-all duration-300 relative py-1 ${
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
            href="#contact"
            className="px-5 py-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 hover:bg-brand-accent hover:text-brand-bg font-sans font-semibold text-sm uppercase tracking-wider transition-all duration-300"
          >
            Sistem Kurdur
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-brand-white hover:text-brand-accent transition-colors"
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
            className="fixed top-[68px] left-0 w-full h-auto glass-panel border-b border-white/5 py-8 px-6 z-40 flex flex-col gap-6 md:hidden"
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
              href="#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl border border-brand-accent bg-brand-accent/10 text-brand-accent font-semibold uppercase tracking-wider"
            >
              Sistem Kurdur
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-semibold uppercase tracking-wider mb-6">
              <FiDroplet className="animate-bounce" /> Yapay Zeka Denetimli Dikey Tarım
            </div>
            <h1 className="font-outfit font-black text-4xl sm:text-6xl md:text-7xl leading-tight text-brand-white mb-6">
              Doğayı Gelecekle <br />
              <span className="text-clip-gradient bg-fluid-accent">Eşzamanlıyoruz</span>
            </h1>
            <p className="font-sans text-lg md:text-xl text-brand-white/70 leading-relaxed mb-8 max-w-2xl">
              Geleneksel tarıma kıyasla %95 daha az su tüketen, 3D dijital izleme sensörleri ve robotik besin dağıtımı ile donatılmış yeni nesil dikey tarım kulelerini inşa ediyoruz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#interactive"
                className="px-8 py-4 rounded-xl bg-brand-accent text-brand-bg font-sans font-bold text-base uppercase tracking-wider hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                Kuleyi Yönet <FiArrowDown className="animate-bounce" />
              </a>
              <a
                href="#about"
                className="px-8 py-4 rounded-xl border border-white/10 hover:border-brand-accent hover:bg-brand-accent/5 transition-all duration-300 font-sans font-bold text-base uppercase tracking-wider text-center"
              >
                Keşfet
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
                Biyoteknoloji ve <br />
                <span className="text-brand-accent text-glow-accent">Hassas Tarım Çağı</span>
              </h2>
              <p className="font-sans text-brand-white/80 leading-relaxed mb-6">
                BioSync Labs dikey tarım modülleri, bitki fizyolojisine uygun ışık spektrumu yönetimi ve kök bölgesine besin solüsyonu taşıyan mikro jetlerle çalışır.
              </p>
              <p className="font-sans text-brand-white/70 leading-relaxed">
                Her bir büyütme tepsisinde yer alan spektral kameralar, bitkilerdeki yaprak alanı indeksini (LAI) ve klorofil aktivitesini 7/24 analiz eder. Böylece hastalıklar henüz yaprakta belirmeden teşhis edilir ve besin formülasyonu otomatik olarak güncellenir.
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
                <FiCpu className="text-brand-accent" /> Kule Otomasyon Katmanları
              </h3>
              <ul className="space-y-4 font-sans text-brand-white/80">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2" />
                  <span><strong>Fotosentez Spektrum Seçici:</strong> Bitkinin çeşidine ve evresine göre kırmızı-mavi veya UV ışık eşleme.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2" />
                  <span><strong>Kapalı Devre Su Geri Kazanımı:</strong> Bitki terlemesiyle salınan nemin yoğuşturularak sisteme geri kazandırılması.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2" />
                  <span><strong>Mobil Besin Kokteyli:</strong> Her kuleye özel mikro ve makro element dozajlama üniteleri.</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </section>

        {/* INTERACTIVE CONTROLS SECTION */}
        <section id="interactive" className="py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-outfit font-black text-3xl sm:text-5xl text-brand-white mb-4 uppercase">
                BİYO-KONTROL MERKEZİ
              </h2>
              <p className="font-sans text-brand-white/70 max-w-xl mx-auto">
                Arka plandaki 3D dikey tarım kulesini yönetin. Spektrum ışığını değiştirin, besin akış hızını ayarlayın ve ortam nemini düzenleyin.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-8 md:p-12 rounded-3xl border border-brand-accent/20 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-fluid-accent" />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-white/5 pb-6">
                <div>
                  <h3 className="font-outfit font-bold text-xl text-brand-white uppercase">Kule Telemetri Paneli</h3>
                  <p className="font-sans text-xs text-brand-white/50">Hassas spektrum kontrolü ve IoT ayarları</p>
                </div>
                
                {/* Light Spectrum Selector */}
                <div className="flex gap-2">
                  {['full', 'redblue', 'uv'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setLightSpectrum(mode)}
                      className={`px-4 py-2 rounded-lg font-sans font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                        lightSpectrum === mode
                          ? 'bg-brand-accent text-brand-bg hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'border border-white/10 text-brand-white hover:border-brand-accent'
                      }`}
                    >
                      {mode === 'full' ? 'Tam Işık' : mode === 'redblue' ? 'Kızıl-Mavi' : 'Gelişmiş UV'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                {/* Nutrient Flow */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans font-semibold text-sm text-brand-white uppercase flex items-center gap-2">
                      <FiActivity className="text-brand-accent" /> Besin Solüsyon Akış Hızı
                    </span>
                    <span className="font-outfit font-bold text-brand-accent text-glow-accent">{nutrientFlow} ml/dk</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={nutrientFlow}
                    onChange={(e) => setNutrientFlow(parseInt(e.target.value))}
                    className="w-full h-2 bg-brand-navy rounded-lg appearance-none cursor-pointer accent-brand-accent"
                  />
                  <div className="flex justify-between text-xs text-brand-white/30 mt-1">
                    <span>Minimum Denge (10 ml/dk)</span>
                    <span>Nominal Akış (50 ml/dk)</span>
                    <span>Maksimum Besleme (100 ml/dk)</span>
                  </div>
                </div>

                {/* Humidity */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans font-semibold text-sm text-brand-white uppercase flex items-center gap-2">
                      <FiDroplet className="text-brand-accent" /> Odacık Bağıl Nem Seviyesi
                    </span>
                    <span className="font-outfit font-bold text-brand-accent text-glow-accent">% {humidity} RH</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    value={humidity}
                    onChange={(e) => setHumidity(parseInt(e.target.value))}
                    className="w-full h-2 bg-brand-navy rounded-lg appearance-none cursor-pointer accent-brand-accent"
                  />
                  <div className="flex justify-between text-xs text-brand-white/30 mt-1">
                    <span>Kuru Yaprak (%30)</span>
                    <span>İdeal Sera (%60)</span>
                    <span>Yoğun Sis (%90)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SOLUTIONS SECTION */}
        <section id="solutions" className="py-24">
          <div className="text-center mb-16">
            <h2 className="font-outfit font-black text-3xl sm:text-5xl text-brand-white mb-4 uppercase">
              DİKEY TARIM MÜHENDİSLİĞİ
            </h2>
            <p className="font-sans text-brand-white/70 max-w-xl mx-auto">
              Kent merkezlerinde, endüstriyel hangarlarda sürdürülebilir gıda tedarik sistemleri kuruyoruz.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -8 }}
              className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between h-[320px]"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mb-6">
                  <FiDroplet size={24} />
                </div>
                <h3 className="font-outfit font-bold text-xl text-brand-white mb-3 uppercase">Otomasyonlu Su Geri Kazanımı</h3>
                <p className="font-sans text-sm text-brand-white/70 leading-relaxed">
                  Kapalı devre evaporasyon yoğuşturucu sistemimiz ile su tüketimini sıfıra yakın seviyeye indirgiyoruz.
                </p>
              </div>
              <span className="font-outfit text-xs text-brand-accent font-semibold tracking-widest uppercase">Çözüm #1</span>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between h-[320px]"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mb-6">
                  <FiCpu size={24} />
                </div>
                <h3 className="font-outfit font-bold text-xl text-brand-white mb-3 uppercase">AI Klorofil Takip Kameraları</h3>
                <p className="font-sans text-sm text-brand-white/70 leading-relaxed">
                  Derin öğrenme algoritmalarıyla yapraktaki klorofil emilimini ölçerek bitki sağlığını anında raporlama.
                </p>
              </div>
              <span className="font-outfit text-xs text-brand-accent font-semibold tracking-widest uppercase">Çözüm #2</span>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between h-[320px] sm:col-span-2 lg:col-span-1"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mb-6">
                  <FiEye size={24} />
                </div>
                <h3 className="font-outfit font-bold text-xl text-brand-white mb-3 uppercase">Modüler Büyütme Kuleleri</h3>
                <p className="font-sans text-sm text-brand-white/70 leading-relaxed">
                  Tavan yüksekliğine göre üst üste eklenebilen dikey mimarimizle metrekare başına verimliliği 12 kat artırın.
                </p>
              </div>
              <span className="font-outfit text-xs text-brand-accent font-semibold tracking-widest uppercase">Çözüm #3</span>
            </motion.div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section id="stats" className="py-24">
          <div className="glass-panel p-8 md:p-16 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-accent/5 blur-[120px] rounded-full -z-10" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <h3 className="font-outfit font-black text-4xl sm:text-6xl text-brand-accent text-glow-accent mb-2">%95</h3>
                <p className="font-sans text-xs sm:text-sm uppercase tracking-wider text-brand-white/50">Daha Az Su Sarfiyatı</p>
              </div>
              <div>
                <h3 className="font-outfit font-black text-4xl sm:text-6xl text-brand-accent text-glow-accent mb-2">365 Gün</h3>
                <p className="font-sans text-xs sm:text-sm uppercase tracking-wider text-brand-white/50">Mevsimden Bağımsız Üretim</p>
              </div>
              <div>
                <h3 className="font-outfit font-black text-4xl sm:text-6xl text-brand-accent text-glow-accent mb-2">2.5 Kat</h3>
                <p className="font-sans text-xs sm:text-sm uppercase tracking-wider text-brand-white/50">Daha Hızlı Hasat Döngüsü</p>
              </div>
              <div>
                <h3 className="font-outfit font-black text-4xl sm:text-6xl text-brand-accent text-glow-accent mb-2">0 Adet</h3>
                <p className="font-sans text-xs sm:text-sm uppercase tracking-wider text-brand-white/50">Kimyasal Tarım İlacı (Pestisit)</p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="py-24">
          <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-2">
              <h2 className="font-outfit font-black text-3xl sm:text-5xl text-brand-white mb-6 uppercase tracking-wide">
                Gıda Devrimini <br />
                <span className="text-brand-accent text-glow-accent">Bugün Başlatın</span>
              </h2>
              <p className="font-sans text-brand-white/70 leading-relaxed mb-8">
                Tesisinizde dikey tarım modülleri kurmak, spektral LED aydınlatmalarımızı incelemek veya fizibilite raporu talep etmek için form doldurun.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-accent">
                    <FiPhone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-white/50 font-medium">Bize Ulaşın</p>
                    <a href="tel:+902160000000" className="text-brand-white hover:text-brand-accent transition-colors font-semibold">+90 (216) 444 80 80</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-accent">
                    <FiMail size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-white/50 font-medium">E-posta</p>
                    <a href="mailto:info@biosynclabs.com" className="text-brand-white hover:text-brand-accent transition-colors font-semibold">info@biosynclabs.com</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-accent">
                    <FiMapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-white/50 font-medium">Laboratuvar & Merkez</p>
                    <span className="text-brand-white font-semibold">Yıldız Teknopark, Davutpaşa / İstanbul</span>
                  </div>
                </div>
              </div>

              {/* Whatsapp */}
              <div className="mt-8">
                <a
                  href="https://wa.me/905558080808"
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
                        placeholder="Örn: Mehmet Öz"
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
                        placeholder="mehmet@sirketiniz.com"
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
                      placeholder="Dikey tarım kulesi kurulumu, LED siparişi vb."
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
                      placeholder="Hangar alanınızı veya hedeflediğiniz aylık hasat miktarını açıklayın."
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
                    className="w-full py-4 rounded-xl bg-brand-accent text-brand-bg font-sans font-bold text-sm uppercase tracking-widest hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 disabled:opacity-50"
                  >
                    {submitStatus === 'submitting' ? 'Gönderiliyor...' : 'Teklif Formunu Gönder'}
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
        <p>© 2026 BioSync Labs Teknolojik Tarım Sistemleri A.Ş. Tüm Hakları Saklıdır.</p>
        <p className="mt-2 text-white/20">Bu sitenin kodları lisans korumalıdır. Yetkisiz kopyalanamaz.</p>
      </footer>
    </div>
  );
}
