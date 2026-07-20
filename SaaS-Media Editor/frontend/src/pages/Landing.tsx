import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Cloud, 
  Zap, 
  CheckCircle,
  Type,
  Square,
  Trash2
} from 'lucide-react';

interface LandingProps {
  onNavigate: (page: 'landing' | 'login' | 'register' | 'editor' | 'dashboard') => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);
  const [playgroundCanvas, setPlaygroundCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObj, setSelectedObj] = useState<fabric.Object | null>(null);

  // Initialize interactive playground canvas on the landing page
  useEffect(() => {
    if (!miniCanvasRef.current) return;

    const fc = new fabric.Canvas(miniCanvasRef.current, {
      width: 480,
      height: 310,
      backgroundColor: '#f8fafc',
    });

    // Add initial tutorial items
    const titleText = new fabric.IText('Playground Studio 🚀', {
      left: 100,
      top: 60,
      fontSize: 26,
      fontFamily: 'system-ui',
      fontWeight: 'bold',
      fill: '#1e1b4b',
    });

    const bodyText = new fabric.IText('Try dragging and editing this text!\nClick buttons below to add more.', {
      left: 60,
      top: 120,
      fontSize: 16,
      fontFamily: 'system-ui',
      fill: '#475569',
      lineHeight: 1.3,
    });

    const testRect = new fabric.Rect({
      left: 180,
      top: 200,
      width: 100,
      height: 60,
      fill: '#8b5cf6',
      rx: 8,
      ry: 8,
    });

    fc.add(titleText, bodyText, testRect);
    fc.renderAll();
    setPlaygroundCanvas(fc);

    // Track active selection
    fc.on('selection:created', (e) => setSelectedObj(e.selected ? e.selected[0] : null));
    fc.on('selection:updated', (e) => setSelectedObj(e.selected ? e.selected[0] : null));
    fc.on('selection:cleared', () => setSelectedObj(null));

    return () => {
      fc.dispose();
    };
  }, []);

  const addPlaygroundText = () => {
    if (!playgroundCanvas) return;
    const txt = new fabric.IText('New Text Box', {
      left: 120,
      top: 80,
      fontSize: 22,
      fontFamily: 'system-ui',
      fill: '#7c3aed',
    });
    playgroundCanvas.add(txt);
    playgroundCanvas.setActiveObject(txt);
    playgroundCanvas.renderAll();
  };

  const addPlaygroundShape = () => {
    if (!playgroundCanvas) return;
    const rect = new fabric.Rect({
      left: 190,
      top: 120,
      width: 80,
      height: 80,
      fill: '#ec4899',
      rx: 12,
      ry: 12,
    });
    playgroundCanvas.add(rect);
    playgroundCanvas.setActiveObject(rect);
    playgroundCanvas.renderAll();
  };

  const deletePlaygroundSelected = () => {
    if (!playgroundCanvas) return;
    const active = playgroundCanvas.getActiveObject();
    if (active) {
      playgroundCanvas.remove(active);
      playgroundCanvas.discardActiveObject();
      playgroundCanvas.renderAll();
    }
  };

  const handleGetStarted = () => {
    if (user) {
      onNavigate('dashboard');
    } else {
      onNavigate('register');
    }
  };

  return (
    <div className="flex flex-col relative flex-1">

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1 relative z-10">
        
        {/* Left Side: Copy (Customer Facing Language only) */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 fill-brand-400" />
            Modern Graphics & Canvas Editor
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            Design graphics <br />
            <span className="bg-gradient-to-r from-brand-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              instantly online
            </span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Create professional templates, customize layering, edit texts, and upload assets in our interactive design studio. Save your projects securely in the cloud and download.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-brand-600 to-violet-650 hover:from-brand-500 hover:to-violet-550 active:from-brand-700 active:to-violet-750 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/15 cursor-pointer text-sm"
            >
              Start Designing Free
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-350 hover:text-white font-semibold rounded-xl text-center transition-all text-sm cursor-pointer"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Right Side: Interactive Playground Canvas Mockup */}
        <div className="lg:col-span-6 relative">
          <div className="relative mx-auto max-w-lg lg:max-w-none bg-slate-900/40 border border-slate-850 rounded-2xl p-4 shadow-2xl backdrop-blur-md overflow-hidden">
            
            {/* Window header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-850 mb-3 text-slate-400">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 animate-pulse">
                Live Studio Demo (Try it below)
              </span>
              <div className="w-8" />
            </div>

            {/* Live Interactive Playground Canvas */}
            <div className="bg-slate-950 border border-slate-900 rounded-lg aspect-[1.5] relative overflow-hidden flex flex-col justify-between p-3.5">
              
              <div className="flex-1 bg-slate-100 rounded-md overflow-hidden flex items-center justify-center relative border border-slate-800">
                <canvas ref={miniCanvasRef} />
              </div>

              {/* Live Canvas Buttons */}
              <div className="flex items-center justify-between mt-3 text-xs">
                <div className="flex gap-2">
                  <button 
                    onClick={addPlaygroundText}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Type className="w-3.5 h-3.5" />
                    Text Box
                  </button>
                  <button 
                    onClick={addPlaygroundShape}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Square className="w-3.5 h-3.5" />
                    Shapes
                  </button>
                </div>

                {selectedObj ? (
                  <button 
                    onClick={deletePlaygroundSelected}
                    className="bg-red-950/40 hover:bg-red-950 border border-red-900 text-red-200 px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Selected
                  </button>
                ) : (
                  <span className="text-[10px] text-brand-400 font-bold flex items-center gap-1 bg-brand-500/10 border border-brand-500/20 px-2 py-1 rounded">
                    Interactive Preview <CheckCircle className="w-3.5 h-3.5 text-brand-400 fill-brand-400/20" />
                  </span>
                )}
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900/60 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Designed for Creative Flow
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            The platform provides intuitive controls, structured layering, and high-performance design workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-slate-900/30 border border-slate-900 hover:border-slate-800 p-6 rounded-2xl transition-all shadow-md">
            <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Interactive Design Layers</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Enables users to arrange design hierarchies, bring layers to front or send them to back, rotate, drag, and scale dynamically.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/30 border border-slate-900 hover:border-slate-800 p-6 rounded-2xl transition-all shadow-md">
            <div className="w-10 h-10 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center text-violet-400 mb-4">
              <Cloud className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Personal Cloud Library</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Upload custom brand assets, graphics, and logos. Access them anytime from your project library inside our cloud studio database.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/30 border border-slate-900 hover:border-slate-800 p-6 rounded-2xl transition-all shadow-md">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">High-Resolution Exports</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Download your final graphics in crisp high-definition formats (PNG / JPEG) ready for print, social media, and web publications.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-550">
          <span>&copy; {new Date().getFullYear()} SaaS Canvas. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
