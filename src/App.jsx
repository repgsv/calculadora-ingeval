import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Settings, 
  Construction, 
  Layers, 
  Trash2, 
  FileText,
  AlertCircle,
  Info,
  Scale,
  Variable,
  Wrench,
  Maximize,
  Box,
  ChevronDown,
  Hammer,
  Droplets,
  Layout,
  Hash,
  Grid
} from 'lucide-react';

// --- CONSTANTES GLOBALES ---
const RODS_PER_QQ = {
  2: 30, 3: 13.6, 4: 8.5, 5: 4.87, 6: 3.4, 7: 2.5, 
  8: 1.9, 9: 1.5, 10: 1.2, 11: 1.0, 12: 0.85,
};

// --- COMPONENTES COMPARTIDOS DE UI ---
const Navbar = ({ activeModule, setActiveModule }) => {
  const modules = [
    { id: 'soleras', label: 'Soleras', icon: Construction },
    { id: 'zapatas', label: 'Zapatas', icon: Maximize },
    { id: 'nervios', label: 'Nervios', icon: Layers },
    { id: 'vigas', label: 'Vigas', icon: Box },
    { id: 'paredes', label: 'Paredes', icon: Grid },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <Construction size={22} />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tighter italic">INGEVAL</span>
          </div>
          <div className="hidden md:flex gap-1">
            {modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  activeModule === mod.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <mod.icon size={14} />
                {mod.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

const SteelRow = ({ label, bars, qq, cal }) => (
  <div className="space-y-1 mb-2">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="bg-indigo-700 text-white text-[9px] px-1.5 py-0.5 rounded font-black">#{cal}</span>
        <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest italic">{label}</span>
      </div>
      <span className="text-[10px] text-slate-500 font-mono">{(bars || 0).toFixed(2)} uds</span>
    </div>
    <div className="flex justify-between font-bold text-emerald-400 border-t border-slate-800/50 pt-1 leading-none">
      <span className="text-[8px] uppercase tracking-tighter text-slate-400">Peso Estimado:</span>
      <span className="text-sm font-mono">{(qq || 0).toFixed(2)} qq</span>
    </div>
  </div>
);

const ResultRow = ({ label, value, color = "text-slate-100" }) => (
  <div className="flex justify-between items-center text-sm border-b border-slate-800/30 pb-1.5 mb-1.5">
    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-tight">{label}:</span>
    <span className={`font-mono font-bold ${color}`}>{value}</span>
  </div>
);

// --- MÓDULO SOLERAS ---
const SolerasModule = () => {
  const [data, setData] = useState({
    unidad: 'ml', cantidad: 1, ancho: 0.20, alto: 0.20, recubrimiento: 3,
    sobreexcavacion: 'No', calibreLong: 4, cantidadLong: 4, calibreTrans: 3, separacion: 0.20,
    despConc: 5, despAce: 5, usos: 2
  });

  const results = useMemo(() => {
    let lT = data.unidad === 'ml' ? data.cantidad : (data.ancho * data.alto > 0 ? data.cantidad / (data.ancho * data.alto) : 0);
    const vN = data.ancho * data.alto * lT;
    const vC = vN * (1 + data.despConc / 100);
    const v6L = (lT * data.cantidadLong / 6) * (1 + data.despAce / 100);
    const qL = v6L / RODS_PER_QQ[data.calibreLong];
    const dE = ((data.ancho - (data.recubrimiento/100 * 2)) * 2) + ((data.alto - 0.07 - data.recubrimiento/100) * 2);
    const v6T = ((lT / data.separacion + 1) * Math.max(0, dE) / 6) * (1 + data.despAce / 100);
    const qT = v6T / RODS_PER_QQ[data.calibreTrans];
    const ply = data.sobreexcavacion === 'Sí' ? (lT * data.alto * 2) / 2.97 / data.usos : 0;
    return { lT, vN, vC, v6L, qL, v6T, qT, al: (qL + qT) * 3, ply };
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-indigo-700 font-bold mb-4 uppercase text-xs border-b pb-2 tracking-widest"><Layers size={16} className="inline mr-2"/> Geometría Soleras</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400">Unidad</label><select value={data.unidad} onChange={(e)=>setData({...data, unidad: e.target.value})} className="border p-2 rounded bg-indigo-50/30 text-indigo-700 font-bold"><option value="ml">Lineal (ml)</option><option value="m3">Cúbico (m³)</option></select></div>
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400">Cantidad</label><input type="number" value={data.cantidad} onChange={(e)=>setData({...data, cantidad: parseFloat(e.target.value)||0})} className="border p-2 rounded" /></div>
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400">Ancho (m)</label><input type="number" step="0.01" value={data.ancho} onChange={(e)=>setData({...data, ancho: parseFloat(e.target.value)||0})} className="border p-2 rounded" /></div>
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-indigo-500">Largo L (m)</label><input type="text" value={results.lT.toFixed(2)} disabled className="border p-2 rounded bg-slate-50 font-bold" /></div>
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400">Alto (m)</label><input type="number" step="0.01" value={data.alto} onChange={(e)=>setData({...data, alto: parseFloat(e.target.value)||0})} className="border p-2 rounded" /></div>
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400">Recub. (cm)</label><input type="number" value={data.recubrimiento} onChange={(e)=>setData({...data, recubrimiento: parseFloat(e.target.value)||0})} className="border p-2 rounded" /></div>
            <div className="flex flex-col gap-1 col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase">¿Sobreexcavación (Lleva Moldes)?</label><select value={data.sobreexcavacion} onChange={(e)=>setData({...data, sobreexcavacion: e.target.value})} className="border p-2 rounded font-bold text-indigo-600"><option value="No">No</option><option value="Sí">Sí</option></select></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-indigo-700 font-bold mb-4 uppercase text-xs border-b pb-2 tracking-widest"><Settings size={16} className="inline mr-2"/> Diseño de Refuerzo</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2"><p className="text-[10px] font-black text-indigo-500 uppercase">Longitudinal</p><div className="flex gap-2"><select value={data.calibreLong} onChange={(e)=>setData({...data, calibreLong: parseInt(e.target.value)})} className="border p-1.5 rounded text-xs w-full">{Object.keys(RODS_PER_QQ).map(k=><option key={k} value={k}>#{k}</option>)}</select><input type="number" value={data.cantidadLong} onChange={(e)=>setData({...data, cantidadLong: parseInt(e.target.value)||0})} className="border p-1.5 rounded text-xs w-full" /></div></div>
            <div className="space-y-2"><p className="text-[10px] font-black text-indigo-500 uppercase">Estribos</p><div className="flex gap-2"><select value={data.calibreTrans} onChange={(e)=>setData({...data, calibreTrans: parseInt(e.target.value)})} className="border p-1.5 rounded text-xs w-full">{Object.keys(RODS_PER_QQ).map(k=><option key={k} value={k}>#{k}</option>)}</select><input type="number" step="0.01" value={data.separacion} onChange={(e)=>setData({...data, separacion: parseFloat(e.target.value)||0})} className="border p-1.5 rounded text-xs w-full" /></div></div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-5">
        <ResultsView type="SOLERAS" results={results} data={data} steels={[
          {label: 'Longitudinal', bars: results.v6L, qq: results.qL, cal: data.calibreLong},
          {label: 'Estribos', bars: results.v6T, qq: results.qT, cal: data.calibreTrans}
        ]} />
      </div>
    </div>
  );
};

// --- MÓDULO ZAPATAS ---
const ZapatasModule = () => {
  const [data, setData] = useState({
    tipo: 'Aislada', cantidad: 1, anchoB: 1.00, altoH: 0.30, recubrimiento: 7.5,
    sobreexcavacion: 'No', calibreX: 4, espX: 0.15, calibreY: 4, espY: 0.15,
    refuerzoSup: 'No', calibreXSup: 3, espXSup: 0.20, calibreYSup: 3, espYSup: 0.20,
    despC: 5, despA: 5, usos: 2
  });

  const results = useMemo(() => {
    let lT = data.tipo === 'Corrida' ? data.cantidad : (data.anchoB * data.altoH > 0 ? data.cantidad / (data.anchoB * data.altoH) : 0);
    const vN = data.anchoB * data.altoH * lT;
    const vC = vN * (1 + data.despC/100);
    const rM = data.recubrimiento / 100;
    
    // Inferior
    const lX = Math.max(0, data.anchoB - (2 * rM));
    const cXInf = (data.espY > 0) ? (lT / data.espY + 1) : 0;
    const v6XInf = (cXInf * lX / 6) * (1 + data.despA/100);
    const qXInf = v6XInf / RODS_PER_QQ[data.calibreX];
    
    const lY = Math.max(0, lT - (2 * rM));
    const cYInf = (data.espX > 0) ? (data.anchoB / data.espX + 1) : 0;
    const v6YInf = (cYInf * lY / 6) * (1 + data.despA/100);
    const qYInf = v6YInf / RODS_PER_QQ[data.calibreY];

    // Superior
    let v6XSup = 0, qXSup = 0, v6YSup = 0, qYSup = 0;
    if (data.refuerzoSup === 'Sí') {
      const cXSup = (data.espYSup > 0) ? (lT / data.espYSup + 1) : 0;
      v6XSup = (cXSup * lX / 6) * (1 + data.despA/100);
      qXSup = v6XSup / RODS_PER_QQ[data.calibreXSup];
      const cYSup = (data.espXSup > 0) ? (data.anchoB / data.espXSup + 1) : 0;
      v6YSup = (cYSup * lY / 6) * (1 + data.despA/100);
      qYSup = v6YSup / RODS_PER_QQ[data.calibreYSup];
    }

    const aC = data.sobreexcavacion === 'Sí' ? (lT * data.altoH * 2) + (data.anchoB * data.altoH * 2) : 0;
    return { lT, vN, vC, qX: qXInf+qXSup, qY: qYInf+qYSup, v6X: v6XInf+v6XSup, v6Y: v6YInf+v6YSup, al: (qXInf+qYInf+qXSup+qYSup)*3, ply: aC / 2.97 / data.usos };
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-indigo-700 font-bold mb-4 uppercase text-xs border-b pb-2 tracking-widest"><Maximize size={16} className="inline mr-2"/> Geometría Zapatas</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400">Tipo</label><select value={data.tipo} onChange={(e)=>setData({...data, tipo: e.target.value})} className="border p-2 rounded bg-indigo-50/30 text-indigo-700 font-bold"><option value="Aislada">Aislada (m³)</option><option value="Corrida">Corrida (ml)</option></select></div>
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400">Cant. Análisis</label><input type="number" value={data.cantidad} onChange={(e)=>setData({...data, cantidad: parseFloat(e.target.value)||0})} className="border p-2 rounded" /></div>
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400">Ancho B (m)</label><input type="number" step="0.01" value={data.anchoB} onChange={(e)=>setData({...data, anchoB: parseFloat(e.target.value)||0})} className="border p-2 rounded" /></div>
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-indigo-500">Largo L (m)</label><input type="text" value={results.lT.toFixed(2)} disabled className="border p-2 rounded bg-slate-50 font-bold" /></div>
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400">Alto H (m)</label><input type="number" step="0.01" value={data.altoH} onChange={(e)=>setData({...data, altoH: parseFloat(e.target.value)||0})} className="border p-2 rounded" /></div>
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400">Recub. (cm)</label><input type="number" value={data.recubrimiento} onChange={(e)=>setData({...data, recubrimiento: parseFloat(e.target.value)||0})} className="border p-2 rounded" /></div>
            <div className="flex flex-col gap-1 col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase">¿Sobreexcavación (Molde)?</label><select value={data.sobreexcavacion} onChange={(e)=>setData({...data, sobreexcavacion: e.target.value})} className="border p-2 rounded font-bold text-indigo-600"><option value="No">No</option><option value="Sí">Sí</option></select></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-indigo-700 font-bold mb-4 uppercase text-xs border-b pb-2 tracking-widest"><Settings size={16} className="inline mr-2"/> Diseño de Refuerzo</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded"><p className="text-[10px] font-bold mb-2 uppercase text-indigo-500">Sentido X (Inf)</p><div className="flex gap-2"><select value={data.calibreX} onChange={(e)=>setData({...data, calibreX: parseInt(e.target.value)})} className="w-full text-xs border p-1 rounded">{Object.keys(RODS_PER_QQ).map(k=><option key={k} value={k}>#{k}</option>)}</select><input type="number" step="0.01" value={data.espX} onChange={(e)=>setData({...data, espX: parseFloat(e.target.value)||0})} className="w-full text-xs border p-1 rounded" /></div></div>
              <div className="p-3 bg-slate-50 rounded"><p className="text-[10px] font-bold mb-2 uppercase text-indigo-500">Sentido Y (Inf)</p><div className="flex gap-2"><select value={data.calibreY} onChange={(e)=>setData({...data, calibreY: parseInt(e.target.value)})} className="w-full text-xs border p-1 rounded">{Object.keys(RODS_PER_QQ).map(k=><option key={k} value={k}>#{k}</option>)}</select><input type="number" step="0.01" value={data.espY} onChange={(e)=>setData({...data, espY: parseFloat(e.target.value)||0})} className="w-full text-xs border p-1 rounded" /></div></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-indigo-600 rounded text-white text-xs font-bold uppercase shadow-lg"><span>¿Activar Refuerzo Superior?</span><select value={data.refuerzoSup} onChange={(e)=>setData({...data, refuerzoSup: e.target.value})} className="bg-indigo-700 border-none rounded px-2 py-1 outline-none"><option value="No">No</option><option value="Sí">Sí</option></select></div>
            {data.refuerzoSup === 'Sí' && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4">
                <div className="p-3 bg-emerald-50 rounded border border-emerald-100"><p className="text-[10px] font-bold mb-2 text-emerald-700 uppercase">Sentido X (Sup)</p><div className="flex gap-2"><select value={data.calibreXSup} onChange={(e)=>setData({...data, calibreXSup: parseInt(e.target.value)})} className="w-full text-xs border p-1 rounded">{Object.keys(RODS_PER_QQ).map(k=><option key={k} value={k}>#{k}</option>)}</select><input type="number" step="0.01" value={data.espXSup} onChange={(e)=>setData({...data, espXSup: parseFloat(e.target.value)||0})} className="w-full text-xs border p-1 rounded" /></div></div>
                <div className="p-3 bg-emerald-50 rounded border border-emerald-100"><p className="text-[10px] font-bold mb-2 text-emerald-700 uppercase">Sentido Y (Sup)</p><div className="flex gap-2"><select value={data.calibreYSup} onChange={(e)=>setData({...data, calibreYSup: parseInt(e.target.value)})} className="w-full text-xs border p-1 rounded">{Object.keys(RODS_PER_QQ).map(k=><option key={k} value={k}>#{k}</option>)}</select><input type="number" step="0.01" value={data.espYSup} onChange={(e)=>setData({...data, espYSup: parseFloat(e.target.value)||0})} className="w-full text-xs border p-1 rounded" /></div></div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="lg:col-span-5">
        <ResultsView type="ZAPATAS" results={results} data={data} steels={[
          {label: 'Parrilla X (T)', bars: results.v6X, qq: results.qX, cal: data.refuerzoSup === 'Sí' ? 'Varios' : data.calibreX},
          {label: 'Parrilla Y (T)', bars: results.v6Y, qq: results.qY, cal: data.refuerzoSup === 'Sí' ? 'Varios' : data.calibreY}
        ]} />
      </div>
    </div>
  );
};

// --- MÓDULO NERVIOS ---
const NerviosModule = () => {
  const [data, setData] = useState({
    unidad: 'ml', seccion: 'Regular', dim1: 0.15, dim3: 0.10, dim4: 0.10,
    longitud: 6, cantidad: 1, rec: 2.5,
    calL1: 4, cantL1: 2, calL2: 3, cantL2: 2,
    calT: 3, sepT: 0.20,
    cantG: 1, longG: 0.40, calG: 2, despC: 5, despA: 5, usos: 2
  });

  const results = useMemo(() => {
    let aS = data.seccion === 'Regular' ? (data.dim1 * data.longitud) : (data.dim1 * data.dim4) + (data.dim3 * (data.longitud - data.dim4));
    let hT = data.unidad === 'ml' ? 1 * data.cantidad : (aS > 0 ? data.cantidad / aS : 0);
    const vN = aS * hT;
    const vC = vN * (1 + data.despC / 100);
    const qL1 = (hT * data.cantL1 / 6) * (1 + data.despA/100) / RODS_PER_QQ[data.calL1];
    const qL2 = (hT * data.cantL2 / 6) * (1 + data.despA/100) / RODS_PER_QQ[data.calL2];
    const rM = data.rec / 100;
    const dE = ((data.dim1 - (rM * 2)) * 2) + ((data.longitud - (rM * 2)) * 2);
    const v6T = ((hT / data.sepT + 1) * Math.max(0, dE) / 6) * (1 + data.despA / 100);
    const qT = v6T / RODS_PER_QQ[data.calT];
    const aC = ((data.dim1 * 2) + (data.longitud * 2)) * hT;
    return { hT, vN, vC, qL1, qL2, v6T, qT, al: (qL1+qL2+qT)*3, sep: Math.ceil((hT/0.3)*8), ply: aC / 2.97 / data.usos, cur: aC * 0.06 };
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-indigo-700 font-bold mb-4 uppercase text-xs border-b pb-2 tracking-widest"><Layers size={16} className="inline mr-2"/> Geometría Nervios</h3>
          <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unidad</label><select value={data.unidad} onChange={(e)=>setData({...data, unidad: e.target.value})} className="border p-2 rounded bg-indigo-50/30 text-indigo-700 font-bold"><option value="ml">Metro Lineal</option><option value="m3">Metro Cúbico</option></select></div>
             <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cant. Análisis</label><input type="number" value={data.cantidad} onChange={(e)=>setData({...data, cantidad: parseFloat(e.target.value)||0})} className="border p-2 rounded" /></div>
             <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ancho (m)</label><input type="number" step="0.01" value={data.dim1} onChange={(e)=>setData({...data, dim1: parseFloat(e.target.value)||0})} className="border p-2 rounded" /></div>
             <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Alto H (Calc)</label><input type="text" value={results.hT.toFixed(2)} disabled className="border p-2 rounded bg-slate-50 font-bold" /></div>
             <div className="flex flex-col gap-1 col-span-2"><label className="text-[10px] font-bold text-slate-400">Sección</label><select value={data.seccion} onChange={(e)=>setData({...data, seccion: e.target.value})} className="border p-2 rounded"><option value="Regular">Regular</option><option value="En L">En L</option></select></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-indigo-700 font-bold mb-4 uppercase text-xs border-b pb-2 tracking-widest"><Settings size={16} className="inline mr-2"/> Refuerzo</h3>
          <div className="space-y-4">
             <div className="p-3 bg-slate-50 rounded"><p className="text-[10px] font-black uppercase text-indigo-400 mb-2">Longitudinal Combinado</p><div className="grid grid-cols-4 gap-2"><select value={data.calL1} onChange={(e)=>setData({...data, calL1: parseInt(e.target.value)})} className="border text-xs p-1 rounded">{Object.keys(RODS_PER_QQ).map(k=><option key={k} value={k}>#{k}</option>)}</select><input value={data.cantL1} onChange={(e)=>setData({...data, cantL1: parseInt(e.target.value)||0})} className="border text-xs p-1 rounded" /><select value={data.calL2} onChange={(e)=>setData({...data, calL2: parseInt(e.target.value)})} className="border text-xs p-1 rounded">{Object.keys(RODS_PER_QQ).map(k=><option key={k} value={k}>#{k}</option>)}</select><input value={data.cantL2} onChange={(e)=>setData({...data, cantL2: parseInt(e.target.value)||0})} className="border text-xs p-1 rounded" /></div></div>
             <div className="p-3 bg-slate-50 rounded"><p className="text-[10px] font-black uppercase text-indigo-400 mb-2">Estribos</p><div className="flex gap-2"><select value={data.calT} onChange={(e)=>setData({...data, calT: parseInt(e.target.value)})} className="border text-xs p-1 rounded w-full">{Object.keys(RODS_PER_QQ).map(k=><option key={k} value={k}>#{k}</option>)}</select><input step="0.01" value={data.sepT} onChange={(e)=>setData({...data, sepT: parseFloat(e.target.value)||0})} className="border text-xs p-1 rounded w-full" /></div></div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-5"><ResultsView type="NERVIOS" results={results} data={data} steels={[{label:'Long 1', qq:results.qL1, cal:data.calL1}, {label:'Long 2', qq:results.qL2, cal:data.calL2}, {label:'Estribos', bars:results.v6T, qq:results.qT, cal:data.calT}]} /></div>
    </div>
  );
};

// --- MÓDULO VIGAS ---
const VigasModule = () => {
  const [data, setData] = useState({
    unidad: 'ml', apoyo: 'Aire', ancho: 0.20, alto: 0.40, cantidad: 1,
    rec: 4, calL1: 3, cantL1: 10, calL2: 4, cantL2: 0, calT: 4, sepT: 0.20,
    despC: 5, despA: 5, usos: 2
  });

  const results = useMemo(() => {
    let lT = data.unidad === 'ml' ? 1 * data.cantidad : (data.ancho * data.alto > 0 ? data.cantidad / (data.ancho * data.alto) : 0);
    const vN = data.ancho * data.alto * lT;
    const vC = vN * (1 + data.despC / 100);
    const qL1 = (lT * data.cantL1 / 6) * (1 + data.despA/100) / RODS_PER_QQ[data.calL1];
    const qL2 = (lT * data.cantL2 / 6) * (1 + data.despA/100) / RODS_PER_QQ[data.calL2];
    const rM = data.rec / 100;
    const dE = ((data.ancho - (rM * 2)) * 2) + ((data.alto - (rM * 2)) * 2) + 0.14;
    const v6T = ((lT / data.sepT + 1) * dE / 6) * (1 + data.despA / 100);
    const qT = v6T / RODS_PER_QQ[data.calT];
    let perM = (data.apoyo === 'Aire') ? data.ancho + (2 * data.alto) : (2 * data.alto);
    const aC = perM * lT;
    return { lT, vN, vC, qL1, qL2, v6T, qT, al: (qL1+qL2+qT)*0.99, sep: Math.ceil((lT/0.3)*8), ply: aC / 2.97 / data.usos, cur: aC * 0.06 };
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-indigo-700 font-bold mb-4 uppercase text-xs border-b pb-2 tracking-widest"><Box size={16} className="inline mr-2"/> Geometría Vigas</h3>
          <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400">Apoyo</label><select value={data.apoyo} onChange={(e)=>setData({...data, apoyo: e.target.value})} className="border p-2 rounded bg-indigo-50/30 text-indigo-700 font-bold"><option value="Aire">Al Aire (Base+Lat)</option><option value="Apoyada">Apoyada (Solo Lat)</option></select></div>
             <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400">Unidad</label><select value={data.unidad} onChange={(e)=>setData({...data, unidad: e.target.value})} className="border p-2 rounded"><option value="ml">Lineal</option><option value="m3">Cúbico</option></select></div>
             <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400">Ancho (m)</label><input type="number" step="0.01" value={data.ancho} onChange={(e)=>setData({...data, ancho: parseFloat(e.target.value)||0})} className="border p-2 rounded" /></div>
             <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-indigo-500">Largo L (Resultado)</label><input type="text" value={results.lT.toFixed(2)} disabled className="border p-2 rounded bg-slate-50 font-bold" /></div>
             <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400">Alto (m)</label><input type="number" step="0.01" value={data.alto} onChange={(e)=>setData({...data, alto: parseFloat(e.target.value)||0})} className="border p-2 rounded" /></div>
             <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400">Cant.</label><input type="number" value={data.cantidad} onChange={(e)=>setData({...data, cantidad: parseFloat(e.target.value)||0})} className="border p-2 rounded" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-indigo-700 font-bold mb-4 uppercase text-xs border-b pb-2 tracking-widest"><Settings size={16} className="inline mr-2"/> Refuerzo Vigas</h3>
          <div className="space-y-4">
             <div className="p-3 bg-slate-50 rounded border"><p className="text-[10px] font-black uppercase text-indigo-400 mb-2 tracking-widest">Parrilla Longitudinal</p><div className="grid grid-cols-4 gap-2"><select value={data.calL1} onChange={(e)=>setData({...data, calL1: parseInt(e.target.value)})} className="border text-xs p-1 rounded">{Object.keys(RODS_PER_QQ).map(k=><option key={k} value={k}>#{k}</option>)}</select><input value={data.cantL1} onChange={(e)=>setData({...data, cantL1: parseInt(e.target.value)||0})} className="border text-xs p-1 rounded" /><select value={data.calL2} onChange={(e)=>setData({...data, calL2: parseInt(e.target.value)})} className="border text-xs p-1 rounded">{Object.keys(RODS_PER_QQ).map(k=><option key={k} value={k}>#{k}</option>)}</select><input value={data.cantL2} onChange={(e)=>setData({...data, cantL2: parseInt(e.target.value)||0})} className="border text-xs p-1 rounded" /></div></div>
             <div className="p-3 bg-slate-50 rounded border"><p className="text-[10px] font-black uppercase text-indigo-400 mb-2 tracking-widest">Estribos</p><div className="flex gap-2"><select value={data.calT} onChange={(e)=>setData({...data, calT: parseInt(e.target.value)})} className="border text-xs p-1 rounded w-full">{Object.keys(RODS_PER_QQ).map(k=><option key={k} value={k}>#{k}</option>)}</select><input step="0.01" value={data.sepT} onChange={(e)=>setData({...data, sepT: parseFloat(e.target.value)||0})} className="border text-xs p-1 rounded w-full" /></div></div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-5"><ResultsView type="VIGAS" results={results} data={data} steels={[{label:'Long 1', qq:results.qL1, cal:data.calL1}, {label:'Long 2', qq:results.qL2, cal:data.calL2}, {label:'Estribos', bars:results.v6T, qq:results.qT, cal:data.calT}]} /></div>
    </div>
  );
};

// --- MÓDULO PAREDES ---
const ParedesModule = () => {
  const [data, setData] = useState({
    alto: 2.50, espesor: 15, cantidad: 1, calV1: 3, sepV1: 0.40, v2Active: false, calV2: 3, sepV2: 0.80,
    calH: 2, sepH: 0.40, mezcla: '1:4', groutFc: '210', groutTipo: 'Reforzadas', sisado: 'No',
    despC: 5, despA: 5, despB: 5
  });

  const results = useMemo(() => {
    const lB = data.alto > 0 ? (1 / data.alto) : 0;
    const aT = 1 * data.cantidad;
    const blq = Math.ceil(aT * 12.5 * (1 + data.despB/100));
    const v6V1 = ( (lB / data.sepV1 + 1) * data.alto * data.cantidad / 6 ) * (1 + data.despA/100);
    const qV1 = v6V1 / RODS_PER_QQ[data.calV1];
    let v6V2 = 0, qV2 = 0;
    if (data.v2Active) {
      v6V2 = ( (lB / data.sepV2 + 1) * data.alto * data.cantidad / 6 ) * (1 + data.despA/100);
      qV2 = v6V2 / RODS_PER_QQ[data.calV2];
    }
    const v6H = ( (data.alto / data.sepH + 1) * lB * data.cantidad / 6 ) * (1 + data.despA/100);
    const qH = v6H / RODS_PER_QQ[data.calH];
    let vM2 = data.espesor === 15 ? 0.018 : 0.025;
    if (data.sisado === 'Sí') vM2 *= 1.10;
    const vMT = vM2 * aT;
    const mF = { '1:3': 12, '1:4': 9, '1:5': 7.5 };
    const cM = vMT * mF[data.mezcla];
    const aM = vMT * 1.05;
    const vPC = data.espesor === 15 ? 0.0035 : 0.0055;
    const cR = ( (lB / data.sepV1) + (data.v2Active ? lB / data.sepV2 : 0) ) * data.cantidad;
    let nC = data.groutTipo === 'Total' ? (25 * aT) : cR;
    const vGT = nC * vPC * (1 + data.despC/100);
    const cG = vGT * (data.groutFc === '210' ? 9.5 : 7.5);
    const aG = vGT * 0.5, csh = vGT * 0.5;
    return { bloques: blq, v6V1, qV1, v6V2, qV2, v6H, qH, cemT: Math.ceil(cM+cG), areT: aM+aG, cshT: csh, al: (qV1+qV2+qH)*1.5, lT: lB, vC: aT };
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
           <h3 className="text-indigo-700 font-bold mb-4 uppercase text-xs border-b pb-2 tracking-widest"><Grid size={16} className="inline mr-2"/> Parámetros Pared</h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400">Alto (m)</label><input type="number" step="0.01" value={data.alto} onChange={(e)=>setData({...data, alto: parseFloat(e.target.value)||0})} className="border p-2 rounded" /></div>
              <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-indigo-500">Largo para 1m²</label><input type="text" value={results.lT.toFixed(2)} disabled className="border p-2 rounded bg-slate-50 font-bold" /></div>
              <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400">Espesor</label><select value={data.espesor} onChange={(e)=>setData({...data, espesor: parseInt(e.target.value)})} className="border p-2 rounded"><option value="15">15 cm</option><option value="20">20 cm</option></select></div>
              <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400">Cant. Análisis</label><input type="number" value={data.cantidad} onChange={(e)=>setData({...data, cantidad: parseFloat(e.target.value)||0})} className="border p-2 rounded outline-indigo-600" /></div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-indigo-700 font-bold mb-4 uppercase text-xs border-b pb-2 tracking-widest"><Settings size={16} className="inline mr-2"/> Diseño de Refuerzo Vertical/Horiz.</h3>
          <div className="space-y-4">
             <div className="p-3 bg-slate-50 rounded border"><p className="text-[10px] font-black uppercase text-indigo-400 mb-2 tracking-widest">Armadura Vertical 1</p><div className="flex gap-4"><select value={data.calV1} onChange={(e)=>setData({...data, calV1: parseInt(e.target.value)})} className="border p-2 rounded text-xs w-full">{[2,3,4].map(k=><option key={k} value={k}>#{k}</option>)}</select><input type="number" step="0.01" value={data.sepV1} onChange={(e)=>setData({...data, sepV1: parseFloat(e.target.value)||0})} className="border p-2 rounded text-xs w-full" /></div></div>
             <div className="flex items-center gap-2"><input type="checkbox" checked={data.v2Active} onChange={(e)=>setData({...data, v2Active: e.target.checked})} id="v2" /><label htmlFor="v2" className="text-[10px] font-bold uppercase text-slate-500 cursor-pointer">Activar Vertical 2</label></div>
             <div className="p-3 bg-slate-50 rounded border"><p className="text-[10px] font-black uppercase text-indigo-400 mb-2 tracking-widest">Armadura Horizontal</p><div className="flex gap-4"><select value={data.calH} onChange={(e)=>setData({...data, calH: parseInt(e.target.value)})} className="border p-2 rounded text-xs w-full">{[2,3].map(k=><option key={k} value={k}>#{k}</option>)}</select><input type="number" step="0.01" value={data.sepH} onChange={(e)=>setData({...data, sepH: parseFloat(e.target.value)||0})} className="border p-2 rounded text-xs w-full" /></div></div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-5"><ResultsView type="PAREDES" results={results} data={data} steels={[{label:'Vertical 1', qq:results.qV1, cal:data.calV1}, {label:'Horizontal', qq:results.qH, cal:data.calH}]} /></div>
    </div>
  );
};

// --- PANEL DE RESULTADOS CONSOLIDADO ---
const ResultsView = ({ type, results, data, steels }) => {
  const isPared = type === 'PAREDES';
  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl text-white overflow-hidden sticky top-20 border border-slate-800">
      <div className="bg-indigo-600 px-6 py-5 flex justify-between items-center border-b border-indigo-500">
        <h2 className="font-bold flex items-center gap-2 uppercase tracking-widest text-sm text-balance"><FileText size={18} /> Resultados {type}</h2>
        <div className="text-right leading-tight"><p className="text-xl font-black">{data.cantidad || data.cantidadAnalisis}</p><p className="text-[9px] font-bold uppercase text-indigo-200 tracking-tighter">{isPared ? 'm²' : 'uds'}</p></div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">{isPared ? 'Total Cemento' : 'Mezcla Concreto'}</span>
          <span className="text-2xl font-mono text-indigo-400">{isPared ? results.cemT : results.vC.toFixed(2)} {isPared ? 'bol' : 'm³'}</span>
        </div>

        <div className="space-y-1">
          {isPared && <ResultRow label="Bloques" value={`${results.bloques} uds`} color="text-indigo-300" />}
          {steels.map((s, idx) => (
            <SteelRow key={idx} label={s.label} bars={s.bars} qq={s.qq} cal={s.cal} />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-inner">
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Alambre</p>
            <p className="text-lg font-mono text-indigo-400">{results.al.toFixed(2)} lbs</p>
          </div>
          {results.sep && (
            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-inner">
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Separadores</p>
              <p className="text-lg font-mono text-indigo-400">{results.sep} uds</p>
            </div>
          )}
        </div>

        <div className="space-y-1.5 border-t border-slate-800 pt-3">
          {results.ply > 0 && <ResultRow label="Plywood" value={`${results.ply.toFixed(2)} pzs`} color="text-orange-400" />}
          {isPared && (
             <>
               <ResultRow label="Arena Fina" value={`${results.areT.toFixed(2)} m³`} color="text-emerald-400" />
               <ResultRow label="Grava/Chisca" value={`${results.cshT.toFixed(2)} m³`} color="text-emerald-400" />
             </>
          )}
          {results.cur > 0 && <ResultRow label="Curador" value={`${results.cur.toFixed(2)} gal`} color="text-emerald-400" />}
        </div>

        <button onClick={() => window.print()} className="w-full py-3 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg">Imprimir Memoria Técnica</button>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const App = () => {
  const [activeModule, setActiveModule] = useState('soleras');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 selection:bg-indigo-100">
      <Navbar activeModule={activeModule} setActiveModule={setActiveModule} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <header className="mb-8 flex items-end justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">INGEVAL Suite</h1>
            <p className="text-slate-500 font-medium text-sm">Control Maestro de Cubicaje y Materiales v8.0</p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold text-slate-400 block tracking-widest uppercase">Release</span>
            <span className="text-xs font-black text-indigo-600 font-mono italic">COMPLETE_STABLE</span>
          </div>
        </header>

        {activeModule === 'soleras' && <SolerasModule />}
        {activeModule === 'zapatas' && <ZapatasModule />}
        {activeModule === 'nervios' && <NerviosModule />}
        {activeModule === 'vigas' && <VigasModule />}
        {activeModule === 'paredes' && <ParedesModule />}
      </main>
      <footer className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 py-3 text-center text-[10px] text-slate-400 font-mono z-50">
        &copy; {new Date().getFullYear()} INGEVAL - INGENIERÍA CIVIL Y SOFTWARE EL SALVADOR
      </footer>
    </div>
  );
};

export default App;

