import express from 'express';
import { getUsers, Register, Login, Logout, allitems, populeritems } from '../controllers/Users.js';
import { verifyToken } from '../middleware/VerifyToken.js';
import { refershToken } from '../controllers/RefreshToken.js';

const router = express.Router();

router.get('/users', verifyToken, getUsers);
router.post('/register', Register);
router.post('/login', Login);
router.get('/fruits', allitems);
router.get('/fruits/popular', populeritems);
router.get('/token', refershToken);
router.delete('/logout', Logout);

export default router;