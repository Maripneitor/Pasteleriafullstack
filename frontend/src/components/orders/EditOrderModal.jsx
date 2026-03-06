import React, { useState, useEffect } from 'react';
import { 
    X, Save, Calendar, Clock, MapPin, FileText, User, 
    Cake, Truck, DollarSign, Sparkles, Loader2, ChevronRight, 
    Layers, Square, Circle, Heart, RectangleVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../../api/axiosClient';
import catalogApi from '../../api/catalogApi';
import aiService from '../../api/aiService';
import toast from 'react-hot-toast';

const EditOrderModal = ({ order, isOpen, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('cliente');
    const [loading, setLoading] = useState(false);
    const [aiThinking, setAiThinking] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [showAiMagic, setShowAiMagic] = useState(false);

    // Catalogs
    const [flavors, setFlavors] = useState([]);
    const [fillings, setFillings] = useState([]);

    const [formData, setFormData] = useState({
        cliente_nombre: '',
        cliente_telefono: '',
        fecha_entrega: '',
        hora_entrega: '',
        ubicacion_entrega: '',
        calle: '',
        num_ext: '',
        colonia: '',
        referencias: '',
        descripcion_diseno: '',
        dedicatoria: '',
        forma: '',
        numero_personas: '',
        altura_extra: 'No',
        tipo_folio: 'Normal',
        num_pisos: 1,
        tematica: '',
        paleta_colores: '',
        tipo_cobertura: '',
        decoracion_especial: '',
        alergias: '',
        sabores_pan: [],
        rellenos: [],
        total: '',
        anticipo: '',
        estatus_pago: 'Pendiente',
        estatus_produccion: 'Pendiente'
    });

    useEffect(() => {
        if (order) {
            setFormData({
                cliente_nombre: order.cliente_nombre || '',
                cliente_telefono: order.cliente_telefono || '',
                fecha_entrega: order.fecha_entrega || '',
                hora_entrega: order.hora_entrega || '',
                ubicacion_entrega: order.ubicacion_entrega || 'En Sucursal',
                calle: order.calle || '',
                num_ext: order.num_ext || '',
                colonia: order.colonia || '',
                referencias: order.referencias || '',
                descripcion_diseno: order.descripcion_diseno || '',
                dedicatoria: order.dedicatoria || '',
                forma: order.forma || 'Redondo',
                numero_personas: order.numero_personas || 1,
                altura_extra: order.altura_extra || 'No',
                tipo_folio: order.tipo_folio || 'Normal',
                num_pisos: order.num_pisos || 1,
                tematica: order.tematica || '',
                paleta_colores: order.paleta_colores || '',
                tipo_cobertura: order.tipo_cobertura || '',
                decoracion_especial: order.decoracion_especial || '',
                alergias: order.alergias || '',
                sabores_pan: Array.isArray(order.sabores_pan) ? order.sabores_pan : 
                            (typeof order.sabores_pan === 'string' && order.sabores_pan ? JSON.parse(order.sabores_pan) : []),
                rellenos: Array.isArray(order.rellenos) ? order.rellenos : 
                          (typeof order.rellenos === 'string' && order.rellenos ? JSON.parse(order.rellenos) : []),
                total: order.total || '',
                anticipo: order.anticipo || '',
                estatus_pago: order.estatus_pago || 'Pendiente',
                estatus_produccion: order.estatus_produccion || 'Pendiente'
            });
        }
        
        // Load catalogs
        const loadCatalogs = async () => {
            try {
                const [f, s] = await Promise.all([
                    catalogApi.getFlavors(),
                    catalogApi.getFillings()
                ]);
                setFlavors(f);
                setFillings(s);
            } catch (e) {
                console.error("Error loading catalogs", e);
            }
        };
        loadCatalogs();
    }, [order]);

    if (!isOpen || !order) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleArrayToggle = (field, value) => {
        setFormData(prev => {
            const current = prev[field] || [];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    const handleAiEdit = async (e) => {
        e.preventDefault();
        if (!aiInput.trim()) return;

        setAiThinking(true);
        try {
            const res = await aiService.editOrderWithAI(order.id, aiInput);
            if (res.success) {
                // Actualizar formData con los cambios aplicados
                const updated = res.order;
                setFormData(prev => ({
                    ...prev,
                    ...updated,
                    sabores_pan: Array.isArray(updated.sabores_pan) ? updated.sabores_pan : JSON.parse(updated.sabores_pan || '[]'),
                    rellenos: Array.isArray(updated.rellenos) ? updated.rellenos : JSON.parse(updated.rellenos || '[]'),
                }));
                toast.success(res.aiConfirmation || 'Cambios aplicados');
                setAiInput('');
                setShowAiMagic(false);
            }
        } catch (err) {
            toast.error('La IA no pudo procesar el cambio');
        } finally {
            setAiThinking(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await client.put(`/folios/${order.id}`, formData);
            toast.success('Pedido actualizado con éxito');
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar cambios');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'cliente', label: 'Cliente', icon: User, color: 'text-blue-500' },
        { id: 'producto', label: 'Producto', icon: Cake, color: 'text-pink-500' },
        { id: 'logistica', label: 'Entrega', icon: Truck, color: 'text-orange-500' },
        { id: 'pago', label: 'Pago', icon: DollarSign, color: 'text-emerald-500' }
    ];

    const getCountdown = () => {
        if (!formData.fecha_entrega) return null;
        const target = new Date(`${formData.fecha_entrega}T${formData.hora_entrega || '00:00'}`);
        const now = new Date();
        const diff = target - now;
        
        if (diff < 0) return { text: 'Entrega en el pasado', color: 'text-gray-400' };
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return { text: `Faltan ${days} día(s) y ${hours} hrs`, color: 'text-pink-400' };
        if (hours > 0) return { text: `Faltan ${hours} horas para la entrega`, color: 'text-orange-400' };
        return { text: '¡Entrega inminente!', color: 'text-red-500' };
    };

    const countdown = getCountdown();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20"
            >
                {/* Header Section */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 text-pink-400 text-xs font-black uppercase tracking-[0.2em] mb-2">
                                <Sparkles size={14} /> Gestión de Pedido
                            </div>
                            <h2 className="text-4xl font-black">{formData.cliente_nombre || 'Sin Nombre'}</h2>
                            <div className="flex items-center gap-4 mt-1">
                                <p className="text-gray-400 font-bold">Folio: #{order.folioNumber || order.id}</p>
                                {countdown && (
                                    <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${countdown.color}`}>
                                        <Clock size={12} /> {countdown.text}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShowAiMagic(!showAiMagic)}
                                className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-black text-sm transition-all ${
                                    showAiMagic ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                            >
                                <Sparkles size={18} /> Asistente IA
                            </button>
                            <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* AI Magic Bar */}
                    <AnimatePresence>
                        {showAiMagic && (
                            <motion.form 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                onSubmit={handleAiEdit}
                                className="mt-6 overflow-hidden"
                            >
                                <div className="p-1 bg-white/10 rounded-[1.5rem] backdrop-blur-md border border-white/10 flex gap-2">
                                    <input 
                                        type="text"
                                        placeholder="Ej: 'Cambia el sabor a chocolate y aumenta el precio en 200 pesos'..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-white/40 font-medium px-4"
                                        value={aiInput}
                                        onChange={(e) => setAiInput(e.target.value)}
                                        disabled={aiThinking}
                                    />
                                    <button 
                                        type="submit"
                                        disabled={aiThinking || !aiInput.trim()}
                                        className="bg-white text-gray-900 px-6 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-gray-100 disabled:opacity-50 transition-all"
                                    >
                                        {aiThinking ? <Loader2 className="animate-spin" size={16} /> : 'Aplicar Magia'}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                {/* Main Body */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Tabs Sidebar */}
                    <div className="w-24 bg-gray-50 border-r border-gray-100 flex flex-col items-center py-8 gap-6">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`group relative p-4 rounded-2xl transition-all ${
                                    activeTab === tab.id ? 'bg-white shadow-xl text-gray-900 scale-110' : 'text-gray-400 hover:text-gray-600'
                                }`}
                                title={tab.label}
                            >
                                <tab.icon size={24} className={activeTab === tab.id ? tab.color : ''} />
                                {activeTab === tab.id && (
                                    <motion.div 
                                        layoutId="activeTabIndicator"
                                        className="absolute right-[-2.5rem] w-1 h-8 bg-gray-900 rounded-full"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-12 bg-white">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ x: 10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -10, opacity: 0 }}
                                className="space-y-8"
                            >
                                {activeTab === 'cliente' && (
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                                            <input 
                                                name="cliente_nombre"
                                                value={formData.cliente_nombre}
                                                onChange={handleChange}
                                                className="w-full text-xl font-bold p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Teléfono</label>
                                            <input 
                                                name="cliente_telefono"
                                                value={formData.cliente_telefono}
                                                onChange={handleChange}
                                                className="w-full text-xl font-bold p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'producto' && (
                                    <div className="space-y-10">
                                        <div className="grid md:grid-cols-2 gap-8 items-end">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Tipo de Pedido</label>
                                                <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
                                                    {['Normal', 'Base/Especial'].map(type => (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, tipo_folio: type }))}
                                                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                                                formData.tipo_folio === type 
                                                                ? 'bg-white text-gray-900 shadow-md' 
                                                                : 'text-gray-400 hover:text-gray-600'
                                                            }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Forma</label>
                                                <select 
                                                    name="forma"
                                                    value={formData.forma}
                                                    onChange={handleChange}
                                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"
                                                >
                                                    <option value="Redondo">Redondo</option>
                                                    <option value="Cuadrado">Cuadrado</option>
                                                    <option value="Rectangular">Rectangular</option>
                                                    <option value="Corazon">Corazón</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Cake size={14} /> Sabores de Pan
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {flavors.map(f => (
                                                        <button 
                                                            key={f.id}
                                                            type="button"
                                                            onClick={() => handleArrayToggle('sabores_pan', f.name)}
                                                            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                                                                formData.sabores_pan.includes(f.name) 
                                                                ? 'bg-pink-500 border-pink-500 text-white shadow-lg' 
                                                                : 'bg-white border-gray-100 text-gray-500 hover:border-pink-200'
                                                            }`}
                                                        >
                                                            {f.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Layers size={14} /> Rellenos
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {fillings.map(s => (
                                                        <button 
                                                            key={s.id}
                                                            type="button"
                                                            onClick={() => handleArrayToggle('rellenos', s.name)}
                                                            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                                                                formData.rellenos.includes(s.name) 
                                                                ? 'bg-purple-500 border-purple-500 text-white shadow-lg' 
                                                                : 'bg-white border-gray-100 text-gray-500 hover:border-purple-200'
                                                            }`}
                                                        >
                                                            {s.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {formData.tipo_folio === 'Base/Especial' && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-pink-50/50 rounded-[2rem] border border-pink-100/50"
                                            >
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Niveles/Pisos</label>
                                                    <input 
                                                        type="number"
                                                        name="num_pisos"
                                                        value={formData.num_pisos}
                                                        onChange={handleChange}
                                                        className="w-full p-3 bg-white border-none rounded-xl font-bold text-pink-600"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Temática</label>
                                                    <input 
                                                        type="text"
                                                        name="tematica"
                                                        value={formData.tematica}
                                                        onChange={handleChange}
                                                        placeholder="Ej: Spiderman"
                                                        className="w-full p-3 bg-white border-none rounded-xl font-bold text-pink-600"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Cobertura</label>
                                                    <input 
                                                        type="text"
                                                        name="tipo_cobertura"
                                                        value={formData.tipo_cobertura}
                                                        onChange={handleChange}
                                                        placeholder="Ej: Fondant"
                                                        className="w-full p-3 bg-white border-none rounded-xl font-bold text-pink-600"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Colores</label>
                                                    <input 
                                                        type="text"
                                                        name="paleta_colores"
                                                        value={formData.paleta_colores}
                                                        onChange={handleChange}
                                                        placeholder="Rojo y Azul"
                                                        className="w-full p-3 bg-white border-none rounded-xl font-bold text-pink-600"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                        
                                        <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Personas</label>
                                                <input 
                                                    type="number"
                                                    name="numero_personas"
                                                    value={formData.numero_personas}
                                                    onChange={handleChange}
                                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-lg"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">¿Altura Extra?</label>
                                                <select 
                                                    name="altura_extra"
                                                    value={formData.altura_extra}
                                                    onChange={handleChange}
                                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"
                                                >
                                                    <option value="No">No</option>
                                                    <option value="Si">Sí</option>
                                                    <option value="Doble">Doble</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Diseño / Decoración Especial</label>
                                                <textarea 
                                                    name="descripcion_diseno"
                                                    value={formData.descripcion_diseno}
                                                    onChange={handleChange}
                                                    rows={3}
                                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"
                                                    placeholder="Describe los elementos especiales, toppers, figuras..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Alergias / Restricciones</label>
                                                <textarea 
                                                    name="alergias"
                                                    value={formData.alergias}
                                                    onChange={handleChange}
                                                    rows={3}
                                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-rose-500 placeholder:text-rose-200"
                                                    placeholder="Ej: Sin nueces, sin gluten..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-6 border-t border-gray-50">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Estado Producción</label>
                                            <select 
                                                name="estatus_produccion"
                                                value={formData.estatus_produccion}
                                                onChange={handleChange}
                                                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"
                                            >
                                                <option value="Pendiente">Pendiente</option>
                                                <option value="En Proceso">En Proceso</option>
                                                <option value="Listos">Listo</option>
                                                <option value="Entregado">Entregado</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'logistica' && (
                                    <div className="space-y-8">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Fecha Entrega</label>
                                                <input 
                                                    type="date"
                                                    name="fecha_entrega"
                                                    value={formData.fecha_entrega}
                                                    onChange={handleChange}
                                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Hora Entrega</label>
                                                <input 
                                                    type="time"
                                                    name="hora_entrega"
                                                    value={formData.hora_entrega}
                                                    onChange={handleChange}
                                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Ubicación / Calle</label>
                                            <input 
                                                name="calle"
                                                value={formData.calle}
                                                onChange={handleChange}
                                                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"
                                                placeholder="Calle y número..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Colonia / Referencias</label>
                                            <textarea 
                                                name="referencias"
                                                value={formData.referencias}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"
                                                placeholder="Entre calles, color de casa..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'pago' && (
                                    <div className="grid md:grid-cols-2 gap-12 items-center">
                                        <div className="space-y-8">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Total del Pedido</label>
                                                <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-3xl">
                                                    <span className="text-2xl font-black text-gray-400">$</span>
                                                    <input 
                                                        type="number"
                                                        name="total"
                                                        value={formData.total}
                                                        onChange={handleChange}
                                                        placeholder="0.00"
                                                        className="flex-1 bg-transparent border-none focus:ring-0 text-3xl font-black text-gray-900"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Anticipo</label>
                                                <div className="flex items-center gap-2 bg-emerald-50 p-4 rounded-3xl">
                                                    <span className="text-2xl font-black text-emerald-400">$</span>
                                                    <input 
                                                        type="number"
                                                        name="anticipo"
                                                        value={formData.anticipo}
                                                        onChange={handleChange}
                                                        placeholder="0.00"
                                                        className="flex-1 bg-transparent border-none focus:ring-0 text-3xl font-black text-emerald-600"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-8 bg-gray-900 rounded-[2rem] text-white flex flex-col items-center justify-center text-center shadow-2xl">
                                            <p className="text-xs font-black uppercase tracking-[0.3em] opacity-50 mb-4">RESTA POR PAGAR</p>
                                            <h4 className="text-5xl font-black mb-6">
                                                ${(Number(formData.total || 0) - Number(formData.anticipo || 0)).toFixed(2)}
                                            </h4>
                                            <div className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest ${
                                                Number(formData.total || 0) - Number(formData.anticipo || 0) <= 0.01 ? 'bg-emerald-500' : 'bg-orange-500'
                                            }`}>
                                                {Number(formData.total || 0) - Number(formData.anticipo || 0) <= 0.01 ? 'Liquidado' : 'Pendiente'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-white border-t border-gray-100 flex justify-between items-center">
                    <button 
                        onClick={onClose}
                        className="px-8 py-4 text-gray-400 font-bold hover:text-gray-900 transition-all uppercase text-xs tracking-widest"
                    >
                        Descartar
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-gray-900 text-white px-12 py-4 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-gray-200 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Confirmar Cambios
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default EditOrderModal;
