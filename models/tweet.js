'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tweet = sequelize.define(
    'Tweet',
    {
      description: {
        type: DataTypes.STRING,
        validate: {
          len: [1, 140]
        }
      },
      UserId: DataTypes.INTEGER,
      likeCounts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    },
    {}
  );
  Tweet.associate = function(models) {
    Tweet.belongsTo(models.User);
    Tweet.hasMany(models.Reply);
    Tweet.hasMany(models.Like);
    Tweet.belongsToMany(models.User, {
      through: models.Like,
      foreignKey: 'TweetId',
      as: 'LikedUsers'
    });
  };
  return Tweet;
};
