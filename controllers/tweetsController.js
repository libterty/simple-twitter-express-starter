const db = require('../models');
const User = db.User;
const Tweet = db.Tweet;

const tweetsController = {
  // GET tweets
  getTweets: (req, res) => {
    return res.render('tweets');
  }
};

module.exports = tweetsController;
