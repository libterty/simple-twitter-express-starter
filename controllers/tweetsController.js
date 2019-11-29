const db = require('../models');
const User = db.User;
const Tweet = db.Tweet;

const tweetsController = {
  getTweets: async (req, res) => {
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
        introduction: r.User.dataValues.introduction
          ? r.User.dataValues.introduction.substring(0, 50)
          : '',
        isAdmin: r.User.dataValues.isAdmin
      }
    }));
    const users = await User.findAll({ limit: 10 })
    const usersData = await users.map(r => ({
      id: r.dataValues.id,
      name: r.dataValues.name,

      avatar: r.dataValues.avatar
        ? r.dataValues.avatar
        : 'https://via.placeholder.com/300',
      introduction: r.dataValues.introduction
        ? r.dataValues.introduction.substring(0, 50)
        : '',
      isAdmin: r.dataValues.isAdmin
    }))

    return res.render('tweets', {
      tweets: data,
      users: usersData
    });
  }
};

module.exports = tweetsController;
