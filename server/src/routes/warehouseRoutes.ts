import express from 'express';
import { getWarehouses, createWarehouse, getLocations, createLocation } from '../controllers/warehouseController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken);

router.get('/warehouses', getWarehouses);
router.post('/warehouses', createWarehouse);

router.get('/locations', getLocations);
router.post('/locations', createLocation);

export default router;
