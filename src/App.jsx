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

// --- COMPONENTES COMPARTIDOS ---
const Navbar = ({ activeModule, setActiveModule }) => {
  const modules = [
    { id: 'soleras', label: 'Soleras de Fundación', icon: Construction },
    { id: 'zapatas', label: 'Zapatas Aisladas', icon: Maximize },
    { id: 'nervios', label: 'Nervios', icon: Layers },
    { id: 'vigas', label: 'Vigas', icon: Box },
    { id: 'paredes', label: 'Paredes', icon: Grid },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <Construction size={24} />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tighter">INGEVAL</span>
          </div>
          <div className="hidden md:flex gap-1">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                    activeModule === mod.id 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} />
                  {mod.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

// --- MÓDULO PAREDES ---
const ParedesModule = () => {
  const [formData, setFormData] = useState({
    alto: 2.50,
    espesor: 15,
    cantidadAnalisis: 1,
    calibreV1: 3, separacionV1: 0.40,
    refuerzoV2Active: false, calibreV2: 3, separacionV2: 0.80,
    calibreH: 2, separacionH: 0.40,
    mezclaProporcion: '1:4',
    groutFc: '210',
    groutTipo: 'Reforzadas',
    sisado: 'No',
    desperdicioConcreto: 5,
    desperdicioAcero: 5,
    desperdicioBloque: 5
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value) 
    }));
  };

  const results = useMemo(() => {
    const { alto, espesor, cantidadAnalisis, calibreV1, separacionV1, refuerzoV2Active, calibreV2, separacionV2, calibreH, separacionH, mezclaProporcion, groutFc, groutTipo, sisado, desperdicioConcreto, desperdicioAcero, desperdicioBloque } = formData;

    // Lógica m2: Largo es inversamente proporcional al alto para dar 1m2
    const largoBase = alto > 0 ? (1 / alto) : 0;
    const areaTotal = 1 * cantidadAnalisis; // Siempre es 1m2 * cantidad

    // 1. Bloques
    const bloques = Math.ceil(areaTotal * 12.5 * (1 + desperdicioBloque / 100));

    // 2. Refuerzo Vertical (Calculado sobre el largo base para completar 1m2)
    const v6V1 = ( (largoBase / separacionV1 + 1) * alto * cantidadAnalisis / 6 ) * (1 + desperdicioAcero / 100);
    const qV1 = v6V1 / (RODS_PER_QQ[calibreV1] || 1);
    
    let v6V2 = 0, qV2 = 0;
    if (refuerzoV2Active) {
      v6V2 = ( (largoBase / separacionV2 + 1) * alto * cantidadAnalisis / 6 ) * (1 + desperdicioAcero / 100);
      qV2 = v6V2 / (RODS_PER_QQ[calibreV2] || 1);
    }

    // 3. Refuerzo Horizontal
    const v6H = ( (alto / separacionH + 1) * largoBase * cantidadAnalisis / 6 ) * (1 + desperdicioAcero / 100);
    const qH = v6H / (RODS_PER_QQ[calibreH] || 1);

    // 4. Mezclas
    let volMorteroM2 = espesor === 15 ? 0.018 : 0.025;
    if (sisado === 'Sí') volMorteroM2 *= 1.10;
    const volMorteroTotal = volMorteroM2 * areaTotal;
    const morteroFactors = { '1:3': 12, '1:4': 9, '1:5': 7.5 };
    const cementoMortero = volMorteroTotal * (morteroFactors[mezclaProporcion] || 9);
    const arenaMortero = volMorteroTotal * 1.05;

    // Grout
    const celdasPorM2 = 25;
    const volPorCelda = espesor === 15 ? 0.0035 : 0.0055;
    const celdasRefuerzo = ( (largoBase / separacionV1) + (refuerzoV2Active ? largoBase / separacionV2 : 0) ) * cantidadAnalisis;
    let numCeldas = groutTipo === 'Total' ? (celdasPorM2 * areaTotal) : celdasRefuerzo;
    const volGroutTotal = numCeldas * volPorCelda * (1 + desperdicioConcreto/100);

    const cementoGrout = volGroutTotal * (groutFc === '210' ? 9.5 : 7.5);
    const arenaGrout = volGroutTotal * 0.5;
    const chiscaGrout = volGroutTotal * 0.5;

    return {
      bloques, v6V1, qV1, v6V2, qV2, v6H, qH, 
      cementoTotal: Math.ceil(cementoMortero + cementoGrout),
      arenaTotal: arenaMortero + arenaGrout,
      chiscaTotal: chiscaGrout,
      alambre: (qV1 + qV2 + qH) * 1.5,
      largoTotal: largoBase,
      areaTotal, volGroutTotal, volMorteroTotal
    };
  }, [formData]);

  return <ModuleLayout formData={formData} handleChange={handleChange} results={results} type="paredes" />;
};

// --- OTROS MÓDULOS ---
const SolerasModule = () => {
  const [formData, setFormData] = useState({
    cantidadAnalisis: 1, unidad: 'ml', ancho: 0.20, alto: 0.20, recubrimiento: 3,
    concretoFc: '210', sobreexcavacion: 'No', calibreLong: 4, cantidadLong: 4,
    calibreTrans: 3, separacionTrans: 0.20, desperdicioConcreto: 5,
    desperdicioAcero: 5, usosMadera: 2
  });
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };
  const results = useMemo(() => {
    const { cantidadAnalisis, unidad, ancho, alto, recubrimiento, sobreexcavacion, calibreLong, cantidadLong, calibreTrans, separacionTrans, desperdicioConcreto, desperdicioAcero, usosMadera } = formData;
    let lT = 0, vN = 0;
    if (unidad === 'ml') { lT = 1 * cantidadAnalisis; vN = ancho * alto * lT; }
    else { vN = 1 * cantidadAnalisis; lT = (ancho > 0 && alto > 0) ? (vN / (ancho * alto)) : 0; }
    const vC = vN * (1 + desperdicioConcreto / 100);
    const v6L = (lT * cantidadLong / 6) * (1 + desperdicioAcero / 100);
    const qL = v6L / (RODS_PER_QQ[calibreLong] || 1);
    const dE = ((ancho - (recubrimiento/100 * 2)) * 2) + ((alto - 0.07 - recubrimiento/100) * 2);
    const cE = (separacionTrans > 0) ? (lT / separacionTrans) + 1 : 0;
    const v6T = (cE * Math.max(0, dE) / 6) * (1 + desperdicioAcero / 100);
    const qT = v6T / (RODS_PER_QQ[calibreTrans] || 1);
    const al = (qL + qT) * 3;
    const ply = sobreexcavacion === 'Sí' ? (lT * alto * 2) / 2.97 / usosMadera : 0;
    return { largoTotal: lT, volNeto: vN, volConcretoFinal: vC, varillas6mLong: v6L, quintalesLong: qL, varillas6mTrans: v6T, quintalesTrans: qT, alambre: al, plywood: ply };
  }, [formData]);
  return <ModuleLayout formData={formData} handleChange={handleChange} results={results} type="soleras" />;
};

const ZapatasModule = () => {
  const [formData, setFormData] = useState({
    tipo: 'Aislada', cantidadAnalisis: 1, anchoB: 1.00, altoH: 0.30, recubrimiento: 7.5,
    concretoFc: '210', sobreexcavacion: 'No', calibreX: 4, espaciamientoX: 0.15,
    calibreY: 4, espaciamientoY: 0.15, refuerzoSuperior: 'No', calibreXSup: 3,
    espaciamientoXSup: 0.20, calibreYSup: 3, espaciamientoYSup: 0.20,
    desperdicioConcreto: 5, desperdicioAcero: 5, usosMadera: 2
  });
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };
  const results = useMemo(() => {
    const { tipo, cantidadAnalisis, anchoB, altoH, recubrimiento, calibreX, espaciamientoX, calibreY, espaciamientoY, refuerzoSuperior, calibreXSup, espaciamientoXSup, calibreYSup, espaciamientoYSup, desperdicioConcreto, desperdicioAcero, sobreexcavacion, usosMadera } = formData;
    let lT = 0, vN = 0;
    if (tipo === 'Corrida') { lT = 1 * cantidadAnalisis; vN = anchoB * lT * altoH; }
    else { vN = 1 * cantidadAnalisis; lT = (anchoB > 0 && altoH > 0) ? (vN / (anchoB * altoH)) : 0; }
    const vC = vN * (1 + desperdicioConcreto/100);
    const rM = recubrimiento / 100;
    const lX = Math.max(0, anchoB - (2 * rM));
    const cX = (espaciamientoY > 0) ? (lT / espaciamientoY) + 1 : 0;
    const qXInf = (cX * lX / 6) * (1 + desperdicioAcero/100) / (RODS_PER_QQ[calibreX] || 1);
    const lY = Math.max(0, lT - (2 * rM));
    const cY = (espaciamientoX > 0) ? (anchoB / espaciamientoX) + 1 : 0;
    const qYInf = (cY * lY / 6) * (1 + desperdicioAcero/100) / (RODS_PER_QQ[calibreY] || 1);
    let qXSup = 0, qYSup = 0;
    if (refuerzoSuperior === 'Sí') {
      qXSup = ( (lT/espaciamientoYSup + 1) * lX / 6) * (1 + desperdicioAcero/100) / (RODS_PER_QQ[calibreXSup] || 1);
      qYSup = ( (anchoB/espaciamientoXSup + 1) * lY / 6) * (1 + desperdicioAcero/100) / (RODS_PER_QQ[calibreYSup] || 1);
    }
    const aC = sobreexcavacion === 'Sí' ? (lT * altoH * 2) + (anchoB * altoH * 2) : 0;
    return { largoTotal: lT, volNeto: vN, volConcretoFinal: vC, qX: qXInf + qXSup, qY: qYInf + qYSup, alambre: (qXInf + qYInf + qXSup + qYSup) * 3, plywood: aC / 2.97 / usosMadera };
  }, [formData]);
  return <ModuleLayout formData={formData} handleChange={handleChange} results={results} type="zapatas" />;
};

const NerviosModule = () => {
  const [formData, setFormData] = useState({
    unidad: 'ml', seccion: 'Regular', dim1: 0.15, dim3: 0.10, dim4: 0.10,
    longitud: 6, cantidadAnalisis: 1, recubrimiento: 2.5,
    calibreLong1: 4, cantidadLong1: 2, calibreLong2: 3, cantidadLong2: 2,
    calibreTrans: 3, separacionTrans: 0.20,
    cantidadGrapa: 1, longitudGrapa: 0.40, calibreGrapa: 2, desperdicioConcreto: 5, desperdicioAcero: 5, usosMadera: 2
  });
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };
  const results = useMemo(() => {
    const { unidad, seccion, dim1, dim3, dim4, longitud, cantidadAnalisis, recubrimiento, calibreLong1, cantidadLong1, calibreLong2, cantidadLong2, calibreTrans, separacionTrans, cantidadGrapa, longitudGrapa, calibreGrapa, desperdicioConcreto, desperdicioAcero, usosMadera } = formData;
    let hT = 0, vN = 0;
    let aS = seccion === 'Regular' ? (dim1 * longitud) : (dim1 * dim4) + (dim3 * (longitud - dim4));
    if (unidad === 'ml') { hT = 1 * cantidadAnalisis; vN = aS * hT; }
    else { vN = 1 * cantidadAnalisis; hT = aS > 0 ? (vN / aS) : 0; }
    const vC = vN * (1 + desperdicioConcreto / 100);
    const qL1 = (hT * cantidadLong1 / 6) * (1 + desperdicioAcero/100) / (RODS_PER_QQ[calibreLong1] || 1);
    const qL2 = (hT * cantidadLong2 / 6) * (1 + desperdicioAcero/100) / (RODS_PER_QQ[calibreLong2] || 1);
    const cantE = (separacionTrans > 0) ? (hT / separacionTrans) + 1 : 0;
    const dE = ((dim1 - (recubrimiento/100 * 2)) * 2) + ((longitud - (recubrimiento/100 * 2)) * 2);
    const qT = (cantE * dE / 6) * (1 + desperdicioAcero/100) / (RODS_PER_QQ[calibreTrans] || 1);
    const sep = Math.ceil((hT / 0.3) * 8);
    const aC = ((dim1 * 2) + (longitud * 2)) * hT;
    return { altoTotal: hT, volNeto: vN, volConcretoFinal: vC, qL1, qL2, qT, alambre: (qL1+qL2+qT)*3, separadores: sep, plywood: aC / 2.97 / usosMadera, curador: aC * 0.06 };
  }, [formData]);
  return <ModuleLayout formData={formData} handleChange={handleChange} results={results} type="nervios" />;
};

const VigasModule = () => {
  const [formData, setFormData] = useState({
    unidad: 'ml', apoyo: 'Aire', ancho: 0.20, alto: 0.40, cantidadAnalisis: 1,
    recubrimiento: 4, calibreLong1: 3, cantidadLong1: 10, calibreLong2: 4, cantidadLong2: 0,
    calibreTrans: 4, separacionTrans: 0.20, calibreGrapa: 4, cantidadGrapa: 2, longitudGrapa: 0.20,
    desperdicioConcreto: 5, desperdicioAcero: 5, usosMadera: 2
  });
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };
  const results = useMemo(() => {
    const { unidad, ancho, alto, cantidadAnalisis, recubrimiento, calibreLong1, cantidadLong1, calibreLong2, cantidadLong2, calibreTrans, separacionTrans, desperdicioConcreto, desperdicioAcero, usosMadera } = formData;
    let lT = 0, vN = 0;
    if (unidad === 'ml') { lT = 1 * cantidadAnalisis; vN = ancho * alto * lT; }
    else { vN = 1 * cantidadAnalisis; lT = (ancho * alto > 0) ? (vN / (ancho * alto)) : 0; }
    const vC = vN * (1 + desperdicioConcreto / 100);
    const qL1 = (lT * cantidadLong1 / 6) * (1 + desperdicioAcero/100) / (RODS_PER_QQ[calibreLong1] || 1);
    const qL2 = (lT * cantidadLong2 / 6) * (1 + desperdicioAcero/100) / (RODS_PER_QQ[calibreLong2] || 1);
    const dE = ((ancho - (recubrimiento/100 * 2)) * 2) + ((alto - (recubrimiento/100 * 2)) * 2) + 0.14;
    const qT = ((lT/separacionTrans + 1) * dE / 6) * (1 + desperdicioAcero/100) / (RODS_PER_QQ[calibreTrans] || 1);
    const sep = Math.ceil((lT / 0.3) * 8);
    return { largoTotal: lT, volNeto: vN, volConcretoFinal: vC, qL1, qL2, qT, alambre: (qL1+qL2+qT)*0.99, separadores: sep };
  }, [formData]);
  return <ModuleLayout formData={formData} handleChange={handleChange} results={results} type="vigas" />;
};

// --- LAYOUT UNIVERSAL ---
const ModuleLayout = ({ formData, handleChange, results, type }) => {
  const isPared = type === 'paredes';
  const isNervio = type === 'nervios';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500 pb-20">
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 text-indigo-700 font-bold mb-6 border-b pb-2 uppercase tracking-tighter text-sm">
            <Layers size={18} /> Geometría y Análisis
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-balance">Unidad de Medida</label>
              <select name="unidad" value={formData.unidad || (isPared ? "m2" : formData.tipo)} onChange={handleChange} disabled={isPared} className={`px-3 py-2 border rounded-md font-bold text-indigo-600 bg-indigo-50/30 ${isPared ? 'cursor-not-allowed opacity-75' : ''}`}>
                {isPared ? <option value="m2">Metro Cuadrado (m²)</option> :
                (type === 'soleras' || type === 'nervios' || type === 'vigas') ? <><option value="ml">Metro Lineal (ml)</option><option value="m3">Metro Cúbico (m³)</option></> :
                <><option value="Aislada">Aislada (m³)</option><option value="Corrida">Corrida (ml)</option></>}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-balance">Cantidad de Análisis</label>
              <input type="number" name="cantidadAnalisis" value={formData.cantidadAnalisis} onChange={handleChange} className="px-3 py-2 border rounded-md font-bold focus:ring-2 ring-indigo-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-dashed">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">{isPared ? 'Alto Pared (m)' : isNervio ? 'Ancho (Dim 1)' : 'Ancho (m)'}</label>
              <input type="number" name={isPared ? "alto" : (isNervio ? "dim1" : (type === 'zapatas' ? "anchoB" : "ancho"))} step="0.01" value={isPared ? formData.alto : (isNervio ? formData.dim1 : (type === 'zapatas' ? formData.anchoB : formData.ancho))} onChange={handleChange} className="px-3 py-2 border rounded-md" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Largo L (m)</label>
              <input type="text" value={(results.largoTotal || 0).toFixed(2)} disabled className="px-3 py-2 border border-indigo-100 rounded-md bg-indigo-50/50 font-bold text-indigo-700" />
            </div>
            <div className="flex flex-col gap-1 text-balance">
               <label className="text-[10px] font-bold text-slate-400 uppercase">{isPared ? 'Espesor Bloque' : isNervio ? 'Largo Nervio' : 'Alto H (m)'}</label>
               {isPared ? (
                 <select name="espesor" value={formData.espesor} onChange={handleChange} className="px-3 py-2 border rounded-md font-bold">
                   <option value="15">15 cm</option><option value="20">20 cm</option>
                 </select>
               ) : (
                 <input type="number" name={isNervio ? "longitud" : (type === 'zapatas' ? "altoH" : "alto")} step="0.01" value={isNervio ? formData.longitud : (type === 'zapatas' ? formData.altoH : (results.altoTotal || formData.alto))} onChange={handleChange} disabled={isNervio} className={`px-3 py-2 border rounded-md font-bold ${isNervio ? 'bg-indigo-50 text-indigo-700' : ''}`} />
               )}
            </div>
            {!isPared && <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-balance">Recub. (cm)</label><input type="number" name="recubrimiento" value={formData.recubrimiento} onChange={handleChange} className="px-3 py-2 border rounded-md" /></div>}
          </div>
        </div>

        {isPared && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 text-indigo-700 font-bold mb-4 border-b pb-2 uppercase tracking-tighter text-sm"><Droplets size={18} /> Mortero y Grout</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-500 uppercase">Proporción Pega</label><select name="mezclaProporcion" value={formData.mezclaProporcion} onChange={handleChange} className="px-3 py-2 border rounded-md"><option value="1:3">1:3</option><option value="1:4">1:4</option><option value="1:5">1:5</option></select></div>
              <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-500 uppercase text-balance">Relleno Grout</label><select name="groutTipo" value={formData.groutTipo} onChange={handleChange} className="px-3 py-2 border rounded-md"><option value="Reforzadas">Solo Refuerzo</option><option value="Total">Lleno Total</option></select></div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 text-indigo-700 font-bold mb-4 border-b pb-2 uppercase tracking-tighter text-sm"><Settings size={18} /> Diseño de Refuerzo</div>
          {isPared ? (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Refuerzo Vertical</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><span className="text-[9px] font-bold text-slate-400">#1 Calibre</span><select name="calibreV1" value={formData.calibreV1} onChange={handleChange} className="px-2 py-1 border rounded text-xs">{[2,3,4].map(k => <option key={k} value={k}>#{k}</option>)}</select></div>
                  <div className="flex flex-col gap-1"><span className="text-[9px] font-bold text-slate-400 text-balance">#1 Sep. (m)</span><input type="number" name="separacionV1" step="0.01" value={formData.separacionV1} onChange={handleChange} className="px-2 py-1 border rounded text-xs" /></div>
                </div>
                <div className="mt-4 pt-2 border-t flex items-center gap-2"><input type="checkbox" name="refuerzoV2Active" checked={formData.refuerzoV2Active} onChange={handleChange} id="v2" /><label htmlFor="v2" className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer">Refuerzo Vertical 2</label></div>
                {formData.refuerzoV2Active && <div className="grid grid-cols-2 gap-4 mt-3 animate-in fade-in"><select name="calibreV2" value={formData.calibreV2} onChange={handleChange} className="px-2 py-1 border rounded text-xs">{[2,3,4].map(k => <option key={k} value={k}>#{k}</option>)}</select><input type="number" name="separacionV2" step="0.01" value={formData.separacionV2} onChange={handleChange} className="px-2 py-1 border rounded text-xs" /></div>}
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100"><p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Refuerzo Horizontal</p><div className="grid grid-cols-2 gap-4"><select name="calibreH" value={formData.calibreH} onChange={handleChange} className="px-2 py-1 border rounded text-xs">{[2,3].map(k => <option key={k} value={k}>#{k}</option>)}</select><input type="number" name="separacionH" step="0.01" value={formData.separacionH} onChange={handleChange} className="px-2 py-1 border rounded text-xs" /></div></div>
            </div>
          ) : <div className="text-slate-400 italic text-xs">Configuración específica de refuerzo disponible en el panel.</div>}
        </div>
      </div>

      {/* Resultados Derecha */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-slate-900 rounded-2xl shadow-xl text-white overflow-hidden border border-slate-800 sticky top-20">
          <div className="bg-indigo-600 px-6 py-5 flex justify-between items-center border-b border-indigo-500">
            <h2 className="font-bold flex items-center gap-2 uppercase tracking-widest text-sm text-balance">Resultados {type.toUpperCase()}</h2>
            <div className="text-right leading-tight">
              <p className="text-xl font-black">{formData.cantidadAnalisis}</p>
              <p className="text-[9px] font-bold uppercase text-indigo-200 tracking-tighter">{isPared ? 'm² Totales' : 'm³ Finales'}</p>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {isPared ? (
              <>
                <ResultRow label="Total Bloques" value={`${results.bloques} uds`} color="text-indigo-400" />
                <div className="space-y-3 pt-2">
                   <SteelRow label="Ref. Vertical 1" bars={results.v6V1} qq={results.qV1} cal={formData.calibreV1} />
                   {formData.refuerzoV2Active && <SteelRow label="Ref. Vertical 2" bars={results.v6V2} qq={results.qV2} cal={formData.calibreV2} />}
                   <SteelRow label="Ref. Horizontal" bars={results.v6H} qq={results.qH} cal={formData.calibreH} />
                </div>
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <ResultRow label="Cemento (Pega+Grout)" value={`${results.cementoTotal} bolsas`} color="text-emerald-400" />
                  <ResultRow label="Arena Fina" value={`${results.arenaTotal.toFixed(2)} m³`} color="text-emerald-400" />
                  <ResultRow label="Gravilla / Chisca" value={`${results.chiscaTotal.toFixed(2)} m³`} color="text-emerald-400" />
                  <ResultRow label="Alambre de Amarre" value={`${results.alambre.toFixed(2)} lbs`} color="text-indigo-300" />
                </div>
              </>
            ) : <p className="text-xs text-slate-500 italic">Detalles en reporte técnico.</p>}
            <button onClick={() => window.print()} className="w-full py-3 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg">Generar Reporte Ingeval</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-3 border-b flex items-center gap-2"><Variable size={16} className="text-slate-400" /><h3 className="text-xs font-black uppercase text-slate-500 tracking-tighter">Memoria de Cálculo</h3></div>
          <div className="p-5 font-mono text-[10px] space-y-4">
            <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
              <p className="text-indigo-700 font-bold mb-1 underline uppercase tracking-widest text-balance">Geometría Dinámica {type.toUpperCase()}:</p>
              {isPared ? (
                <>
                  <p>Área Base por Análisis: 1.00 m²</p>
                  <p>Alto Pared (H): {formData.alto.toFixed(2)} m</p>
                  <p className="text-indigo-600 font-bold">Largo Necesario (L): {(results.largoTotal || 0).toFixed(4)} m</p>
                  <p className="text-[9px] text-slate-500 mt-2 italic text-balance">Fórmula: L = 1m² / Alto. Esto garantiza el análisis por m² exacto.</p>
                </>
              ) : <p>Largo Resultante: {(results.largoTotal || 0).toFixed(4)} m</p>}
            </div>
            <div className="flex gap-2 items-start text-slate-400 italic leading-tight text-balance"><AlertCircle size={12} className="shrink-0 mt-0.5" /><p>Cálculo basado en estándares estructurales INGEVAL El Salvador.</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultRow = ({ label, value, color = "text-slate-100" }) => (
  <div className="flex justify-between items-center text-sm border-b border-slate-800/30 pb-1.5"><span className="text-slate-400 text-xs tracking-tight uppercase font-bold">{label}:</span><span className={`font-mono font-bold ${color}`}>{value}</span></div>
);

const SteelRow = ({ label, bars, qq, cal }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center"><div className="flex items-center gap-2"><span className="bg-indigo-700 text-white text-[9px] px-1.5 py-0.5 rounded font-black">#{cal}</span><span className="text-indigo-400 text-[9px] font-bold uppercase tracking-widest italic">{label}</span></div><span className="text-[9px] text-slate-500 font-mono">{(bars || 0).toFixed(2)} uds</span></div>
    <div className="flex justify-between font-bold text-emerald-400 border-t border-slate-800/50 pt-1 leading-none"><span className="text-[8px] uppercase tracking-tighter">Peso Est.:</span><span className="text-sm font-mono">{(qq || 0).toFixed(2)} qq</span></div>
  </div>
);

// --- COMPONENTE PRINCIPAL ---
const App = () => {
  const [activeModule, setActiveModule] = useState('soleras');

  const renderModule = () => {
    switch(activeModule) {
      case 'soleras': return <SolerasModule />;
      case 'zapatas': return <ZapatasModule />;
      case 'nervios': return <NerviosModule />;
      case 'vigas': return <VigasModule />;
      case 'paredes': return <ParedesModule />;
      default: return <SolerasModule />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 selection:bg-indigo-100">
      <Navbar activeModule={activeModule} setActiveModule={setActiveModule} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <header className="mb-8 flex items-end justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">INGEVAL Suite</h1>
            <p className="text-slate-500 font-medium text-sm">Control Maestro de Materiales de Construcción</p>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-[10px] font-bold text-slate-400 block tracking-widest uppercase">Versión Motor</span>
            <span className="text-xs font-black text-indigo-600 font-mono tracking-tighter">MASTER_v6.5_PARED_FIX</span>
          </div>
        </header>
        {renderModule()}
      </main>
      <footer className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 py-3 text-center text-[10px] text-slate-400 font-mono z-50">
        &copy; {new Date().getFullYear()} INGEVAL - INGENIERÍA Y SOFTWARE CIVIL
      </footer>
    </div>
  );
};

export default App;