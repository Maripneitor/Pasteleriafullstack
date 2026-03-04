import React, { useMemo } from 'react';
import { FileText, X, Package, Edit, DollarSign, Clock, User, ChevronRight, Cake, MapPin } from 'lucide-react';
import { ordersApi } from '../../services/ordersApi';
import { handlePdfResponse } from '../../utils/pdfHelper';
import { useNavigate } from 'react-router-dom';

const DayDetailModal = ({ date, events, onClose }) => {
    const navigate = useNavigate();
    const formattedDate = new Date(date).toLocaleDateString('es-MX', { 
        weekday: 'long', 
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const dateStr = date.toISOString().split('T')[0];

    // Stats for the day
    const stats = useMemo(() => {
        return {
            total: events.length,
            paid: events.filter(e => e.extendedProps.isPaid && !e.extendedProps.isCancelled).length,
            pending: events.filter(e => !e.extendedProps.isPaid && !e.extendedProps.isCancelled).length,
            cancelled: events.filter(e => e.extendedProps.isCancelled).length
        };
    }, [events]);

    const handlePrintDaySummary = () => {
        handlePdfResponse(() => ordersApi.downloadDaySummary(dateStr));
    };

    const parseJson = (val) => {
        if (Array.isArray(val)) return val;
        try { return JSON.parse(val); } catch (e) { return []; }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-white/20">
                {/* Header */}
                <div className="p-8 pb-6 bg-gradient-to-br from-indigo-600 via-pink-500 to-rose-600 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h2 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Entregas Programadas</h2>
                            <h3 className="text-3xl font-black capitalize">{formattedDate}</h3>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all active:scale-95"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-6">
                        <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/10">
                            <span className="text-[10px] font-bold block opacity-70">TOTAL</span>
                            <span className="text-xl font-black">{stats.total}</span>
                        </div>
                        <div className="bg-emerald-400/20 px-4 py-2 rounded-2xl backdrop-blur-sm border border-emerald-400/20">
                            <span className="text-[10px] font-bold block opacity-70 italic uppercase">Pagados</span>
                            <span className="text-xl font-black">{stats.paid}</span>
                        </div>
                        <div className="bg-orange-400/20 px-4 py-2 rounded-2xl backdrop-blur-sm border border-orange-400/20">
                            <span className="text-[10px] font-bold block opacity-70 italic uppercase">Deuda</span>
                            <span className="text-xl font-black text-orange-200">{stats.pending}</span>
                        </div>
                        {stats.cancelled > 0 && (
                            <div className="bg-gray-400/20 px-4 py-2 rounded-2xl backdrop-blur-sm border border-gray-400/20">
                                <span className="text-[10px] font-bold block opacity-70 italic uppercase text-gray-300">Cancelados</span>
                                <span className="text-xl font-black text-gray-300">{stats.cancelled}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/50">
                    {events.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-gray-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-300">
                                <Package size={32} className="text-gray-300" />
                            </div>
                            <h4 className="text-gray-500 font-bold">Agenda libre para hoy</h4>
                            <p className="text-gray-400 text-sm">No hay pedidos registrados para esta fecha.</p>
                        </div>
                    ) : (
                        events.map(evt => {
                            const data = evt.extendedProps;
                            const isCancelled = data.isCancelled;
                            const isPaid = data.isPaid;
                            const sabores = parseJson(data.sabores_pan);
                            const rellenos = parseJson(data.rellenos);
                            
                            return (
                                <div key={evt.id} className={`bg-white border rounded-[1.5rem] p-5 hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 group relative overflow-hidden ${isCancelled ? 'border-red-100 bg-red-50/30' : 'border-gray-100'}`}>
                                    {/* Left Accent Bar */}
                                    <div className={`absolute top-0 left-0 bottom-0 w-2 ${
                                        isCancelled ? 'bg-red-500' : (isPaid ? 'bg-emerald-500' : 'bg-orange-500')
                                    }`}></div>

                                    <div className="flex justify-between items-start pl-3">
                                        <div className="space-y-3 flex-1">
                                            {/* Top info */}
                                            <div className="flex items-center gap-2">
                                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-black">
                                                    #{data.folioNumber || evt.id}
                                                </span>
                                                <div className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                                                    isCancelled ? 'bg-red-100 text-red-700' : (isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700')
                                                }`}>
                                                    <DollarSign size={10} />
                                                    {isCancelled ? 'CANCELADO' : (isPaid ? 'PAGADO' : `DEBE $${data.resta}`)}
                                                </div>
                                                <div className="flex items-center gap-1 text-pink-600 font-bold text-xs ml-2">
                                                    <Clock size={14} />
                                                    {data.hora_entrega || '??:??'}
                                                </div>
                                            </div>

                                            {/* Client Name */}
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${isCancelled ? 'bg-gray-200 text-gray-500' : 'bg-pink-100 text-pink-600'}`}>
                                                    {data.cliente_nombre?.charAt(0)}
                                                </div>
                                                <h4 className={`font-extrabold text-gray-900 text-lg uppercase leading-none ${isCancelled ? 'line-through opacity-40' : ''}`}>
                                                    {data.cliente_nombre}
                                                </h4>
                                            </div>

                                            {/* Order Details Mini-Grid */}
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {sabores.length > 0 && (
                                                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2 py-1 rounded-xl text-[11px] font-bold text-gray-600">
                                                        <Cake size={12} className="text-pink-400" />
                                                        {sabores.join(', ')}
                                                    </div>
                                                )}
                                                {rellenos.length > 0 && (
                                                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2 py-1 rounded-xl text-[11px] font-bold text-gray-500 italic">
                                                        {rellenos.join(' + ')}
                                                    </div>
                                                )}
                                                {data.tipo_folio && (
                                                    <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 lowercase">
                                                        {data.tipo_folio}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => navigate(`/pedidos/${data.id || evt.id}/editar`)}
                                                className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm shadow-blue-100"
                                                title="Gestionar Pedido"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            {!isCancelled && (
                                                <button
                                                    onClick={() => handlePdfResponse(() => ordersApi.downloadPdf(data.id || evt.id))}
                                                    className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-800 hover:text-white transition-all border border-gray-100"
                                                    title="Descargar Comanda"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bottom Progress (Money) */}
                                    {!isCancelled && (
                                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between pl-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 ${isPaid ? 'bg-emerald-500' : 'bg-pink-500'}`}
                                                        style={{ width: `${Math.min((data.anticipo / data.total) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[10px] font-black text-gray-400 italic">
                                                    {Math.round((data.anticipo / data.total) * 100)}% Cubierto
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-bold text-gray-400 block uppercase leading-none">Total</span>
                                                <span className="text-lg font-black text-gray-900">${data.total}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 flex gap-4 bg-white">
                    <button
                        onClick={() => navigate('/pedidos/nuevo')}
                        className="flex-1 px-6 py-4 bg-pink-50 text-pink-600 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-pink-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        + Nuevo Pedido
                    </button>
                    {events.length > 0 && (
                        <button
                            onClick={handlePrintDaySummary}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-black hover:shadow-2xl hover:shadow-gray-200 active:scale-95 transition-all group"
                        >
                            <FileText size={20} className="group-hover:rotate-12 transition-transform" /> 
                            Resumen del Día
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DayDetailModal;
