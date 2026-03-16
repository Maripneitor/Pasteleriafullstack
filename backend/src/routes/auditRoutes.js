const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Solo admin/superadmin
router.get('/', authMiddleware, roleMiddleware(['ADMIN', 'Administrador', 'SUPER_ADMIN', 'OWNER']), auditController.getAuditLogs);
router.get('/monitor', authMiddleware, roleMiddleware(['SUPER_ADMIN', 'OWNER', 'ADMIN']), auditController.getMonitorDashboard);

module.exports = router;
