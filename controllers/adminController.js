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
