import { useState, useEffect, useRef } from "react";
import { Bot, X, Send, Sparkles, Loader2, AlertCircle, Mic, MicOff, History, Trash2, PlusCircle, Edit3, Search, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import aiService from '../services/aiService';
import toast from 'react-hot-toast';
import useDictation from '../hooks/useDictation';

import { useOrder } from '../context/OrderContext';

const AiAssistantTray = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    // Conditional hook usage - only use if context is available
    let updateOrder = null;
    try {
        const orderContext = useOrder();
        updateOrder = orderContext?.updateOrder;
    } catch (e) {
        // Context not available
    }

    // ===== NEW: Mode Selector State =====
    const [mode, setMode] = useState('CREATE'); // CREATE | EDIT | SEARCH | INSIGHTS | DELETE

    const [activeSessionId, setActiveSessionId] = useState(null);
    const [messages, setMessages] = useState([
        { role: 'ai', text: '¡Hola! Soy tu asistente de pastelería. ¿En qué te ayudo hoy?', mode: 'CREATE' }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [error, setError] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [sessions, setSessions] = useState([]);

    // Load history on mount
    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const data = await aiService.getSessions();
            if (data) setSessions(data);
        } catch (err) {
            console.error("Error loading sessions", err);
        }
    };

    const handleNewChat = () => {
        setActiveSessionId(null);
        setMessages([{ role: 'ai', text: '¡Nuevo chat iniciado! Cuéntame qué pedido quieres registrar.', mode: 'CREATE' }]);
        setMode('CREATE');
        toast.success("Nuevo chat listo");
    };

    const handleDeleteSession = async (id, e) => {
        e.stopPropagation();
        if (confirm('¿Eliminar esta conversación?')) {
            await aiService.deleteSession(id);
            setSessions(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleLoadSession = (session) => {
        setActiveSessionId(session.id);
        const historyJson = session.whatsappConversation;
        const history = historyJson ? (typeof historyJson === 'string' ? JSON.parse(historyJson) : historyJson) : [];
        
        if (history.length > 0) {
            setMessages(history.map(h => ({ 
                role: h.role === 'user' ? 'user' : 'ai', 
                text: typeof h.content === 'string' ? h.content : (h.text || 'Mensaje de sistema')
            })));
        }

        if (session.extractedData && updateOrder) {
            const data = session.extractedData;
            const mappedData = {};
            if (data.customerName) mappedData.clientName = data.customerName;
            if (data.phone) mappedData.clientPhone = data.phone;
            if (data.deliveryDate) mappedData.deliveryDate = data.deliveryDate;
            if (data.deliveryTime) mappedData.deliveryTime = data.deliveryTime;
            if (data.flavorId) mappedData.flavorId = data.flavorId;
            if (data.fillingId) mappedData.fillingId = data.fillingId;
            if (data.specs) mappedData.designDescription = data.specs;
            if (data.peopleCount) mappedData.peopleCount = data.peopleCount;
            if (data.shape) mappedData.shape = data.shape;
            updateOrder(prev => ({ ...prev, ...mappedData }));
        }

        setShowHistory(false);
        toast.success(`Chat de ${session.customerName || 'Pedido'} cargado`);
    };

    const { isListening, transcript, startListening, stopListening, resetTranscript, error: dictationError } = useDictation();

    // Sync dictation error
    useEffect(() => {
        if (dictationError) {
            setError(dictationError);
            setTimeout(() => setError(null), 5000);
        }
    }, [dictationError]);

    // Sync dictation to input
    useEffect(() => {
        if (transcript) {
            setInput(transcript);
        }
    }, [transcript]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isThinking]);

    // ⭐ ENHANCED handleSend with MODE SWITCH
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isThinking) return;

        const userMessage = input;

        // Save to context
        if (updateOrder) {
            updateOrder(prev => ({
                ...prev,
                draftTranscriptRaw: (prev.draftTranscriptRaw || '') + '\n- ' + userMessage
            }));
        }

        setMessages(prev => [...prev, { role: 'user', text: userMessage, mode }]);
        setInput('');
        resetTranscript();
        setIsThinking(true);
        setError(null);

        try {
            let response;

            switch (mode) {
                case 'CREATE':
                    response = await aiService.parseOrderIntent(userMessage, activeSessionId);

                    if (response.sessionId) {
                        setActiveSessionId(response.sessionId);
                    }

                    if (response.is_new_order_intent) {
                        toast.success("¡Nueva solicitud detectada! He iniciado un nuevo contexto.");
                        setMessages([
                            { role: 'user', text: userMessage, mode: 'CREATE' },
                            {
                                role: 'ai',
                                text: response.assistant_response || 'Entiendo, ¿podrías darme más detalles?',
                                mode: 'CREATE',
                                extractedData: response.draft,
                                is_full_order_captured: response.is_full_order_captured
                            }
                        ]);
                    } else {
                        setMessages(prev => [...prev, {
                            role: 'ai',
                            text: response.assistant_response || 'Entiendo, ¿podrías darme más detalles?',
                            mode: 'CREATE',
                            extractedData: response.draft,
                            is_full_order_captured: response.is_full_order_captured
                        }]);
                    }

                    if (response.is_full_order_captured) {
                        toast.success("¡Pedido Completado! Generando pre-nota...", {
                            icon: '🎉',
                            duration: 5000
                        });
                        
                        // ⭐ Sincronización de FullCalendar: Lanzar evento global para refetch
                        window.dispatchEvent(new CustomEvent('calendar-refresh'));
                    }

                    // Auto-fill form with SHINE EFFECT
                    if (response.draft && updateOrder) {
                        const data = response.draft;
                        
                        // ⭐ Sincronización de FullCalendar: Si hay fecha, avisar al calendario
                        if (data.fecha_entrega) {
                            window.dispatchEvent(new CustomEvent('ai-date-update', { detail: data.fecha_entrega }));
                        }

                        const mappedData = {};
                        
                        if (data.cliente_nombre) mappedData.clientName = data.cliente_nombre;
                        if (data.cliente_telefono) mappedData.clientPhone = data.cliente_telefono;
                        if (data.fecha_entrega) mappedData.deliveryDate = data.fecha_entrega;
                        if (data.hora_entrega) mappedData.deliveryTime = data.hora_entrega;
                        if (data.peopleCount) mappedData.peopleCount = data.peopleCount;
                        if (data.shape) mappedData.shape = data.shape;
                        
                        if (data.sabores_pan && data.sabores_pan.length > 0) {
                            mappedData.flavorId = data.sabores_pan[0];
                        }
                        if (data.rellenos && data.rellenos.length > 0) {
                            mappedData.fillingId = data.rellenos[0];
                        }
                        
                        if (data.descripcion_diseno) mappedData.designDescription = data.descripcion_diseno;

                        // Trigger visual "shine" effect in the form
                        updateOrder(prev => ({ 
                            ...prev, 
                            ...mappedData,
                            _lastAiUpdate: Date.now(), // Unique ID to trigger animations
                            _aiShine: true 
                        }));

                        // Remove shine after a second
                        setTimeout(() => {
                            updateOrder(prev => ({ ...prev, _aiShine: false }));
                        }, 1000);
                    }

                    loadSessions();
                    break;

                case 'EDIT':
                    // Extract order ID from message (can be improved with UI order selector)
                    const orderIdMatch = userMessage.match(/\b(\d+)\b/);
                    const orderId = orderIdMatch ? parseInt(orderIdMatch[1]) : null;

                    if (!orderId) {
                        setMessages(prev => [...prev, {
                            role: 'ai',
                            text: '❓ No detecté el ID del pedido. Por favor menciona el número de pedido (ej: "pedido 123 cambiar fecha al martes")',
                            mode: 'EDIT',
                            isError: true
                        }]);
                        break;
                    }

                    response = await aiService.editOrderWithAI(orderId, userMessage);

                    setMessages(prev => [...prev, {
                        role: 'ai',
                        text: response.aiConfirmation || 'Pedido actualizado',
                        mode: 'EDIT',
                        changes: response.changes,
                        changedFields: response.changedFields,
                        order: response.order
                    }]);
                    break;

                case 'SEARCH':
                    // ✨ INTELLIGENT FALLBACK: If query looks like an edit/create intent (con nouns/verbos clave), switch to CREATE mode.
                    const editKeywords = [
                        'cambia', 'actualiza', 'ponle', 'quita', 'mejor', 'pero', 'ahora', 'quiero', 
                        'pedido', 'folio', 'sabor', 'marzo', 'personas', 'diseno', 'forma'
                    ];
                    const hasKeywords = editKeywords.some(kw => userMessage.toLowerCase().includes(kw));
                    const isLongConversation = userMessage.trim().split(' ').length > 4 || userMessage.length > 50;
                    
                    if (hasKeywords || isLongConversation) {
                        toast("Cambiando a modo Asistente para procesar pedido...", { icon: '🤖' });
                        setMode('CREATE');
                        response = await aiService.parseOrderIntent(userMessage, activeSessionId);
                        
                        if (response.sessionId) setActiveSessionId(response.sessionId);
                        
                        setMessages(prev => [...prev, {
                            role: 'ai',
                            text: response.assistant_response || 'Entiendo, ¿podrías darme más detalles?',
                            mode: 'CREATE',
                            extractedData: response.draft,
                            is_full_order_captured: response.is_full_order_captured
                        }]);

                        // Sync form data
                        if (response.draft && updateOrder) {
                            const data = response.draft;
                            const mappedData = {};
                            if (data.cliente_nombre) mappedData.clientName = data.cliente_nombre;
                            if (data.cliente_telefono) mappedData.clientPhone = data.cliente_telefono;
                            if (data.fecha_entrega) mappedData.deliveryDate = data.fecha_entrega;
                            if (data.hora_entrega) mappedData.deliveryTime = data.hora_entrega;
                            if (data.peopleCount) mappedData.peopleCount = data.peopleCount;
                            if (data.shape) mappedData.shape = data.shape;
                            if (data.sabores_pan?.[0]) mappedData.flavorId = data.sabores_pan[0];
                            if (data.rellenos?.[0]) mappedData.fillingId = data.rellenos[0];
                            if (data.descripcion_diseno) mappedData.designDescription = data.descripcion_diseno;

                            updateOrder(prev => ({ 
                                ...prev, 
                                ...mappedData,
                                _lastAiUpdate: Date.now(),
                                _aiShine: true 
                            }));
                        }
                        break;
                    }

                    response = await aiService.searchOrdersWithAI(userMessage);

                    setMessages(prev => [...prev, {
                        role: 'ai',
                        text: response.aiSummary || (response.count === 0 ? 'No encontré pedidos con esa descripción.' : `Encontré ${response.count} resultados`),
                        mode: 'SEARCH',
                        results: response.results,
                        count: response.count,
                        totalValue: response.totalValue,
                        filters: response.filters
                    }]);
                    break;

                case 'INSIGHTS':
                    response = await aiService.getDashboardInsights(userMessage);

                    setMessages(prev => [...prev, {
                        role: 'ai',
                        text: response.insight || 'Análisis completado',
                        mode: 'INSIGHTS',
                        dashboardData: response.dashboardData,
                        question: response.question
                    }]);
                    break;

                case 'DELETE':
                    const delMatch = userMessage.match(/\b(\d+)\b/);
                    const delId = delMatch ? parseInt(delMatch[1]) : null;

                    if (!delId) {
                        setMessages(prev => [...prev, {
                            role: 'ai',
                            text: '❓ Necesito el ID del pedido para eliminarlo (ej: "eliminar pedido 123")',
                            mode: 'DELETE'
                        }]);
                        break;
                    }

                    if (confirm(`¿Estás SEGURO de eliminar el pedido ${delId}? Esta acción no se puede deshacer.`)) {
                        response = await aiService.deleteOrderWithAI(delId, userMessage);
                        setMessages(prev => [...prev, {
                            role: 'ai',
                            text: response.aiConfirmation || 'Pedido eliminado correctamente',
                            mode: 'DELETE',
                            isDeleted: true
                        }]);
                    } else {
                        setIsThinking(false);
                        return;
                    }
                    break;
            }

        } catch (err) {
            console.error('Error en IA:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Error al procesar';

            setMessages(prev => [...prev, {
                role: 'ai',
                text: `❌ ${errorMsg}`,
                mode,
                isError: true
            }]);

            // Fallback to legacy parser for CREATE mode
            if (mode === 'CREATE') {
                try {
                    const fallbackResponse = await aiService.parseOrderIntent(userMessage);
                    if (fallbackResponse.assistant_response) {
                        setMessages(prev => [...prev, {
                            role: 'ai',
                            text: fallbackResponse.assistant_response,
                            mode: 'CREATE',
                            draft: fallbackResponse.draft
                        }]);

                        if (fallbackResponse.draft && updateOrder) {
                            updateOrder(fallbackResponse.draft);
                        }
                    }
                } catch (fallbackErr) {
                    console.error('Fallback también falló:', fallbackErr);
                }
            }
        } finally {
            setIsThinking(false);
        }
    };

    // ⭐ DYNAMIC PLACEHOLDER based on mode
    const getPlaceholder = () => {
        switch (mode) {
            case 'CREATE':
                return 'Ej: Pastel de chocolate para María, tel 5551234567, entrega 15 de marzo...';
            case 'EDIT':
                return 'Ej: Pedido 123 cambiar fecha al martes';
            case 'SEARCH':
                return 'Ej: pedidos de esta semana mayores a 800 pesos';
            case 'INSIGHTS':
                return 'Ej: ¿Cuánto hemos vendido este mes?';
            case 'DELETE':
                return 'Ej: Eliminar pedido 123 porque el cliente canceló';
            default:
                return 'Escribe tu mensaje...';
        }
    };

    // ⭐ RENDER extras based on mode
    const renderMessageExtras = (msg) => {
        if (!msg.mode || msg.isError) return null;

        switch (msg.mode) {
            case 'CREATE':
                if (msg.is_full_order_captured && msg.extractedData) {
                    const data = msg.extractedData;
                    return (
                        <div className="mt-3 p-3 bg-pink-50 border border-pink-200 rounded-lg shadow-inner overflow-hidden relative">
                             <div className="absolute -top-1 -right-1 opacity-10 rotate-12">
                                <Sparkles size={48} className="text-pink-500" />
                            </div>
                            <h4 className="font-bold text-pink-700 mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <Sparkles size={16} />
                                Pre-Nota Generada
                            </h4>
                            <div className="text-xs space-y-1.5 text-gray-700 bg-white/50 p-2 rounded border border-pink-100">
                                <div className="flex justify-between border-b border-pink-50 pb-1">
                                    <span className="font-bold">Cliente:</span>
                                    <span>{data.cliente_nombre || 'Pendiente'}</span>
                                </div>
                                <div className="flex justify-between border-b border-pink-50 pb-1">
                                    <span className="font-bold">Entrega:</span>
                                    <span>{data.fecha_entrega || 'Pendiente'} {' ' + (data.hora_entrega || '')}</span>
                                </div>
                                <div className="flex justify-between border-b border-pink-50 pb-1">
                                    <span className="font-bold">Tamaño:</span>
                                    <span>{data.peopleCount || '?'} pers. ({data.shape || 'R'})</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold text-pink-600">Total Est.:</span>
                                    <span className="font-black text-pink-600">$500.00</span>
                                </div>
                            </div>
                            <button
                                className="mt-3 w-full py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-bold text-xs shadow-lg hover:shadow-pink-200 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Bot size={14} className="group-hover:scale-125 transition" />
                                CONFIRMAR Y GENERAR PDF
                            </button>
                        </div>
                    );
                }

                if (msg.orderData) {
                    return (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                <PlusCircle size={16} />
                                Pedido Creado: {msg.folioNumber}
                            </h4>
                            <div className="text-sm space-y-1 text-gray-700">
                                <p><strong>Cliente:</strong> {msg.orderData.client?.name || msg.orderData.cliente_nombre}</p>
                                <p><strong>Entrega:</strong> {new Date(msg.orderData.fecha_entrega).toLocaleDateString('es-MX')}</p>
                            </div>
                            <button
                                onClick={() => {
                                    navigate(`/pedidos/${msg.orderData.id}`);
                                    onClose();
                                }}
                                className="mt-2 w-full py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition"
                            >
                                Ver Pedido Completo
                            </button>
                        </div>
                    );
                }
                break;

            case 'EDIT':
                if (msg.changedFields && msg.changedFields.length > 0) {
                    return (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                <Edit3 size={16} />
                                Cambios Aplicados
                            </h4>
                            <ul className="text-sm space-y-1 text-gray-700 list-disc list-inside">
                                {msg.changedFields.map((field, idx) => (
                                    <li key={idx}>{field}</li>
                                ))}
                            </ul>
                            {msg.order && (
                                <button
                                    onClick={() => {
                                        navigate(`/pedidos/${msg.order.id}`);
                                        onClose();
                                    }}
                                    className="mt-2 w-full py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition"
                                >
                                    Ver Pedido
                                </button>
                            )}
                        </div>
                    );
                }
                break;

            case 'SEARCH':
                if (msg.results && msg.results.length > 0) {
                    return (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                                <Search size={16} />
                                {msg.count} Resultado{msg.count !== 1 ? 's' : ''}
                            </h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {msg.results.slice(0, 10).map((order) => (
                                    <div
                                        key={order.id}
                                        onClick={() => {
                                            navigate(`/pedidos/${order.id}`);
                                            onClose();
                                        }}
                                        className="block p-2 bg-white rounded border hover:border-yellow-400 transition cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-sm">{order.folioNumber}</p>
                                                <p className="text-xs text-gray-600">{order.cliente}</p>
                                            </div>
                                            <span className="text-sm font-bold text-green-600">
                                                ${order.total}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Entrega: {new Date(order.fecha_entrega).toLocaleDateString('es-MX')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            {msg.count > 10 && (
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    ... y {msg.count - 10} más
                                </p>
                            )}
                            {msg.totalValue !== undefined && (
                                <div className="mt-3 pt-3 border-t border-yellow-200 text-sm text-gray-700">
                                    <p><strong>Total:</strong> ${msg.totalValue.toFixed(2)}</p>
                                </div>
                            )}
                        </div>
                    );
                }
                break;

            case 'INSIGHTS':
                if (msg.dashboardData) {
                    return (
                        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                                <BarChart3 size={16} />
                                Datos del Dashboard
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2 bg-white rounded">
                                    <p className="text-gray-500">Total Pedidos</p>
                                    <p className="font-bold text-lg">{msg.dashboardData.totalOrders}</p>
                                </div>
                                <div className="p-2 bg-white rounded">
                                    <p className="text-gray-500">Este Mes</p>
                                    <p className="font-bold text-lg">{msg.dashboardData.monthOrders}</p>
                                </div>
                                <div className="p-2 bg-white rounded">
                                    <p className="text-gray-500">Ingresos Mes</p>
                                    <p className="font-bold text-green-600">${msg.dashboardData.monthRevenue}</p>
                                </div>
                                <div className="p-2 bg-white rounded">
                                    <p className="text-gray-500">Pendientes</p>
                                    <p className="font-bold text-orange-600">{msg.dashboardData.pendingOrders}</p>
                                </div>
                            </div>
                        </div>
                    );
                }
                break;
            case 'DELETE':
                if (msg.isDeleted) {
                    return (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-center gap-2">
                            <Trash2 size={16} />
                            <span>Pedido eliminado de forma permanente</span>
                        </div>
                    );
                }
                break;
        }

        return null;
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-4 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col"
                        style={{ maxHeight: '80vh' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <Bot size={20} />
                                <span className="font-medium">Asistente IA</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="p-1 hover:bg-white/20 rounded transition"
                                    title="Historial de Chats"
                                >
                                    <History size={18} />
                                </button>
                                <button onClick={onClose} className="p-1 hover:bg-white/20 rounded transition">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* ⭐ MODE SELECTOR */}
                        <div className="flex gap-1 p-2 border-b bg-gray-50">
                            <button
                                onClick={() => setMode('CREATE')}
                                className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 ${mode === 'CREATE'
                                    ? 'bg-pink-500 text-white shadow'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <PlusCircle size={14} />
                                Crear
                            </button>
                            <button
                                onClick={() => setMode('EDIT')}
                                className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 ${mode === 'EDIT'
                                    ? 'bg-blue-500 text-white shadow'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Edit3 size={14} />
                                Editar
                            </button>
                            <button
                                onClick={() => setMode('SEARCH')}
                                className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 ${mode === 'SEARCH'
                                    ? 'bg-green-500 text-white shadow'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Search size={14} />
                                Buscar
                            </button>
                            <button
                                onClick={() => setMode('INSIGHTS')}
                                className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 ${mode === 'INSIGHTS'
                                    ? 'bg-purple-500 text-white shadow'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <BarChart3 size={14} />
                                Insights
                            </button>
                            <button
                                onClick={() => setMode('DELETE')}
                                className={`flex-1 py-2 px-2 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 ${mode === 'DELETE'
                                    ? 'bg-red-500 text-white shadow'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Trash2 size={14} />
                                Eliminar
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 bg-gray-50 overflow-hidden relative flex">
                            {/* History Sidebar */}
                            <AnimatePresence>
                                {showHistory && (
                                    <motion.div
                                        initial={{ x: -250, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -250, opacity: 0 }}
                                        className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl z-[60] border-r border-gray-200 overflow-hidden flex flex-col"
                                    >
                                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Historial</span>
                                            <button 
                                                onClick={handleNewChat}
                                                className="flex items-center gap-1 text-pink-500 font-bold text-xs hover:bg-pink-50 px-2 py-1 rounded-lg transition"
                                            >
                                                <PlusCircle size={14} /> Nuevo
                                            </button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto">
                                            {sessions.length === 0 ? (
                                                <div className="p-12 text-center text-gray-400">
                                                    <History size={32} className="mx-auto mb-2 opacity-20" />
                                                    <p className="text-xs font-bold">Sin conversaciones</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    {sessions.map(s => (
                                                        <div
                                                            key={s.id}
                                                            onClick={() => handleLoadSession(s)}
                                                            className={`p-4 border-b hover:bg-pink-50 cursor-pointer group relative transition-all ${activeSessionId === s.id ? 'bg-pink-50 border-l-4 border-l-pink-500' : ''}`}
                                                        >
                                                            <div className="text-sm font-black text-gray-800 truncate pr-6">
                                                                {s.summary || `Sesión #${s.id}`}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">
                                                                {new Date(s.updatedAt).toLocaleDateString()} • {new Date(s.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            <button
                                                                onClick={(e) => handleDeleteSession(s.id, e)}
                                                                className="absolute right-3 top-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Chat Area */}
                            <div className="flex-1 flex flex-col h-96 overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center text-gray-400 text-sm mt-10">
                                        <Sparkles className="inline-block mb-2 opacity-50" />
                                        <p>¿En qué te ayudo hoy?</p>
                                    </div>
                                )}

                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'w-full'}`}>
                                            <div className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.role === 'user'
                                                ? 'bg-pink-500 text-white rounded-br-none'
                                                : msg.isError
                                                    ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-none'
                                                    : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                                                }`}>
                                                {msg.text}
                                            </div>
                                            {renderMessageExtras(msg)}
                                        </div>
                                    </div>
                                ))}

                                {isThinking && (
                                    <div className="flex justify-start">
                                        <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex items-center gap-2">
                                            <Loader2 size={14} className="animate-spin text-pink-500" />
                                            <span className="text-xs text-gray-400">Pensando...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-gray-100">
                            {error && (
                                <div className="text-xs text-red-500 mb-2 px-2 flex items-center justify-between">
                                    <span>{error}</span>
                                    <button onClick={() => setError(null)}><X size={12} /></button>
                                </div>
                            )}

                            {/* Dictation Feedback */}
                            {isListening ? (
                                <div className="mb-2 p-2 bg-pink-50 rounded-lg border border-pink-100 animate-pulse">
                                    <div className="flex items-center gap-2 text-pink-600 text-xs font-medium mb-1">
                                        <Mic size={12} className="animate-ping" />
                                        Escuchando...
                                    </div>
                                    <p className="text-sm text-gray-700 italic">
                                        {transcript || "Habla ahora..."}
                                    </p>
                                </div>
                            ) : transcript && (
                                <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-100 relative group">
                                    <p className="text-sm text-gray-700">{transcript}</p>
                                    <button
                                        onClick={resetTranscript}
                                        className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleSend} className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={isListening ? "Escuchando..." : getPlaceholder()}
                                    className="w-full pl-4 pr-20 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-pink-100 transition-all text-sm"
                                    disabled={isThinking || isListening}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={isListening ? stopListening : startListening}
                                        className={`p-2 rounded-lg transition-all ${isListening
                                            ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                            : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'
                                            }`}
                                        title={isListening ? "Detener dictado" : "Iniciar dictado"}
                                    >
                                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isThinking}
                                        className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </form>
                            <div className="text-[10px] text-center text-gray-300 mt-2">
                                Potenciado por OpenAI GPT-4o-mini
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AiAssistantTray;
