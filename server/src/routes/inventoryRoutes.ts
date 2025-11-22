import express from 'express';
import { getStockLedger, getStockLevels } from '../controllers/inventoryController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken);

router.get('/ledger', getStockLedger);
router.get('/levels', getStockLevels);

export default router;
