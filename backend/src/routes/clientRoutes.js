const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middlewaress/authMiddleware');

router.use(authMiddleware);

// Define las rutas para la colección de clientes
router.route('/')
    .get(authMiddleware, clientController.getAllClients)   // GET /api/clients
    .post(authMiddleware, clientController.createClient);  // POST /api/clients

module.exports = router;