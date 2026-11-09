import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingDown, 
  DollarSign, 
  Leaf, 
  Flame, 
  Scale, 
  Layers, 
  Utensils, 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Building2, 
  ChefHat, 
  CheckCircle2, 
  PieChart, 
  BarChart3,
  Sliders,
  AlertCircle
} from 'lucide-react';

interface PresetType {
  id: string;
  name: string;
  description: string;
  prepWaste: number;
  buffetWaste: number;
  plateWaste: number;
  spoilageWaste: number;
  defaultCovers: number;
  defaultCostPerCover: number;
}

const PRESETS: PresetType[] = [
  {
    id: 'fine-dining',
    name: 'Fine Dining À La Carte',
    description: 'High trimming standards, precision knife work, zero buffet.',
    prepWaste: 24,
    buffetWaste: 0,
    plateWaste: 7,
    spoilageWaste: 4,
    defaultCovers: 120,
    defaultCostPerCover: 22.0
  },
  {
    id: 'hotel-buffet',
    name: 'Hotel & Banquet Buffet',
    description: 'High holding pan volume, banquet prep trimmings, high plate return.',
    prepWaste: 18,
    buffetWaste: 20,
    plateWaste: 12,
    spoilageWaste: 5,
    defaultCovers: 350,
    defaultCostPerCover: 14.5
  },
  {
    id: 'casual-bistro',
    name: 'Casual Bistro & Gastropub',
    description: 'Moderate vegetable trim, high plate portioning, fast-paced service.',
    prepWaste: 15,
    buffetWaste: 2,
    plateWaste: 14,
    spoilageWaste: 6,
    defaultCovers: 200,
    defaultCostPerCover: 9.5
  },
  {
    id: 'pastry-bakery',
    name: 'Production Bakery & Pastry',
    description: 'High laminated dough trim, stale crusts, day-old returns.',
    prepWaste: 22,
    buffetWaste: 0,
    plateWaste: 4,
    spoilageWaste: 8,
    defaultCovers: 280,
    defaultCostPerCover: 6.0
  }
];

interface SurplusWasteCalculatorProps {
  onOpenLibrary?: () => void;
  onOpenCourse?: (courseId: string) => void;
}

export const SurplusWasteCalculator: React.FC<SurplusWasteCalculatorProps> = ({
  onOpenLibrary,
  onOpenCourse,
}) => {
  // Calculator State
  const [selectedPreset, setSelectedPreset] = useState<string>('fine-dining');
  const [currency, setCurrency] = useState<string>('$');
  const [dailyCovers, setDailyCovers] = useState<number>(140);
  const [costPerCover, setCostPerCover] = useState<number>(18.5);
  const [operatingDays, setOperatingDays] = useState<number>(6);
  
  // 4 Key Waste Streams (as shown in Quick Wins)
  const [prepWastePercent, setPrepWastePercent] = useState<number>(22);
  const [buffetWastePercent, setBuffetWastePercent] = useState<number>(5);
  const [plateWastePercent, setPlateWastePercent] = useState<number>(9);
  const [spoilageWastePercent, setSpoilageWastePercent] = useState<number>(5);

  // Target reduction % achievable with Supritamone Academy SOPs
  const [reductionTarget, setReductionTarget] = useState<number>(45);

  // Apply preset
  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const p = PRESETS.find(x => x.id === presetId);
    if (p) {
      setPrepWastePercent(p.prepWaste);
      setBuffetWastePercent(p.buffetWaste);
      setPlateWastePercent(p.plateWaste);
      setSpoilageWastePercent(p.spoilageWaste);
      setDailyCovers(p.defaultCovers);
      setCostPerCover(p.defaultCostPerCover);
    }
  };

  // Real-time calculations
  const calculations = useMemo(() => {
    const weeklyDays = operatingDays;
    const annualDays = weeklyDays * 52;
    
    // Total raw food procurement spend
    const dailySpend = dailyCovers * costPerCover;
    const monthlySpend = dailySpend * (annualDays / 12);
    const annualSpend = dailySpend * annualDays;

    // Waste percentages sum
    const totalWastePercent = Math.min(65, prepWastePercent + buffetWastePercent + plateWastePercent + spoilageWastePercent);

    // Gross financial cost of waste
    const annualWasteCost = annualSpend * (totalWastePercent / 100);
    const monthlyWasteCost = annualWasteCost / 12;
    const dailyWasteCost = annualWasteCost / annualDays;

    // Projected savings with Supritamone Academy upcycling protocols
    const annualSavings = annualWasteCost * (reductionTarget / 100);
    const monthlySavings = annualSavings / 12;
    const dailySavings = annualSavings / annualDays;

    // Mass Balance (kg): estimated 0.65 kg raw food purchased per cover
    const kgPurchasedPerCover = 0.65;
    const annualFoodPurchasedKg = dailyCovers * kgPurchasedPerCover * annualDays;
    const annualFoodWastedKg = annualFoodPurchasedKg * (totalWastePercent / 100);
    const annualFoodDivertedKg = annualFoodWastedKg * (reductionTarget / 100);

    // Environmental metrics: 2.5 kg CO2e per kg food waste diverted (EPA WARM model)
    const annualCo2eAvoidedKg = annualFoodDivertedKg * 2.5;
    const annualCo2eTonnes = annualCo2eAvoidedKg / 1000;

    // Bottom-line profit margin impact (typical food cost is ~32%)
    const foodCostPointsSaved = (totalWastePercent * (reductionTarget / 100)) * 0.32;

    // Proportional breakdown
    const sumPercent = (prepWastePercent + buffetWastePercent + plateWastePercent + spoilageWastePercent) || 1;
    const prepShare = (prepWastePercent / sumPercent) * 100;
    const buffetShare = (buffetWastePercent / sumPercent) * 100;
    const plateShare = (plateWastePercent / sumPercent) * 100;
    const spoilageShare = (spoilageWastePercent / sumPercent) * 100;

    return {
      dailySpend,
      monthlySpend,
      annualSpend,
      totalWastePercent,
      annualWasteCost,
      monthlyWasteCost,
      dailyWasteCost,
      annualSavings,
      monthlySavings,
      dailySavings,
      annualFoodWastedKg,
      annualFoodDivertedKg,
      annualCo2eTonnes,
      foodCostPointsSaved,
      prepShare,
      buffetShare,
      plateShare,
      spoilageShare
    };
  }, [
    dailyCovers, 
    costPerCover, 
    operatingDays, 
    prepWastePercent, 
    buffetWastePercent, 
    plateWastePercent, 
    spoilageWastePercent, 
    reductionTarget
  ]);

  const formatMoney = (val: number) => {
    return `${currency}${Math.round(val).toLocaleString()}`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
            <Calculator className="w-3.5 h-3.5" />
            <span>REAL-TIME COMMERCIAL MASS-BALANCE CALCULATOR</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Kitchen Food Waste & Profit Loss Monitor
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Instantly calculate trim loss, buffet overproduction, plate returns, and spoilage costs. Model exact bottom-line financial gains and carbon reductions achieved by implementing Dr. Chef Supritam Basu's certified upcycling SOPs.
          </p>
        </div>
      </div>

      {/* Preset Selector Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Kitchen Operating Presets:</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Currency:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
              {['$', '€', '£'].map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${currency === c ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                selectedPreset === preset.id
                  ? 'border-blue-600 bg-blue-50/50 shadow-2xs ring-1 ring-blue-500/20'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
              }`}
            >
              <p className="font-bold text-xs text-slate-900">{preset.name}</p>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Top Real-Time KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Annual Spend */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Food Spend</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {formatMoney(calculations.annualSpend)}
          </p>
          <span className="text-[11px] text-slate-500 mt-1">
            {formatMoney(calculations.monthlySpend)} / month
          </span>
        </div>

        {/* Metric 2: Waste Cost */}
        <div className="bg-white p-5 rounded-xl border border-rose-200/80 bg-rose-50/20 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Current Waste Loss</span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
              {calculations.totalWastePercent}%
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">
            {formatMoney(calculations.annualWasteCost)}
          </p>
          <span className="text-[11px] text-rose-700/80 mt-1">
            {formatMoney(calculations.dailyWasteCost)} discarded / day
          </span>
        </div>

        {/* Metric 3: Realizable Savings */}
        <div className="bg-white p-5 rounded-xl border border-emerald-300 bg-emerald-50/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Projected Savings</span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
              -{reductionTarget}% Target
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
            +{formatMoney(calculations.annualSavings)}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1">
            +{formatMoney(calculations.monthlySavings)} / month recovered
          </span>
        </div>

        {/* Metric 4: CO2e & Margin */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profit & Climate ROI</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
            +{calculations.foodCostPointsSaved.toFixed(1)}%
          </p>
          <span className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>{calculations.annualCo2eTonnes.toFixed(1)} t CO2e diverted</span>
          </span>
        </div>
      </div>

      {/* Main Interactive Controls + Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Input Sliders (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Real-Time Kitchen Operational Inputs</span>
            </h2>
            <button
              onClick={() => handleSelectPreset('fine-dining')}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Operational Metrics: Covers & Spend */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Daily Covers: <span className="text-blue-600 font-extrabold">{dailyCovers}</span>
              </label>
              <input
                type="range"
                min={25}
                max={1000}
                step={5}
                value={dailyCovers}
                onChange={(e) => setDailyCovers(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Covers / day</span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Food Cost / Cover: <span className="text-blue-600 font-extrabold">{currency}{costPerCover.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min={2}
                max={50}
                step={0.5}
                value={costPerCover}
                onChange={(e) => setCostPerCover(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Raw purchase cost</span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Days Open / Wk: <span className="text-blue-600 font-extrabold">{operatingDays} days</span>
              </label>
              <input
                type="range"
                min={5}
                max={7}
                step={1}
                value={operatingDays}
                onChange={(e) => setOperatingDays(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Annual operating base</span>
            </div>
          </div>

          {/* 4 Waste Streams (Quick Wins Categories) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Waste Streams (Quick Wins Breakdown)</span>
              <span className="text-slate-400 font-normal">Mass % of Purchased Food</span>
            </h3>

            {/* Stream 1: Prep Waste */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-xs">
                    🍳
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900">Prep Waste (Trimmings & Peelings)</span>
                    <p className="text-[10px] text-slate-500">Vegetable tops, butchery trim, bone frames, bread crusts</p>
                  </div>
                </div>
                <span className="font-mono font-extrabold text-amber-700 text-sm">{prepWastePercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={prepWastePercent}
                onChange={(e) => setPrepWastePercent(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Stream 2: Buffet Waste */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    🍱
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900">Buffet & Overproduction Waste</span>
                    <p className="text-[10px] text-slate-500">Unserved holding pans, carvery leftovers, banquet excess</p>
                  </div>
                </div>
                <span className="font-mono font-extrabold text-emerald-700 text-sm">{buffetWastePercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={35}
                value={buffetWastePercent}
                onChange={(e) => setBuffetWastePercent(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Stream 3: Plate Waste */}
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-700 flex items-center justify-center font-bold text-xs">
                    🍽️
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900">Plate Waste (Customer Returns)</span>
                    <p className="text-[10px] text-slate-500">Over-portioned garnishes, unconsumed sides, bread basket stales</p>
                  </div>
                </div>
                <span className="font-mono font-extrabold text-blue-700 text-sm">{plateWastePercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={plateWastePercent}
                onChange={(e) => setPlateWastePercent(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Stream 4: Spoilage Waste */}
            <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-purple-500/20 text-purple-700 flex items-center justify-center font-bold text-xs">
                    ⏱️
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900">Spoilage & Inventory Shrinkage</span>
                    <p className="text-[10px] text-slate-500">Walk-in decay, cold-chain temperature spikes, inventory lapse</p>
                  </div>
                </div>
                <span className="font-mono font-extrabold text-purple-700 text-sm">{spoilageWastePercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={spoilageWastePercent}
                onChange={(e) => setSpoilageWastePercent(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Reduction Target Slider */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Supritamone Academy Upcycling Reduction Target:</span>
              </span>
              <span className="font-mono font-extrabold text-emerald-700 text-sm">{reductionTarget}% Reduction</span>
            </div>
            <input
              type="range"
              min={15}
              max={75}
              step={5}
              value={reductionTarget}
              onChange={(e) => setReductionTarget(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Standard commercial brigades reduce waste by 35%–55% within 90 days of implementing the 252 Zero Waste Kitchen protocols.
            </p>
          </div>
        </div>

        {/* Right Column: Visual Breakdown & Recommended Upcycling Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          {/* Visual Mass-Balance Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              <span>Waste Stream Composition</span>
            </h3>

            {/* Proportion Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex shadow-inner">
              <div 
                style={{ width: `${calculations.prepShare}%` }} 
                className="bg-amber-500 transition-all duration-300" 
                title={`Prep: ${calculations.prepShare.toFixed(1)}%`}
              />
              <div 
                style={{ width: `${calculations.buffetShare}%` }} 
                className="bg-emerald-500 transition-all duration-300" 
                title={`Buffet: ${calculations.buffetShare.toFixed(1)}%`}
              />
              <div 
                style={{ width: `${calculations.plateShare}%` }} 
                className="bg-blue-500 transition-all duration-300" 
                title={`Plate: ${calculations.plateShare.toFixed(1)}%`}
              />
              <div 
                style={{ width: `${calculations.spoilageShare}%` }} 
                className="bg-purple-500 transition-all duration-300" 
                title={`Spoilage: ${calculations.spoilageShare.toFixed(1)}%`}
              />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-slate-600">Prep Trim: <strong>{calculations.prepShare.toFixed(0)}%</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-600">Buffet Hold: <strong>{calculations.buffetShare.toFixed(0)}%</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span className="text-slate-600">Plate Waste: <strong>{calculations.plateShare.toFixed(0)}%</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                <span className="text-slate-600">Spoilage: <strong>{calculations.spoilageShare.toFixed(0)}%</strong></span>
              </div>
            </div>

            {/* Mass Diverted Callout */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-700">
                <span>Landfill Mass Diverted:</span>
                <strong className="text-emerald-700">{Math.round(calculations.annualFoodDivertedKg).toLocaleString()} kg / year</strong>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Avoided Carbon Emissions:</span>
                <strong className="text-blue-700">{calculations.annualCo2eTonnes.toFixed(1)} Metric Tonnes CO2e</strong>
              </div>
            </div>
          </div>

          {/* Actionable Kitchen Protocols Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-emerald-600" />
              <span>Recommended Upcycling Protocols</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-200/60 flex items-start gap-2">
                <span className="text-amber-700 font-bold">1.</span>
                <div>
                  <strong className="text-slate-900">Prep Waste Solutions:</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Dehydrate citrus rinds into Oleo-Saccharum cordial, roast bone frames for 24h Glace de Viande, and blitz leek tops into Ash Salt.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/60 flex items-start gap-2">
                <span className="text-emerald-700 font-bold">2.</span>
                <div>
                  <strong className="text-slate-900">Buffet Waste Solutions:</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Chafing pan starch recovery: repurpose roasted meats into rillettes and croquettes; cool excess dairy into Ricotta Salata.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-200/60 flex items-start gap-2">
                <span className="text-blue-700 font-bold">3.</span>
                <div>
                  <strong className="text-slate-900">Plate & Spoilage Reductions:</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Lacto-ferment excess roots into 2.5% saline escabeche pickles; recalibrate side carb portion weights by 12% across pass.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Links */}
            <div className="pt-2 flex items-center justify-between gap-2">
              {onOpenLibrary && (
                <button
                  onClick={onOpenLibrary}
                  className="flex-1 py-2 px-3 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition-colors border border-blue-200"
                >
                  Browse 500 Byproducts
                </button>
              )}
              {onOpenCourse && (
                <button
                  onClick={() => onOpenCourse('food-waste-prevention-chefs')}
                  className="flex-1 py-2 px-3 text-center bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs"
                >
                  Start Chef Diploma
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
