const db = require('../models');
const User = db.User;
const Tweet = db.Tweet;

const tweetsController = {
  getTweets: async (req, res) => {
    try {
      const tweets = await Tweet.findAndCountAll({
        order: [['updatedAt', 'DESC']],
        include: [User]
      });
      const data = await tweets.rows.map(r => ({
        ...r.dataValues,
        userId: r.User.dataValues.id,
        User: {
          id: r.User.dataValues.id,
          name: r.User.dataValues.name,
          avatar: r.User.dataValues.avatar
            ? r.User.dataValues.avatar
            : 'https://via.placeholder.com/300',
          isAdmin: r.User.dataValues.isAdmin
        }
      }));
      const users = await User.findAll({ limit: 10 });
      const usersData = await users.map(r => ({
        id: r.dataValues.id,
        name: r.dataValues.name,
        avatar: r.dataValues.avatar
          ? r.dataValues.avatar
          : 'https://via.placeholder.com/300',
        introduction: r.dataValues.introduction || '',
        isAdmin: r.dataValues.isAdmin
      }));

      return res.render('tweets', {
        tweets: data,
        users: usersData,
        localUser: res.locals.user.dataValues
      });
    } catch (e) {
      return res.status(400).render('404');
    }
  },
  addTweet: async (req, res) => {
    const { description } = req.body;

    try {
      if (!description) {
        req.flash('error_messages', '字數需大於0');
        return res.redirect('/');
      }
      if (description.length > 140) {
        req.flash('error_messages', '字數需低於140');
        return res.redirect('/');
      }
      console.log('locals', res.locals.user.id);

      const tweet = await Tweet.create({
        UserId: res.locals.user.id,
        description
      });

      await tweet.save();
      return res.redirect('/tweets');
    } catch (e) {
      return res.status(400).render('404');
    }
  }
};

module.exports = tweetsController;
