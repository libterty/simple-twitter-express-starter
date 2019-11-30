const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'temp/' });
const passport = require('../config/passport');
const userController = require('../controllers/userController.js');
const tweetsController = require('../controllers/tweetsController.js');
const helpers = require('../_helpers');

// authentication function
const authenticated = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    return next();
  }
  res.redirect('/signin');
};

const authenticatedUser = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    // 因為ACC TDD的設定要改成res.locals.user...
    if (res.locals.user.dataValues.id == req.params.id) {
      return next();
    }
    req.flash('error_messages', 'Bad Request!');
    return res.redirect('back');
  }
  res.redirect('/signin');
};

const authenticatedAdmin = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    // 因為ACC TDD的設定要改成res.locals.user...
    if (res.locals.user.dataValues.isAdmin) {
      return next();
    }
    return res.redirect('/');
  }
  res.redirect('/signin');
};

// root
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
// Get user profile
router.get('/users/:id/tweets', authenticated, userController.getDashboard);
// Get edit user profile
router.get('/users/:id/edit', authenticatedUser, userController.getUser);
// post edit user profile
router.post(
  '/users/:id/edit',
  authenticatedUser,
  upload.single('avatar'),
  userController.putUser
);
// post like/unlike
router.post('/tweets/:id/like', authenticated, userController.addLike);
router.post('/tweets/:id/unlike', authenticated, userController.removeLike);

// tweets GET, POST
router.get('/tweets', authenticated, tweetsController.getTweets);
router.post('/tweets', authenticated, tweetsController.addTweet);
router.get(
  '/tweets/:tweet_id/replies',
  authenticated,
  tweetsController.getReplyTweets
);

// POST DELETE /followships/:id
router.post(
  '/followships/:followingId',
  authenticated,
  userController.addFollowing
);
router.delete(
  '/followships/:followingId',
  authenticated,
  userController.removeFollowing
);
module.exports = router;
