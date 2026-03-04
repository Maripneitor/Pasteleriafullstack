import React, { useState } from 'react';
import { useOrder } from '../../../context/OrderContext';
import ClientAutocomplete from '../wizard/ClientAutocomplete';
import AiMagicPaste from '../wizard/AiMagicPaste';
import { User, Phone } from 'lucide-react';

const StepA_Client = ({ next, prev }) => {
    const { orderData, updateOrder } = useOrder();
    
    // Default to Anonymous/Manual if no specific client is selected
    const [isAnonymous, setIsAnonymous] = useState(!orderData.selectedClient);

    const handleSwitchToManual = () => {
        setIsAnonymous(true);
        updateOrder({ selectedClient: null });
    };

    const handleSwitchToSearch = () => {
        setIsAnonymous(false);
        updateOrder({ clientName: '', clientPhone: '' });
    };

    const isValid = orderData.clientName && orderData.clientPhone;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <header className="flex flex-col gap-1">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <span className="bg-pink-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-lg shadow-pink-200 rotate-3">A</span>
                    Información del Cliente
                </h2>
                <p className="text-gray-500 text-sm ml-13">Ingresa los datos para identificar este pedido.</p>
            </header>

            {/* AI Shortcut - Still visible as it's very helpful */}
            <AiMagicPaste onComplete={() => {
                // Keep manual mode if AI fills it
                setIsAnonymous(true); 
            }} />

            {/* Mode Selector Tabs (Modern Look) */}
            <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
                <button
                    onClick={handleSwitchToManual}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                        isAnonymous 
                        ? 'bg-white text-pink-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <User size={18} />
                    Cliente Ocasional
                </button>
                <button
                    onClick={handleSwitchToSearch}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                        !isAnonymous 
                        ? 'bg-white text-pink-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <User size={18} className="fill-current" />
                    Buscar en Registro
                </button>
            </div>

            <main className="bg-white border-2 border-gray-50 rounded-3xl p-6 shadow-sm">
                {isAnonymous ? (
                    // Manual Fields (Now Primary)
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Datos manuales</p>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={orderData.registerClient || false}
                                    onChange={(e) => updateOrder({ registerClient: e.target.checked })}
                                    className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                                />
                                <span className="text-xs font-bold text-gray-500 group-hover:text-pink-600 transition-colors">Registrar en mi base de datos</span>
                            </label>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 ml-1">Nombre Completo *</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-pink-500 text-gray-400">
                                        <User size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        value={orderData.clientName || ''}
                                        onChange={(e) => updateOrder({ clientName: e.target.value })}
                                        placeholder="Ej. Javier Ruiz"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-50/50 transition-all outline-none text-gray-800 font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 ml-1">Teléfono Móvil *</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-pink-500 text-gray-400">
                                        <Phone size={20} />
                                    </div>
                                    <input
                                        type="tel"
                                        value={orderData.clientPhone || ''}
                                        onChange={(e) => updateOrder({ clientPhone: e.target.value })}
                                        placeholder="Ej. 55 1234 5678"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-50/50 transition-all outline-none text-gray-800 font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Registered Client Selection
                    <div className="space-y-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Buscador de clientes</p>
                        <ClientAutocomplete
                            selectedClient={orderData.selectedClient}
                            onSelect={(client) => {
                                if (client) {
                                    updateOrder({
                                        selectedClient: client,
                                        clientName: client.name,
                                        clientPhone: client.phone
                                    });
                                } else {
                                    updateOrder({ selectedClient: null, clientName: '', clientPhone: '' });
                                }
                            }}
                        />
                        {orderData.selectedClient && (
                            <div className="mt-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl flex items-center gap-4 animate-in zoom-in-95">
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-green-600 font-black text-xl border border-green-100">
                                    {orderData.clientName.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-gray-900 text-lg leading-tight">{orderData.clientName}</h4>
                                    <p className="text-gray-600 font-medium">{orderData.clientPhone}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-200 text-green-800">
                                            Cliente Verificado
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <footer className="flex justify-end pt-6 border-t border-gray-100">
                <button
                    onClick={next}
                    disabled={!isValid}
                    className="group bg-gradient-to-r from-pink-600 to-rose-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-pink-200 hover:-translate-y-1 active:translate-y-0 disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none transition-all duration-200 flex items-center gap-3"
                >
                    Continuar a Detalles
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
            </footer>
        </div>
    );
};

export default StepA_Client;
