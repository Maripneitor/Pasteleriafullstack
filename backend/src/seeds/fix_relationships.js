require('dotenv').config({ path: '../../.env' });
const { sequelize } = require('../models');

async function fixSchemaConstraints() {
    try {
        console.log('🔌 Conectando a la BD para reparaciones...');
        await sequelize.authenticate();
        console.log('✅ Conectado.');

        // 1. Fix Types for Foreign Keys
        // MySQL command to change column type to BIGINT
        const fixes = [
            `ALTER TABLE folios MODIFY clientId BIGINT NULL;`,
            `ALTER TABLE folios MODIFY responsibleUserId BIGINT NULL;`,
            // Ensure tenantId is also BIGINT
            `ALTER TABLE folios MODIFY tenantId BIGINT DEFAULT 1;`,
            `ALTER TABLE users MODIFY id BIGINT AUTO_INCREMENT;`
        ];

        for (const sql of fixes) {
            try {
                console.log(`🛠 Ejecutando: ${sql}`);
                await sequelize.query(sql);
                console.log(`✅ Éxito.`);
            } catch (error) {
                console.error(`⚠️ Error (puede que ya esté aplicado): ${error.original?.sqlMessage || error.message}`);
            }
        }

        console.log('🏁 Schema Constraints Fix completado.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fatal en migration script:', error);
        process.exit(1);
    }
}

fixSchemaConstraints();
