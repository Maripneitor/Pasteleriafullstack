import React, { useState } from 'react';
import { Sparkles, Loader2, Clipboard, CheckCircle2, AlertCircle } from 'lucide-react';
import aiService from '../../../api/aiService';
import { useOrder } from '../../../context/OrderContext';
import toast from 'react-hot-toast';

const AiMagicPaste = ({ onComplete }) => {
    const { updateOrder } = useOrder();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleParse = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const result = await aiService.parseOrderIntent(text);
            
            if (result.valid || result.draft) {
                const draft = result.draft || {};
                
                // Map backend names to OrderContext names
                const mappedData = {
                    clientName: draft.cliente_nombre || draft.customerName || '',
                    clientPhone: draft.cliente_telefono || draft.phone || '',
                    deliveryDate: draft.fecha_entrega || draft.deliveryDate || '',
                    deliveryTime: draft.hora_entrega || draft.deliveryTime || '',
                    peopleCount: draft.peopleCount || '',
                    shape: draft.shape || '',
                    designDescription: draft.descripcion_diseno || draft.specs || '',
                };

                // Filter out nulls
                const cleanData = Object.fromEntries(
                    Object.entries(mappedData).filter(([_, v]) => v != null && v !== '')
                );

                updateOrder(cleanData);
                toast.success("¡Datos extraídos con éxito! Revisa los campos.");
                if (result.assistant_response) {
                    toast(result.assistant_response, { icon: '🤖', duration: 5000 });
                }
                setIsExpanded(false);
                setText('');
                if (onComplete) onComplete();
            } else {
                toast.error("No se pudo interpretar el pedido. Intenta ser más específico.");
            }
        } catch (error) {
            console.error("AI Magic Error:", error);
            toast.error("Error al conectar con la IA.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`transition-all duration-300 ${isExpanded ? 'bg-pink-50 border-pink-200' : 'bg-white border-gray-100'} border-2 rounded-2xl p-4 shadow-sm mb-6`}>
            {!isExpanded ? (
                <button 
                    onClick={() => setIsExpanded(true)}
                    className="w-full flex items-center justify-between text-pink-600 font-bold group"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-pink-100 p-2 rounded-lg group-hover:scale-110 transition-transform">
                            <Sparkles size={20} />
                        </div>
                        <span className="text-sm">¿Tienes el pedido en texto? Impórtalo con IA</span>
                    </div>
                </button>
            ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-pink-700 flex items-center gap-2">
                            <Sparkles size={16} />
                            Pegar texto del pedido
                        </h3>
                        <button onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-gray-600 text-xs">Cancelar</button>
                    </div>
                    
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Ej: Hola, quiero un pastel de Spiderman para 50 personas, 3 leches con Nutella para el domingo 8..."
                        className="w-full h-32 p-3 text-sm border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                    />

                    <div className="flex gap-2">
                        <button
                            onClick={handleParse}
                            disabled={loading || !text.trim()}
                            className="flex-1 bg-pink-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-pink-700 disabled:opacity-50 flex items-center justify-center gap-2 transition shadow-lg shadow-pink-200"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Clipboard size={16} />}
                            {loading ? 'Analizando...' : 'Auto-rellenar Campos'}
                        </button>
                    </div>
                    
                    <p className="text-[10px] text-pink-400 text-center italic">
                        La IA intentará extraer cliente, fecha, sabor y diseño automáticamente.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AiMagicPaste;
