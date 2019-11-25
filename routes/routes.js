const express = require('express');
const router = express.Router();

router.get('/signup', userController.signUpPage);
router.post('/signup', userController.signUp);

module.exports = router;
