import React, { useEffect, useState } from 'react';
import api from '../../api/axiosClient';
import { Shield, Search, Filter, Clock, User as UserIcon, Activity, RefreshCw, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const GlobalAuditPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEntity, setFilterEntity] = useState('ALL');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/super/audit');
            setLogs(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar auditoría global");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.actor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             log.entityId?.toString().includes(searchTerm);
        const matchesEntity = filterEntity === 'ALL' || log.entity === filterEntity;
        return matchesSearch && matchesEntity;
    });

    const entities = ['ALL', ...new Set(logs.map(l => l.entity))];

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 text-pink-50 opacity-20 pointer-events-none">
                    <Shield size={160} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-4">
                        <div className="p-3 bg-pink-500 text-white rounded-2xl shadow-lg shadow-pink-200">
                            <Shield size={28} />
                        </div>
                        Registro de Auditoría Global
                    </h1>
                    <p className="text-gray-500 text-sm mt-2 font-medium">Historial completo de acciones críticas en toda la infraestructura.</p>
                </div>
                <button 
                    onClick={fetchLogs}
                    className="relative z-10 flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl shadow-gray-200"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Actualizar Log
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Búsqueda</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Usuario, acción, ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-50 rounded-2xl text-sm focus:ring-4 ring-pink-500/10 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Entidad</label>
                            <select 
                                value={filterEntity}
                                onChange={(e) => setFilterEntity(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-50 rounded-2xl text-sm font-bold text-gray-700 focus:ring-4 ring-pink-500/10 outline-none transition-all appearance-none"
                            >
                                {entities.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>

                        <div className="pt-4 border-t border-gray-50">
                            <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                <span>Coincidencias</span>
                                <span className="text-pink-600 font-black">{filteredLogs.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-100 relative overflow-hidden group">
                        <AlertTriangle className="absolute -bottom-4 -right-4 text-white/10 group-hover:scale-110 transition-transform" size={120} />
                        <h3 className="text-lg font-black mb-2 relative z-10">Alertas SaaS</h3>
                        <p className="text-xs text-indigo-100 mb-4 relative z-10">Se han detectado interacciones con el módulo de contratos recientemente.</p>
                        <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors relative z-10">
                            Ver Alertas
                        </button>
                    </div>
                </div>

                <div className="md:col-span-3">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha & Hora</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actor</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acción</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Detalle de Entidad</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-pink-50/30 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-900">{new Date(log.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-[10px] font-mono text-gray-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-black text-xs">
                                                        {log.actor?.name?.[0] || 'S'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800">{log.actor?.name || 'Sistema'}</p>
                                                        <p className="text-[10px] text-pink-500 font-black uppercase tracking-tighter">ID: {log.actor?.tenantId || 'GLOBAL'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                                                    log.action.includes('DELETE') ? 'bg-red-50 text-red-600 border-red-100' :
                                                    log.action.includes('UPDATE') ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-700">
                                                        {log.entity} <span className="text-gray-400 font-mono">#{log.entityId}</span>
                                                    </p>
                                                    {log.meta && Object.keys(log.meta).length > 0 && (
                                                        <p className="text-[10px] text-gray-400 mt-1 truncate max-w-xs">{JSON.stringify(log.meta)}</p>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLogs.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-20 text-center text-gray-400 font-bold italic">
                                                {loading ? 'Cargando registros...' : 'No se encontraron eventos para los filtros seleccionados.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalAuditPage;
