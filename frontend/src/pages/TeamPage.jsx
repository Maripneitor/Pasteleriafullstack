import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Shield, ShieldOff, CheckCircle, XCircle } from 'lucide-react';
import usersApi from '../services/usersApi';
import branchesApi from '../services/branchesApi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const TeamPage = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        branchId: '',
        shift: 'Matutino'
    });
    const [branches, setBranches] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const fetchUsers = async () => {
        try {
            const data = await usersApi.getAll();
            setUsers(data);
        } catch {
            toast.error('Error cargando usuarios');
        }
    };

    const fetchBranches = async () => {
        try {
            const data = await branchesApi.getAll();
            setBranches(data);
        } catch (error) {
            console.error("Error fetching branches:", error);
        }
    };

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (mounted) {
                await fetchUsers();
                await fetchBranches();
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    const handleSuspend = async (user) => {
        const isCurrentlyActive = user.status === 'ACTIVE';
        const action = isCurrentlyActive ? 'suspender' : 'activar';
        if (!window.confirm(`¿Seguro que deseas ${action} este usuario?`)) return;
        try {
            await usersApi.toggleStatus(user.id, !isCurrentlyActive);
            toast.success(`Usuario ${isCurrentlyActive ? 'suspendido' : 'activado'}`);
            fetchUsers();
        } catch (error) {
            toast.error('Error al cambiar estado');
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            const isCurrentlyActive = user.status === 'ACTIVE';
            await usersApi.toggleStatus(user.id, !isCurrentlyActive);
            toast.success(isCurrentlyActive ? 'Usuario desactivado' : 'Usuario activado');
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error('Error cambiando estado');
        }
    };

    const handleEdit = (user) => {
        // Restriction: System Owners/Owners cannot edit Super Admins
        if (user.role === 'SUPER_ADMIN') {
            toast.error('No se pueden editar usuarios con el rol SUPER_ADMIN');
            return;
        }

        // Restriction: Owner cannot modify their own access
        if (user.id === currentUser?.id) {
            toast.error('Como Dueño, no puedes modificar tu propio perfil desde aquí.');
            return;
        }

        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role || 'EMPLOYEE',
            branchId: user.branchId || '',
            shift: user.shift || 'Matutino'
        });
        setEditId(user.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleOpenCreate = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'EMPLOYEE',
            branchId: '',
            shift: 'Matutino'
        });
        setIsEditing(false);
        setEditId(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Only send password if provided
                const dataToSend = { ...formData };
                if (!dataToSend.password) delete dataToSend.password;

                await usersApi.update(editId, dataToSend);
                toast.success('Usuario actualizado');
            } else {
                await usersApi.create(formData);
                toast.success('Usuario creado');
            }
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error en la operación');
        }
    };

    const RoleBadge = ({ role }) => {
        const styles = {
            SUPER_ADMIN: 'bg-red-100 text-red-700 border-red-200',
            ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
            OWNER: 'bg-pink-100 text-pink-700 border-pink-200',
            EMPLOYEE: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            USER: 'bg-gray-100 text-gray-600 border-gray-200'
        };
        const r = role || 'USER';
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${styles[r] || styles.USER}`}>
                {r.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Equipo de Trabajo</h1>
                    <p className="text-gray-500">Gestiona accesos y roles del sistema.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="bg-gray-900 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition active:scale-95 flex items-center gap-2"
                >
                    <Plus size={20} /> Nuevo Usuario
                </button>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <tr>
                            <th className="p-5">Colaborador</th>
                            <th className="p-5 text-center">Turno</th>
                            <th className="p-5 text-center">Sucursal</th>
                            <th className="p-5 text-center">Rol</th>
                            <th className="p-5 text-center">Activo</th>
                            <th className="p-5 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white/40">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-white/60 transition group">
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transform transition group-hover:rotate-12
                                            ${user.status === 'ACTIVE' ? 'bg-gradient-to-br from-pink-400 to-rose-500' : 'bg-gray-300'}`}>
                                            {(user.name || "U")[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800 text-lg leading-tight">{user.name}</div>
                                            <div className="text-xs text-gray-400">{user.email}</div>
                                            <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold">
                                                {user.lastConnection ? `Visto ${formatDistanceToNow(new Date(user.lastConnection), { addSuffix: true, locale: es })}` : 'Sin conexión registrada'}
                                            </div>
                                            {user.owner && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Shield size={10} className="text-pink-400" />
                                                    <span className="text-[10px] text-gray-400 uppercase font-bold">Líder: {user.owner.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5 text-center">
                                    <span className="px-3 py-1 bg-sky-50 text-sky-700 rounded-lg text-xs font-bold border border-sky-100">
                                        {user.shift || 'Sin asignar'}
                                    </span>
                                </td>
                                <td className="p-5 text-center">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold border border-gray-200">
                                        {user.assignedBranch?.name || user.organization?.businessName || 'Central'}
                                    </span>
                                </td>
                                <td className="p-5 text-center">
                                    <RoleBadge role={user.role} />
                                </td>
                                <td className="p-5 text-center">
                                    <div className="flex justify-center">
                                        {user.status === 'ACTIVE' ? (
                                            <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-black bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 uppercase tracking-tighter">
                                                <CheckCircle size={12} /> Sí
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-gray-400 text-[10px] font-black bg-gray-100 px-2 py-1 rounded-full border border-gray-200 uppercase tracking-tighter">
                                                <XCircle size={12} /> {user.status === 'BLOCKED' ? 'Suspendido' : 'Pendiente'}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-5 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition">
                                        <button
                                            onClick={() => handleSuspend(user)}
                                            className={`p-2 rounded-xl transition ${user.status === 'ACTIVE' ? 'text-gray-400 hover:text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                                            title={user.status === 'ACTIVE' ? "Suspender Usuario" : "Activar Usuario"}
                                            disabled={user.role === 'SUPER_ADMIN' || user.id === currentUser?.id}
                                        >
                                            {user.status === 'ACTIVE' ? <ShieldOff size={20} /> : <Shield size={20} />}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition disabled:opacity-30"
                                            disabled={user.role === 'SUPER_ADMIN' || user.id === currentUser?.id}
                                        >
                                            <Edit2 size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">
                            {isEditing ? 'Editar Usuario' : 'Nuevo Colaborador'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                required
                                placeholder="Nombre Completo"
                                className="input-modern w-full p-3 border rounded-xl"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                required
                                type="email"
                                placeholder="Correo Electrónico"
                                className="input-modern w-full p-3 border rounded-xl"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                disabled={isEditing} // Email is usually unique identifier
                            />
                            <input
                                type="password"
                                required={!isEditing}
                                placeholder={isEditing ? "Contraseña (dejar en blanco para no cambiar)" : "Contraseña Temporal"}
                                className="input-modern w-full p-3 border rounded-xl"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                            <select
                                className="input-modern w-full p-3 border rounded-xl"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="EMPLOYEE">Empleado</option>
                                <option value="OWNER">Dueño (Acceso Total)</option>
                                <option value="ADMIN">Admin General</option>
                            </select>

                            <select
                                className="input-modern w-full p-3 border rounded-xl"
                                value={formData.shift}
                                onChange={e => setFormData({ ...formData, shift: e.target.value })}
                            >
                                <option value="Matutino">☀ Turno Matutino</option>
                                <option value="Vespertino">🌙 Turno Vespertino</option>
                            </select>

                            {formData.role === 'EMPLOYEE' && (
                                <select
                                    className="input-modern w-full p-3 border rounded-xl"
                                    value={formData.branchId}
                                    onChange={e => setFormData({ ...formData, branchId: e.target.value })}
                                >
                                    <option value="">Asignar a Sucursal...</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            )}
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 shadow-lg transition">Guardar</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default TeamPage;
