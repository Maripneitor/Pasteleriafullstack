import React, { useEffect, useState } from 'react';
import api from '../../api/axiosClient';
import { Shield, Clock, User, Globe, Activity, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const GlobalSessionsPage = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/super/sessions');
            setSessions(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar sesiones");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Activity className="text-blue-500" size={32} /> Monitoreo de Sesiones
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Usuarios activos en tiempo real en toda la plataforma.</p>
                </div>
                <button 
                    onClick={fetchSessions}
                    className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors border border-blue-100"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Usuario</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pastelería (Tenant)</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Última Actividad</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Dispositivo / IP</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sessions.length > 0 ? sessions.map((session) => (
                                <tr key={session.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black">
                                                {session.user?.name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{session.user?.name}</p>
                                                <p className="text-xs text-gray-400">{session.user?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200">
                                            ID: {session.user?.tenantId}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                            <Clock size={14} className="text-gray-400" />
                                            {new Date(session.lastSeenAt || session.updatedAt).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                                            <Globe size={14} className="text-gray-300" />
                                            {session.userAgent?.slice(0, 30) || 'IP: ' + (session.ipAddress || 'Unknown')}...
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Activo</span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-medium italic">
                                        No hay sesiones activas detectadas actualmente.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GlobalSessionsPage;
