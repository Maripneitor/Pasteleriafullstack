import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Key, Tag, User as UserIcon, Store as StoreIcon, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ActivationCodesPage = () => {
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCodes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/super/activation-codes');
            setCodes(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar códigos de activación");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCodes();
    }, []);

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Key className="text-orange-500" size={32} /> Códigos de Activación Global
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Gestión de licencias y acceso a nuevas sucursales.</p>
                </div>
                <button 
                    onClick={fetchCodes}
                    className="p-3 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-100 transition-colors border border-orange-100"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {codes.length > 0 ? codes.map((code) => (
                    <div key={code.id} className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-10 group-hover:scale-125 transition-transform ${code.isUsed ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                        
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-orange-200 transition-all">
                                <span className="text-2xl font-black font-mono tracking-tighter text-gray-800">
                                    {code.code}
                                </span>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                code.isUsed 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-orange-50 text-orange-600 border-orange-100 animate-pulse'
                            }`}>
                                {code.isUsed ? 'Utilizado' : 'Pendiente'}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <UserIcon size={16} className="text-gray-400" />
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asignado a</p>
                                    <p className="text-xs font-bold text-gray-800">{code.owner?.name || 'Manual'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <StoreIcon size={16} className="text-gray-400" />
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sucursal Destino</p>
                                    <p className="text-xs font-bold text-gray-800">{code.branch?.name || 'Global'}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                                    <Clock size={12} /> Creado: {new Date(code.createdAt).toLocaleDateString()}
                                </div>
                                {code.isUsed && (
                                    <div className="text-emerald-500">
                                        <CheckCircle size={18} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
                        <Key size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-400 font-bold italic">No se encontraron códigos de activación globales.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivationCodesPage;
