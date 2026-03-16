const express = require('express');
const router = express.Router();
const productionController = require('../controllers/productionController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', productionController.getDailyProduction);
router.patch('/:id/status', productionController.updateStatus);

module.exports = router;
