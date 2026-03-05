require('dotenv').config({ path: '../../.env' });
const { sequelize } = require('../models');

async function repairDatabase() {
    console.log('🚀 Iniciando script de reparación de Base de Datos (Idempotente)...');

    try {
        await sequelize.authenticate();
        console.log('✅ Conexión establecida.');

        // 1. Reparar fechas '0000-00-00' (SAFE UPDATE)
        const checkDates = await sequelize.query("SELECT COUNT(*) as count FROM folios WHERE CAST(fecha_entrega AS CHAR) = '0000-00-00'", { type: sequelize.QueryTypes.SELECT });
        if (checkDates[0].count > 0) {
            console.log(`🛠  Encontradas ${checkDates[0].count} fechas inválidas. Reparando...`);
            await sequelize.query(`UPDATE folios SET fecha_entrega = NULL WHERE CAST(fecha_entrega AS CHAR) = '0000-00-00' OR CAST(fecha_entrega AS CHAR) LIKE '0000%';`);
            await sequelize.query(`UPDATE folios SET cancelado_en = NULL WHERE CAST(cancelado_en AS CHAR) = '0000-00-00' OR CAST(cancelado_en AS CHAR) LIKE '0000%';`);
        } else {
            console.log('✅ Fechas validadas (No se encontraron 0000-00-00).');
        }

        // 2. Agregar columnas faltantes de forma segura (check first)
        const [columns] = await sequelize.query("SHOW COLUMNS FROM folios LIKE 'fecha_entrega'");
        if (columns.length === 0) {
            console.log('🛠  Agregando columna faltante: fecha_entrega');
            await sequelize.query("ALTER TABLE folios ADD COLUMN fecha_entrega DATE NULL;");
        }

        // 3. Alinear TIPOS de ID (BIGINT)
        console.log('🛠  Verificando alineación de tenantId...');
        const tables = ['folios', 'users', 'fillings', 'flavors', 'clients'];

        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

        for (const table of tables) {
            try {
                const [exists] = await sequelize.query(`SHOW TABLES LIKE '${table}';`);
                if (exists.length > 0) {
                    // Check type
                    const [colDef] = await sequelize.query(`SHOW COLUMNS FROM ${table} LIKE 'tenantId'`);
                    if (colDef.length > 0 && !colDef[0].Type.includes('bigint')) {
                        console.log(`   -> Ajustando ${table}.tenantId a BIGINT...`);
                        await sequelize.query(`ALTER TABLE ${table} MODIFY COLUMN tenantId BIGINT DEFAULT 1;`);
                    }
                }
            } catch (err) {
                console.warn(`   ⚠️ Error verificando ${table}: ${err.message}`);
            }
        }

        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');

        console.log('✅ Reparación finalizada.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error Fatal:', error);
        process.exit(1);
    }
}

repairDatabase();
