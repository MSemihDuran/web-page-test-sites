import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Type, 
  Trash2, 
  Sparkles, 
  Check, 
  Palette,
  Square,
  Circle,
  FolderUp,
  MousePointer,
  Paintbrush,
  Layers,
  Triangle as TriangleIcon,
  Star as StarIcon,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Settings,
  Activity,
  Eraser,
  Wand2,
  Crop
} from 'lucide-react';

interface CanvasEditorProps {
  projectId: string;
  onBack: () => void;
}

type ToolType = 'select' | 'brush' | 'shapes' | 'eraser' | 'magic' | 'background' | 'layers';

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ projectId, onBack }) => {
  const { user, toggleSubscription } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  // Core States
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [projectName, setProjectName] = useState('');
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // UI States
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [layers, setLayers] = useState<fabric.Object[]>([]);
  
  // Brush/Drawing States
  const [brushColor, setBrushColor] = useState('#8b5cf6');
  const [brushWidth, setBrushWidth] = useState(8);

  // Selection States
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [textColor, setTextColor] = useState('#1e293b');
  const [fontSize, setFontSize] = useState(40);
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [canvasBgColor, setCanvasBgColor] = useState('#ffffff');
  const [objectOpacity, setObjectOpacity] = useState(100);
  
  // Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Sync layers list helper
  const syncLayers = (fc: fabric.Canvas) => {
    setLayers([...fc.getObjects()].reverse());
  };

  // Load project details
  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/projects/${projectId}`);
        const { name, canvasJson } = response.data.project;
        setProjectName(name);

        const parsed = JSON.parse(canvasJson);
        const w = parsed.width || 1080;
        const h = parsed.height || 1080;
        setWidth(w);
        setHeight(h);

        // Initialize Fabric.js Canvas
        if (canvasRef.current) {
          // Prevent double initialization wrappers on React Strict Mode reruns
          if (fabricCanvasRef.current) {
            fabricCanvasRef.current.dispose();
            fabricCanvasRef.current = null;
          }

          const fc = new fabric.Canvas(canvasRef.current, {
            width: w,
            height: h,
            backgroundColor: parsed.data?.background || '#ffffff',
          });

          fabricCanvasRef.current = fc;

          // Configure selection listeners
          const updateSelection = () => {
            const active = fc.getActiveObject();
            if (active) {
              setSelectedObject(active);
              setObjectOpacity(Math.round((active.opacity || 1) * 100));
              if (active.type === 'text' || active.type === 'i-text') {
                const textObj = active as fabric.IText;
                setTextColor(textObj.fill as string || '#000000');
                setFontSize(textObj.fontSize || 40);
                setFontFamily(textObj.fontFamily || 'sans-serif');
              }
            } else {
              setSelectedObject(null);
            }
          };

          fc.on('selection:created', updateSelection);
          fc.on('selection:updated', updateSelection);
          fc.on('selection:cleared', () => setSelectedObject(null));

          // Set listeners to keep layers panel updated
          fc.on('object:added', () => syncLayers(fc));
          fc.on('object:removed', () => syncLayers(fc));
          fc.on('object:modified', () => syncLayers(fc));

          // Set background color state
          setCanvasBgColor(parsed.data?.background || '#ffffff');

          // Load serialized canvas components if they exist
          if (parsed.data) {
            fc.loadFromJSON(parsed.data, () => {
              fc.renderAll();
              setCanvas(fc);
              syncLayers(fc);
              setLoading(false);
            });
          } else {
            setCanvas(fc);
            syncLayers(fc);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Failed to load design:', error);
        alert('Could not load the design.');
        onBack();
      }
    };

    loadProject();

    // Clean up
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [projectId]);

  // Handle Free Brush Drawing Configuration
  useEffect(() => {
    if (!canvas) return;
    
    // Brush is active if 'brush' is selected OR if eraser is selected (pixel eraser)
    canvas.isDrawingMode = activeTool === 'brush' || activeTool === 'eraser';
    
    if (canvas.isDrawingMode) {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      if (activeTool === 'eraser') {
        // Pixel eraser paints using background color
        canvas.freeDrawingBrush.color = canvasBgColor;
      } else {
        canvas.freeDrawingBrush.color = brushColor;
      }
      canvas.freeDrawingBrush.width = brushWidth;
    }
  }, [activeTool, brushColor, brushWidth, canvasBgColor, canvas]);

  // Eraser Tool - Object click erase event handler
  useEffect(() => {
    if (!canvas) return;
    
    const handleEraseClick = (opt: fabric.IEvent) => {
      if (activeTool === 'eraser' && opt.target) {
        canvas.remove(opt.target);
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    };

    canvas.on('mouse:down', handleEraseClick);
    return () => {
      canvas.off('mouse:down', handleEraseClick);
    };
  }, [canvas, activeTool]);

  // Smart Selection Magic Wand - select all elements matching clicked element color
  useEffect(() => {
    if (!canvas) return;

    const handleMagicSelection = (opt: fabric.IEvent) => {
      if (activeTool === 'magic' && opt.target) {
        const targetColor = opt.target.fill;
        if (!targetColor) {
          alert('Magic Wand: No color detected on clicked element.');
          return;
        }

        // Find all objects with matching fill color
        const matchingObjects = canvas.getObjects().filter(o => o.fill === targetColor);
        if (matchingObjects.length > 0) {
          // Select them as a group
          const selection = new fabric.ActiveSelection(matchingObjects, {
            canvas: canvas
          });
          canvas.setActiveObject(selection);
          canvas.renderAll();
          alert(`Magic Wand: Selected ${matchingObjects.length} elements with color ${targetColor}!`);
          setActiveTool('select'); // automatically switch to select tool to allow movement/edit
        }
      }
    };

    canvas.on('mouse:down', handleMagicSelection);
    return () => {
      canvas.off('mouse:down', handleMagicSelection);
    };
  }, [canvas, activeTool]);

  // Adjust background color
  const handleBgColorChange = (color: string) => {
    if (!canvas) return;
    setCanvasBgColor(color);
    canvas.setBackgroundColor(color, () => {
      canvas.renderAll();
    });
  };

  // Add Text
  const addText = () => {
    if (!canvas) return;
    const text = new fabric.IText('Double click to edit', {
      left: width / 2 - 150,
      top: height / 2 - 20,
      fontSize: 40,
      fill: '#1e293b',
      fontFamily: 'sans-serif',
      cornerColor: '#8b5cf6',
      cornerStyle: 'circle',
      transparentCorners: false,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  // Add Shape
  const addShape = (type: 'rect' | 'circle' | 'triangle' | 'star' | 'ring' | 'badge') => {
    if (!canvas) return;
    let shape: fabric.Object;
    
    const baseConfig = {
      left: width / 2 - 75,
      top: height / 2 - 75,
      cornerColor: '#8b5cf6',
      cornerStyle: 'circle' as const,
      transparentCorners: false,
    };

    if (type === 'rect') {
      shape = new fabric.Rect({
        ...baseConfig,
        width: 150,
        height: 150,
        fill: '#a855f7',
      });
    } else if (type === 'circle') {
      shape = new fabric.Circle({
        ...baseConfig,
        radius: 75,
        fill: '#c084fc',
      });
    } else if (type === 'triangle') {
      shape = new fabric.Triangle({
        ...baseConfig,
        width: 150,
        height: 130,
        fill: '#6366f1',
      });
    } else if (type === 'star') {
      const starPath = "M 75,10 L 92,48 L 132,54 L 102,82 L 110,122 L 75,102 L 40,122 L 48,82 L 18,54 L 58,48 Z";
      shape = new fabric.Path(starPath, {
        ...baseConfig,
        fill: '#fbbf24',
        scaleX: 1.2,
        scaleY: 1.2
      });
    } else if (type === 'ring') {
      shape = new fabric.Circle({
        ...baseConfig,
        radius: 65,
        fill: 'transparent',
        stroke: '#06b6d4',
        strokeWidth: 6,
        shadow: new fabric.Shadow({
          color: '#06b6d4',
          blur: 15,
          offsetX: 0,
          offsetY: 0
        })
      });
    } else {
      // Group: Design Badge Sticker
      const bgCard = new fabric.Rect({
        width: 200,
        height: 60,
        rx: 12,
        ry: 12,
        fill: '#ec4899',
        shadow: new fabric.Shadow({
          color: '#ec4899',
          blur: 8,
          offsetX: 0,
          offsetY: 0
        })
      });
      const text = new fabric.IText('PREMIUM BADGE', {
        fontSize: 16,
        fontFamily: 'sans-serif',
        fill: '#ffffff',
        fontWeight: 'bold',
        left: 30,
        top: 20
      });
      shape = new fabric.Group([bgCard, text], {
        ...baseConfig,
        left: width / 2 - 100,
        top: height / 2 - 30,
      });
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  };

  // Upload image to backend
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append('file', file);

    try {
      setSaving(true);
      const response = await axios.post('http://localhost:5000/api/upload/asset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imageUrl = response.data.fileUrl;

      fabric.Image.fromURL(imageUrl, (img) => {
        img.scaleToWidth(width * 0.4);
        img.set({
          left: width / 2 - (img.getScaledWidth() / 2),
          top: height / 2 - (img.getScaledHeight() / 2),
          cornerColor: '#8b5cf6',
          cornerStyle: 'circle',
          transparentCorners: false,
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      }, { crossOrigin: 'anonymous' });

    } catch (err: any) {
      console.error(err);
      alert('Failed to upload image.');
    } finally {
      setSaving(false);
    }
  };

  // Crop Selected Image helper
  const handleCropImage = (ratio: '1:1' | '16:9' | 'reset') => {
    if (!canvas || !selectedObject || selectedObject.type !== 'image') return;
    const img = selectedObject as fabric.Image;
    
    if (ratio === 'reset') {
      img.set('clipPath', undefined);
    } else {
      const wVal = img.width || 200;
      const hVal = img.height || 200;
      let clipWidth = wVal;
      let clipHeight = hVal;
      
      if (ratio === '1:1') {
        const size = Math.min(wVal, hVal);
        clipWidth = size;
        clipHeight = size;
      } else if (ratio === '16:9') {
        clipHeight = wVal * (9 / 16);
        if (clipHeight > hVal) {
          clipHeight = hVal;
          clipWidth = hVal * (16 / 9);
        }
      }
      
      const clipRect = new fabric.Rect({
        width: clipWidth,
        height: clipHeight,
        left: -clipWidth / 2,
        top: -clipHeight / 2,
        originX: 'center',
        originY: 'center'
      });
      
      img.set('clipPath', clipRect);
    }
    
    canvas.renderAll();
    syncLayers(canvas);
  };

  // Remove selected element
  const deleteSelected = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.remove(active);
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  // Arrange levels
  const bringToFront = () => {
    if (!canvas || !selectedObject) return;
    canvas.bringToFront(selectedObject);
    canvas.renderAll();
    syncLayers(canvas);
  };

  const sendToBack = () => {
    if (!canvas || !selectedObject) return;
    canvas.sendToBack(selectedObject);
    canvas.renderAll();
    syncLayers(canvas);
  };

  // Modify active element properties
  const handleTextColorChange = (color: string) => {
    if (!canvas || !selectedObject) return;
    setTextColor(color);
    if (selectedObject.type === 'text' || selectedObject.type === 'i-text') {
      selectedObject.set('fill' as any, color);
      canvas.renderAll();
    }
  };

  const handleFontSizeChange = (size: number) => {
    if (!canvas || !selectedObject) return;
    setFontSize(size);
    if (selectedObject.type === 'text' || selectedObject.type === 'i-text') {
      (selectedObject as any).set('fontSize', size);
      canvas.renderAll();
    }
  };

  const handleFontFamilyChange = (family: string) => {
    if (!canvas || !selectedObject) return;
    setFontFamily(family);
    if (selectedObject.type === 'text' || selectedObject.type === 'i-text') {
      (selectedObject as any).set('fontFamily', family);
      canvas.renderAll();
    }
  };

  const handleOpacityChange = (val: number) => {
    if (!canvas || !selectedObject) return;
    setObjectOpacity(val);
    selectedObject.set('opacity', val / 100);
    canvas.renderAll();
  };

  // Layers list helpers
  const handleSelectLayer = (obj: fabric.Object) => {
    if (!canvas) return;
    canvas.setActiveObject(obj);
    canvas.renderAll();
    setActiveTool('select');
  };

  const handleToggleVisibility = (obj: fabric.Object, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvas) return;
    obj.visible = !obj.visible;
    canvas.renderAll();
    syncLayers(canvas);
  };

  const handleToggleLock = (obj: fabric.Object, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvas) return;
    const isLocked = !obj.lockMovementX;
    obj.lockMovementX = isLocked;
    obj.lockMovementY = isLocked;
    obj.lockScalingX = isLocked;
    obj.lockScalingY = isLocked;
    obj.lockRotation = isLocked;
    obj.hasControls = !isLocked;
    canvas.renderAll();
    syncLayers(canvas);
  };

  const handleDeleteLayer = (obj: fabric.Object, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvas) return;
    canvas.remove(obj);
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  // Save project layout to backend
  const handleSaveProject = async () => {
    if (!canvas) return;
    setSaving(true);
    try {
      const fabricJson = canvas.toJSON();
      const canvasJson = JSON.stringify({
        width,
        height,
        data: {
          ...fabricJson,
          background: canvasBgColor
        }
      });

      await axios.put(`http://localhost:5000/api/projects/${projectId}`, {
        name: projectName,
        canvasJson
      });

      alert('Design saved successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  // Export design: Subscription-locked
  const handleExportCanvas = async () => {
    if (!canvas) return;

    // Check both paid status and 1-day free trial status
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const createdAtMs = user ? new Date(user.createdAt).getTime() : 0;
    const isTrialActive = Date.now() - createdAtMs < oneDayInMs;

    if (!user?.isSubscribed && !isTrialActive) {
      setShowUpgradeModal(true);
      return;
    }

    setExporting(true);

    try {
      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1.0,
        multiplier: 2
      });

      const response = await axios.post('http://localhost:5000/api/upload/export', {
        imageData: dataUrl
      });

      const fileUrl = response.data.fileUrl;

      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `${projectName.replace(/\s+/g, '_')}_export.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        setShowUpgradeModal(true);
      } else {
        alert(err.response?.data?.error || 'Failed to export canvas.');
      }
    } finally {
      setExporting(false);
    }
  };

  const getLayerIcon = (type: string, obj: any) => {
    if (type === 'rect') return <Square className="w-3.5 h-3.5 text-pink-400" />;
    if (type === 'circle') {
      if (obj.stroke && obj.shadow) return <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />;
      return <Circle className="w-3.5 h-3.5 text-violet-400" />;
    }
    if (type === 'triangle') return <TriangleIcon className="w-3.5 h-3.5 text-indigo-400" />;
    if (type === 'path') return <Paintbrush className="w-3.5 h-3.5 text-emerald-400" />;
    if (type === 'text' || type === 'i-text') return <Type className="w-3.5 h-3.5 text-yellow-400" />;
    if (type === 'image') return <FolderUp className="w-3.5 h-3.5 text-sky-400" />;
    return <Settings className="w-3.5 h-3.5 text-slate-400" />;
  };

  const getLayerName = (obj: any) => {
    if (obj.type === 'i-text' || obj.type === 'text') {
      const textVal = obj.text || '';
      return `Text: "${textVal.substring(0, 12)}${textVal.length > 12 ? '...' : ''}"`;
    }
    if (obj.type === 'rect') return 'Rectangle Shape';
    if (obj.type === 'circle') {
      if (obj.stroke && obj.shadow) return 'Neon Glow Ring';
      return 'Circle Shape';
    }
    if (obj.type === 'triangle') return 'Triangle Shape';
    if (obj.type === 'path') return 'Brush Vector Path';
    if (obj.type === 'image') return 'Custom Image asset';
    if (obj.type === 'group') return 'Styled Badge Sticker';
    return obj.type || 'Object Layer';
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-900 bg-slate-900/60 backdrop-blur-md px-6 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-brand-500 focus:outline-none text-white font-extrabold text-sm px-1 py-0.5 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveProject}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Design'}
          </button>

          <button
            onClick={handleExportCanvas}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-brand-500/10"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? 'Exporting...' : 'Export High-Res PNG'}
            {!user?.isSubscribed && (
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 ml-0.5 animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 1. Far-Left Vertical Icon Toolbar */}
        <nav className="w-16 border-r border-slate-900 bg-slate-950 flex flex-col items-center py-4 justify-between shrink-0">
          <div className="space-y-3.5 w-full flex flex-col items-center">
            
            {[
              { id: 'select', label: 'Select / Move', icon: MousePointer },
              { id: 'brush', label: 'Drawing Brush', icon: Paintbrush },
              { id: 'eraser', label: 'Erase Elements', icon: Eraser },
              { id: 'magic', label: 'Magic Selection', icon: Wand2 },
              { id: 'shapes', label: 'Add Elements', icon: TriangleIcon },
              { id: 'background', label: 'Background', icon: Palette },
              { id: 'layers', label: 'Layers List', icon: Layers }
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as ToolType)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
                    activeTool === tool.id
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                  title={tool.label}
                >
                  <Icon className="w-5 h-5" />
                  <div className="absolute left-14 bg-slate-900 border border-slate-800 text-[10px] font-bold text-white px-2 py-1 rounded shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {tool.label}
                  </div>
                </button>
              );
            })}

          </div>

          <div className="text-[10px] text-slate-700 font-extrabold font-mono tracking-wider rotate-[-90deg] my-4 select-none">
            STUDIO
          </div>
        </nav>

        {/* 2. Contextual Dock Panel */}
        <aside className="w-64 border-r border-slate-900 bg-slate-900/20 flex flex-col p-4 shrink-0 overflow-y-auto">
          
          {/* A. SELECT TOOL / CONTEXT OPTIONS */}
          {activeTool === 'select' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                <MousePointer className="w-3.5 h-3.5 text-brand-400" />
                Select Mode
              </h4>

              {selectedObject ? (
                <div className="space-y-4">
                  {/* Layer arrangement buttons */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-500 uppercase font-bold">Layer Order</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={bringToFront}
                        className="py-1.5 px-3 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-[10px] font-bold text-slate-350 hover:text-white rounded cursor-pointer transition-colors"
                      >
                        Bring Front
                      </button>
                      <button
                        onClick={sendToBack}
                        className="py-1.5 px-3 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-[10px] font-bold text-slate-355 hover:text-white rounded cursor-pointer transition-colors"
                      >
                        Send Back
                      </button>
                    </div>
                  </div>

                  {/* Opacity slider */}
                  <div>
                    <label className="block text-[10px] text-slate-550 uppercase font-bold mb-1">Layer Opacity ({objectOpacity}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={objectOpacity}
                      onChange={(e) => handleOpacityChange(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                    />
                  </div>

                  {/* Image Crop Actions */}
                  {selectedObject.type === 'image' && (
                    <div className="space-y-2 pt-3 border-t border-slate-850/80">
                      <label className="block text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                        <Crop className="w-3.5 h-3.5 text-sky-400" />
                        Crop Image Asset
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => handleCropImage('1:1')}
                          className="py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-[10px] font-bold rounded cursor-pointer text-slate-300"
                        >
                          1:1 Square
                        </button>
                        <button
                          onClick={() => handleCropImage('16:9')}
                          className="py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-[10px] font-bold rounded cursor-pointer text-slate-300"
                        >
                          16:9 Ratio
                        </button>
                        <button
                          onClick={() => handleCropImage('reset')}
                          className="py-1 bg-red-950/40 hover:bg-red-900 border border-red-900/60 text-[10px] font-bold rounded cursor-pointer text-red-200"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Text-specific formatting */}
                  {(selectedObject.type === 'text' || selectedObject.type === 'i-text') && (
                    <div className="space-y-4 pt-3 border-t border-slate-850">
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Font Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => handleTextColorChange(e.target.value)}
                            className="w-7 h-7 rounded border border-slate-750 bg-transparent cursor-pointer p-0 block"
                          />
                          <span className="text-xs text-slate-350 font-mono uppercase">{textColor}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-550 uppercase font-bold mb-1">Font Size ({fontSize}px)</label>
                        <input
                          type="range"
                          min="10"
                          max="200"
                          value={fontSize}
                          onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1.5">Font Family</label>
                        <select
                          value={fontFamily}
                          onChange={(e) => handleFontFamilyChange(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 text-white rounded text-xs outline-none cursor-pointer"
                        >
                          <option value="sans-serif">Sans-Serif</option>
                          <option value="serif">Serif</option>
                          <option value="monospace">Monospace</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Impact">Impact</option>
                          <option value="Courier New">Courier</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={deleteSelected}
                    className="w-full py-2 bg-red-950/40 hover:bg-red-950 border border-red-900/60 hover:border-red-900 text-red-200 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Selected
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-500 leading-normal text-center py-8">
                  No elements selected. <br />Click on an item on the canvas to move, edit, or crop.
                </div>
              )}
            </div>
          )}

          {/* B. BRUSH PAINTING MODE OPTIONS */}
          {activeTool === 'brush' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                <Paintbrush className="w-3.5 h-3.5 text-brand-400" />
                Drawing Brush
              </h4>

              <div className="p-3 bg-brand-500/5 border border-brand-500/10 rounded-xl text-[11px] text-slate-450 leading-normal mb-1">
                Freehand drawing mode is active. Paint directly onto the canvas with your cursor.
              </div>

              <div>
                <label className="block text-[10px] text-slate-550 uppercase font-bold mb-1">Brush Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-750 bg-transparent cursor-pointer p-0 block"
                  />
                  <span className="text-xs text-slate-350 font-mono uppercase">{brushColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-550 uppercase font-bold mb-1">Brush Size ({brushWidth}px)</label>
                <input
                  type="range"
                  min="1"
                  max="80"
                  value={brushWidth}
                  onChange={(e) => setBrushWidth(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-500 uppercase font-bold">Quick Palette</label>
                <div className="flex flex-wrap gap-1.5">
                  {['#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ffffff', '#000000'].map(c => (
                    <button
                      key={c}
                      onClick={() => setBrushColor(c)}
                      className={`w-6 h-6 rounded-full border border-slate-800 cursor-pointer transition-transform hover:scale-110 active:scale-90 ${
                        brushColor === c ? 'ring-2 ring-brand-500' : ''
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* C. ERASER TOOL */}
          {activeTool === 'eraser' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                <Eraser className="w-3.5 h-3.5 text-brand-400" />
                Eraser Suite
              </h4>

              <div className="p-3 bg-red-950/20 border border-red-900/10 rounded-xl text-[10.5px] text-red-200/80 leading-normal space-y-2">
                <p className="font-semibold text-red-200">Modes Enabled:</p>
                <ul className="list-disc pl-3.5 space-y-1.5">
                  <li><strong>Object Eraser:</strong> Click directly on any vector shape, image, or text to erase it instantly.</li>
                  <li><strong>Pixel Eraser:</strong> Drag with cursor to brush erase lines (matches canvas background color).</li>
                </ul>
              </div>

              <div>
                <label className="block text-[10px] text-slate-550 uppercase font-bold mb-1">Pixel Brush Width ({brushWidth}px)</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={brushWidth}
                  onChange={(e) => setBrushWidth(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>
            </div>
          )}

          {/* D. SMART SELECTION / MAGIC WAND */}
          {activeTool === 'magic' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-brand-400" />
                Magic Wand
              </h4>

              <div className="p-3 bg-cyan-950/20 border border-cyan-900/20 rounded-xl text-[11px] text-cyan-200 leading-normal">
                <p className="font-bold flex items-center gap-1 mb-1">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  Color Selector Active
                </p>
                Click on any shape or text. The Wand will dynamically find and select all elements sharing the identical color!
              </div>

              <div className="text-[10px] text-slate-500 text-center py-6">
                Waiting for target color click...
              </div>
            </div>
          )}

          {/* E. ADD SHAPES AND TEXT DOCK */}
          {activeTool === 'shapes' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                <TriangleIcon className="w-3.5 h-3.5 text-brand-400" />
                Add Elements
              </h4>

              {/* Text, Image Upload */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={addText}
                  className="flex flex-col items-center justify-center p-3 bg-slate-900 border border-slate-850 hover:border-brand-500 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer group"
                >
                  <Type className="w-4 h-4 text-slate-400 group-hover:text-brand-400 mb-1.5" />
                  <span className="text-[10px] font-bold">Text Box</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-3 bg-slate-900 border border-slate-850 hover:border-brand-500 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer group"
                >
                  <FolderUp className="w-4 h-4 text-slate-400 group-hover:text-brand-400 mb-1.5" />
                  <span className="text-[10px] font-bold">Upload Image</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Vector Geometries Grid */}
              <div className="space-y-2 pt-2 border-t border-slate-850/80">
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1.5">Vector Geometries</label>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addShape('rect')}
                    className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-850 hover:border-brand-500 text-slate-350 hover:text-white rounded-lg text-left transition-colors text-[10px] font-bold cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 text-pink-400" />
                    Rectangle
                  </button>

                  <button
                    onClick={() => addShape('circle')}
                    className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-850 hover:border-brand-500 text-slate-355 hover:text-white rounded-lg text-left transition-colors text-[10px] font-bold cursor-pointer"
                  >
                    <Circle className="w-3.5 h-3.5 text-violet-400" />
                    Circle
                  </button>

                  <button
                    onClick={() => addShape('triangle')}
                    className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-850 hover:border-brand-500 text-slate-355 hover:text-white rounded-lg text-left transition-colors text-[10px] font-bold cursor-pointer"
                  >
                    <TriangleIcon className="w-3.5 h-3.5 text-indigo-400" />
                    Triangle
                  </button>

                  <button
                    onClick={() => addShape('star')}
                    className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-850 hover:border-brand-500 text-slate-355 hover:text-white rounded-lg text-left transition-colors text-[10px] font-bold cursor-pointer"
                  >
                    <StarIcon className="w-3.5 h-3.5 text-yellow-400" />
                    Star Vector
                  </button>
                </div>
              </div>

              {/* Design Presets */}
              <div className="space-y-2 pt-2 border-t border-slate-850/80">
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1.5">Design Presets</label>
                
                <div className="space-y-2">
                  <button
                    onClick={() => addShape('ring')}
                    className="w-full flex items-center gap-2.5 p-2.5 bg-slate-900 border border-slate-850 hover:border-brand-500 text-slate-300 hover:text-white rounded-xl text-left transition-all text-xs font-bold cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)] flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-extrabold">Neon Glow Ring</h5>
                      <p className="text-[9px] text-slate-500 font-normal">Glow circle vector</p>
                    </div>
                  </button>

                  <button
                    onClick={() => addShape('badge')}
                    className="w-full flex items-center gap-2.5 p-2.5 bg-slate-900 border border-slate-850 hover:border-brand-500 text-slate-300 hover:text-white rounded-xl text-left transition-all text-xs font-bold cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.4)] flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-extrabold">Acme Promo Sticker</h5>
                      <p className="text-[9px] text-slate-500 font-normal">Prestyled layout group</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* F. CANVAS BACKGROUND COLOR OPTIONS */}
          {activeTool === 'background' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-brand-400" />
                Canvas Color
              </h4>

              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <input
                    type="color"
                    value={canvasBgColor}
                    onChange={(e) => handleBgColorChange(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-750 bg-transparent cursor-pointer p-0 block"
                  />
                </div>
                <span className="text-xs text-slate-300 font-mono uppercase">{canvasBgColor}</span>
              </div>

              <div className="space-y-1.5 border-t border-slate-850/80 pt-3">
                <label className="block text-[10px] text-slate-500 uppercase font-bold">Standard Palette</label>
                <div className="flex flex-wrap gap-1.5">
                  {['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#0f172a', '#020617', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map(c => (
                    <button
                      key={c}
                      onClick={() => handleBgColorChange(c)}
                      className="w-6 h-6 rounded border border-slate-800 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* G. LAYERS LIST PANEL */}
          {activeTool === 'layers' && (
            <div className="space-y-4 flex-1 flex flex-col">
              <div>
                <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-400" />
                  Layers List
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Manage elements stacking order.</p>
              </div>

              <div className="space-y-1.5 overflow-y-auto max-h-[450px] pr-1">
                {layers.length > 0 ? (
                  layers.map((layer, idx) => {
                    const isSelected = selectedObject === layer;
                    const isLocked = !!layer.lockMovementX;
                    const isVisible = layer.visible !== false;

                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectLayer(layer)}
                        className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-lg border text-xs cursor-pointer transition-all active:scale-98 ${
                          isSelected
                            ? 'bg-slate-900 border-brand-500/40 text-white'
                            : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/40 hover:border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {getLayerIcon(layer.type || '', layer)}
                          <span className="truncate font-semibold text-[11px] leading-none">
                            {getLayerName(layer)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Toggle visibility */}
                          <button
                            onClick={(e) => handleToggleVisibility(layer, e)}
                            className="p-1 text-slate-500 hover:text-slate-200 transition-colors"
                            title={isVisible ? 'Hide Layer' : 'Show Layer'}
                          >
                            {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-650" />}
                          </button>

                          {/* Toggle Lock */}
                          <button
                            onClick={(e) => handleToggleLock(layer, e)}
                            className="p-1 text-slate-500 hover:text-slate-200 transition-colors"
                            title={isLocked ? 'Unlock Layer' : 'Lock Layer'}
                          >
                            {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5 text-slate-650" />}
                          </button>

                          {/* Delete Layer */}
                          <button
                            onClick={(e) => handleDeleteLayer(layer, e)}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                            title="Delete Layer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-[11px] text-slate-550 text-center py-10 leading-normal">
                    Canvas is currently empty.<br />Add shapes or text to view layers.
                  </div>
                )}
              </div>
            </div>
          )}

        </aside>

        {/* 3. Studio Editor Viewport */}
        <main className="flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-8 relative">
          
          {loading && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-slate-400">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mb-2"></div>
              <span>Preparing Canvas Studio...</span>
            </div>
          )}

          <div 
            className="bg-slate-900 shadow-2xl relative border border-slate-900 shrink-0"
            style={{ width: `${width}px`, height: `${height}px` }}
          >
            <canvas id="fabric-canvas" ref={canvasRef} />
          </div>

          {/* Scale note info */}
          <div className="absolute bottom-4 right-4 bg-slate-900/80 border border-slate-850 px-3 py-1.5 rounded-md text-[10px] text-slate-400 pointer-events-none z-10">
            Canvas Resolution: {width} × {height} px
          </div>
        </main>
      </div>

      {/* Upgrade Subscription Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl relative text-center">
            
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-slate-950 fill-slate-950" />
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight">Unlock Premium Export</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Exporting high-resolution canvas layouts is a premium feature. Upgrade to a paid Premium subscription to download your graphics instantly.
            </p>

            {/* Simulated Plan Specs */}
            <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 my-6 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Unlimited High-Res PNG & JPEG exports</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Cloud backup & custom asset uploads</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Secure bank card billing integration</span>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <button
                onClick={async () => {
                  try {
                    await axios.post('http://localhost:5000/api/auth/subscribe', {
                      cardName: 'Studio Tester',
                      cardNumber: '4111 1111 1111 1111',
                      cardExpiry: '12/29',
                      cardCvv: '123'
                    });
                    await toggleSubscription();
                    await toggleSubscription();
                    setShowUpgradeModal(false);
                    alert('Subscription activated successfully! You can now export your graphic.');
                  } catch (error) {
                    alert('Payment processing failed.');
                  }
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold rounded-lg shadow-lg shadow-amber-500/10 cursor-pointer transition-all uppercase tracking-wider text-xs"
              >
                Upgrade to Premium ($9.99/mo)
              </button>
              
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-2 px-4 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Close & Continue Free
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
