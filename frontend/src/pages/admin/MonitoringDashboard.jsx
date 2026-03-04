import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Eye, 
    TrendingUp, 
    Users, 
    ShoppingBag,
    Clock,
    Zap,
    ShieldCheck,
    RefreshCw,
    AlertCircle,
    Activity,
    Radar
} from 'lucide-react';
import toast from 'react-hot-toast';

const MonitoringDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchData = async () => {
        try {
            const auditRes = await api.get('/audit/monitor');
            setData(auditRes.data);
            setLastUpdated(new Date());
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al conectar con el Feed de Chismes");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 45000); // 45s refresh
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
            <div className="relative">
                <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="w-20 h-20 border-4 border-pink-500/30 border-t-pink-500 rounded-full mb-6 shadow-[0_0_30px_rgba(236,72,153,0.3)]"
                />
                <Radar className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-pink-500" size={32} />
            </div>
            <p className="text-pink-500 font-bold animate-pulse text-xl tracking-widest uppercase">Iniciando Vigilancia... 🕵️‍♂️</p>
        </div>
    );

    const { recentLogs = [], salesStats = [], latestOrders = [], isSuper } = data || {};

    const getActionColor = (action) => {
        const a = action.toLowerCase();
        if (a.includes('delete') || a.includes('cancel')) return 'text-red-400 bg-red-400/10 border-red-400/20';
        if (a.includes('create') || a.includes('add')) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        if (a.includes('update') || a.includes('edit')) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    };

    return (
        <div className="p-4 md:p-8 space-y-8 bg-slate-950 min-h-screen text-slate-200 selection:bg-pink-500/30 selection:text-pink-200">
            {/* Ambient background glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                            <Eye size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
                                Modo Chismoso
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                                </span>
                            </h1>
                            <p className="text-slate-400 font-medium flex items-center gap-2">
                                <Activity size={16} className="text-pink-500" /> Monitoreo de activos en tiempo real
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-4 border-r border-slate-800 pr-6">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Status del Radar</span>
                        <span className="text-emerald-400 font-mono text-sm">Sistemas Nominales</span>
                    </div>
                    
                    <button 
                        onClick={fetchData}
                        className="group relative px-6 py-3 bg-slate-900 border border-slate-800 text-white rounded-xl hover:border-pink-500/50 transition-all shadow-xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-3 relative z-10">
                            <RefreshCw size={18} className="text-pink-500 group-hover:rotate-180 transition-transform duration-500" />
                            <span className="font-bold tracking-wide">Refrescar Feed</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Eventos Radar', value: recentLogs.length, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-400/5', border: 'border-blue-400/20' },
                    { label: 'Movimientos Hoy', value: latestOrders.length, icon: ShoppingBag, color: 'text-pink-400', bg: 'bg-pink-400/5', border: 'border-pink-400/20' },
                    { label: 'Sucursales Online', value: salesStats.length, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/5', border: 'border-emerald-400/20' },
                    { label: 'Nivel Acceso', value: isSuper ? 'TOTAL' : 'PARCIAL', icon: ShieldCheck, color: 'text-violet-400', bg: 'bg-violet-400/5', border: 'border-violet-400/20' },
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className={`backdrop-blur-md ${stat.bg} p-6 rounded-3xl border ${stat.border} flex items-center gap-5 hover:scale-[1.02] transition-transform cursor-default group`}
                    >
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} border ${stat.border} group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
                            <p className="text-3xl font-black text-white">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Feed Column */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <Activity size={24} className="text-pink-500" /> Transmisión en Vivo
                                </h2>
                                <p className="text-slate-500 text-sm mt-1 uppercase tracking-tighter">Últimas 20 interacciones detectadas</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 rounded-full border border-slate-800">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-mono text-emerald-500">CONECTADO</span>
                            </div>
                        </div>
                        <div className="p-2 h-[650px] overflow-y-auto custom-scrollbar">
                            <AnimatePresence mode="popLayout">
                                {recentLogs.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-600 grayscale opacity-50">
                                        <AlertCircle size={48} className="mb-4" />
                                        <p>Silencio en el radar...</p>
                                    </div>
                                ) : (
                                    recentLogs.map((log, i) => {
                                        const actionStyles = getActionColor(log.action);
                                        return (
                                            <motion.div 
                                                key={log.id}
                                                initial={{ opacity: 0, x: -50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                layout
                                                className="m-2 p-5 bg-slate-950/40 border border-slate-800/50 rounded-2xl hover:border-pink-500/30 transition-all flex items-start gap-5 group"
                                            >
                                                <div className="relative shrink-0">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-black text-lg border border-slate-700 shadow-lg group-hover:border-pink-500/50 transition-colors">
                                                        {log.actor?.username?.[0]?.toUpperCase() || 'AI'}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800">
                                                        <Zap size={10} className="text-yellow-500" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-slate-200 text-base">{log.actor?.username || 'Sistema'}</span>
                                                            <span className="text-slate-500 text-xs">—</span>
                                                            <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-700 uppercase">
                                                                {log.tenant?.businessName || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                                                            <Clock size={12} /> {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${actionStyles}`}>
                                                            {log.action}
                                                        </span>
                                                        <p className="text-slate-400 text-sm">
                                                            en <span className="font-bold text-slate-100">{log.entity}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </div>
                    </section>
                </div>

                {/* Sidebar Column: Stats & Latest */}
                <div className="space-y-8">
                    {/* Performance Ranking */}
                    <section className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
                        <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                             <TrendingUp size={20} className="text-emerald-400" /> Sucursales Top
                        </h2>
                        <div className="space-y-8">
                            {salesStats.length === 0 && (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                                        <TrendingUp size={24} className="text-slate-700" />
                                    </div>
                                    <p className="text-slate-500 text-sm italic">Esperando datos de hoy...</p>
                                </div>
                            )}
                            {salesStats.map((stat, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">Sucursal</p>
                                            <p className="font-bold text-slate-200">{stat.branch?.name || 'Central'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-white font-mono tracking-tighter">${Number(stat.totalSales).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-[2px]">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (stat.totalSales / 10000) * 100)}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className="h-full bg-gradient-to-r from-pink-600 to-rose-500 rounded-full shadow-[0_0_10px_rgba(219,39,119,0.4)]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Latest Critical Moves */}
                    <section className="bg-gradient-to-br from-pink-600 to-rose-700 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(225,29,72,0.3)] text-white overflow-hidden relative group">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black flex items-center gap-3">
                                    <Zap size={20} className="text-yellow-300" /> Movimientos
                                </h2>
                                <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold">ALERTA</span>
                            </div>
                            <div className="space-y-4">
                                {latestOrders.length === 0 && <p className="text-sm opacity-60 italic">Nada por ahora.</p>}
                                {latestOrders.map((order, i) => (
                                    <motion.div 
                                        whileHover={{ x: 5 }}
                                        key={order.id} 
                                        className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/10 transition-colors shadow-lg"
                                    >
                                        <div className="flex justify-between font-black mb-1">
                                            <span className="font-mono text-lg">{order.folioNumber}</span>
                                            <span className="text-white text-lg">${Number(order.total).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center opacity-80">
                                            <p className="text-xs font-bold truncate pr-4">{order.cliente_nombre}</p>
                                            <p className="text-[10px] uppercase font-black bg-pink-800/40 px-1.5 py-0.5 rounded">{order.status}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                            <ShoppingBag size={150} />
                        </div>
                    </section>
                </div>
            </div>
            
            {/* Footer indicator */}
            <div className="relative z-10 pt-10 pb-4 text-center">
                <p className="text-slate-600 font-mono text-[10px] tracking-[0.3em] uppercase">
                    Protocolo de Vigilancia Activo • Encriptación End-to-End • © {new Date().getFullYear()} La Fiesta Cloud
                </p>
            </div>
        </div>
    );
};

export default MonitoringDashboard;
