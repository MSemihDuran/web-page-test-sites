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
  FiRadio
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import StellarOrbit3D from './components/StellarOrbit3D';

export default function App() {
  const [orbitSpeed, setOrbitSpeed] = useState(1);
  const [signalFreq, setSignalFreq] = useState(5);
  const [stationsCount, setStationsCount] = useState(4);
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
      setStatusMessage('Talebiniz başarıyla oluşturuldu! Uzay operasyonları koordinatörümüz sizinle en kısa sürede iletişime geçecektir.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setUserCaptcha('');
      generateCaptcha();
    }, 1500);
  };

  const navLinks = [
    { id: 'hero', name: 'Ana Sayfa' },
    { id: 'about', name: 'Hakkımızda' },
    { id: 'interactive', name: 'Görev Kontrol' },
    { id: 'solutions', name: 'Hizmetler' },
    { id: 'stats', name: 'Kapasite' },
    { id: 'contact', name: 'İletişim' }
  ];

  return (
    <div className="relative min-h-screen selection:bg-brand-accent selection:text-brand-bg">
      <div className="noise-overlay" />

      {/* 3D Animated Background */}
      <StellarOrbit3D 
        scrollProgress={scrollProgress}
        orbitSpeed={orbitSpeed}
        signalFreq={signalFreq}
        stationsCount={stationsCount}
      />

      {/* Header/Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
        <a href="#hero" className="flex items-center gap-2 text-brand-white font-outfit font-bold text-xl tracking-wider">
          <FiGlobe className="text-brand-accent animate-pulse" size={24} />
          <span>STELLAR <span className="text-brand-accent">ORBIT</span></span>
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
            Görev Başlat
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
              Görev Başlat
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
              <FiGlobe className="animate-bounce" /> Dünya Yörüngesinde Kesintisiz Bağlantı
            </div>
            <h1 className="font-outfit font-black text-4xl sm:text-6xl md:text-7xl leading-tight text-brand-white mb-6">
              Kozmik Lojistik <br />
              <span className="text-clip-gradient bg-fluid-accent">Global Bağlantı</span>
            </h1>
            <p className="font-sans text-lg md:text-xl text-brand-white/70 leading-relaxed mb-8 max-w-2xl">
              Alçak Dünya yörüngesindeki uyduların konuşlandırılması, veri akış yollarının lazer haberleşme sistemleriyle yönetimi ve kargo entegrasyonu alanında uçtan uca uzay operasyonları sağlıyoruz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#interactive"
                className="px-8 py-4 rounded-xl bg-brand-accent text-brand-bg font-sans font-bold text-base uppercase tracking-wider hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                Görev Kontrolü Aç <FiArrowDown className="animate-bounce" />
              </a>
              <a
                href="#about"
                className="px-8 py-4 rounded-xl border border-white/10 hover:border-brand-accent hover:bg-brand-accent/5 transition-all duration-300 font-sans font-bold text-base uppercase tracking-wider text-center"
              >
                Teknik Altyapı
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
                Uzay Taşımacılığı ve <br />
                <span className="text-brand-accent text-glow-accent">Yörünge Operasyonları</span>
              </h2>
              <p className="font-sans text-brand-white/80 leading-relaxed mb-6">
                Stellar Orbit, CubeSat ve nanosat uydularının roket yük yuvası entegrasyonundan, fırlatma sonrası yörünge yerleşim takibine kadar olan tüm süreçleri yönetir.
              </p>
              <p className="font-sans text-brand-white/70 leading-relaxed">
                Yapay zeka yönlendirmeli yer istasyonu ağımız, uydu takımyıldızlarının kendi aralarında oluşturduğu lazer link veri hatlarını optimize ederek kıtalararası gecikme süresini (latency) 12 milisaniyeye kadar düşürür.
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
                <FiCpu className="text-brand-accent" /> Operasyon Katmanları
              </h3>
              <ul className="space-y-4 font-sans text-brand-white/80">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2" />
                  <span><strong>Fırlatma Entegrasyonu:</strong> Uyduların standartlara uygun yük kapsüllerine güvenli montajı.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2" />
                  <span><strong>Takımyıldız Optimizasyonu:</strong> Uyduların yörüngedeki çarpışma risklerini önleyen otomatik kaçınma manevrası.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2" />
                  <span><strong>Lazer Downlink Ağı:</strong> Yer istasyonları ve uydular arasında yüksek bant genişliğinde veri indirme.</span>
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
                GÖREV KONTROL PANELİ
              </h2>
              <p className="font-sans text-brand-white/70 max-w-xl mx-auto">
                Arka plandaki 3D yörünge simülatörünü yönetin. Uyduların yörünge hızlarını, sinyal frekans aralığını ve etkin izleme istasyonu sayısını kontrol edin.
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
                  <h3 className="font-outfit font-bold text-xl text-brand-white uppercase">Görev Kontrol Konsolu</h3>
                  <p className="font-sans text-xs text-brand-white/50">Holografik yörünge ayarları ve veri bağlantısı</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Orbit Speed */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans font-semibold text-sm text-brand-white uppercase flex items-center gap-2">
                      <FiGlobe className="text-brand-accent" /> Uydu Yörünge Hızı (Hız Çarpanı)
                    </span>
                    <span className="font-outfit font-bold text-brand-accent text-glow-accent">{orbitSpeed}x Çarpan</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={orbitSpeed}
                    onChange={(e) => setOrbitSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-brand-navy rounded-lg appearance-none cursor-pointer accent-brand-accent"
                  />
                  <div className="flex justify-between text-xs text-brand-white/30 mt-1">
                    <span>Sabit Yörünge (0x)</span>
                    <span>Nominal Hız (1x)</span>
                    <span>Hiper Hız (5x)</span>
                  </div>
                </div>

                {/* Signal Frequency */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans font-semibold text-sm text-brand-white uppercase flex items-center gap-2">
                      <FiRadio className="text-brand-accent" /> Lazer Veri Aktarım Hızı
                    </span>
                    <span className="font-outfit font-bold text-brand-accent text-glow-accent">{signalFreq} GHz</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={signalFreq}
                    onChange={(e) => setSignalFreq(parseInt(e.target.value))}
                    className="w-full h-2 bg-brand-navy rounded-lg appearance-none cursor-pointer accent-brand-accent"
                  />
                  <div className="flex justify-between text-xs text-brand-white/30 mt-1">
                    <span>Düşük Bant Genişliği (1 GHz)</span>
                    <span>Optimum Bağlantı (5 GHz)</span>
                    <span>Maksimum Downlink (10 GHz)</span>
                  </div>
                </div>

                {/* Ground Stations Count */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans font-semibold text-sm text-brand-white uppercase flex items-center gap-2">
                      <FiActivity className="text-brand-accent" /> Etkin Yer İzleme İstasyonu
                    </span>
                    <span className="font-outfit font-bold text-brand-accent text-glow-accent">{stationsCount} İstasyon</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={stationsCount}
                    onChange={(e) => setStationsCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-brand-navy rounded-lg appearance-none cursor-pointer accent-brand-accent"
                  />
                  <div className="flex justify-between text-xs text-brand-white/30 mt-1">
                    <span>Kuzey Yarım Küre (1)</span>
                    <span>Ekvatoral Hat (4)</span>
                    <span>Global Kapsama (6)</span>
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
              HİZMET BİRİMLERİMİZ
            </h2>
            <p className="font-sans text-brand-white/70 max-w-xl mx-auto">
              Uzay pazarının tüm lojistik ve telekomünikasyon ihtiyaçlarına yönelik anahtar teslim çözümler.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -8 }}
              className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between h-[320px]"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mb-6">
                  <FiGlobe size={24} />
                </div>
                <h3 className="font-outfit font-bold text-xl text-brand-white mb-3 uppercase">Yörünge Yerleştirme</h3>
                <p className="font-sans text-sm text-brand-white/70 leading-relaxed">
                  Payload kapsüllerindeki uydularınızın, önceden planlanmış yörünge koordinatlarına hassas salınımı.
                </p>
              </div>
              <span className="font-outfit text-xs text-brand-accent font-semibold tracking-widest uppercase">Görev #1</span>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between h-[320px]"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mb-6">
                  <FiRadio size={24} />
                </div>
                <h3 className="font-outfit font-bold text-xl text-brand-white mb-3 uppercase">Lazer Haberleşme Ağı</h3>
                <p className="font-sans text-sm text-brand-white/70 leading-relaxed">
                  Uydular arası yüksek hızlı lazer link hatları kurarak yeryüzündeki fiber ağ yükünü hafifletiyoruz.
                </p>
              </div>
              <span className="font-outfit text-xs text-brand-accent font-semibold tracking-widest uppercase">Görev #2</span>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between h-[320px] sm:col-span-2 lg:col-span-1"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mb-6">
                  <FiZap size={24} />
                </div>
                <h3 className="font-outfit font-bold text-xl text-brand-white mb-3 uppercase">Telemetri ve Kontrol</h3>
                <p className="font-sans text-sm text-brand-white/70 leading-relaxed">
                  Merkezi yer istasyonu yazılımımızla uydularınızın pil seviyelerini ve güneş paneli durumunu anlık takip edin.
                </p>
              </div>
              <span className="font-outfit text-xs text-brand-accent font-semibold tracking-widest uppercase">Görev #3</span>
            </motion.div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section id="stats" className="py-24">
          <div className="glass-panel p-8 md:p-16 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-accent/5 blur-[120px] rounded-full -z-10" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <h3 className="font-outfit font-black text-4xl sm:text-6xl text-brand-accent text-glow-accent mb-2">12 ms</h3>
                <p className="font-sans text-xs sm:text-sm uppercase tracking-wider text-brand-white/50">Lazer Link Gecikmesi</p>
              </div>
              <div>
                <h3 className="font-outfit font-black text-4xl sm:text-6xl text-brand-accent text-glow-accent mb-2">480+</h3>
                <p className="font-sans text-xs sm:text-sm uppercase tracking-wider text-brand-white/50">Yörüngede Aktif Uydu</p>
              </div>
              <div>
                <h3 className="font-outfit font-black text-4xl sm:text-6xl text-brand-accent text-glow-accent mb-2">99.99%</h3>
                <p className="font-sans text-xs sm:text-sm uppercase tracking-wider text-brand-white/50">Lazer Sinyal Kararlılığı</p>
              </div>
              <div>
                <h3 className="font-outfit font-black text-4xl sm:text-6xl text-brand-accent text-glow-accent mb-2">84 adet</h3>
                <p className="font-sans text-xs sm:text-sm uppercase tracking-wider text-brand-white/50">Başarılı Fırlatma Entegrasyonu</p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="py-24">
          <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-2">
              <h2 className="font-outfit font-black text-3xl sm:text-5xl text-brand-white mb-6 uppercase tracking-wide">
                Yörüngedeki Yerinizi <br />
                <span className="text-brand-accent text-glow-accent">Hemen Alın</span>
              </h2>
              <p className="font-sans text-brand-white/70 leading-relaxed mb-8">
                Fırlatma rezervasyonu yaptırmak, CubeSat uydularınızı yörüngeye taşımak veya global yer istasyonu erişimi talep etmek için form doldurun.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-accent">
                    <FiPhone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-white/50 font-medium">Bize Ulaşın</p>
                    <a href="tel:+902120000000" className="text-brand-white hover:text-brand-accent transition-colors font-semibold">+90 (212) 777 90 90</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-accent">
                    <FiMail size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-white/50 font-medium">E-posta</p>
                    <a href="mailto:ops@stellarorbit.com" className="text-brand-white hover:text-brand-accent transition-colors font-semibold">ops@stellarorbit.com</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-accent">
                    <FiMapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-white/50 font-medium">Uzay Üssü & Merkez</p>
                    <span className="text-brand-white font-semibold">Teknopark İstanbul, Pendik / İstanbul</span>
                  </div>
                </div>
              </div>

              {/* Whatsapp */}
              <div className="mt-8">
                <a
                  href="https://wa.me/905557779090"
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
                        placeholder="Örn: Burak Kaya"
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
                      placeholder="CubeSat fırlatma, Lazer Link erişimi vb."
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
                      placeholder="Uydunuzun ağırlığını veya yörünge yüksekliği gereksinimlerinizi belirtin."
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
                    className="w-full py-4 rounded-xl bg-brand-accent text-brand-bg font-sans font-bold text-sm uppercase tracking-widest hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 disabled:opacity-50"
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
        <p>© 2026 Stellar Orbit Uzay Taşımacılığı ve Uydu Teknolojileri A.Ş. Tüm Hakları Saklıdır.</p>
        <p className="mt-2 text-white/20">Bu sitenin kodları lisans korumalıdır. Yetkisiz kopyalanamaz.</p>
      </footer>
    </div>
  );
}
