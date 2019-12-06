const db = require('../models');
const Sequelize = require('sequelize');
const User = db.User;
const Tweet = db.Tweet;
const Reply = db.Reply;
const Like = db.Like;
const Followship = db.Followship;
const Op = Sequelize.Op;

const tweetsController = {
  getTweets: async (req, res) => {
    let isFollowed = [];
    let isLike = [];
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
      const users = await User.findAll({
        limit: 10,
        order: [['followerCounts', 'DESC']]
      });

      const usersData = await users.map(r => ({
        id: r.dataValues.id,
        name: r.dataValues.name,
        avatar: r.dataValues.avatar
          ? r.dataValues.avatar
          : 'https://via.placeholder.com/300',
        introduction: r.dataValues.introduction || '',
        isAdmin: r.dataValues.isAdmin,
        followerCounts: r.dataValues.followerCounts
      }));

      // popular sidebar data
      const followLists = res.locals.user.dataValues.Followings;
      if (followLists) {
        followLists.map(user => isFollowed.push(user.dataValues.id));
      }

      // get all likeTweets in array
      if (res.locals.user.dataValues.LikedTweets) {
        res.locals.user.dataValues.LikedTweets.map(tweet => {
          return isLike.push(tweet.dataValues.id);
        });
      }

      return res.render('tweets', {
        tweets: data,
        users: usersData,
        localUser: res.locals.user.dataValues,
        isFollowed,
        isLike
      });
    } catch (e) {
      return res.status(400).render('404');
    }
  },
  addTweet: async (req, res) => {
    const { description } = req.body;
    if (!description) {
      console.log('check');
      req.flash('error_messages', '字數需大於0');
      return res.redirect('back');
    }
    if (description.length > 140) {
      req.flash('error_messages', '字數需低於140');
      return res.redirect('back');
    }

    try {
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
    let isLike = [];
    let isFollowed = [];
    try {
      // find tweet data
      const tweet = await Tweet.findOne({
        where: {
          id: req.params.tweet_id
        },
        include: { model: User }
      }).then(d => d);

      if (!tweet) {
        req.flash('error_messages', 'tweet不存在');
        return res.redirect('back');
      }
      const currentUser = Number(tweet.UserId);
      // reply
      const replies = await Reply.findAll({
        where: {
          TweetId: req.params.tweet_id
        },
        include: [{ model: User }, { model: Tweet }]
      }).then(d => d);
      const replyData = await replies.map(r => ({
        ...r.dataValues,
        User: {
          id: r.User.dataValues.id,
          name: r.User.dataValues.name,
          avatar: r.User.dataValues.avatar
            ? r.User.dataValues.avatar
            : 'https://i.imgur.com/ZJIb6zp.png',
          isAdmin: r.User.dataValues.isAdmin
        },
        Tweet: {
          id: r.Tweet.dataValues.id,
          likeCounts: r.Tweet.dataValues.likeCounts
        }
      }));

      // find sideNav data
      const user = await User.findOne({
        where: {
          id: currentUser
        },
        include: { model: Tweet }
      }).then(d => d);

      const userTweets = await user.Tweets.map(r => ({
        ...r.dataValues
      }));
      const totalLikes = await Like.findAll({
        where: {
          UserId: currentUser
        }
      }).then(d => d);
      const totalFollowings = await Followship.findAll({
        where: {
          followerId: currentUser
        }
      }).then(d => d);
      const totalFollowers = await Followship.findAll({
        where: {
          followingId: currentUser
        }
      }).then(d => d);

      const followLists = res.locals.user.dataValues.Followings;
      if (followLists) {
        followLists.map(user => isFollowed.push(user.dataValues.id));
      }

      if (!user) {
        return res.redirect('back');
      }

      // check if is Current User
      if (req.user) {
        req.user.id === currentUser
          ? (isCurrentUser = true)
          : (isCurrentUser = false);
      }
      // get all likeTweets in array
      if (res.locals.user.dataValues.LikedTweets) {
        res.locals.user.dataValues.LikedTweets.map(tweet => {
          return isLike.push(tweet.dataValues.id);
        });
      }

      return res.render('reply', {
        tweet,
        replies: replyData,
        user,
        isCurrentUser,
        currentUser,
        userTweets,
        totalLikes,
        totalFollowers,
        totalFollowings,
        isFollowed,
        localUser: res.locals.user.dataValues,
        isLike
      });
    } catch (e) {
      return res.status(400).render('404');
    }
  },
  addReply: async (req, res) => {
    const { comment } = req.body;
    try {
      if (!comment || comment.length === 0) {
        req.flash('error_messages', '字數需大於0');
        return res.redirect('back');
      }
      if (comment.length > 140) {
        req.flash('error_messages', '字數需低於140');
        return res.redirect('back');
      }

      const reply = await Reply.create({
        UserId: res.locals.user.dataValues.id,
        TweetId: req.params.tweet_id,
        comment
      });
      await reply.save();
      const tweet = await Tweet.findByPk(reply.TweetId);
      tweet.increment('replyCounts');
      return res.redirect('back');
    } catch (e) {
      return res.status(400).render('404');
    }
  }
};

module.exports = tweetsController;
