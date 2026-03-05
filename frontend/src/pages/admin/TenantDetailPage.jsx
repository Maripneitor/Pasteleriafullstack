import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Building, Users, Store as StoreIcon, CheckCircle, Save, Calendar, Activity, X, History, Power, PaintBucket, PowerOff, ShieldAlert, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

const TenantDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editMaxBranches, setEditMaxBranches] = useState(2);
    const [editMaxUsers, setEditMaxUsers] = useState(5);
    
    // Audit log state
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const fetchTenantData = async () => {
        try {
            const res = await api.get(`/super/tenants/${id}`);
            setTenant(res.data);
            setEditMaxBranches(res.data.maxBranches || 2);
            setEditMaxUsers(res.data.maxUsers || 5);
        } catch (error) {
            console.error("Error fetching tenant detail", error);
            toast.error("Error al cargar detalles del dueño");
            navigate('/admin/tenants');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenantData();
    }, [id, navigate]);

    const handleSaveLimit = async () => {
        try {
            await api.put(`/super/tenants/${id}/limits`, { 
                maxBranches: parseInt(editMaxBranches),
                maxUsers: parseInt(editMaxUsers)
            });
            toast.success("Límites actualizados");
            setIsEditing(false);
            fetchTenantData();
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar límite");
        }
    };

    const fetchUserLogs = async (user) => {
        setSelectedUser(user);
        setShowAuditModal(true);
        setLoadingLogs(true);
        try {
            const res = await api.get(`/super/audit?userId=${user.id}`);
            setAuditLogs(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar auditoría");
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleToggleTenantStatus = async () => {
        const isCurrentlyActive = tenant.saasContract ? tenant.saasContract.isActive : true;
        const confirmMsg = isCurrentlyActive 
            ? "¿Seguro que deseas SUSPENDER a este dueño? Todos sus usuarios perderán acceso al sistema." 
            : "¿Deseas REACTIVAR la cuenta de este dueño?";
            
        if (!window.confirm(confirmMsg)) return;

        try {
            await api.put(`/super/saas/tenants/${id}/contract`, { isActive: !isCurrentlyActive });
            toast.success(isCurrentlyActive ? "Dueño suspendido" : "Dueño reactivado");
            fetchTenantData();
        } catch (error) {
            console.error(error);
            toast.error("Error al cambiar estado de cuenta");
        }
    };

    const handleResetBranding = async () => {
        if (!window.confirm("🚨 ¿Deseas resetear el branding de este negocio por contenido inapropiado? (Se aplicarán valores por defecto)")) return;

        try {
            await api.put(`/tenant/config`, { 
                tenantId: id, 
                logoUrl: null, 
                primaryColor: null, 
                footerText: null, 
                businessName: null 
            });
            toast.success("Branding reseteado exitosamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al resetear branding");
        }
    };

    const handleToggleUserStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
        if (!window.confirm(`¿Seguro que deseas cambiar el estado de este usuario a ${newStatus}?`)) return;

        try {
            await api.put(`/users/${userId}`, { status: newStatus });
            toast.success("Estado de usuario actualizado");
            fetchTenantData();
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar usuario");
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500 font-medium animate-pulse">Cargando detalles de dueño...</div>;
    if (!tenant) return null;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <button
                onClick={() => navigate('/admin/tenants')}
                className="group flex items-center text-gray-400 hover:text-pink-600 transition-all font-bold text-sm uppercase tracking-widest"
            >
                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 group-hover:border-pink-200 mr-3 transition-colors">
                    <ArrowLeft size={18} />
                </div>
                Volver a Gestión
            </button>

            {/* Header */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-pink-100/20 border border-gray-100 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 text-pink-50 opacity-10 pointer-events-none">
                    <Building size={200} />
                </div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-[2rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-pink-200">
                        {tenant.businessName?.charAt(0) || '?'}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-4xl font-black text-gray-900 leading-none">
                                {tenant.businessName || 'Dueño sin nombre'}
                            </h1>
                            {(!tenant.saasContract || tenant.saasContract.isActive) ? (
                                <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-1.5 border border-emerald-100">
                                    <CheckCircle size={12} /> Cliente Activo
                                </span>
                            ) : (
                                <span className="px-4 py-1.5 rounded-full bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-1.5 border border-red-100">
                                    <PowerOff size={12} /> Cliente Suspendido
                                </span>
                            )}
                        </div>
                        <p className="text-gray-400 mt-2 font-medium flex items-center gap-3">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono text-gray-500 uppercase">ID: #{tenant.id}</span>
                            <span className="flex items-center gap-1"><Calendar size={14} className="text-pink-400" /> Miembro desde: {new Date(tenant.createdAt).toLocaleDateString()}</span>
                        </p>
                    </div>
                </div>
                
                {!isEditing && (
                    <div className="flex gap-3 relative z-10 flex-wrap justify-end mt-4 md:mt-0">
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-95"
                        >
                            Limitar
                        </button>
                        <button 
                            onClick={() => navigate(`/admin/branding?tenantId=${id}`)}
                            className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-colors border border-indigo-100 flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
                            title="Gestionar Branding Manualmente"
                        >
                            <Palette size={20} /> Editar Diseño
                        </button>
                        <button 
                            onClick={handleResetBranding}
                            className="p-3 bg-pink-50 text-pink-600 rounded-2xl hover:bg-pink-100 transition-colors border border-pink-100"
                            title="Resetear Branding al Default"
                        >
                            <PaintBucket size={20} />
                        </button>
                        <button 
                            onClick={handleToggleTenantStatus}
                            className={`p-3 rounded-2xl transition-colors border active:scale-95 text-white shadow-xl ${(!tenant.saasContract || tenant.saasContract.isActive) ? 'bg-red-500 hover:bg-red-600 border-red-200 shadow-red-200' : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-200 shadow-emerald-200'}`}
                            title={(!tenant.saasContract || tenant.saasContract.isActive) ? "Suspender Negocio" : "Reactivar Negocio"}
                        >
                            <Power size={20} />
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Limits & General Info Config */}
                <div className="space-y-8 md:col-span-1">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                <Building size={20} />
                            </div>
                            Control de Escalamiento
                        </h2>
                        
                        <div className="space-y-6">
                            <div className={`p-6 rounded-3xl border transition-all ${isEditing ? 'bg-pink-50 border-pink-200 shadow-inner' : 'bg-gray-50 border-gray-50'}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <StoreIcon size={14} className="text-pink-500" /> Sucursales
                                    </span>
                                </div>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={editMaxBranches}
                                        onChange={(e) => setEditMaxBranches(e.target.value)}
                                        className="w-full p-4 bg-white border border-pink-200 rounded-2xl text-2xl font-black text-pink-600 focus:ring-4 ring-pink-500/20 outline-none transition-all"
                                        min="1"
                                    />
                                ) : (
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-black text-gray-900 leading-none">{tenant.maxBranches}</span>
                                        <span className="text-xs font-bold text-gray-400 uppercase mb-1">Permitidas</span>
                                    </div>
                                )}
                            </div>

                            <div className={`p-6 rounded-3xl border transition-all ${isEditing ? 'bg-blue-50 border-blue-200 shadow-inner' : 'bg-gray-50 border-gray-50'}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={14} className="text-blue-500" /> Usuarios Admin
                                    </span>
                                </div>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={editMaxUsers}
                                        onChange={(e) => setEditMaxUsers(e.target.value)}
                                        className="w-full p-4 bg-white border border-blue-200 rounded-2xl text-2xl font-black text-blue-600 focus:ring-4 ring-blue-500/20 outline-none transition-all"
                                        min="1"
                                    />
                                ) : (
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-black text-gray-900 leading-none">{tenant.maxUsers || 5}</span>
                                        <span className="text-xs font-bold text-gray-400 uppercase mb-1">Permitidos</span>
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <button 
                                        onClick={() => setIsEditing(false)}
                                        className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={handleSaveLimit}
                                        className="py-4 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} /> Guardar
                                    </button>
                                </div>
                            )}

                            <div className="p-6 bg-gradient-to-br from-orange-400 to-rose-500 rounded-3xl text-white shadow-lg shadow-orange-100">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Uso Actual</p>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-2xl font-black">{tenant.branches?.length || 0}</p>
                                        <p className="text-[8px] font-bold uppercase tracking-tighter opacity-70">Sucursales</p>
                                    </div>
                                    <div className="w-px h-8 bg-white/20" />
                                    <div>
                                        <p className="text-2xl font-black">{tenant.users?.length || 0}</p>
                                        <p className="text-[8px] font-bold uppercase tracking-tighter opacity-70">Usuarios</p>
                                    </div>
                                    <Activity size={32} className="opacity-20 translate-x-2" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Branches List */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <StoreIcon size={20} className="text-orange-500" />
                            Sucursales ({tenant.branches?.length || 0})
                        </h2>
                        
                        {tenant.branches?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {tenant.branches.map(branch => (
                                    <div key={branch.id} className="border border-gray-200 rounded-xl p-4 hover:border-pink-300 transition-colors bg-gradient-to-br from-white to-orange-50/30">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-900 truncate">{branch.name}</h3>
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono">ID: {branch.id}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-2">
                                            <Calendar size={14} /> Creada: {new Date(branch.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <StoreIcon size={32} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-gray-500">Este dueño aún no tiene sucursales registradas.</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Users size={20} className="text-blue-500" />
                            Usuarios Administrativos ({tenant.users?.length || 0})
                        </h2>
                        
                        {tenant.users?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left align-middle border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-500">
                                            <th className="py-2 font-semibold">Nombre</th>
                                            <th className="py-2 font-semibold">Email</th>
                                            <th className="py-2 font-semibold">Estado</th>
                                            <th className="py-2 font-semibold">Rol</th>
                                            <th className="py-2 font-semibold text-right">Control & Audit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tenant.users.map(user => (
                                            <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="py-3 font-medium text-gray-900">{user.name}</td>
                                                <td className="py-3 text-gray-600">{user.email}</td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                        user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                        user.status === 'BLOCKED' ? 'bg-red-50 text-red-600 border-red-100' : 
                                                        'bg-gray-100 text-gray-500 border-gray-200'
                                                    }`}>
                                                        {user.status || 'ACTIVE'}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black leading-none ${
                                                        user.role === 'OWNER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleToggleUserStatus(user.id, user.status)}
                                                        className={`p-1.5 rounded-md transition ${user.status === 'BLOCKED' ? 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                                                        title={user.status === 'BLOCKED' ? 'Desbloquear Usuario' : 'Bloquear Usuario'}
                                                    >
                                                        <ShieldAlert size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => fetchUserLogs(user)}
                                                        className="p-1.5 bg-gray-50 hover:bg-gray-200 rounded-md transition text-gray-500"
                                                        title="Ver historial de acciones"
                                                    >
                                                        <History size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-500">No hay usuarios asignados a este dueño.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Audit Log Modal */}
            {showAuditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Log de Auditoría</h3>
                                <p className="text-sm text-gray-500">{selectedUser?.name} ({selectedUser?.email})</p>
                            </div>
                            <button onClick={() => setShowAuditModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {loadingLogs ? (
                                <div className="text-center py-10 text-gray-400">Cargando acciones...</div>
                            ) : auditLogs.length > 0 ? (
                                auditLogs.map((log, idx) => (
                                    <div key={idx} className="flex gap-4 border-l-2 border-pink-200 pl-4 py-1">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <span className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                                                    {log.action}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-mono">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                <span className="font-semibold">{log.entity}:</span> {log.entityId || 'N/A'}
                                            </p>
                                            {log.meta && Object.keys(log.meta).length > 0 && (
                                                <pre className="text-[10px] bg-gray-50 p-2 rounded mt-2 text-gray-500 overflow-x-auto">
                                                    {JSON.stringify(log.meta, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-400">No hay acciones registradas para este usuario.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantDetailPage;
