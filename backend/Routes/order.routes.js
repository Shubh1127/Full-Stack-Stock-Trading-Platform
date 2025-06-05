const express=require('express');
const router=express.Router();
const OrderController=require('../controllers/order.controller');
const authMiddleware=require('../middleware/authMiddleware');

router.post('/buystock', authMiddleware, OrderController.buyStock);
router.post('/sellstock', authMiddleware, OrderController.sellStock);
router.get('/sellstock', authMiddleware, OrderController.sellStockByOrderId);
router.get('/allpositions', authMiddleware, OrderController.AllPositions);
router.get('/allorders/:userId', authMiddleware, OrderController.AllOrdersbyUserId);

module.exports=router;