import React, { useState, useCallback, useEffect, useRef } from 'react';

/**
 * DesignControls for Athena Dock (v8.4.6 - SELF-REPORTING EDITION)
 * This sidebar now 'learns' its colors from the site's computed CSS.
 */
export default function DesignControls({ onColorChange, siteStructure }) {
  const lastInteractionTime = useRef(0);
  const debounceTimer = useRef(null);
  const [localColors, setLocalColors] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [presets, setPresets] = useState([]);
  const [stylePresetName, setStylePresetName] = useState('');
  const [debugInfo, setDebugInfo] = useState({ source: 'Searching...', lastSync: null, keysFound: 0 });
  const [showInspector, setShowInspector] = useState(false);

  const [sliderValues, setSliderValues] = useState({
    content_top_offset: 0,
    header_height: 80
  });

  const hydrateData = useCallback((sourceName, rawData) => {
    if (!rawData) return;
    
    const flat = {
      ...(rawData.site_settings || {}),
      ...(Array.isArray(rawData.site_settings) ? rawData.site_settings[0] : {}),
      ...(rawData.style_config || {}),
      ...(Array.isArray(rawData.style_config) ? rawData.style_config[0] : {}),
      ...(rawData.header_settings || {}),
      ...(Array.isArray(rawData.header_settings) ? rawData.header_settings[0] : {}),
      ...(rawData.hero || {}),
      ...(Array.isArray(rawData.hero) ? rawData.hero[0] : {}),
      ...rawData // Include top-level properties (which now include computed colors)
    };

    if (Object.keys(flat).length > 5) {
        setLocalColors(prev => ({ ...prev, ...flat }));
        setDebugInfo({ 
            source: sourceName, 
            lastSync: new Date().toLocaleTimeString(), 
            keysFound: Object.keys(flat).length
        });
        setIsHydrated(true);

        const h = flat.header_hoogte || flat.header_height || 80;
        const o = flat.content_top_offset || 0;
        setSliderValues({ header_height: parseInt(h), content_top_offset: parseInt(o) });
    }
  }, []);

  useEffect(() => {
    fetch('/api/system/style-presets')
        .then(res => {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return res.json();
            } else {
                throw new Error("Ongeldige JSON ontvangen (waarschijnlijk HTML error)");
            }
        })
        .then(data => setPresets(data.presets || []))
        .catch(e => console.error("Kon presets niet laden", e));
  }, []);

  const handleApplyPreset = async (preset) => {
    if (!window.confirm(`Preset '${preset.name}' toepassen? Dit overschrijft huidige kleuren.`)) return;
    
    console.log("🎨 Applying style preset:", preset.id);
    for (const [key, value] of Object.entries(preset.colors)) {
        handlePreview(key, value);
        handleSave(key, value);
    }
  };

  const handleSaveStylePreset = async () => {
    if (!stylePresetName) return;
    const rawUrl = siteStructure?.url || window.location.origin;
    const siteName = rawUrl.split('/')[3] || 'dock-test-site';
    
    try {
        const res = await fetch(`/api/sites/${siteName}/save-style-preset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: stylePresetName })
        });
        if (res.ok) {
            alert(`✅ Stijl '${stylePresetName}' opgeslagen als preset!`);
            setStylePresetName('');
            // Reload presets
            fetch('/api/system/style-presets').then(r => r.json()).then(d => setPresets(d.presets || []));
        }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const handleSiteMessage = (event) => {
      if (event.data?.type === 'SITE_READY' || event.data?.type === 'SITE_SYNC_RESPONSE') {
        const payload = event.data.structure || { data: event.data.fullRow ? { style_config: event.data.fullRow } : null };
        if (payload.data) hydrateData('Live Site Scan', payload.data);
      }
    };
    window.addEventListener('message', handleSiteMessage);
    return () => window.removeEventListener('message', handleSiteMessage);
  }, [hydrateData]);

  useEffect(() => {
    if (siteStructure?.data && (Date.now() - lastInteractionTime.current > 3000)) {
        hydrateData('Dock API', siteStructure.data);
    }
  }, [siteStructure, hydrateData]);

  const handlePreview = (key, value) => {
    lastInteractionTime.current = Date.now();
    if (key === 'content_top_offset' || key === 'header_hoogte') {
      const sliderKey = key === 'header_hoogte' ? 'header_height' : key;
      setSliderValues(prev => ({ ...prev, [sliderKey]: value }));
    }
    setLocalColors(prev => ({ ...prev, [key]: value }));
    
    // DEBOUNCED PREVIEW (v2.1)
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
        onColorChange(key, value, false);
    }, 16);
  };

  const handleSave = (key, value) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    lastInteractionTime.current = Date.now();
    setLocalColors(prev => ({ ...prev, [key]: value }));
    onColorChange(key, value, true);
  };

  const handleExportToSheets = async () => {
    const rawUrl = siteStructure?.url || window.location.origin;
    const siteName = rawUrl.split('/')[3] || 'dock-test-site';
    const url = `/api/sites/${siteName}/export-to-sheet`;

    setIsSyncing(true);
    try {
        const response = await fetch(url, { method: 'POST' });
        const result = await response.json();
        if (result.success) {
            alert("✅ Wijzigingen succesvol geëxporteerd naar Google Sheets!");
        } else {
            alert("❌ Fout bij export: " + (result.error || "Onbekende fout"));
        }
    } catch (e) {
        alert("❌ Netwerkfout bij export.");
    } finally {
        setIsSyncing(false);
    }
  };

  const handleFooterChange = async (type) => {
    const rawUrl = siteStructure?.url || window.location.origin;
    const siteName = rawUrl.split('/')[3] || 'dock-test-site';
    const url = `/api/sites/${siteName}/update-config`;

    try {
        const res = await fetch(url, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ footer: type }) 
        });
        if (res.ok) {
            alert(`✅ Footer gewijzigd naar ${type}. De site wordt herbouwd...`);
            window.location.reload();
        }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-6 h-full overflow-y-auto pb-32">
      {/* Sidebar Header */}
      <div className="mb-8 flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative z-10">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white leading-none">Design Editor</h3>
          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-2 font-bold uppercase">
              <span className={`w-2 h-2 rounded-full ${isHydrated ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></span>
              {isHydrated ? `Synced` : 'Waiting'}
          </p>
        </div>
        <button 
            onClick={() => setShowInspector(true)} 
            className="bg-blue-600 text-white w-10 h-10 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center"
        >
            <i className="fa-solid fa-chart-simple"></i>
        </button>
      </div>

      {/* --- FULL SCREEN DATA INSPECTOR --- */}
      {showInspector && (
        <div className="fixed inset-0 z-[5000] bg-slate-900/95 backdrop-blur-2xl flex flex-col p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h2 className="text-white font-black text-4xl tracking-tighter uppercase mb-2">Athena Data Inspector</h2>
                    <p className="text-blue-400 font-mono text-xs uppercase">Hydration Source: {debugInfo.source} | Last Sync: {debugInfo.lastSync}</p>
                </div>
                <button 
                    onClick={() => setShowInspector(false)}
                    className="bg-white text-black px-10 py-4 rounded-2xl font-black text-xs hover:bg-blue-500 hover:text-white transition-all shadow-2xl"
                >
                    CLOSE INSPECTOR
                </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                    <h4 className="text-white font-black text-xs uppercase mb-6 tracking-widest opacity-50">Global Palette</h4>
                    <div className="space-y-3">
                        {Object.entries(localColors).filter(([k]) => k.includes('_color')).sort().map(([k, v]) => (
                            <div key={k} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl">
                                <div className="w-10 h-10 rounded-xl shadow-inner border border-white/10" style={{ backgroundColor: String(v) }}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black text-slate-500 uppercase truncate">{k}</p>
                                    <p className="text-sm font-mono text-white truncate">{String(v)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 flex flex-col">
                    <h4 className="text-white font-black text-xs uppercase mb-6 tracking-widest opacity-50">Rauwe Data Feed</h4>
                    <div className="flex-1 overflow-auto font-mono text-[10px] space-y-1">
                        {Object.entries(localColors).sort().map(([k, v]) => (
                            <div key={k} className="flex justify-between border-b border-white/5 py-1.5 hover:bg-white/5 px-2 rounded transition-colors">
                                <span className="text-blue-400">{k}:</span>
                                <span className="text-slate-300 truncate max-w-[150px]">{typeof v === 'object' ? '{Obj}' : String(v)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                    <h4 className="text-white font-black text-xs uppercase mb-6 tracking-widest opacity-50">Sync Check</h4>
                    <div className="space-y-6">
                        <div className="p-6 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                            <p className="text-white font-bold text-xs mb-4">Diagnostic Result:</p>
                            <div className="space-y-2 text-[11px]">
                                <p className="flex justify-between"><span>Iframe Ready:</span> <span className="text-green-400">YES</span></p>
                                <p className="flex justify-between"><span>Bridge V33:</span> <span className="text-green-400">ACTIVE</span></p>
                                <p className="flex justify-between"><span>Data State:</span> <span className="text-green-400">POPULATED</span></p>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed italic">
                            De kleuren in de kiezers worden geladen uit style_config.json. Als ze zwart blijven in de kiezers maar de site is wel gekleurd, dan is style_config.json leeg en gebruikt de site berekende defaults.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- REGULAR UI --- */}
      <div className="space-y-10 relative z-0">
        {/* Style Presets Gallery */}
        <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">Style Presets</h4>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {presets.map(preset => (
                    <button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset)}
                        className="shrink-0 group flex flex-col items-center gap-2"
                    >
                        <div className="w-14 h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-1 group-hover:border-emerald-500 transition-all active:scale-90 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                            <div className="grid grid-cols-2 grid-rows-2 h-full rounded-lg overflow-hidden">
                                <div style={{ backgroundColor: preset.colors.light_primary_color || preset.colors.dark_primary_color }}></div>
                                <div style={{ backgroundColor: preset.colors.light_accent_color || preset.colors.dark_accent_color }}></div>
                                <div style={{ backgroundColor: preset.colors.light_bg_color || preset.colors.dark_bg_color }}></div>
                                <div style={{ backgroundColor: preset.colors.light_text_color || preset.colors.dark_text_color }}></div>
                            </div>
                        </div>
                        <span className="text-[8px] font-black uppercase text-slate-500 group-hover:text-emerald-500 transition-colors whitespace-nowrap">{preset.name.split(' ').slice(1).join(' ')}</span>
                    </button>
                ))}
            </div>
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <input 
                    type="text" 
                    placeholder="Huidige stijl opslaan als..." 
                    value={stylePresetName}
                    onChange={(e) => setStylePresetName(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border-0 rounded-xl px-4 py-2 text-[10px] font-bold outline-none dark:text-white"
                />
                <button 
                    onClick={handleSaveStylePreset}
                    disabled={!stylePresetName}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30"
                >
                    Save
                </button>
            </div>
        </div>

        {/* Style & Footer Dropdowns */}
        <div className="space-y-3">
            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <select
                    onChange={(e) => {
                        const rawUrl = siteStructure?.url || window.location.origin;
                        const siteName = rawUrl.split('/')[3] || 'dock-test-site';
                        const baseUrl = rawUrl.split('/' + siteName)[0];
                        const url = `${baseUrl}/${siteName}/__athena/update-json`;
                        fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'swap-style', value: e.target.value }) })
                        .then(() => window.location.reload());
                    }}
                    className="w-full text-xs p-4 bg-white dark:bg-slate-900 border-0 rounded-xl font-black text-slate-800 dark:text-white focus:outline-none shadow-sm appearance-none cursor-pointer"
                    defaultValue=""
                >
                    <option value="" disabled>THEME STIJL KIEZEN...</option>
                    {['modern.css', 'classic.css', 'modern-dark.css', 'bold.css', 'corporate.css', 'warm.css'].map(style => (
                    <option key={style} value={style}>🎨 {style.replace('.css', '').toUpperCase()}</option>
                    ))}
                </select>
            </div>

            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <select
                    onChange={(e) => handleFooterChange(e.target.value)}
                    className="w-full text-xs p-4 bg-white dark:bg-slate-900 border-0 rounded-xl font-black text-slate-800 dark:text-white focus:outline-none shadow-sm appearance-none cursor-pointer"
                    defaultValue={localColors.footer_type || ""}
                >
                    <option value="" disabled>FOOTER TYPE KIEZEN...</option>
                    <option value="minimal">🔗 MINIMAL (Basic)</option>
                    <option value="expanded">📱 EXPANDED (Socials)</option>
                    <option value="columns">🏛️ COLUMNS (Advanced)</option>
                </select>
            </div>
            </div>

            {/* Typography Section */}
            <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-blue-500 pl-3">Typografie</h4>

            <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Heading Font</label>
                    <select 
                        value={localColors.font_heading || "serif"}
                        onChange={(e) => { handlePreview('font_heading', e.target.value); handleSave('font_heading', e.target.value); }}
                        className="w-full text-xs p-3 bg-white dark:bg-slate-900 border-0 rounded-xl font-bold dark:text-white outline-none shadow-sm"
                    >
                        <option value="serif">Classic Serif</option>
                        <option value="sans">Modern Sans</option>
                        <option value="mono">Technical Mono</option>
                        <option value="display">Display Bold</option>
                    </select>
                </div>

                <div className="space-y-2 pt-2">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Body Font</label>
                    <select 
                        value={localColors.font_body || "sans"}
                        onChange={(e) => { handlePreview('font_body', e.target.value); handleSave('font_body', e.target.value); }}
                        className="w-full text-xs p-3 bg-white dark:bg-slate-900 border-0 rounded-xl font-bold dark:text-white outline-none shadow-sm"
                    >
                        <option value="sans">Modern Sans</option>
                        <option value="serif">Classic Serif</option>
                        <option value="mono">Technical Mono</option>
                    </select>
                </div>

                <div className="space-y-3 pt-2">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider flex justify-between">
                            <span>Basis Grootte</span>
                            <span className="text-blue-500">{localColors.font_base_size || "16px"}</span>
                        </label>
                        <input 
                            type="range" min="12" max="24" step="1"
                            value={parseInt(localColors.font_base_size) || 16}
                            onChange={(e) => { handlePreview('font_base_size', `${e.target.value}px`); handleSave('font_base_size', `${e.target.value}px`); }}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none accent-blue-600"
                        />
                    </div>
                </div>
                </div>

                {/* Global Button Section */}
                <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-blue-500 pl-3">Globale Knoppen</h4>

                <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Knoppen Vorm</label>
                        <select 
                            value={localColors.button_radius || "9999px"}
                            onChange={(e) => { handlePreview('button_radius', e.target.value); handleSave('button_radius', e.target.value); }}
                            className="w-full text-xs p-3 bg-white dark:bg-slate-900 border-0 rounded-xl font-bold dark:text-white outline-none shadow-sm"
                        >
                            <option value="9999px">Pill (Full Rounded)</option>
                            <option value="12px">Soft (Rounded)</option>
                            <option value="4px">Technical (Small Radius)</option>
                            <option value="0px">Square (Sharp)</option>
                        </select>
                    </div>

                    <div className="space-y-2 pt-2">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Knoppen Stijl</label>
                        <select 
                            value={localColors.button_style || "solid"}
                            onChange={(e) => { handlePreview('button_style', e.target.value); handleSave('button_style', e.target.value); }}
                            className="w-full text-xs p-3 bg-white dark:bg-slate-900 border-0 rounded-xl font-bold dark:text-white outline-none shadow-sm"
                        >
                            <option value="solid">Standard Solid</option>
                            <option value="glow">Soft Glow (Shadow)</option>
                            <option value="flat">Flat (Minimalist)</option>
                            <option value="glass">Glassmorphism (Subtle)</option>
                        </select>
                    </div>
                </div>
                </div>

                {/* Layout Controls */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-blue-500 pl-3">Header & Layout</h4>
          <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
              <label className="text-[9px] font-black text-slate-500 uppercase">Header Visible</label>
              <input
                type="checkbox"
                checked={localColors.header_zichtbaar !== false}
                onChange={(e) => { handlePreview('header_zichtbaar', e.target.checked); handleSave('header_zichtbaar', e.target.checked); }}
                className="w-5 h-5 rounded-full border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
            </div>

            <Slider label="Hoogte" value={sliderValues.header_height} min={40} max={250} unit="px" onPreview={(v) => handlePreview('header_hoogte', v)} onSave={(v) => handleSave('header_hoogte', v)} />
            <Slider label="Transparantie" value={Math.round((parseFloat(localColors.header_transparantie) || 0) * 100)} min={0} max={100} unit="%" onPreview={(v) => handlePreview('header_transparantie', v/100)} onSave={(v) => handleSave('header_transparantie', v/100)} />
            <Slider label="Content Offset" value={sliderValues.content_top_offset} min={0} max={200} unit="px" onPreview={(v) => handlePreview('content_top_offset', v)} onSave={(v) => handleSave('content_top_offset', v)} />

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
              <Toggle label="Logo" settingsKey="toon_logo" value={localColors.toon_logo} onPreview={handlePreview} onSave={handleSave} />
              <Toggle label="Titel" settingsKey="toon_titel" value={localColors.toon_titel} onPreview={handlePreview} onSave={handleSave} />
              <Toggle label="Ondertitel" settingsKey="toon_ondertitel" value={localColors.toon_ondertitel} onPreview={handlePreview} onSave={handleSave} />
              <Toggle label="CTA Knop" settingsKey="toon_cta_knop" value={localColors.toon_cta_knop} onPreview={handlePreview} onSave={handleSave} />
              <Toggle label="Navigatie" settingsKey="toon_navigatie" value={localColors.toon_navigatie} onPreview={handlePreview} onSave={handleSave} />
            </div>
          </div>
        </div>

        {/* Color Palette Sections */}
        <ColorSection title="Light Theme" prefix="light_" colors={localColors} onPreview={handlePreview} onSave={handleSave} themeColor="blue" />
        <ColorSection title="Dark Theme" prefix="dark_" colors={localColors} onPreview={handlePreview} onSave={handleSave} themeColor="purple" />

        {/* --- DOCK PERSISTENCE LAYER --- */}
        <div className="pt-10 border-t border-slate-200 dark:border-slate-800">
            <button
                onClick={handleExportToSheets}
                disabled={isSyncing}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${
                    isSyncing 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95'
                }`}
            >
                {isSyncing ? (
                    <i className="fa-solid fa-spinner animate-spin"></i>
                ) : (
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                )}
                {isSyncing ? 'Synchroniseren...' : 'Export naar Google Sheets'}
            </button>
            {localColors.last_sheet_sync && (
                <p className="text-[8px] text-emerald-500/70 mt-2 font-mono uppercase tracking-tighter text-center">
                    Laatste sync: {new Date(localColors.last_sheet_sync).toLocaleString()}
                </p>
            )}
            <p className="text-[9px] text-slate-400 mt-4 text-center leading-relaxed px-4">
                Dit pusht alle lokale visuele wijzigingen (kleuren, logo, titels) naar de live Google Sheet bron.
            </p>
        </div>
      </div>
    </div>
  );
}

const Slider = ({ label, value, min, max, unit, onPreview, onSave }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <label className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{label}</label>
      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{value}{unit}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      value={value} 
      onInput={(e) => onPreview(e.target.value)} 
      onChange={(e) => onSave(e.target.value)}
      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" 
    />
  </div>
);

const Toggle = ({ label, settingsKey, value, onPreview, onSave }) => (
  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-blue-200 transition-colors">
    <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{label}</label>
    <input
      type="checkbox"
      checked={value !== false}
      onChange={(e) => { onPreview(settingsKey, e.target.checked); onSave(settingsKey, e.target.checked); }}
      className="w-4 h-4 rounded-full border-slate-300 text-blue-600 cursor-pointer"
    />
  </div>
);

const ColorSection = ({ title, prefix, colors, onPreview, onSave, themeColor }) => (
  <div className="space-y-6">
    <h4 className={`text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-${themeColor}-500 pl-3`}>{title} Colors</h4>
    <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-inner">
      {['primary', 'accent', 'button', 'card', 'header', 'footer', 'bg', 'text'].map(key => (
        <div key={key} className="space-y-2">
          <label className="text-[8px] font-black uppercase text-slate-400 block ml-1">{key}</label>
          <div className="relative group">
            <input
                type="color"
                value={colors[`${prefix}${key}_color`] || '#000000'}
                onInput={(e) => onPreview(`${prefix}${key}_color`, e.target.value)}
                onChange={(e) => onSave(`${prefix}${key}_color`, e.target.value)}
                className="w-full h-10 rounded-2xl cursor-pointer border-2 border-white dark:border-slate-700 bg-transparent shadow-sm group-hover:scale-105 transition-transform"
            />
            {(!colors[`${prefix}${key}_color`] || colors[`${prefix}${key}_color`] === '#000000') && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Missing data"></div>
                </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);
