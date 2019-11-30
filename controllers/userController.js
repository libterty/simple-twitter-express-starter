const bcrypt = require('bcrypt-nodejs');
const imgur = require('imgur-node-api');
const db = require('../models');
const User = db.User;
const Tweet = db.Tweet;
const Like = db.Like;
const Followship = db.Followship;
const IMGUR_CLIENT_ID = process.env.imgur_id;

const userController = {
  // 登錄頁面VIEW
  signUpPage: (req, res) => {
    return res.render('signup');
  },
  // 登錄頁面POST請求
  signUp: async (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', '請填入使用者名稱！');
      return res.redirect('/signup');
    }
    if (!req.body.email) {
      req.flash('error_messages', '請填入信箱！');
      return res.redirect('/signup');
    }
    if (!req.body.password || !req.body.passwordCheck) {
      req.flash('error_messages', '請填入密碼或認證密碼！');
      return res.redirect('/signup');
    }
    if (req.body.password.length < 8) {
      req.flash('error_messages', '密碼強度太弱，密碼長度需大等於8字元！');
      return res.redirect('/signup');
    }
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！');
      return res.redirect('/signup');
    }
    // 確認使用者名稱有沒有被使用過
    const isName = await User.findOne({
      where: { name: req.body.name }
    }).then(name => {
      return name;
    });

    User.findOne({ where: { email: req.body.email } }).then(user => {
      if (user) {
        req.flash('error_messages', '信箱重複！');
        return res.redirect('/signup');
      }
      if (isName) {
        req.flash('error_messages', '使用者名稱重複！');
        return res.redirect('/signup');
      }
      User.create({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(
          req.body.password,
          bcrypt.genSaltSync(10),
          null
        )
      }).then(() => {
        req.flash('success_messages', '成功註冊帳號！');
        return res.redirect('/signin');
      });
    });
  },
  // render 登入頁面
  signInPage: (req, res) => {
    return res.render('signin');
  },
  // Post 登入功能
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入!');
    req.user.isAdmin ? res.redirect('/admin/tweets') : res.redirect('/tweets');
  },
  // Get 登出頁面
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！');
    req.logout();
    res.redirect('/signin');
  },
  // Get /users/:id/tweets頁面
  getDashboard: (req, res) => {
    let isCurrentUser;
    let isLike = [];
    let isFollowed = [];
    let currentUser = Number(req.params.id);
    return User.findByPk(req.params.id).then(user => {
      if (user) {
        Tweet.findAll().then(tweets => {
          let userTweets = [];
          // filtering the equivalent user
          tweets.map(tweet => {
            if (tweet.dataValues.UserId === Number(req.params.id)) {
              userTweets.push(tweet.dataValues);
            }
          });
          // check if is Current User
          if (req.user) {
            req.user.id === Number(req.params.id)
              ? (isCurrentUser = true)
              : (isCurrentUser = false);
          }
          // sort with Date
          userTweets = userTweets.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          // get all likeTweets in array
          res.locals.user.dataValues.LikedTweets.map(tweet =>
            isLike.push(tweet.dataValues.id)
          );
          // get all following Users in an array
          const followLists = res.locals.user.dataValues.Followings;
          followLists.map(user => {
            isFollowed.push(user.dataValues.id);
          });
          const totalLikes = res.locals.user.dataValues.LikedTweets.length;
          const totalFollowers = res.locals.user.dataValues.Followers.length;
          const totalFollowings = res.locals.user.dataValues.Followings.length;

          console.log(res.locals.user.dataValues);

          return res.render('dashboard', {
            user,
            userTweets,
            isCurrentUser,
            isLike,
            isFollowed,
            currentUser,
            totalLikes,
            totalFollowers,
            totalFollowings
          });
        });
      } else {
        return res.render('404');
      }
    });
  },
  // Get /users/:id/edit頁面
  getUser: (req, res) => {
    return User.findByPk(req.params.id).then(user => {
      return user ? res.render('usersEdit', { user }) : res.render('404');
    });
  },
  // Post /users/:id/edit功能
  putUser: async (req, res) => {
    // 檢查是否有名稱
    if (!req.body.name) {
      req.flash('error_messages', '請填入修改的名稱！！');
      return res.redirect('back');
    }
    // 檢查是否有自介
    if (!req.body.introduction) {
      req.flash('error_messages', '請填入修改的自我介紹！！');
      return res.redirect('back');
    }

    const isDuplicateName = await User.findAll({
      where: { name: req.body.name }
    }).then(user => {
      return user;
    });
    // 檢查是否有重複使用者名稱
    if (isDuplicateName.length !== 0) {
      req.flash('error_messages', '此名稱已經有人使用！！');
      return res.redirect('back');
    }

    const { file } = req;
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        if (err) console.log('Upload Img Error: ', err.message);
        // Transaction需要處理commit加rollback確保原子性
        return User.findByPk(req.params.id)
          .then(user => {
            user
              .update({
                name: req.body.name,
                introduction: req.body.introduction,
                avatar: file ? img.data.link : user.avatar
              })
              .then(user => {
                req.flash('success_messages', '成功修改資料！');
                return res.render('usersEdit', { user });
              })
              .catch(err => {
                req.flash('error_messages', err.message);
                return res.redirect(`/users/${req.params.id}/edit`);
              });
          })
          .catch(err => {
            req.flash('error_messages', err.message);
            return res.redirect(`/users/${req.params.id}/edit`);
          });
      });
    } else {
      // Transaction需要處理commit加rollback確保原子性
      return User.findByPk(req.params.id)
        .then(user => {
          user
            .update({
              name: req.body.name,
              introduction: req.body.introduction,
              avatar: user.avatar
            })
            .then(user => {
              req.flash('success_messages', '成功修改資料！');
              return res.render('usersEdit', { user });
            })
            .catch(err => {
              req.flash('error_messages', err.message);
              return res.redirect(`/users/${req.params.id}/edit`);
            });
        })
        .catch(err => {
          req.flash('error_messages', err.message);
          return res.redirect(`/users/${req.params.id}/edit`);
        });
    }
  },

  addLike: async (req, res) => {
    // Prevent Injection Attack
    const isLiked = await Like.findAll({
      where: {
        UserId: res.locals.user.dataValues.id,
        TweetId: req.params.id
      }
    }).then(like => {
      return like;
    });
    if (isLiked.length !== 0) {
      req.flash('error_messages', 'Bad Request!');
      return res.redirect('back');
    } else {
      // Transaction需要處理commit加rollback確保原子性
      return Like.create({
        UserId: res.locals.user.dataValues.id,
        TweetId: req.params.id
      })
        .then(() => {
          Tweet.findByPk(req.params.id)
            .then(tweet => {
              // Transaction需要處理高併發
              tweet
                .increment('likeCounts')
                .then(tweet => {
                  req.flash('success_messages', '新增你的按讚！！');
                  return res.redirect('back');
                })
                .catch(err => {
                  req.flash('error_messages', err.message);
                  return res.redirect('back');
                });
            })
            .catch(err => {
              req.flash('error_messages', err.message);
              return res.redirect('back');
            });
        })
        .catch(err => {
          req.flash('error_messages', err.message);
          return res.redirect('back');
        });
    }
  },

  removeLike: async (req, res) => {
    // Prevent Injection Attack
    const isRemoved = await Like.findAll({
      where: {
        UserId: res.locals.user.dataValues.id,
        TweetId: req.params.id
      }
    }).then(like => {
      return like;
    });

    if (isRemoved.length === 0) {
      req.flash('error_messages', 'Bad Request!');
      return res.redirect('back');
    } else {
      // Transaction需要處理commit加rollback確保原子性
      return Like.findOne({
        where: {
          UserId: res.locals.user.dataValues.id,
          TweetId: req.params.id
        }
      })
        .then(like => {
          like
            .destroy()
            .then(() => {
              // Transaction需要處理高併發
              Tweet.findByPk(req.params.id)
                .then(tweet => {
                  tweet
                    .decrement('likeCounts')
                    .then(() => {
                      req.flash('success_messages', '移除你的按讚！！');
                      return res.redirect('back');
                    })
                    .catch(err => {
                      req.flash('error_messages', err.message);
                      return res.redirect('back');
                    });
                })
                .catch(err => {
                  req.flash('error_messages', err.message);
                  return res.redirect('back');
                });
            })
            .catch(err => {
              req.flash('error_messages', err.message);
              return res.redirect('back');
            });
        })
        .catch(err => {
          req.flash('error_messages', err.message);
          return res.redirect('back');
        });
    }
  },

  addFollowing: async (req, res) => {
    console.log('res.locals.user.dataValues.id', res.locals.user.dataValues.id);
    console.log('req.params.followingId', req.params.followingId);
    if (res.locals.user.dataValues.id === Number(req.params.followingId)) {
      req.flash('error_messages', 'Bad Request!');
      return res.redirect('back');
    }

    // prevent injection attack
    const isFollowed = await Followship.findAll({
      where: {
        followerId: res.locals.user.dataValues.id,
        followingId: req.params.followingId
      }
    }).then(follow => {
      return follow;
    });

    if (isFollowed.length !== 0) {
      req.flash('error_messages', 'Bad Request!');
      return res.redirect('back');
    } else {
      return Followship.create({
        followerId: res.locals.user.dataValues.id,
        followingId: req.params.followingId
      })
        .then(() => {
          req.flash('success_messages', '新增追蹤！！');
          return res.redirect('back');
        })
        .catch(err => {
          req.flash('error_messages', err.message);
          return res.redirect('back');
        });
    }
  },

  removeFollowing: async (req, res) => {
    if (res.locals.user.dataValues.id === Number(req.params.followingId)) {
      req.flash('error_messages', 'Bad Request!');
      return res.redirect('back');
    }

    // prevent injection attack
    const isRemoved = await Followship.findAll({
      where: {
        followerId: res.locals.user.dataValues.id,
        followingId: req.params.followingId
      }
    }).then(follow => {
      return follow;
    });

    if (isRemoved.length === 0) {
      req.flash('error_messages', 'Bad Request!');
      return res.redirect('back');
    } else {
      return Followship.findOne({
        where: {
          followerId: res.locals.user.dataValues.id,
          followingId: req.params.followingId
        }
      }).then(followship => {
        followship
          .destroy()
          .then(() => {
            req.flash('success_messages', '移除追蹤！！');
            return res.redirect('back');
          })
          .catch(err => {
            req.flash('error_messages', err.message);
            return res.redirect('back');
          });
      });
    }
  }
};

module.exports = userController;
