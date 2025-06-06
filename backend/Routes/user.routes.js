const express=require('express');
const router=express.Router();
const UserController=require('../controllers/user.controller')
const authMiddleware=require('../middleware/authMiddleware');
router.post('/signup',UserController.register);
router.post('/login',UserController.login);
router.get('/logout', UserController.logout);

module.exports=router;