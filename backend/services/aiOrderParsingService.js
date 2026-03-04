const { OpenAI } = require('openai');
const { CakeFlavor, Filling } = require('../models');
const { Op } = require('sequelize');

// Setup OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key',
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const SYSTEM_INSTRUCTIONS = `
### ROL: ASISTENTE DE PASTELERÍA INTELIGENTE
Eres la **Asistente de Pastelería Inteligente**: experta, amable y extremadamente organizada. Tu objetivo es filtrar el "caos" del cliente y confirmar un pedido limpio y estructurado.

### REGLAS DE ORO (DNA DEL SISTEMA):
1. **Detección de Cambios (Limpieza de Buffer):** Si el usuario dice "mejor no", "espera" o "cámbialo", BORRA la opción anterior. No acumules sabores si el cliente se arrepintió. Confirma solo la decisión final.
2. **Modo Edición por Folio/ID (#XXXX):** 
   - **IMPORTANTE:** Si el usuario menciona un número de pedido o ID (ej: "#4502", "pedido P-2024..."), busca ese pedido.
   - Informa explícitamente: "He localizado tu pedido #ID. ¿Qué cambio deseas realizar?". 
   - Actúa sobre los datos de ese pedido específico.
3. **Memoria de Estado & Memoria de Pez (EVITAR LOOPS):** 
   - Revisa todo el historial. Si el usuario ya dio un dato, **NO lo vuelvas a preguntar**. 
   - Si el usuario solo menciona un cambio, mantén todo lo demás intacto.
4. **Validación Proactiva de Fechas:** 
   - CONFIRMA siempre la fecha numérica para evitar confusiones.
   - **Buffer 6 PM:** Si es tarde y pide para "hoy", ofrece "mañana".
5. **Cierre Estructurado Mandatario (CONTRATO VISUAL):**
   - **PROHIBIDO:** Decir "Te generaré un ID" o "Pronto tendrás tu folio". 
   - **OBLIGATORIO:** Cuando el pedido esté completo (\`is_full_order_captured\`: true), DEBES cerrar con este formato de "Contrato":
     "¡Excelente [Nombre]! Tu pedido ha sido registrado con éxito. 🎂
     **Folio:** #[Menciona el Folio si existe en el estado actual]
     **Fecha/Hora:** [Fecha], [Hora]
     **Detalles:** [Resumen rápido: Sabor, Tamaño, Forma, Diseño]
     
     **PASO FINAL:** Para confirmar tu lugar en la agenda, por favor realiza el depósito del anticipo a: 
     [CLABE: 1234 5678 9012 3456 | Banco: PastelBank] 
     Y envíame la captura de pantalla por aquí. ¡Muchas gracias!"
6. **Factor Humano & Empatía:** Responde con calidez. 
7. **Trigger de Acción:** Marca \`is_full_order_captured\` como true solo cuando tengas Fecha, Hora, Sabor, Tamaño y Nombre.
8. **CONFIRMADO ES CONFIRMADO (LEY DE PERSISTENCIA):** Si en el "ESTADO ACTUAL" ya ves que \`is_full_order_captured\` es true, NO vuelvas a pedir datos básicos. Si el usuario te saluda o pregunta "se agendo?", responde confirmando: "¡Sí! Ya todo está registrado bajo el Folio #ID. ¿Hay algo específico que desees cambiar?".
9. **INYECCIÓN DE CONTEXTO ES LEY:** Si el sistema te inyecta datos en el "ESTADO ACTUAL", asume que esos son los datos reales del pedido, incluso si contradicen mensajes muy antiguos del historial. Prioriza siempre el JSON de estado inyectado.

### MANEJO DE CASOS ESPECIALES:
- **"Mita y Mita":** Si el cliente pide instrucciones por secciones (ej: "fresas solo en una mitad"), detalla esto claramente en el campo 'specs'.
- **"Express" (Urgencia):** Si detectas que es para "hoy mismo" o "en 2 horas", marca 'specs' como "PEDIDO URGENTE" y pregunta disponibilidad antes de confirmar.
- **"El Copión" (Privacidad):** Si piden "lo mismo que mi prima", explica amablemente que por privacidad no puedes ver pedidos de terceros y pide los detalles de nuevo.

### FORMATO DE SALIDA (JSON):
{
  "is_new_order_intent": boolean,
  "editing_folio": string | null,
  "customerName": string | null,
  "phone": string | null,
  "deliveryDate": string (YYYY-MM-DD) | null,
  "deliveryTime": string (HH:mm) | null,
  "peopleCount": number | null,
  "shape": "Redondo" | "Cuadrado" | "Rectangular" | "Corazon" | null,
  "flavorId": number | null,
  "fillingId": number | null,
  "specs": string (detalles de secciones/urgencias),
  "missing_info": string[],
  "assistant_response": string (usa el formato de Contrato en negritas y con emojis si está completo),
  "is_full_order_captured": boolean
}
Version: 1.5.2
`;

class AiOrderParsingService {

    /**
     * Parse text into structured order with IDs
     * @param {string} text 
     * @param {number} tenantId 
     * @returns {Object} { valid: boolean, data: Object, errors: string[] }
     */
    async parseOrder(text, tenantId, history = [], existingData = {}) {
        // 1. Fetch RAG Context (Catalogs)
        const flavors = await CakeFlavor.findAll({
            where: { tenantId },
            attributes: ['id', 'name']
        });
        const fillings = await Filling.findAll({
            where: { tenantId },
            attributes: ['id', 'name']
        });

        const catalogContext = {
            flavors: flavors.map(f => ({ id: f.id, name: f.name })),
            fillings: fillings.map(f => ({ id: f.id, name: f.name }))
        };

        // 2. Call AI
        // We separate this method for easier mocking
        const aiResponse = await this._callOpenAI(text, catalogContext, history, existingData);

        // 3. Deterministic Validation
        const validation = this._validateIds(aiResponse, catalogContext);

        // Always return the data, but include validation details
        return { 
            valid: validation.valid, 
            data: aiResponse, 
            errors: validation.errors 
        };
    }

    /**
     * Internal method to call OpenAI - Monkey patch this for QA
     */
    async _callOpenAI(text, context, history = [], existingData = {}) {
        // QA Mode Mock
        if (process.env.QA_MODE === '1') {
            const fId = context.flavors.length > 0 ? context.flavors[0].id : null;
            const filId = context.fillings.length > 0 ? context.fillings[0].id : null;
            return {
                customerName: "QA Mock User",
                is_new_order_intent: false,
                phone: "5555555555",
                deliveryDate: new Date().toISOString().split('T')[0],
                flavorId: fId,
                fillingId: filId,
                specs: "QA Mock Specs (Determinism)",
                errors: [],
                missing_info: [],
                assistant_response: "Mock response",
                is_full_order_captured: true
            };
        }

        if (!process.env.OPENAI_API_KEY) {
            console.warn("⚠️ No OpenAI API Key. In production this fails. In QA we mock this.");
            throw new Error("OpenAI Config Missing");
        }

        const dynamicPrompt = `
Contexto de Inventario:
Sabores: ${JSON.stringify(context.flavors)}
Rellenos: ${JSON.stringify(context.fillings)}
Fecha actual: ${new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}

### ESTADO ACTUAL DEL PEDIDO (DATOS YA CAPTURADOS):
${JSON.stringify(existingData, null, 2)}
REGLA CRÍTICA: NO preguntes por campos (Fecha, Personas, Sabor, etc.) que ya tengan un valor válido en el JSON de arriba. Solo enfócate en lo nuevo o en lo que el usuario pida cambiar.
`;

        const messages = [
            { role: "system", content: SYSTEM_INSTRUCTIONS + dynamicPrompt },
            ...history.map(h => ({ 
                role: h.role === 'user' ? 'user' : 'assistant', 
                content: typeof h.content === 'string' ? h.content : JSON.stringify(h.content) 
            })),
            { role: "user", content: text }
        ];

        const completion = await openai.chat.completions.create({
            model: MODEL,
            messages,
            response_format: { type: "json_object" },
            temperature: 0
        });

        try {
            const content = completion.choices[0].message.content;
            return JSON.parse(content);
        } catch (e) {
            console.error("CRITICAL: AI Parsing Error", e);
            return { 
                is_new_order_intent: false,
                assistant_response: "⚠️ Tuve un pequeño problema técnico procesando ese mensaje. ¿Podrías decirme de nuevo qué necesitas para el pastel? 🎂",
                is_full_order_captured: false,
                missing_info: ["reintento_necesario"]
            };
        }
    }

    _validateIds(data, context) {
        const errors = [];
        if (data.errors && data.errors.length > 0) {
            errors.push(...data.errors);
        }

        // Validate Flavor
        if (data.flavorId) {
            const exists = context.flavors.find(f => f.id === data.flavorId);
            if (!exists) errors.push(`Flavor ID ${data.flavorId} does not exist in tenant.`);
        }

        // Validate Filling
        if (data.fillingId) {
            const exists = context.fillings.find(f => f.id === data.fillingId);
            if (!exists) errors.push(`Filling ID ${data.fillingId} does not exist in tenant.`);
        }

        return { valid: errors.length === 0, errors };
    }
}

module.exports = new AiOrderParsingService();
