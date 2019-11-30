const db = require('../models');
const User = db.User;
const Tweet = db.Tweet;
const Reply = db.Reply;

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
        users: usersData
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

      const tweet = await Tweet.create({
        UserId: res.locals.user.dataValues.id,
        description
      });

      await tweet.save();
      return res.redirect('/tweets');
    } catch (e) {
      return res.status(400).render('404');
    }
  },
  getReplyTweets: async (req, res) => {
    let isCurrentUser;
    try {
      const tweet = await Tweet.findOne({
        where: {
          id: req.params.tweet_id
        },
        include: { model: Reply }
      })

      if (!tweet) {
        req.flash('error_messages', 'tweet不存在');
        return res.redirect('back');
      }
      const user = await User.findOne({
        where: {
          id: tweet.UserId
        },
        include: { model: Tweet }
      })
      const userTweets = await user.Tweets.map(r => ({
        ...r.dataValues
      }))

      if (!user) { return res.redirect('back'); }
      // check if is Current User
      if (req.user) {
        req.user.id === Number(tweet.UserId)
          ? (isCurrentUser = true)
          : (isCurrentUser = false);
      }
      return res.render('reply', { tweet, user, isCurrentUser, userTweets })
    } catch (e) {
      console.log(e)
      res.status(400).render('404')
    }


  }
};

module.exports = tweetsController;
