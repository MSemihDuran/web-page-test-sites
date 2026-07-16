import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCpu, 
  FiZap, 
  FiCheckCircle, 
  FiSliders, 
  FiMail, 
  FiArrowDown, 
  FiActivity, 
  FiPlay, 
  FiPause,
  FiPhone,
  FiMapPin
} from 'react-icons/fi';
import WeavingLoom3D from './components/WeavingLoom3D';

export default function App() {
  // Loom interactive state
  const [isPlaying, setIsPlaying] = useState(true);
  const [rpm, setRpm] = useState(180);
  const [warpColor, setWarpColor] = useState('#c5a059'); // Gold default
  const [weftColor, setWeftColor] = useState('#f4d08b'); // Glow Gold default
  const [pattern, setPattern] = useState('plain');

  // Scroll tracking state
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');

  // Monitor scroll height and update progress
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const progress = window.scrollY / totalHeight;
            setScrollProgress(progress);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver to spy on active sections for navigation menu
  useEffect(() => {
    const sections = ['hero', 'about', 'tech', 'speed', 'quality', 'lab', 'contact'];
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px', // Triggers when section occupies the active middle band of the screen
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Fallback when scrolled to the very top
    const handleScrollTop = () => {
      if (window.scrollY < 120) {
        setActiveSection('hero');
      }
    };
    window.addEventListener('scroll', handleScrollTop);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScrollTop);
    };
  }, []);

  // Quick navigation handler
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Color options definitions
  const warpOptions = [
    { name: 'Altın', value: '#c5a059' },
    { name: 'Kuvars Mavi', value: '#00f2fe' },
    { name: 'Mercan', value: '#ff416c' },
    { name: 'Gümüş', value: '#e2e8f0' }
  ];

  const weftOptions = [
    { name: 'Parıltılı Altın', value: '#f4d08b' },
    { name: 'Eflatun', value: '#ff007f' },
    { name: 'Zümrüt', value: '#00f5d4' },
    { name: 'İnci Beyazı', value: '#ffffff' }
  ];

  return (
    <div className="min-h-screen text-brand-white relative">
      {/* Noise background for premium analog feel */}
      <div className="noise-overlay" />

      {/* Floating interactive 3D WebGL Canvas in background */}
      <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
        {/* Shadow overlays to create depth and mask Three.js boundaries */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-bg via-transparent to-brand-bg pointer-events-none z-10 opacity-70" />
        <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-brand-bg to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-brand-bg to-transparent pointer-events-none z-10" />
        
        {/* Three.js canvas element wrapper */}
        <WeavingLoom3D 
          scrollProgress={scrollProgress} 
          rpm={isPlaying ? rpm : 0} 
          warpColor={warpColor}
          weftColor={weftColor}
          pattern={pattern}
        />
      </div>

      {/* PREMIUM HEADER */}
      <motion.header 
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-brand-bg/30 border border-white/[0.05] backdrop-blur-xl rounded-full py-2.5 px-6 z-50 flex justify-between items-center shadow-[0_20px_50px_rgba(4,5,13,0.9)]"
      >
        <span 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="font-outfit font-extrabold text-lg tracking-wider text-white flex items-center gap-3 cursor-pointer group"
        >
          {/* logo.png cropped and enlarged to w-12 h-12, vertically shifted slightly down (top-[53.5%]) to compensate for asset asymmetry */}
          <div className="relative w-12 h-12 overflow-hidden flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Burak Tekstil Logo" 
              className="w-[155px] h-[155px] max-w-none absolute left-1/2 top-[53.5%] -translate-x-1/2 -translate-y-1/2 object-contain transition-transform duration-500 group-hover:scale-[1.08]" 
            />
          </div>
          <span className="hidden sm:inline font-syne text-glow-white ml-1 text-base tracking-wide">
            BURAK <span className="text-brand-gold">TEKSTİL</span>
          </span>
        </span>

        {/* Spaced navigation links for a wider, more breathable menu layout */}
        <nav className="hidden md:flex gap-2.5 px-2.5 py-1.5 items-center text-xxs font-extrabold uppercase tracking-widest bg-black/45 border border-white/[0.04] rounded-full backdrop-blur-md">
          {[
            { id: 'hero', label: 'Ana Sayfa' },
            { id: 'about', label: 'Neden Biz?' },
            { id: 'tech', label: 'Hassasiyet' },
            { id: 'speed', label: 'Hız' },
            { id: 'quality', label: 'Kalite' },
            { id: 'lab', label: 'Laboratuvar' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => scrollToSection(item.id)} 
              className={`relative py-2 px-3.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeSection === item.id 
                  ? 'text-white text-glow-white font-black' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {activeSection === item.id && (
                <motion.div
                  layoutId="activeNavBubble"
                  className="absolute inset-0 rounded-full bg-brand-gold/15 border border-brand-gold/50 shadow-[0_0_12px_rgba(197,160,89,0.3)] backdrop-blur-md"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                >
                  {/* Liquid gloss reflection */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/[0.02] to-white/[0.12] opacity-70 pointer-events-none" />
                </motion.div>
              )}
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Active Loom State Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-navy/60 border border-brand-gold/20 text-xxs font-mono text-slate-200">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            TEZGAH: {isPlaying ? `${rpm} RPM` : 'DURDURULDU'}
          </div>
          <button 
            onClick={() => scrollToSection('contact')}
            className="bg-brand-gold hover:bg-brand-gold-glow text-brand-bg font-extrabold text-xxs tracking-widest uppercase py-2 px-5 rounded-full transition-all duration-300 shadow-[0_4px_15px_rgba(197,160,89,0.25)] hover:shadow-[0_4px_25px_rgba(197,160,89,0.45)] hover:scale-105"
          >
            TEKLİF AL
          </button>
        </div>
      </motion.header>

      {/* OVERLAY CONTENT AREA */}
      <main className="relative z-10">

        {/* 1. HERO SECTION */}
        <section id="hero" className="min-h-screen flex flex-col justify-center items-center px-6 relative pt-20 pb-32">
          <div className="max-w-4xl text-center flex flex-col items-center">
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 relative group cursor-pointer"
              onClick={() => scrollToSection('about')}
            >
              <div className="absolute inset-0 bg-brand-gold/15 rounded-3xl blur-2xl group-hover:bg-brand-gold/25 transition-all duration-500" />
              {/* Rounded square container with logo centered precisely (top-[54.5%] compensates for the asset's empty bottom padding) */}
              <div className="relative w-28 h-28 rounded-3xl bg-brand-navy/30 flex items-center justify-center border border-brand-gold/30 shadow-[0_15px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="Burak Tekstil Logo" 
                  className="w-[340px] h-[340px] max-w-none absolute left-1/2 top-[54.5%] -translate-x-1/2 -translate-y-1/2 object-contain transition-transform duration-500 group-hover:scale-[1.08]" 
                />
              </div>
            </motion.div>

            <motion.span 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-slate-300 font-outfit text-xxs font-semibold tracking-widest uppercase mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping" />
              Tam Entegre Endüstriyel Dokuma
            </motion.span>

            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-3xl sm:text-5xl md:text-7xl font-syne font-extrabold text-white leading-tight tracking-tight text-glow-white"
            >
              İplikten Kumaşa <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-gold via-brand-gold-glow to-white text-glow-gold">
                Kusursuz Dönüşüm
              </span>
            </motion.h1>

            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-slate-300 text-sm md:text-base text-center max-w-2xl mt-6 leading-relaxed"
            >
              Çözgü sarımından dokumaya kadar tüm süreç tek çatı altında. Lojistik yükünü ortadan kaldıran tam entegre parkurumuzla, fason dokumada sıfır hata standardını yaşayın.
            </motion.p>

            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="flex gap-4 mt-10"
            >
              <button 
                onClick={() => scrollToSection('tech')}
                className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-glow text-brand-bg font-extrabold text-xxs tracking-widest uppercase py-3.5 px-7 rounded-full shadow-[0_10px_25px_rgba(197,160,89,0.2)] hover:scale-105 transition-all duration-300"
              >
                Keşfet
              </button>
              <button 
                onClick={() => scrollToSection('lab')}
                className="border border-white/10 hover:border-brand-gold/30 bg-white/[0.02] text-white font-extrabold text-xxs tracking-widest uppercase py-3.5 px-7 rounded-full hover:scale-105 transition-all duration-300"
              >
                Simülatör
              </button>
            </motion.div>
          </div>

          {/* Mouse down scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center text-slate-400 text-xxs tracking-widest font-mono flex flex-col items-center gap-2">
            <span>AŞAĞI KAYDIRIN</span>
            <motion.div 
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-5 h-5 flex items-center justify-center"
            >
              <FiArrowDown />
            </motion.div>
          </div>
        </section>

        {/* 2. ABOUT / VALUE PROPS (Neden Biz) */}
        <section id="about" className="min-h-screen flex items-center px-6 md:px-20 py-24">
          <div className="max-w-xl text-left">
            <span className="text-brand-gold font-mono text-xxs tracking-widest uppercase font-bold">01 / ENTEGRASYON</span>
            <h2 className="text-3xl md:text-5xl font-syne font-bold text-white mt-3 leading-tight">Tek Çatı, Sıfır Risk.</h2>
            <p className="text-slate-300 text-sm mt-5 leading-relaxed">
              İpliklerinizi dışarıdaki çözgücü firmalara taşımak zorunda kalmazsınız. Çözgü hazırlık makinemiz kendi bünyemizde olduğu için, hammaddeleriniz fabrikamıza girdiği andan itibaren sevk riski ve ek nakliye maliyetlerinden arınmış şekilde güvenceye alınır.
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold shrink-0 mt-0.5">
                  <FiCheckCircle />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Sıfır Nakliye Firesi</h4>
                  <p className="text-slate-400 text-xs mt-1">İplik bobinleri taşınırken zarar görmez, neme ve darbelere maruz kalmaz.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold shrink-0 mt-0.5">
                  <FiCheckCircle />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Hızlı Reaksiyon Süresi</h4>
                  <p className="text-slate-400 text-xs mt-1">Desende veya çözgüde yapılacak değişiklikler anında tezgahlarımıza aktarılır.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. PRECISION TECHNOLOGY SECTION (Tech / Shedding) */}
        <section id="tech" className="min-h-screen flex items-center justify-end px-6 md:px-20 py-24">
          <div className="max-w-xl text-left">
            <span className="text-brand-gold font-mono text-xxs tracking-widest uppercase font-bold">02 / HASSASİYET</span>
            <h2 className="text-3xl md:text-5xl font-syne font-bold text-white mt-3 leading-tight">Gücünün Sanatı</h2>
            <p className="text-slate-300 text-sm mt-5 leading-relaxed">
              Arka planda gördüğünüz 3D gücü çerçeveleri (heald frames), iplikleri milimetrik bir açı ve yüksek hızda birbirinden ayırır. Ağızlık açma (shedding) esnasında iplik gerginlikleri anlık olarak elektronik sensörlerce denetlenerek aşınma ve kopmalar sıfıra indirgenir.
            </p>
            <div className="mt-8 p-5 rounded-2xl glass-panel-gold flex items-center gap-4">
              <div className="text-brand-gold text-2xl"><FiCpu /></div>
              <p className="text-slate-200 text-xs leading-relaxed">
                <strong className="text-white block mb-0.5">Elektronik Armür Mekanizması</strong>
                Dokunacak kumaşın desenine bağlı olarak binlerce çözgü ipliğini sıfır hata toleransıyla yukarı ve aşağı konumlandırır.
              </p>
            </div>
          </div>
        </section>

        {/* 4. HIGH SPEED SHUTTLE SECTION (Speed / Shuttle) */}
        <section id="speed" className="min-h-screen flex items-center px-6 md:px-20 py-24">
          <div className="max-w-xl text-left">
            <span className="text-brand-gold font-mono text-xxs tracking-widest uppercase font-bold">03 / VERİMLİLİK</span>
            <h2 className="text-3xl md:text-5xl font-syne font-bold text-white mt-3 leading-tight">Yüksek Hızlı Atkı Atımı</h2>
            <p className="text-slate-300 text-sm mt-5 leading-relaxed">
              Mekik (veya rapier kancalar) açılan ağızlıktan saniyeler içinde geçerek atkı ipliğini karşıdan karşıya taşır. Parkurumuzdaki yüksek devirli tezgahlarda, atkı atımı dinamik hava jetleri ve kancalar yardımıyla kusursuz bir ritimle tekrarlanır.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-brand-navy/35 border border-white/[0.05]">
                <span className="text-2xl font-bold font-syne text-brand-gold">100%</span>
                <p className="text-slate-400 text-xxs uppercase tracking-wider mt-1 font-mono">Gerginlik Takibi</p>
              </div>
              <div className="p-4 rounded-xl bg-brand-navy/35 border border-white/[0.05]">
                <span className="text-2xl font-bold font-syne text-brand-gold">480+</span>
                <p className="text-slate-400 text-xxs uppercase tracking-wider mt-1 font-mono">Max RPM Kapasitesi</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. QUALITY CONTROL SECTION (Quality / Roller) */}
        <section id="quality" className="min-h-screen flex items-center justify-end px-6 md:px-20 py-24">
          <div className="max-w-xl text-left">
            <span className="text-brand-gold font-mono text-xxs tracking-widest uppercase font-bold">04 / KALİTE</span>
            <h2 className="text-3xl md:text-5xl font-syne font-bold text-white mt-3 leading-tight">Kumaşın Yolculuğu</h2>
            <p className="text-slate-300 text-sm mt-5 leading-relaxed">
              Taraklama işleminden geçen her sıra iplik, kumaş silindirine pürüzsüzce sarılır. Sarım aşamasında uygulanan homojen gerginlik, kumaşın eninde ve boyunda dalgalanmaları önler. Son aşamada ise kumaşlar muayene ışıkları altında titizlikle kalite kontrolünden geçirilir.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <FiCheckCircle className="text-emerald-400 text-xl" />
              <span className="text-slate-200 text-xs font-semibold">Tüm parti kodlarında 1. sınıf dokuma sertifikasyonu</span>
            </div>
          </div>
        </section>

        {/* 6. INTERACTIVE LAB SECTION (Lab / Simulator) */}
        <section id="lab" className="min-h-screen flex flex-col justify-center px-6 md:px-20 py-24 relative">
          <div className="max-w-4xl mx-auto w-full grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Left informational panel */}
            <div className="lg:col-span-5 text-left">
              <span className="text-brand-gold font-mono text-xxs tracking-widest uppercase font-bold">05 / SİMÜLASYON</span>
              <h2 className="text-3xl md:text-5xl font-syne font-bold text-white mt-3 leading-tight">Tezgahı Kontrol Edin</h2>
              <p className="text-slate-300 text-xs mt-4 leading-relaxed">
                Dokuma simülatörümüz ile tezgah ayarlarına müdahale edin. 3D sahnede iplik desenlerini (Örgü Tipi) değiştirin, hızı artırıp azaltarak mekanik parçaların dinamik tepkilerini anlık olarak gözlemleyin.
              </p>
              
              <div className="mt-6 p-4 rounded-xl bg-brand-navy/20 border border-brand-gold/10 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300">Simülasyon Durumu:</span>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xxs font-extrabold uppercase tracking-wider transition-all duration-300 ${
                    isPlaying 
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                      : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <FiPause /> DURAKLAT
                    </>
                  ) : (
                    <>
                      <FiPlay /> ÇALIŞTIR
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right configuration dashboard */}
            <div className="lg:col-span-7 p-6 md:p-8 rounded-3xl glass-panel relative">
              <div className="absolute top-4 right-6 text-brand-gold text-xl opacity-60">
                <FiSliders />
              </div>
              <h3 className="text-lg font-outfit font-extrabold text-white mb-6 flex items-center gap-2">
                Simülasyon Ayarları
              </h3>

              <div className="space-y-6">
                {/* 1. SPEED CONTROL (RPM) */}
                <div>
                  <div className="flex justify-between items-center text-xs font-mono text-slate-300 mb-2">
                    <span>Dokuma Hızı (RPM)</span>
                    <span className="text-brand-gold font-bold">{rpm} RPM</span>
                  </div>
                  <input 
                    type="range" 
                    min="60" 
                    max="480" 
                    step="30"
                    value={rpm}
                    onChange={(e) => setRpm(Number(e.target.value))}
                    disabled={!isPlaying}
                    className="w-full h-1.5 bg-brand-navy rounded-lg appearance-none cursor-pointer accent-brand-gold disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                  <div className="flex justify-between text-xxs text-slate-500 mt-1 font-mono">
                    <span>60 (Yavaş Ritim)</span>
                    <span>240 (Standart)</span>
                    <span>480 (Yüksek Hız)</span>
                  </div>
                </div>

                {/* 2. WEAVING PATTERN (Örgü Tipi) */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-2">
                    Örgü Tipi (Örüntü)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'plain', label: 'Düz (Bezayağı)', desc: '1/1 Klasik' },
                      { id: 'twill', label: 'Dimi (Gabardin)', desc: '2/2 Çapraz' },
                      { id: 'satin', label: 'Saten (Atlas)', desc: 'Lüks Pürüzsüz' }
                    ].map((pat) => (
                      <button
                        key={pat.id}
                        onClick={() => setPattern(pat.id)}
                        className={`p-3 rounded-xl border text-center transition-all duration-300 flex flex-col justify-center items-center ${
                          pattern === pat.id
                            ? 'bg-brand-gold/15 border-brand-gold text-white font-semibold'
                            : 'bg-white/[0.01] border-white/[0.05] text-slate-400 hover:bg-white/[0.03] hover:border-white/10'
                        }`}
                      >
                        <span className="text-xs">{pat.label}</span>
                        <span className="text-xxs opacity-60 mt-0.5">{pat.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. THREAD COLORS */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Warp Color */}
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-2">
                      Çözgü Rengi
                    </label>
                    <div className="flex gap-2">
                      {warpOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setWarpColor(opt.value)}
                          title={opt.name}
                          className={`w-6 h-6 rounded-full border transition-transform duration-200 hover:scale-110 ${
                            warpColor === opt.value ? 'border-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: opt.value }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Weft Color */}
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-2">
                      Atkı Rengi
                    </label>
                    <div className="flex gap-2">
                      {weftOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setWeftColor(opt.value)}
                          title={opt.name}
                          className={`w-6 h-6 rounded-full border transition-transform duration-200 hover:scale-110 ${
                            weftColor === opt.value ? 'border-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: opt.value }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* 7. CONTACT SECTION */}
        <section id="contact" className="min-h-screen flex items-center justify-center px-6 py-24">
          <div className="max-w-4xl w-full grid md:grid-cols-12 gap-8 items-stretch">
            
            {/* Info Panel */}
            <div className="md:col-span-5 p-8 rounded-3xl glass-panel-gold border border-brand-gold/10 flex flex-col justify-between">
              <div>
                <span className="text-brand-gold font-mono text-xxs tracking-widest uppercase font-bold">İLETİŞİM</span>
                <h2 className="text-2xl md:text-3xl font-syne font-bold text-white mt-3">İpliğinizi Sanata Dönüştürün</h2>
                <p className="text-slate-300 text-xs mt-4 leading-relaxed">
                  Kabiliyetlerimizi yerinde görmek ve fason dokuma kapasitemiz hakkında bilgi almak için bizimle iletişime geçin. Siz sadece ipliğinizi getirin, kumaşı birlikte şekillendirelim.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <FiPhone className="text-brand-gold text-sm shrink-0" />
                  <span>+90 (212) 555 44 33</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <FiMail className="text-brand-gold text-sm shrink-0" />
                  <span>bilgi@buraktekstil.com</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <FiMapPin className="text-brand-gold text-sm shrink-0 mt-0.5" />
                  <span>Organize Sanayi Bölgesi, 4. Cadde No:12, İstanbul, Türkiye</span>
                </div>
              </div>
            </div>

            {/* Form Panel */}
            <div className="md:col-span-7 p-8 rounded-3xl glass-panel relative flex flex-col justify-center">
              <h3 className="text-lg font-outfit font-extrabold text-white mb-6">Hızlı İletişim Formu</h3>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xxs font-mono uppercase tracking-wider text-slate-400 mb-1">ADINIZ</label>
                    <input 
                      type="text" 
                      placeholder="Burak Bey" 
                      className="w-full bg-brand-navy/35 border border-white/[0.05] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-mono uppercase tracking-wider text-slate-400 mb-1">E-POSTA</label>
                    <input 
                      type="email" 
                      placeholder="ad@firma.com" 
                      className="w-full bg-brand-navy/35 border border-white/[0.05] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xxs font-mono uppercase tracking-wider text-slate-400 mb-1">KONU</label>
                  <input 
                    type="text" 
                    placeholder="Fason Dokuma Talebi" 
                    className="w-full bg-brand-navy/35 border border-white/[0.05] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-mono uppercase tracking-wider text-slate-400 mb-1">MESAJINIZ</label>
                  <textarea 
                    rows="3" 
                    placeholder="İplik cinsi, talep edilen örgü stili ve metraj bilgisi girebilirsiniz..."
                    className="w-full bg-brand-navy/35 border border-white/[0.05] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/50 transition-colors resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-fluid-gold text-brand-bg font-extrabold text-xxs tracking-widest uppercase py-3.5 px-6 rounded-xl hover:scale-[1.01] transition-transform duration-300 shadow-[0_4px_15px_rgba(197,160,89,0.3)]"
                >
                  TALEP OLUŞTUR
                </button>
              </form>
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.05] bg-[#020308] py-8 text-center text-slate-500 text-xxs font-mono relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Cropped footer logo */}
            <div className="relative w-8 h-8 overflow-hidden flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Burak Tekstil Logo" 
                className="w-[96px] h-[96px] max-w-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain" 
              />
            </div>
            <span>© 2026 BURAK TEKSTİL. Tüm Hakları Saklıdır.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand-gold transition-colors">Gizlilik Politikası</a>
            <a href="#" className="hover:text-brand-gold transition-colors">Kullanım Şartları</a>
          </div>
        </div>
      </footer>
    </div>
  );
}