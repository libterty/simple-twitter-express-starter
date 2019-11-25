const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');

router.get('/signup', userController.signUpPage);
router.post('/signup', userController.signUp);

module.exports = router;
