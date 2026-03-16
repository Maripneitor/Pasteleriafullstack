const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { sequelize } = require('../config/database');
const commissionService = require('../services/commissionService');

const runTest = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connected.');

        // Mimic Controller Logic for Flag Parsing
        const mockReqBody = {
            aplicar_comision_cliente: 'true', // Simulate multipart string 'true'
            total: 100,
            folio_numero: `TEST-INT-${Date.now()}`
        };

        console.log('🧪 Testing Controller Logic Bridge...');

        // 1. Controller Parsing Logic copy-paste
        const applyComm = mockReqBody.aplicar_comision_cliente === true || mockReqBody.aplicar_comision_cliente === 'true';
        console.log(`Input 'true' (string) -> Parsed: ${applyComm} (boolean)`);

        if (applyComm !== true) {
            throw new Error('Flag parsing failed!');
        }

        // 2. Service Call
        console.log(`calling commissionService.createCommission for ${mockReqBody.folio_numero}...`);
        const result = await commissionService.createCommission({
            folioNumber: mockReqBody.folio_numero,
            total: mockReqBody.total,
            appliedToCustomer: applyComm,
            userId: 999 // Mock User
        });

        console.log('✅ Commission Created:', JSON.stringify(result.toJSON(), null, 2));

        if (result.appliedToCustomer === true && result.roundedAmount === 5.00) {
            console.log('✨ SUCCESS: Commission applied and calculated correctly.');
        } else {
            console.error('❌ FAILURE: Incorrect calculation or application status.');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
};

runTest();
