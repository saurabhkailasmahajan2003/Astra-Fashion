import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import {
  getDashboardSummary,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/admin.controller.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/summary', getDashboardSummary);
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

router.get('/products', getAdminProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

export default router;


