import express from 'express';
import { Register, Login, Logout, allitems, populeritems, scanitem, resetPassword } from '../controllers/Users.js';
import { verifyToken } from '../middleware/VerifyToken.js';
import { refershToken } from '../controllers/RefreshToken.js';

const router = express.Router();

router.post('/register', Register);
router.post('/login', Login);
router.get('/fruits', allitems);
router.get('/fruits/popular', populeritems);
router.get('/token', refershToken);
router.get('/detection', scanitem)
router.delete('/logout', Logout);
router.post('/resetPassword', resetPassword)


export default router;
