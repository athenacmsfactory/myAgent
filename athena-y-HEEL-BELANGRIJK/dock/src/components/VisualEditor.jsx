import React, { useState, useEffect, useRef } from 'react';

const VisualEditor = ({ item, selectedSite, onSave, onCancel, onUpload }) => {
  const labelRef = useRef(null);
  const urlRef = useRef(null);
  const [allSites, setAllSites] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const initialValueData = item.value || item.currentValue || '';
  const dockType = item.dockType || item.dataType || 'text';
  const isLink = dockType === 'link';
  const isAddSection = dockType === 'add_section';
  const isMedia = dockType === 'media' || (!isLink && !isAddSection && item.binding?.key?.toLowerCase().includes('image'));

  const [value, setValue] = useState('');
  const [sectionLibrary, setSectionLibrary] = useState(null);
  const [linkData, setLinkData] = useState({ 
    label: typeof initialValueData === 'object' ? (initialValueData.label || '') : '', 
    url: typeof initialValueData === 'object' ? (initialValueData.url || '') : initialValueData,
    backgroundColor: typeof initialValueData === 'object' ? (initialValueData.backgroundColor || '') : '',
    borderRadius: typeof initialValueData === 'object' ? (initialValueData.borderRadius || '0') : '0',
    padding: typeof initialValueData === 'object' ? (initialValueData.padding || '12px 24px') : '12px 24px'
  });
  const [textStyles, setTextStyles] = useState({
    color: typeof initialValueData === 'object' ? (initialValueData.color || '') : '',
    fontSize: typeof initialValueData === 'object' ? (initialValueData.fontSize || '') : '',
    fontWeight: typeof initialValueData === 'object' ? (initialValueData.fontWeight || 'normal') : 'normal',
    fontStyle: typeof initialValueData === 'object' ? (initialValueData.fontStyle || 'normal') : 'normal',
    textAlign: typeof initialValueData === 'object' ? (initialValueData.textAlign || 'left') : 'left',
    fontFamily: typeof initialValueData === 'object' ? (initialValueData.fontFamily || '') : '',
    shadowX: typeof initialValueData === 'object' ? (initialValueData.shadowX || 0) : 0,
    shadowY: typeof initialValueData === 'object' ? (initialValueData.shadowY || 0) : 0,
    shadowBlur: typeof initialValueData === 'object' ? (initialValueData.shadowBlur || 0) : 0,
    shadowColor: typeof initialValueData === 'object' ? (initialValueData.shadowColor || 'rgba(0,0,0,0.5)') : 'rgba(0,0,0,0.5)',
    paddingTop: typeof initialValueData === 'object' ? (initialValueData.paddingTop || 0) : 0,
    paddingBottom: typeof initialValueData === 'object' ? (initialValueData.paddingBottom || 0) : 0
  });

  useEffect(() => {
    if (isAddSection) {
        fetch('/api/system/section-library')
            .then(res => res.json())
            .then(data => setSectionLibrary(data))
            .catch(e => console.error("Kon sectie-bibliotheek niet laden", e));
    }
  }, [isAddSection]);

  // Initiale waarde zetten op basis van props (voor snelle start)
  useEffect(() => {
    if (typeof initialValueData === 'object') {
        setValue(initialValueData.text || initialValueData.label || initialValueData.title || '');
    } else {
        setValue(initialValueData);
    }
  }, [initialValueData]);

  // [v33 Debug Bridge]: Luister naar antwoorden van de site
  useEffect(() => {
    const handleSyncResponse = (event) => {
      const { type, key, value: siteValue } = event.data;
      
      // Controleer of dit antwoord voor ONS is (match op key)
      if (type === 'SITE_SYNC_RESPONSE' && key === item.binding?.key) {
        console.log('🏁 [VisualEditor] Parameters received from site:', siteValue);

        if (isLink) {
          const foundUrl = (typeof siteValue === 'object' && siteValue !== null) ? siteValue.url : siteValue;
          const foundLabel = (typeof siteValue === 'object' && siteValue !== null) ? siteValue.label : siteValue;
          setLinkData({ 
            label: foundLabel || '', 
            url: foundUrl || '',
            backgroundColor: siteValue.backgroundColor || '',
            borderRadius: siteValue.borderRadius || '0',
            padding: siteValue.padding || '12px 24px'
          });
          if (labelRef.current) labelRef.current.value = foundLabel || '';
          if (urlRef.current) urlRef.current.value = foundUrl || '';
        } else if (!isMedia) {
          if (typeof siteValue === 'object' && siteValue !== null) {
            setValue(siteValue.text || siteValue.title || siteValue.label || siteValue.name || siteValue.value || '');
            setTextStyles({
              color: siteValue.color || '',
              fontSize: siteValue.fontSize || '',
              fontWeight: siteValue.fontWeight || 'normal',
              fontStyle: siteValue.fontStyle || 'normal',
              textAlign: siteValue.textAlign || 'left',
              fontFamily: siteValue.fontFamily || '',
              shadowX: siteValue.shadowX !== undefined ? siteValue.shadowX : 0,
              shadowY: siteValue.shadowY !== undefined ? siteValue.shadowY : 0,
              shadowBlur: siteValue.shadowBlur !== undefined ? siteValue.shadowBlur : 0,
              shadowColor: siteValue.shadowColor || 'rgba(0,0,0,0.5)',
              paddingTop: siteValue.paddingTop !== undefined ? siteValue.paddingTop : 0,
              paddingBottom: siteValue.paddingBottom !== undefined ? siteValue.paddingBottom : 0
            });
          } else {
            setValue(siteValue || '');
          }
        }
        setIsLoaded(true);
      }
    };

    window.addEventListener('message', handleSyncResponse);
    
    // On-Demand Sync logica
    const requestSync = () => {
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'DOCK_REQUEST_SYNC',
          file: item.binding?.file,
          index: item.binding?.index,
          key: item.binding?.key
        }, '*');
      }
    };

    // STARTUP SEQUENCE:
    // 1. Toon de modal (is mount)
    // 2. Wacht heel even tot React klaar is
    // 3. Vraag data op
    const timer = setTimeout(() => {
        requestSync();
        // Fallback als de site niet reageert binnen 1 sec: gebruik initial data
        setTimeout(() => {
            if (!isLoaded) {
                console.warn('⚠️ Site sync timeout, falling back to initial values');
                const val = typeof initialValueData === 'object' ? (initialValueData.text || initialValueData.label || '') : initialValueData;
                setValue(val);
                if (typeof initialValueData === 'object') {
                    setTextStyles(prev => ({ ...prev, ...initialValueData }));
                }
                setIsLoaded(true);
            }
        }, 1000);
    }, 100);

    return () => {
      window.removeEventListener('message', handleSyncResponse);
      clearTimeout(timer);
    };
  }, [item.binding?.key, isLink, isMedia]);

  const handleSave = () => {
    let finalData;
    if (isAddSection) {
        onSave({ type: 'ADD_SECTION', sectionId: value }, {});
        return;
    }

    if (isLink) {
      finalData = {
        label: labelRef.current ? labelRef.current.value : linkData.label,
        url: urlRef.current ? urlRef.current.value : linkData.url,
        backgroundColor: linkData.backgroundColor,
        borderRadius: linkData.borderRadius,
        padding: linkData.padding
      };
    } else if (isMedia) {
      finalData = value;
    } else {
      // Check if we have any active styles
      const hasStyles = textStyles.color || textStyles.fontSize || textStyles.fontWeight !== 'normal' || 
                        textStyles.fontStyle !== 'normal' || textStyles.textAlign !== 'left' || 
                        textStyles.fontFamily || textStyles.shadowBlur > 0 || textStyles.shadowX !== 0 || textStyles.shadowY !== 0 ||
                        textStyles.paddingTop !== 0 || textStyles.paddingBottom !== 0;

      if (hasStyles) {
        finalData = {
          text: value,
          ...textStyles
        };
      } else {
        finalData = value;
      }
    }
    onSave(finalData, {});
  };

  const handleResetToGlobal = () => {
    if (!window.confirm("Weet je zeker dat je alle individuele opmaak (kleur, schaduw, font) wilt wissen? De tekst zal weer de standaard site-stijl volgen.")) return;
    onSave(value, {});
  };

  const getPreviewUrl = (filename) => {
    if (!filename) return '';
    if (filename.startsWith('http')) return filename;

    // Construct URL from selected site
    const baseUrl = selectedSite?.url || '';
    const cleanBase = baseUrl.replace(/\/$/, '');
    return `${cleanBase}/images/${filename}`.replace(/\/+/g, '/').replace('http:/', 'http://').replace('https:/', 'https://');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Use the upload logic from DockFrame if available or a direct upload
    const formData = new FormData();
    formData.append('file', file);

    const baseUrl = selectedSite?.url || '';
    const cleanBase = baseUrl.replace(/\/$/, '');
    const uploadUrl = `${cleanBase}/__athena/upload`;

    try {
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'X-Filename': file.name },
        body: file
      });
      const data = await res.json();
      if (data.success) {
        setValue(data.filename);
        // Direct save for media usually feels better
        // onUpload(data.filename);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload mislukt.");
    }
  };

  const fontOptions = [
    { label: 'Default', value: '' },
    { label: 'Sans Serif', value: 'ui-sans-serif, system-ui, sans-serif' },
    { label: 'Serif', value: 'ui-serif, Georgia, Cambria, serif' },
    { label: 'Mono', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
    { label: 'Inter', value: '"Inter", sans-serif' },
    { label: 'Poppins', value: '"Poppins", sans-serif' },
    { label: 'Montserrat', value: '"Montserrat", sans-serif' },
    { label: 'Playfair', value: '"Playfair Display", serif' }
  ];

  const shadowString = `${textStyles.shadowX}px ${textStyles.shadowY}px ${textStyles.shadowBlur}px ${textStyles.shadowColor}`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in duration-150 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
            {isAddSection ? 'Nieuwe Sectie Toevoegen' : 'Text Editor v8.4.1'}
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark"></i></button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto">
          {isAddSection ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sectionLibrary?.sections?.map(section => (
                    <button 
                        key={section.id}
                        onClick={() => setValue(section.id)}
                        className={`p-6 rounded-[2rem] border-2 text-left transition-all group ${value === section.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-100 dark:border-slate-800 hover:border-blue-300'}`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${value === section.id ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-blue-500'}`}>
                            <i className={`fa-solid ${section.icon} text-xl`}></i>
                        </div>
                        <h4 className="font-black uppercase tracking-tight text-sm mb-1 dark:text-white">{section.name}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{section.description}</p>
                    </button>
                ))}
                {!sectionLibrary && <div className="col-span-full py-10 text-center text-slate-400 italic">Bibliotheek laden...</div>}
            </div>
          ) : isLink ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Button Label</label>
                    <input
                        ref={labelRef}
                        defaultValue={linkData.label}
                        className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="space-y-2 relative">
                    <label className="text-[10px] font-black uppercase text-slate-400">URL / Link Target</label>
                    <input
                        ref={urlRef}
                        defaultValue={linkData.url}
                        className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest text-center">Button Designer</h4>
                
                <div className="grid grid-cols-2 gap-6">
                    {/* Variant Selector */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase text-slate-500">Knoppentype</label>
                        <select 
                            value={linkData.variant} 
                            onChange={(e) => setLinkData(prev => ({ ...prev, variant: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl p-3 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Geen (Standaard Link) --</option>
                            <option value="primary">🔵 Primary (Fill)</option>
                            <option value="secondary">⚪ Secondary (Fill)</option>
                            <option value="outline">🔲 Outline (Border)</option>
                            <option value="ghost">👻 Ghost (Underline)</option>
                        </select>
                    </div>

                    {/* BG Color */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase text-slate-500">Custom Kleur</label>
                        <input 
                            type="color" 
                            value={linkData.backgroundColor || "#3b82f6"} 
                            onChange={(e) => setLinkData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                            className="w-full h-10 rounded-xl cursor-pointer bg-transparent border-2 border-slate-100 dark:border-slate-800"
                        />
                    </div>

                    {/* Radius */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase text-slate-500">Ronding ({linkData.borderRadius})</label>
                        <input 
                            type="range" min="0" max="50" step="2"
                            value={parseInt(linkData.borderRadius) || 0}
                            onChange={(e) => setLinkData(prev => ({ ...prev, borderRadius: `${e.target.value}px` }))}
                            className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none accent-blue-600"
                        />
                    </div>

                    {/* Padding */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase text-slate-500">Padding ({linkData.padding})</label>
                        <select 
                            value={linkData.padding} 
                            onChange={(e) => setLinkData(prev => ({ ...prev, padding: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl p-3 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="8px 16px">Compact</option>
                            <option value="12px 24px">Normal</option>
                            <option value="16px 32px">Large</option>
                            <option value="20px 40px">Huge</option>
                        </select>
                    </div>
                </div>
              </div>
            </div>
          ) : isMedia ? (
            <div className="space-y-4">
              <div className="aspect-video bg-slate-100 dark:bg-black rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center group relative">
                {value ? (
                  <img src={getPreviewUrl(value)} alt="Preview" className="max-h-full object-contain" />
                ) : (
                  <div className="text-slate-400">Geen afbeelding</div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold uppercase text-xs">
                  Upload Nieuw
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400">Bestandsnaam</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    {/* Color */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Color</label>
                      <input
                        type="color"
                        value={textStyles.color || '#000000'}
                        onChange={(e) => setTextStyles(prev => ({ ...prev, color: e.target.value }))}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 bg-transparent"
                      />
                    </div>

                    {/* Font Size */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Size (px)</label>
                      <input
                        type="number"
                        placeholder="Auto"
                        value={textStyles.fontSize}
                        onChange={(e) => setTextStyles(prev => ({ ...prev, fontSize: e.target.value }))}
                        className="w-20 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                      />
                    </div>

                    {/* Font Family */}
                    <div className="space-y-1 flex-1 min-w-[120px]">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Font</label>
                      <select
                        value={textStyles.fontFamily}
                        onChange={(e) => setTextStyles(prev => ({ ...prev, fontFamily: e.target.value }))}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none"
                      >
                        {fontOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {/* Font Style / Weight */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Style</label>
                      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setTextStyles(prev => ({ ...prev, fontWeight: prev.fontWeight === 'bold' ? 'normal' : 'bold' }))}
                          className={`p-2 text-xs w-10 h-10 ${textStyles.fontWeight === 'bold' ? 'bg-blue-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                          title="Bold"
                        >B</button>
                        <button
                          onClick={() => setTextStyles(prev => ({ ...prev, fontStyle: prev.fontStyle === 'italic' ? 'normal' : 'italic' }))}
                          className={`p-2 text-xs w-10 h-10 italic ${textStyles.fontStyle === 'italic' ? 'bg-blue-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                          title="Italic"
                        >I</button>
                      </div>
                    </div>

                    {/* Alignment */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Align</label>
                      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        {['left', 'center', 'right'].map(align => (
                          <button
                            key={align}
                            onClick={() => setTextStyles(prev => ({ ...prev, textAlign: align }))}
                            className={`p-2 text-xs w-10 h-10 ${textStyles.textAlign === align ? 'bg-blue-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            title={align.charAt(0).toUpperCase() + align.slice(1)}
                          >
                            <i className={`fa-solid fa-align-${align}`}></i>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 md:pt-0 md:border-l md:border-slate-200 md:dark:border-slate-800 md:pl-6">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-blue-500 block mb-2">Text Shadow</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase text-slate-400">X-Offset ({textStyles.shadowX}px)</label>
                          <input type="range" min="-20" max="20" value={textStyles.shadowX} onChange={(e) => setTextStyles(prev => ({ ...prev, shadowX: parseInt(e.target.value) }))} className="w-full accent-blue-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase text-slate-400">Y-Offset ({textStyles.shadowY}px)</label>
                          <input type="range" min="-20" max="20" value={textStyles.shadowY} onChange={(e) => setTextStyles(prev => ({ ...prev, shadowY: parseInt(e.target.value) }))} className="w-full accent-blue-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase text-slate-400">Blur ({textStyles.shadowBlur}px)</label>
                          <input type="range" min="0" max="30" value={textStyles.shadowBlur} onChange={(e) => setTextStyles(prev => ({ ...prev, shadowBlur: parseInt(e.target.value) }))} className="w-full accent-blue-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase text-slate-400">Shadow Color</label>
                          <div className="flex gap-2">
                            <input type="color" value={textStyles.shadowColor.startsWith('rgba') ? '#000000' : textStyles.shadowColor} onChange={(e) => setTextStyles(prev => ({ ...prev, shadowColor: e.target.value }))} className="w-8 h-8 rounded cursor-pointer border border-slate-200 bg-transparent" />
                            <button onClick={() => setTextStyles(prev => ({ ...prev, shadowColor: 'rgba(0,0,0,0.5)' }))} className="text-[8px] font-bold text-slate-400 hover:text-blue-500 underline uppercase">Reset</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <label className="text-[10px] font-black uppercase text-purple-500 block mb-2">Vertical Spacing (Padding)</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase text-slate-400">Padding Top ({textStyles.paddingTop}px)</label>
                          <input type="range" min="0" max="200" value={textStyles.paddingTop} onChange={(e) => setTextStyles(prev => ({ ...prev, paddingTop: parseInt(e.target.value) }))} className="w-full accent-purple-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase text-slate-400">Padding Bottom ({textStyles.paddingBottom}px)</label>
                          <input type="range" min="0" max="200" value={textStyles.paddingBottom} onChange={(e) => setTextStyles(prev => ({ ...prev, paddingBottom: parseInt(e.target.value) }))} className="w-full accent-purple-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Content</label>
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full p-6 bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-700 rounded-2xl min-h-[150px] text-slate-900 dark:text-white resize-none outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    color: textStyles.color,
                    fontSize: textStyles.fontSize ? `${textStyles.fontSize}px` : undefined,
                    fontWeight: textStyles.fontWeight,
                    fontStyle: textStyles.fontStyle,
                    textAlign: textStyles.textAlign,
                    fontFamily: textStyles.fontFamily,
                    textShadow: shadowString,
                    paddingTop: `${textStyles.paddingTop}px`,
                    paddingBottom: `${textStyles.paddingBottom}px`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <button 
            onClick={handleResetToGlobal}
            className="text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-2"
            title="Wis alle handmatige opmaak en volg weer de globale instellingen."
          >
            <i className="fa-solid fa-rotate-left"></i> Reset naar standaard
          </button>

          <div className="flex gap-4">
            <button onClick={onCancel} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all">Cancel</button>
            <button onClick={handleSave} className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all">SAVE CHANGES</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VisualEditor;
