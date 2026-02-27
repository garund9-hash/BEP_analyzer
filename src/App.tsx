/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  Calculator, 
  PieChart, 
  ArrowRight,
  Info,
  DollarSign,
  Package,
  Target
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CostItem {
  id: string;
  name: string;
  amount: number;
}

export default function App() {
  // State for Fixed Costs
  const [fixedCosts, setFixedCosts] = useState<CostItem[]>([
    { id: '1', name: '임대료', amount: 2000000 },
    { id: '2', name: '인건비', amount: 5000000 },
    { id: '3', name: '마케팅비', amount: 1000000 },
  ]);

  // State for Variable Costs
  const [variableCosts, setVariableCosts] = useState<CostItem[]>([
    { id: '1', name: '원부자재', amount: 5000 },
    { id: '2', name: '포장비', amount: 500 },
    { id: '3', name: '배송비', amount: 2500 },
  ]);

  // Pricing State
  const [sellingPrice, setSellingPrice] = useState<number>(15000);
  const [targetProfit, setTargetProfit] = useState<number>(5000000);
  const [maxVolume, setMaxVolume] = useState<number>(2000);

  // Calculations
  const totalFixedCost = useMemo(() => fixedCosts.reduce((sum, item) => sum + item.amount, 0), [fixedCosts]);
  const totalVariableCostPerUnit = useMemo(() => variableCosts.reduce((sum, item) => sum + item.amount, 0), [variableCosts]);
  const contributionMargin = sellingPrice - totalVariableCostPerUnit;
  const contributionMarginRatio = sellingPrice > 0 ? (contributionMargin / sellingPrice) * 100 : 0;
  
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(totalFixedCost / contributionMargin) : 0;
  const breakEvenRevenue = breakEvenUnits * sellingPrice;
  
  const targetUnits = contributionMargin > 0 ? Math.ceil((totalFixedCost + targetProfit) / contributionMargin) : 0;

  // Chart Data Generation
  const chartData = useMemo(() => {
    const data = [];
    const step = Math.max(1, Math.floor(maxVolume / 10));
    const end = Math.max(maxVolume, breakEvenUnits * 1.5);
    
    for (let q = 0; q <= end; q += step) {
      const revenue = q * sellingPrice;
      const totalCost = totalFixedCost + (q * totalVariableCostPerUnit);
      const profit = revenue - totalCost;
      data.push({
        quantity: q,
        revenue,
        totalCost,
        profit,
        fixedCost: totalFixedCost
      });
    }
    return data;
  }, [totalFixedCost, totalVariableCostPerUnit, sellingPrice, maxVolume, breakEvenUnits]);

  // Handlers
  const addFixedCost = () => {
    setFixedCosts([...fixedCosts, { id: Date.now().toString(), name: '새 항목', amount: 0 }]);
  };

  const removeFixedCost = (id: string) => {
    setFixedCosts(fixedCosts.filter(item => item.id !== id));
  };

  const updateFixedCost = (id: string, field: keyof CostItem, value: string | number) => {
    setFixedCosts(fixedCosts.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addVariableCost = () => {
    setVariableCosts([...variableCosts, { id: Date.now().toString(), name: '새 항목', amount: 0 }]);
  };

  const removeVariableCost = (id: string) => {
    setVariableCosts(variableCosts.filter(item => item.id !== id));
  };

  const updateVariableCost = (id: string, field: keyof CostItem, value: string | number) => {
    setVariableCosts(variableCosts.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1C1E] font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-[#E1E3E5] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">ProfitSim <span className="text-indigo-600">Pro</span></h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-[#44474E]">
            <div className="flex items-center gap-1">
              <Calculator className="w-4 h-4" />
              <span>손익분기점 분석기</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Pricing Card */}
            <section className="bg-white rounded-2xl border border-[#E1E3E5] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-base">가격 및 목표 설정</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#44474E] uppercase tracking-wider mb-1.5">판매 단가 (Unit Price)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      className="w-full bg-[#F1F3F5] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#74777F]">₩</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#44474E] uppercase tracking-wider mb-1.5">목표 수익 (Target Profit)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={targetProfit}
                      onChange={(e) => setTargetProfit(Number(e.target.value))}
                      className="w-full bg-[#F1F3F5] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#74777F]">₩</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Fixed Costs Card */}
            <section className="bg-white rounded-2xl border border-[#E1E3E5] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-bold text-base">고정비 (Fixed Costs)</h2>
                </div>
                <button 
                  onClick={addFixedCost}
                  className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                {fixedCosts.map((item) => (
                  <div key={item.id} className="flex gap-2 group">
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => updateFixedCost(item.id, 'name', e.target.value)}
                      className="flex-1 bg-[#F1F3F5] border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                    <input 
                      type="number" 
                      value={item.amount}
                      onChange={(e) => updateFixedCost(item.id, 'amount', Number(e.target.value))}
                      className="w-24 bg-[#F1F3F5] border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 text-right"
                    />
                    <button 
                      onClick={() => removeFixedCost(item.id)}
                      className="p-2 text-[#74777F] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="pt-2 border-t border-[#E1E3E5] flex justify-between items-center">
                  <span className="text-xs font-bold text-[#44474E]">총 고정비</span>
                  <span className="text-sm font-bold text-indigo-600">{formatCurrency(totalFixedCost)}</span>
                </div>
              </div>
            </section>

            {/* Variable Costs Card */}
            <section className="bg-white rounded-2xl border border-[#E1E3E5] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-bold text-base">변동비 (Variable Costs)</h2>
                </div>
                <button 
                  onClick={addVariableCost}
                  className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                {variableCosts.map((item) => (
                  <div key={item.id} className="flex gap-2 group">
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => updateVariableCost(item.id, 'name', e.target.value)}
                      className="flex-1 bg-[#F1F3F5] border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                    <input 
                      type="number" 
                      value={item.amount}
                      onChange={(e) => updateVariableCost(item.id, 'amount', Number(e.target.value))}
                      className="w-24 bg-[#F1F3F5] border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 text-right"
                    />
                    <button 
                      onClick={() => removeVariableCost(item.id)}
                      className="p-2 text-[#74777F] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="pt-2 border-t border-[#E1E3E5] flex justify-between items-center">
                  <span className="text-xs font-bold text-[#44474E]">단위당 변동비</span>
                  <span className="text-sm font-bold text-indigo-600">{formatCurrency(totalVariableCostPerUnit)}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Results & Visualization */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-[#E1E3E5] p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-[#44474E] uppercase tracking-wider">공헌 이익 (CM)</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">{formatCurrency(contributionMargin)}</span>
                  <span className="text-xs text-[#74777F] mt-1">이익률: {contributionMarginRatio.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="bg-indigo-600 rounded-2xl p-5 shadow-lg shadow-indigo-100 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">손익분기점 (BEP)</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">{breakEvenUnits.toLocaleString()} 개</span>
                  <span className="text-xs opacity-80 mt-1">매출액: {formatCurrency(breakEvenRevenue)}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E1E3E5] p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-[#44474E] uppercase tracking-wider">목표 달성 수량</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">{targetUnits.toLocaleString()} 개</span>
                  <span className="text-xs text-[#74777F] mt-1">수익 {formatCurrency(targetProfit)} 기준</span>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <section className="bg-white rounded-2xl border border-[#E1E3E5] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-bold text-lg">수익 시뮬레이션 그래프</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-600" />
                    <span className="text-xs text-[#44474E]">매출</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="text-xs text-[#44474E]">총 비용</span>
                  </div>
                </div>
              </div>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis 
                      dataKey="quantity" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#74777F' }}
                      label={{ value: '판매 수량', position: 'insideBottomRight', offset: -10, fontSize: 10 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#74777F' }}
                      tickFormatter={(value) => `${(value / 10000).toLocaleString()}만`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [formatCurrency(value), '']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#4F46E5" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      name="총 매출"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalCost" 
                      stroke="#F87171" 
                      strokeWidth={2} 
                      dot={false}
                      name="총 비용"
                    />
                    <ReferenceLine 
                      x={breakEvenUnits} 
                      stroke="#10B981" 
                      strokeDasharray="5 5"
                      label={{ value: 'BEP', position: 'top', fill: '#10B981', fontSize: 12, fontWeight: 'bold' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Analysis Table */}
            <section className="bg-white rounded-2xl border border-[#E1E3E5] overflow-hidden shadow-sm">
              <div className="p-6 border-b border-[#E1E3E5]">
                <h2 className="font-bold text-lg">수량별 손익 상세 분석</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FA]">
                      <th className="px-6 py-4 text-xs font-bold text-[#44474E] uppercase tracking-wider">판매 수량</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#44474E] uppercase tracking-wider">총 매출</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#44474E] uppercase tracking-wider">총 비용</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#44474E] uppercase tracking-wider">영업 이익</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#44474E] uppercase tracking-wider">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E3E5]">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((multiplier) => {
                      const q = Math.ceil(breakEvenUnits * multiplier);
                      const revenue = q * sellingPrice;
                      const totalCost = totalFixedCost + (q * totalVariableCostPerUnit);
                      const profit = revenue - totalCost;
                      const isProfit = profit >= 0;
                      
                      return (
                        <tr key={multiplier} className="hover:bg-[#F1F3F5] transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">{q.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm">{formatCurrency(revenue)}</td>
                          <td className="px-6 py-4 text-sm">{formatCurrency(totalCost)}</td>
                          <td className={cn("px-6 py-4 text-sm font-bold", isProfit ? "text-emerald-600" : "text-red-500")}>
                            {formatCurrency(profit)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              isProfit ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                            )}>
                              {isProfit ? "흑자" : "적자"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Insights Footer */}
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
              <div className="flex gap-3">
                <Info className="w-6 h-6 text-indigo-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-indigo-900 mb-1">의사 결정 인사이트</h3>
                  <p className="text-sm text-indigo-800 leading-relaxed">
                    현재 설정된 가격 <strong>{formatCurrency(sellingPrice)}</strong>에서 손익분기점은 <strong>{breakEvenUnits.toLocaleString()}개</strong>입니다. 
                    판매 가격을 10% 인상하면 BEP는 더 낮아지지만, 시장 수요가 감소할 수 있습니다. 
                    변동비를 500원 절감할 경우 공헌이익이 개선되어 목표 수익 달성이 빨라집니다.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
