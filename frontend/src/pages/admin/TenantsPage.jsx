import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Building, Users, AlertCircle, CheckCircle, Save, Settings as SettingsIcon, Store as StoreIcon, DollarSign, Clock, Download, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const TenantsPage = () => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editMaxBranches, setEditMaxBranches] = useState(2);
    const [editMaxUsers, setEditMaxUsers] = useState(5);

    const fetchTenants = async () => {
        try {
            const res = await api.get('/super/tenants');
            setTenants(res.data);
        } catch (error) {
            console.error("Error fetching tenants", error);
            toast.error("Error al cargar dueños");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const startEdit = (tenant) => {
        setEditingId(tenant.id);
        setEditMaxBranches(tenant.maxBranches);
        setEditMaxUsers(tenant.maxUsers || 5);
    };

    const saveLimit = async (tenantId) => {
        try {
            await api.put(
                `/super/tenants/${tenantId}/limits`,
                { 
                    maxBranches: parseInt(editMaxBranches),
                    maxUsers: parseInt(editMaxUsers)
                }
            );
            toast.success("Límites actualizados");
            setEditingId(null);
            fetchTenants();
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar límites");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Cargando Dueños...</div>;

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Building className="text-pink-500" size={32} /> Gestión de Dueños
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Panel centralizado para control de acceso y límites.</p>
                </div>
                <div className="bg-pink-50 text-pink-600 px-6 py-2 rounded-full text-sm font-black border border-pink-100 flex items-center gap-2">
                    <CheckCircle size={16} /> {tenants.length} CLIENTES ACTIVOS
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tenants.map(tenant => (
                    <div key={tenant.id} className="group bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform" />
                        
                        <div className="relative z-10 flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-pink-200">
                                    {tenant.businessName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <Link to={`/admin/tenants/${tenant.id}`} className="hover:text-pink-600 transition-colors">
                                        <h3 className="font-black text-gray-900 text-lg truncate flex items-center gap-1">
                                            {tenant.businessName} <ChevronRight size={18} className="text-gray-300" />
                                        </h3>
                                    </Link>
                                    <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">ID: #{tenant.id}</span>
                                </div>
                            </div>
                            {editingId === tenant.id ? (
                                <button
                                    onClick={() => saveLimit(tenant.id)}
                                    className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-100"
                                    title="Guardar Cambios"
                                >
                                    <Save size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => startEdit(tenant)}
                                    className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-pink-50 hover:text-pink-500 transition-all border border-gray-100 group-hover:border-pink-100"
                                    title="Ajustar Límites"
                                >
                                    <SettingsIcon size={20} />
                                </button>
                            )}
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div className={`p-4 rounded-2xl border transition-colors ${editingId === tenant.id ? 'bg-pink-50 border-pink-100' : 'bg-gray-50 border-gray-50'}`}>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <StoreIcon size={14} className="text-pink-500" /> Límite Sucursales
                                    </span>
                                    {editingId === tenant.id ? (
                                        <input
                                            type="number"
                                            value={editMaxBranches}
                                            onChange={(e) => setEditMaxBranches(e.target.value)}
                                            className="w-16 p-1 text-center bg-white border border-pink-200 rounded-lg text-sm font-black text-pink-600 focus:ring-2 ring-pink-500/20 outline-none"
                                            min="1"
                                        />
                                    ) : (
                                        <span className={`text-sm font-black ${tenant.branchCount >= tenant.maxBranches ? 'text-rose-600' : 'text-gray-900'}`}>
                                            {tenant.branchCount} / {tenant.maxBranches}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className={`p-4 rounded-2xl border transition-colors ${editingId === tenant.id ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-50'}`}>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={14} className="text-blue-500" /> Límite Usuarios
                                    </span>
                                    {editingId === tenant.id ? (
                                        <input
                                            type="number"
                                            value={editMaxUsers}
                                            onChange={(e) => setEditMaxUsers(e.target.value)}
                                            className="w-16 p-1 text-center bg-white border border-blue-200 rounded-lg text-sm font-black text-blue-600 focus:ring-2 ring-blue-500/20 outline-none"
                                            min="1"
                                        />
                                    ) : (
                                        <span className="text-sm font-black text-gray-900">
                                            {tenant.users?.length || 0} / {tenant.maxUsers || 5}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
                                    <Clock size={12} /> Activo desde: {new Date(tenant.lastActive || Date.now()).toLocaleDateString()}
                                </span>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    <CheckCircle size={10} /> Online
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TenantsPage;
