import express from 'express';
import {
    getOperations,
    getOperation,
    createOperation,
    validateOperation,
    getOperationTypes,
    initOperationTypes
} from '../controllers/operationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Public route for init (for hackathon ease)
router.post('/init-types', initOperationTypes);

router.use(authenticateToken);

router.get('/types', getOperationTypes);
router.get('/', getOperations);
router.get('/:id', getOperation);
router.post('/', createOperation);
router.post('/:id/validate', validateOperation);

export default router;
