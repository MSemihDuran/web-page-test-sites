import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Trash2, 
  FolderOpen, 
  ExternalLink 
} from 'lucide-react';

interface ProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
}

interface DashboardProps {
  onNavigate: (page: 'login' | 'register' | 'editor' | 'dashboard') => void;
  setSelectedProjectId: (id: string | null) => void;
  setInitialDimensions: (dims: { width: number; height: number } | null) => void;
}

const TEMPLATES = [
  { name: 'Instagram Post', width: 1080, height: 1080, ratio: '1:1', description: 'Square social media asset' },
  { name: 'Instagram Story', width: 1080, height: 1920, ratio: '9:16', description: 'Vertical phone layout' },
  { name: 'YouTube Thumbnail', width: 1280, height: 720, ratio: '16:9', description: 'Standard high-def landscape' },
  { name: 'Facebook Banner', width: 1200, height: 630, ratio: '1.91:1', description: 'Wide web cover asset' },
];

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  setSelectedProjectId,
  setInitialDimensions
}) => {

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/projects');
      setProjects(response.data.projects);
    } catch (err: any) {
      console.error(err);
      setError('Could not fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    const name = newProjectName.trim() || `Untitled ${selectedTemplate.name}`;
    
    // Structure our canvas payload: dimensions + initial blank fabric objects structure
    const initialCanvasJson = JSON.stringify({
      width: selectedTemplate.width,
      height: selectedTemplate.height,
      data: {
        version: '5.3.0',
        objects: [],
        background: '#ffffff'
      }
    });

    try {
      const response = await axios.post('http://localhost:5000/api/projects', {
        name,
        canvasJson: initialCanvasJson
      });
      
      const newProject = response.data.project;
      setSelectedProjectId(newProject.id);
      setInitialDimensions({ width: selectedTemplate.width, height: selectedTemplate.height });
      onNavigate('editor');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening project
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete project.');
    }
  };

  const handleOpenProject = (id: string) => {
    setSelectedProjectId(id);
    setInitialDimensions(null); // load dimensions from the saved project state
    onNavigate('editor');
  };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto relative z-10">

      {/* Main Dashboard Space */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Create Design */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Start a New Design</h2>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Design Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Marketing Banner"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950/80 border border-slate-850 focus:border-brand-500 text-white rounded-lg placeholder-slate-650 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Select Dimension Template
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.name}
                      type="button"
                      onClick={() => setSelectedTemplate(tmpl)}
                      className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selectedTemplate.name === tmpl.name
                          ? 'bg-brand-500/10 border-brand-500 text-white'
                          : 'bg-slate-950/60 border-slate-850/60 text-slate-400 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-sm text-slate-200">{tmpl.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          selectedTemplate.name === tmpl.name ? 'bg-brand-500/25 text-brand-300' : 'bg-slate-900 text-slate-500'
                        }`}>
                          {tmpl.width} × {tmpl.height} ({tmpl.ratio})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-450 mt-1 leading-normal">
                        {tmpl.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                {creating ? 'Creating...' : 'Create Blank Canvas'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Existing Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl min-h-[400px] flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4">Saved Designs</h2>

            {error && (
              <div className="bg-red-950/40 border border-red-900 text-red-200 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-2"></div>
                <span className="text-sm">Loading projects...</span>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
                <FolderOpen className="w-12 h-12 text-slate-700 mb-3" />
                <p className="text-sm font-medium text-slate-400">No saved designs yet</p>
                <p className="text-xs text-slate-550 mt-1">Select a template on the left to start editing.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => handleOpenProject(proj.id)}
                    className="group bg-slate-900/75 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 p-4 rounded-xl flex flex-col justify-between cursor-pointer transition-all shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-slate-200 group-hover:text-brand-300 transition-colors text-sm truncate max-w-[80%]">
                          {proj.name}
                        </h3>
                        <button
                          onClick={(e) => handleDeleteProject(proj.id, e)}
                          className="text-slate-500 hover:text-red-400 p-1.5 rounded hover:bg-slate-950 transition-all cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1.5">
                        ID: <span className="font-mono text-slate-650">{proj.id.substring(0, 8)}...</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-850/60 mt-4 pt-3 text-[11px] text-slate-450">
                      <span>Edited {new Date(proj.updatedAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1 text-brand-400 group-hover:underline">
                        Open Studio <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};
