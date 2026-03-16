const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const aiService = require('../services/aiOrderParsingService');

async function runTest() {
    console.log("🔍 INICIANDO PRUEBA DE INTEGRACIÓN: DNA v1.4 (Memoria de Estado)");
    
    // Configuración de prueba
    const tenantId = 1; // Ajustar según tu DB
    let history = [];
    let memorySnapshot = {};

    const mensajes = [
        "Hola, quiero un pastel de Chocolate Abuelita para el 9 de marzo",
        "Ay no, perdón, que sea para el 10 de marzo mejor. Somos 20 gentes.",
        "De relleno ponle Nutella. ¿Ya tienes la fecha y cuántos somos?"
    ];

    for (const msg of mensajes) {
        console.log(`\n---------------------------------------------------------`);
        console.log(`👤 USUARIO: "${msg}"`);
        
        // Llamada al servicio con Memoria de Estado
        const result = await aiService.parseOrder(msg, tenantId, history, memorySnapshot);
        const data = result.data || {};

        console.log(`🤖 IA: "${data.assistant_response}"`);
        console.log(`📌 MEMORIA CAPTURADA:`, {
            fecha: data.deliveryDate,
            personas: data.peopleCount,
            sabor: data.flavorId,
            relleno: data.fillingId,
            es_completo: data.is_full_order_captured
        });

        // Actualizar Memoria y Historial para el siguiente turno (Simulando persistencia)
        memorySnapshot = {
            ...memorySnapshot,
            ...data
        };
        history.push({ role: 'user', content: msg });
        history.push({ role: 'assistant', content: data.assistant_response });
        
        // Limpiar history para no saturar el prompt (últimos 10 mensajes)
        if (history.length > 10) history = history.slice(-10);
    }

    console.log(`\n✅ PRUEBA FINALIZADA`);
}

// Ejecutar con gestión de errores
runTest().catch(err => {
    console.error("❌ ERROR CRÍTICO EN EL TEST:", err);
    process.exit(1);
});
