'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      email: {
        type: DataTypes.STRING,
        unique: true
      },
      password: DataTypes.STRING,
      name: {
        type: DataTypes.STRING,
        unique: true
      },
      avatar: DataTypes.STRING,
      introduction: DataTypes.TEXT,
      role: DataTypes.STRING,
      isAdmin: DataTypes.BOOLEAN,
      followerCounts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0
        }
      }
    },
    {}
  );
  User.associate = function (models) {
    User.hasMany(models.Tweet);
    User.hasMany(models.Reply);
    User.hasMany(models.Like);
    User.belongsToMany(models.Tweet, {
      through: models.Like,
      foreignKey: 'UserId',
      as: 'LikedTweets'
    });
    User.belongsToMany(models.User, {
      through: models.Followship,
      foreignKey: 'followingId',
      as: 'Followers'
    });
    User.belongsToMany(models.User, {
      through: models.Followship,
      foreignKey: 'followerId',
      as: 'Followings'
    });
  };
  return User;
};
