import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { CreditCard, TrendingUp, Users, ShoppingBag, DollarSign, PieChart, ShieldAlert, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const SaaSConfigPage = () => {
    const [stats, setStats] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, alertsRes] = await Promise.all([
                api.get('/super/stats'),
                api.get('/super/saas/alerts')
            ]);
            setStats(statsRes.data);
            setAlerts(alertsRes.data.alerts || []);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar configuración SaaS");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-gray-400">CARGANDO MÉTRICAS GLOBALES...</div>;

    return (
        <div className="p-4 md:p-8 space-y-10 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Administración SaaS</h1>
                    <p className="text-gray-500 font-medium mt-1">Visión global financiera y operativa de la plataforma.</p>
                </div>
                <button 
                    onClick={fetchData}
                    className="p-4 bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 hover:border-pink-500 transition-all group"
                >
                    <RefreshCw className="text-gray-400 group-hover:text-pink-500 transition-colors" size={24} />
                </button>
            </header>

            {/* Global Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Ventas Totales', value: `$${Number(stats?.globalSales || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500', shadow: 'shadow-emerald-200' },
                    { label: 'Pastelerías (Tenants)', value: stats?.tenants || 0, icon: PieChart, color: 'bg-pink-500', shadow: 'shadow-pink-200' },
                    { label: 'Usuarios Globales', value: stats?.users || 0, icon: Users, color: 'bg-blue-500', shadow: 'shadow-blue-200' },
                    { label: 'Órdenes Activas', value: stats?.activeOrders || 0, icon: ShoppingBag, color: 'bg-orange-500', shadow: 'shadow-orange-200' },
                ].map((item, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className={`absolute -right-4 -bottom-4 p-8 text-white opacity-10 group-hover:scale-125 transition-transform ${item.color} rounded-full`}>
                            <item.icon size={100} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{item.label}</p>
                            <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{item.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Alerts & Monitoring */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-lg p-8 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <ShieldAlert size={24} className="text-rose-500" /> Alertas de Seguridad SaaS
                            </h2>
                            <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-bold border border-rose-100">DETECCIÓN ACTIVA</span>
                        </div>
                        
                        <div className="space-y-4">
                            {alerts.length > 0 ? alerts.map((alert) => (
                                <div key={alert.id} className="p-5 bg-rose-50/30 border border-rose-100 rounded-2xl flex items-start gap-4">
                                    <div className="p-2 bg-rose-500 text-white rounded-lg">
                                        <ShieldAlert size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-rose-900">{alert.tenant?.businessName || 'Sistema'}</p>
                                            <span className="text-[10px] font-mono text-rose-400">{new Date(alert.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-rose-700 mt-1">{alert.action === 'UPDATE_LIMIT' ? '⚠️ Límite de recursos modificado' : alert.action}</p>
                                        {alert.meta && <pre className="text-[10px] mt-2 bg-white/50 p-2 rounded border border-rose-100 text-rose-600">{JSON.stringify(alert.meta, null, 2)}</pre>}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-gray-400 italic font-medium">No hay alertas críticas en este momento.</div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Quick Actions / Configuration */}
                <div className="space-y-8">
                    <section className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-gray-400/50 group">
                        <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:scale-110 transition-transform">
                            <TrendingUp size={140} />
                        </div>
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3 relative z-10">
                            <CreditCard size={20} className="text-pink-500" /> Reglas de Contrato
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Comisión Global Sugerida</p>
                                <p className="text-2xl font-black text-pink-500">5.0% <span className="text-xs font-medium text-gray-400">por venta</span></p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Ciclo de Facturación</p>
                                <p className="text-2xl font-black text-blue-400">30 <span className="text-xs font-medium text-gray-400">días</span></p>
                            </div>
                            <button className="w-full py-4 bg-pink-600 hover:bg-pink-700 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-pink-900/20 active:scale-95">
                                Editar Configuración de Red
                            </button>
                        </div>
                    </section>

                    <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden relative group">
                         <div className="absolute -top-4 -left-4 w-20 h-20 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform" />
                         <div className="relative z-10">
                            <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-3">
                                <FileText size={20} className="text-emerald-500" /> Reportería Global
                            </h3>
                            <p className="text-xs text-gray-500 mb-6 leading-relaxed">Genera consolidados de ventas y actividad de todos los tenants para el cierre mensual.</p>
                            <button className="w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all">
                                Generar Reporte SaaS
                            </button>
                         </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default SaaSConfigPage;
