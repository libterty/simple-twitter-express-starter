const { User, Tweet, Reply, Like } = require('../models')

const adminController = {
  // 瀏覽所有 tweets
  getTweets: (req, res) => {

    const query = {
      include: [
        { model: User, attributes: ['name'] },
        { model: Reply, attributes: ['id', 'comment'] }
      ],
      order: [['id', 'ASC']],
      limit: 10
    }

    Tweet
      .findAll(query)
      .then(tweets => res.render('admin/tweets', { tweets }))
      .catch(err => res.status(500).json(err.message))
  },

  // 刪除一筆 tweet
  deleteTweet: (req, res) => {
    const deletedTweetId = req.params.id
    const queries = [
      Tweet.findByPk(deletedTweetId),
      Reply.findAll({ where: { TweetId: deletedTweetId } }),
      Like.findAll({ where: { TweetId: deletedTweetId } })
    ]

    Promise
      .all(queries)
      .then(results => {

        const [tweet, replies, likes] = results
        const deletedReplies = replies.map(reply => reply.destroy())
        const deletedLikes = likes.map(like => like.destroy())

        return Promise.all([tweet.destroy(), ...deletedReplies, ...deletedLikes])
      })
      .then(() => {
        req.flash('success_messages', '成功刪除 tweet')
        return res.redirect('/admin/tweets')
      })
      .catch(err => res.status(500).json(err.message))

  },
