/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShoppingCart, 
  Wallet, 
  AlertTriangle, 
  Map as MapIcon,
  Package,
  History,
  Info,
  ShieldCheck,
  Search,
  Bell,
  Menu,
  X,
  FileText,
  Download,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from './lib/utils';
import { generateMockData, inventoryMockData, shariaScoresMock } from './data/mockData';
import { calculateFinancials, detectDoubleOrders } from './lib/engines';
import { KPICard } from './components/KPICard';
import { SalesLineChart, ProductBarChart } from './components/Charts';
import { InventoryPanel } from './components/InventoryPanel';
import { ShariaPanel } from './components/ShariaPanel';
import { AIInsightsPanel } from './components/AIInsightsPanel';
import { getAIInsights } from './services/geminiService';
import { OrderStatus } from './types';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [transactions] = useState(() => generateMockData(150));
  const [inventory] = useState(inventoryMockData);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(true);

  const stats = useMemo(() => calculateFinancials(transactions), [transactions]);
  const doubleOrders = useMemo(() => detectDoubleOrders(transactions), [transactions]);

  // Chart Data preparation
  const salesTrendData = useMemo(() => {
    const daily: Record<string, number> = {};
    transactions.slice(0, 30).forEach(t => {
      const d = t.order_date.split('T')[0];
      daily[d] = (daily[d] || 0) + (t.status_pesanan === OrderStatus.SELESAI ? t.order_amount : 0);
    });
    return Object.entries(daily).map(([date, sales]) => ({ date: date.split('-')[2], sales }));
  }, [transactions]);

  const topProductsData = useMemo(() => {
    const products: Record<string, number> = {};
    transactions.forEach(t => {
      products[t.nama_produk_lampu] = (products[t.nama_produk_lampu] || 0) + t.order_amount;
    });
    return Object.entries(products)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions]);

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const insights = await getAIInsights(stats, transactions);
        setAiInsights(insights);
      } finally {
        setLoadingAI(false);
      }
    };
    fetchAI();
  }, [stats, transactions]);

  const SidebarItem = ({ icon: Icon, label, active = false }: any) => (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200",
      active ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
    )}>
      <Icon className="w-5 h-5" />
      <span className="font-medium text-sm">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-full shadow-xl"
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-72 bg-white border-r border-gray-100 flex flex-col fixed lg:sticky top-0 h-screen z-40"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl">K</div>
                <div>
                  <h1 className="text-xl font-black text-emerald-900 tracking-tighter">KAS</h1>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Knowledge Accounting</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">Menu Utama</p>
                <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
                <SidebarItem icon={TrendingUp} label="Analisis Penjualan" />
                <SidebarItem icon={Wallet} label="Laporan Keuangan" />
                <SidebarItem icon={Package} label="Manajemen Stok" />
                <SidebarItem icon={MapIcon} label="Geografis" />
                
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-8 mb-4 px-4">Kepatuhan & Risiko</p>
                <SidebarItem icon={ShieldCheck} label="Syariah Compliance" />
                <SidebarItem icon={AlertTriangle} label="Deteksi Anomali" />
                <SidebarItem icon={History} label="Audit Log" />
              </div>
            </div>

            <div className="mt-auto p-8 border-t border-gray-50">
              <div className="bg-emerald-50 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold italic">S</div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-gray-900 truncate">Shopee Admin</p>
                  <p className="text-xs text-gray-500 truncate">KAS Platinum Plan</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-gray-800">Dashboard Ringkasan</h2>
            <p className="text-xs text-gray-400 font-medium tracking-tight">Integrated Smart Sales Analytics & Sharia Compliance</p>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Cari transaksi..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="flex items-center gap-4 border-l border-gray-100 pl-6 text-gray-400">
               <button className="relative p-1 hover:text-emerald-600 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
               </button>
               <button className="p-1 hover:text-emerald-600 transition-colors">
                  <Info className="w-5 h-5" />
               </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                <Filter className="w-4 h-4" /> Filter Periode
              </button>
              <span className="text-sm font-medium text-gray-400 px-2 cursor-default">|</span>
              <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">Mei 2026</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                <Download className="w-4 h-4" /> Export XLSX
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-md shadow-emerald-100">
                <FileText className="w-4 h-4" /> Download Report Keuangan
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard 
              title="Omzet Kotor" 
              value={stats.totalRevenue} 
              icon={TrendingUp} 
              isCurrency 
              trend={{ value: 12.5, isUp: true }} 
            />
            <KPICard 
              title="Total Pesanan" 
              value={stats.totalOrders} 
              icon={ShoppingCart} 
              trend={{ value: 8.2, isUp: true }} 
            />
            <KPICard 
              title="Laba Bersih" 
              value={stats.netProfit} 
              icon={Wallet} 
              isCurrency 
              trend={{ value: 3.1, isUp: false }} 
            />
            <KPICard 
              title="Return Rate" 
              value={`${stats.returnRate.toFixed(1)}%`} 
              icon={AlertTriangle} 
              trend={{ value: 0.5, isUp: false }} 
              className={stats.returnRate > 5 ? "border-rose-100" : ""}
            />
          </div>

          {/* AI Insights & Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AIInsightsPanel insights={aiInsights} loading={loadingAI} />
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800">Tren Penjualan Lampu (Harian)</h3>
                <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded">30 HARI TERAKHIR</span>
              </div>
              <SalesLineChart data={salesTrendData} />
            </div>
          </div>

          {/* Performance & Inventory */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-1 lg:col-span-1">
              <h3 className="font-bold text-gray-800 mb-6 uppercase text-xs tracking-widest text-emerald-800">Top Produkterbaik</h3>
              <ProductBarChart data={topProductsData} />
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 uppercase text-xs tracking-widest text-emerald-800">Monitoring Stok Inventory</h3>
                <button className="text-xs font-bold text-emerald-600 hover:underline">Kelola Stok →</button>
              </div>
              <InventoryPanel items={inventory} />
            </div>
          </div>

          {/* Sharia Panel */}
          <div className="bg-[#FAFDFB] p-8 rounded-3xl border border-emerald-100">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-emerald-900 flex items-center gap-3">
                <span className="text-3xl">🕌</span> Syariah Accounting Module
              </h2>
              <p className="text-sm text-emerald-700/70 font-medium">Monitoring kepatuhan bisnis terhadap kaidah akuntansi syariah dan perhitungan zakat otomatis.</p>
            </div>
            <ShariaPanel 
              scores={shariaScoresMock} 
              cash={stats.netProfit} 
              stock={inventory.reduce((acc, item) => acc + (item.stok_akhir * 35000), 0)} 
            />
          </div>

          {/* Anomaly Detection */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
              <h3 className="font-bold text-gray-800">Deteksi Anomali Penjualan</h3>
            </div>
            {doubleOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-rose-50 text-rose-800 text-xs font-bold uppercase">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">ID Order</th>
                      <th className="px-4 py-3">Produk</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Alamat Target</th>
                      <th className="px-4 py-3 rounded-tr-lg">Kemungkinan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doubleOrders.map(t => (
                      <tr key={t.order_id} className="border-b border-gray-50 text-gray-600">
                        <td className="px-4 py-4 font-bold text-rose-600">{t.order_id}</td>
                        <td className="px-4 py-4">{t.nama_produk_lampu}</td>
                        <td className="px-4 py-4">{t.customer_id}</td>
                        <td className="px-4 py-4 italic text-[11px] max-w-xs truncate">{t.customer_address}</td>
                        <td className="px-4 py-4">
                           <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded text-[10px] font-black uppercase">Double Order</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <ShieldCheck className="w-12 h-12 mb-2 text-emerald-200" />
                <p className="font-medium text-sm">Tidak ditemukan indikasi double order di periode ini.</p>
              </div>
            )}
          </div>

          {/* Footer info */}
          <footer className="text-center pb-8 pt-4">
            <p className="text-xs text-gray-300 font-medium uppercase tracking-widest">© 2026 KAS - Knowledge Accounting System • Sharia Compliance Powered by AI</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
