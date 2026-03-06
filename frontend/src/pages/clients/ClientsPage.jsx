import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Phone, Mail } from 'lucide-react';
import clientsApi from '../../api/clients';
import CreateClientModal from './CreateClientModal';
import toast from 'react-hot-toast';

export default function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadClients = async () => {
        setLoading(true);
        try {
            const data = await clientsApi.listClients({ q: search });
            setClients(data);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando clientes');
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            loadClients();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Directorio de Clientes</h1>
                    <p className="text-gray-500 text-sm">Administra tu base de datos de clientes y contactos.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-lg shadow-pink-500/30 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={20} />
                    Nuevo Cliente
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <Search className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o teléfono..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                </div>
            ) : clients.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                    <User className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No se encontraron clientes</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-pink-600 font-bold hover:underline mt-2">
                        Crear el primero
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clients.map((client) => (
                        <div key={client.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600 rounded-full flex items-center justify-center font-bold text-lg">
                                        {client.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 line-clamp-1">{client.name}</h3>
                                        <p className="text-xs text-gray-400">Cliente #{client.id}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <a
                                        href={`https://wa.me/${client.phone.replace(/\s+/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                                        title="Enviar WhatsApp"
                                    >
                                        <svg size={16} viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.435 5.631 1.436h.008c6.548 0 11.88-5.335 11.883-11.892a11.831 11.831 0 00-3.483-8.411z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-gray-400" />
                                    <span className="font-medium">{client.phone}</span>
                                </div>
                                {client.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-gray-400" />
                                        <span className="truncate">{client.email}</span>
                                    </div>
                                )}
                                {client.birthday && (
                                    <div className={`flex items-center gap-2 p-2 rounded-lg ${
                                        new Date(client.birthday).getMonth() === new Date(new Date().setDate(new Date().getDate() + 1)).getMonth() &&
                                        new Date(client.birthday).getDate() === new Date(new Date().setDate(new Date().getDate() + 1)).getDate()
                                        ? 'bg-pink-50 text-pink-700 border border-pink-100 animate-pulse'
                                        : 'text-gray-500'
                                    }`}>
                                        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                            🎂 {new Date(client.birthday).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}
                                        </span>
                                        {new Date(client.birthday).getMonth() === new Date(new Date().setDate(new Date().getDate() + 1)).getMonth() &&
                                         new Date(client.birthday).getDate() === new Date(new Date().setDate(new Date().getDate() + 1)).getDate() && (
                                            <span className="text-[10px] font-black uppercase ml-auto">¡Mañana! 🎁</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onClientCreated={() => loadClients()}
            />
        </div>
    );
}
