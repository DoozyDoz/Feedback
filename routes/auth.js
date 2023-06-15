const express = require('express');
const router = express.Router();
const {
  register,
  login,
  preRegister,
  verifyEmail,
} = require('../controllers/auth');
router.post('/preregister', preRegister);
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);

module.exports = router;
