import React, { useState } from 'react';

const HelpModal = ({ selectedSite, onClose }) => {
  const [activeTab, setActiveTab] = useState('protocol');
  const [prompt, setPrompt] = useState('');
  const [advice, setAdvice] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const askJules = async () => {
    if (!prompt.trim()) return;
    setIsAsking(true);
    try {
        const res = await fetch('/api/ai/jules/advice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt, 
                siteId: selectedSite?.id 
            })
        });
        const data = await res.json();
        setAdvice(data.advice || "AI kon geen advies genereren.");
    } catch (e) {
        setAdvice("❌ Fout bij verbinden met AI Assistant.");
    } finally {
        setIsAsking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={onClose}>
      <div
        className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-hidden border border-slate-700 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <div className="flex gap-4">
            <button 
                onClick={() => setActiveTab('protocol')}
                className={`text-xs font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'protocol' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500'}`}
            >
                Protocol
            </button>
            <button 
                onClick={() => setActiveTab('jules')}
                className={`text-xs font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'jules' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500'}`}
            >
                Ask Jules (AI)
            </button>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 space-y-5 text-sm text-slate-300">
          
          {activeTab === 'protocol' ? (
            <>
              {/* Flow */}
              <div className="flex items-center gap-1 text-[10px] font-mono justify-center flex-wrap mb-6">
                <span className="bg-slate-800 px-2 py-1 rounded">Dock bewerking</span>
                <span className="text-slate-600">→</span>
                <span className="bg-slate-800 px-2 py-1 rounded">automatisch op schijf</span>
                <span className="text-slate-600">→</span>
                <span className="bg-slate-800 px-2 py-1 rounded">Sync → Sheets</span>
                <span className="text-slate-600">→</span>
                <span className="bg-slate-800 px-2 py-1 rounded">Push → GitHub</span>
                <span className="text-slate-600">→</span>
                <span className="bg-slate-800 px-2 py-1 rounded">Live</span>
              </div>

              {/* ... [Rest of Protocol content] ... */}
              <div>
                <p className="text-white font-bold mb-1">Bewerkingen (automatisch opgeslagen)</p>
                <p className="leading-relaxed opacity-80">
                  Alle bewerkingen via de Dock worden <strong className="text-white">automatisch</strong> naar de lokale JSON-bestanden geschreven. 
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <p className="text-white font-bold text-xs uppercase tracking-widest">Publicatie Volgorde:</p>
                <div className="grid gap-3 opacity-80">
                    <p>1. <strong className="text-white">Sync</strong> — Data naar Google Sheets sturen.</p>
                    <p>2. <strong className="text-white">Push</strong> — Wijzigingen naar GitHub sturen.</p>
                    <p>3. <strong className="text-white">Build</strong> — GitHub Actions bouwt de site.</p>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-purple-600/10 border border-purple-500/20 p-6 rounded-2xl">
                    <h4 className="text-purple-400 font-black text-xs uppercase mb-2">Jules 2.0 AI Architect</h4>
                    <p className="text-xs leading-relaxed italic opacity-70">
                        "Ik help je bij technische vragen over de Athena Factory, React componenten of styling optimalisaties."
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jouw Vraag</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Bv: Hoe kan ik de padding van alle secties vergroten?"
                        className="w-full h-24 bg-black/40 border border-slate-700 rounded-xl p-4 text-white text-xs outline-none focus:border-purple-500 transition-all"
                    />
                    <button 
                        onClick={askJules}
                        disabled={isAsking || !prompt.trim()}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all"
                    >
                        {isAsking ? <i className="fa-solid fa-spinner animate-spin mr-2"></i> : <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>}
                        Advies Vragen
                    </button>
                </div>

                {advice && (
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 prose prose-invert prose-xs max-w-none">
                        <div className="text-[10px] font-black text-slate-500 uppercase mb-4 flex justify-between">
                            <span>Advies van Jules</span>
                            <i className="fa-solid fa-robot"></i>
                        </div>
                        <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-xs">
                            {advice}
                        </div>
                    </div>
                )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default HelpModal;
