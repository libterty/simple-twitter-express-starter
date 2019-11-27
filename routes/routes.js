const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const userController = require('../controllers/userController.js');

// authentication function
const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/signin');
};

const authenticatedUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.id == req.params.id) {
      return next();
    }
    req.flash('error_messages', 'Bad Request!');
    return res.redirect(`/users/${req.user.id}/tweets`);
  }
  res.redirect('/signin');
};

const authenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin) {
      return next();
    }
    return res.redirect('/');
  }
  res.redirect('/signin');
};

// TODO: root
router.get('/', authenticated, (req, res) => res.redirect(302, '/tweets'));

// user signIn, register, logout
router.get('/signup', userController.signUpPage);
router.post('/signup', userController.signUp);
router.get('/signin', userController.signInPage);
router.post(
  '/signin',
  passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
  }),
  userController.signIn
);
router.get('/logout', userController.logout);

module.exports = router;
