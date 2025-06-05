
const express=require('express');
const router=express.Router();
const HoldingController=require('../controllers/Holding.controller');
const authMiddleware=require('../middleware/authMiddleware');


router.get('/allholdings', authMiddleware, HoldingController.AllHoldings);

router.get('/holdings/:userId',authMiddleware, HoldingController.HoldingsByUserId);

module.exports=router;