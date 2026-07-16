import React from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiActivity, FiLayers, FiArrowRight } from 'react-icons/fi';

// Logodan birebir çizdiğimiz asil vektörel (SVG) logo bileşeni
const BurakTekstilLogo = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Sol Dikey Çözgü İplikleri (Lacivert) */}
    <path d="M35 25V75M40 25V75M45 25V75" stroke="var(--color-brand-navy)" strokeWidth="3" strokeLinecap="round"/>
    
    {/* Sol taraftaki ufak altın iplik detayları */}
    <path d="M30 30L25 35M30 40L20 50M30 50L25 55" stroke="var(--color-brand-gold)" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
    
    {/* Sağ taraftaki B Harfi (Altın) */}
    <path d="M47 30C55 30 62 33 62 42C62 49 55 50 47 50C55 50 64 51 64 61C64 70 55 70 47 70" stroke="var(--color-brand-gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* B harfi içindeki şık dikey dokuma detay çizgileri */}
    <path d="M52 57H58M52 63H56" stroke="var(--color-brand-gold)" strokeWidth="2.5" strokeLinecap="round"/>
    
    {/* Tam ortadan çapraz geçen şık Dokuma Mekiği (Atkı) */}
    <g transform="rotate(-30 45 50)">
      <rect x="20" y="46" width="50" height="8" rx="4" fill="var(--color-brand-navy)" stroke="var(--color-brand-gold)" strokeWidth="1.5"/>
      <path d="M60 50H72" stroke="var(--color-brand-navy)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="26" cy="50" r="1.5" fill="var(--color-brand-gold)"/>
    </g>
  </svg>
);

export default function App() {
  return (
    <div className="min-h-screen bg-brand-bg font-sans text-white relative overflow-hidden">
      
      {/* 1. ARKA PLANDA AKAN ASİL ALTIN VE LACİVERT ÇÖZGÜ İPLİKLERİ */}
      <div className="absolute inset-y-0 left-0 right-0 flex justify-between px-12 md:px-24 pointer-events-none opacity-[0.12]">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.8, delay: i * 0.08 }}
            className="w-[1px] h-full bg-gradient-to-b from-transparent to-transparent origin-top"
            style={{
              '--tw-gradient-stops': `transparent, ${
                i % 2 === 0 ? 'var(--color-brand-gold)' : 'var(--color-brand-navy)'
              }, transparent`,
            }}
          />
        ))}
      </div>

      {/* 2. EKRANI ENLEMESİNE KESEN MAT ALTIN MEKİK HATTI (ATKI) */}
      <div className="absolute top-[38%] left-0 right-0 h-[1px] bg-white/[0.04] pointer-events-none">
        <motion.div
          animate={{ x: ['-10%', '110%'] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="w-48 h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent shadow-[0_0_25px_var(--color-brand-gold)]"
        />
      </div>

      {/* Logonun renklerine uygun yumuşak arka plan parlamaları (Glowlar) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-navy/35 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-gold/8 blur-[130px] pointer-events-none" />

      {/* FLOATING HEADER (Yüzen Üst Menü) */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl bg-brand-bg/60 border border-white/[0.08] backdrop-blur-xl rounded-full py-3 px-8 z-50 flex justify-between items-center shadow-[0_30px_60px_rgba(7,9,19,0.8)]"
      >
        <span className="font-outfit font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
          {/* Header Sol Logo */}
          <BurakTekstilLogo className="w-10 h-10 -ml-2" />
          <span className="hidden sm:inline">BURAK <span className="text-brand-gold">TEKSTİL</span></span>
        </span>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-200">
          <a href="#about" className="hover:text-brand-gold transition-colors">Neden Biz?</a>
          <a href="#machinery" className="hover:text-brand-gold transition-colors">Teknoloji</a>
          <a href="#capabilities" className="hover:text-brand-gold transition-colors">Kabiliyetler</a>
        </nav>
        <button className="bg-brand-gold hover:bg-brand-gold-glow text-brand-bg font-bold text-xs py-2.5 px-6 rounded-full transition-all duration-300 shadow-[0_4px_20px_rgba(197,160,89,0.35)]">
          Teklif Al
        </button>
      </motion.header>

      {/* HERO SECTION (Giriş Alanı) */}
      <section className="min-h-screen flex flex-col justify-center items-center px-6 relative pt-24 z-10">
        
        {/* Ortadaki Yeni Lüks Logo Alanı */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 relative group"
        >
          {/* Altın Işıma */}
          <div className="absolute inset-0 bg-brand-gold/25 rounded-3xl blur-2xl group-hover:bg-brand-gold/35 transition-all duration-500" />
          
          <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-tr from-brand-navy to-brand-bg flex items-center justify-center shadow-[0_15px_45px_rgba(0,0,0,0.6)] border border-brand-gold/35 transition-all duration-300 group-hover:border-brand-gold-glow">
            {/* Ortadaki Büyük Orijinal Logomuz */}
            <BurakTekstilLogo className="w-20 h-20" />
          </div>
        </motion.div>

        {/* Küçük Teknolojik Gold Badge */}
        <motion.span 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/35 text-brand-white font-outfit text-xs font-semibold tracking-wider uppercase mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping" />
          Tam Entegre Fason Dokuma Hattı
        </motion.span>

        {/* Ana Başlık */}
        <motion.h1 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-4xl md:text-7xl font-outfit font-black text-white text-center max-w-4xl tracking-tight leading-[1.1]"
        >
          İplikten Kumaşa <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-gold via-brand-white to-slate-200">
            Kesintisiz Fason Üretim
          </span>
        </motion.h1>

        {/* Açıklama Metni */}
        <motion.p 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-slate-200 text-lg md:text-xl text-center max-w-2xl mt-6 leading-relaxed"
        >
          Çözgü sarımından dokumaya kadar tüm süreç tek çatı altında. Siz sadece ipliğinizi sevk edin, lojistik ve üretim yükünü biz üstlenelim.
        </motion.p>

        {/* Butonlar */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex gap-4 mt-10"
        >
          <button className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-glow text-brand-bg font-bold py-4 px-8 rounded-full shadow-[0_10px_30px_rgba(197,160,89,0.25)] hover:translate-y-[-2px] transition-all duration-300">
            Parkuru İncele <FiArrowRight />
          </button>
          <button className="border border-white/10 hover:border-brand-gold/30 bg-white/[0.03] text-white font-semibold py-4 px-8 rounded-full hover:translate-y-[-2px] transition-all duration-300">
            Kabiliyetler
          </button>
        </motion.div>
      </section>

      {/* KARTLAR ALANI (Altın Işıltılı Kenarlıklar ve Yeni Lacivert Kart Kutuları) */}
      <section className="py-24 max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 relative z-10">
        {[
          { icon: <FiCpu />, title: 'Sıfır Nakliye Riski', desc: 'İpliğiniz harici çözgücülere taşınmaz. Fabrikamıza indiği andan itibaren kumaş olana kadar tek adreste kalır.' },
          { icon: <FiActivity />, title: 'Minimum Fire Garantisi', desc: 'Yeni nesil elektronik gerginlik kontrol sistemlerimiz ile üretim firesini en alt düzeyde tutuyoruz.' },
          { icon: <FiLayers />, title: 'Şeffaf Süreç', desc: 'Giren hammadde ve çıkan kumaş metrajı tamamen şeffaftır. Süreç boyunca tek muhatabınız biziz.' }
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.6 }}
            whileHover={{ y: -8, borderColor: 'rgba(197,160,89,0.45)', boxShadow: '0 20px 40px rgba(7,9,19,0.5)' }}
            className="p-8 rounded-3xl bg-brand-navy/25 border border-white/[0.06] backdrop-blur-md transition-all duration-300 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold-glow text-2xl mb-6">
              {card.icon}
            </div>
            <h3 className="font-outfit font-bold text-xl text-brand-white mb-3">{card.title}</h3>
            <p className="text-slate-200 text-sm leading-relaxed">{card.desc}</p>
          </motion.div>
        ))}
      </section>

    </div>
  );
}