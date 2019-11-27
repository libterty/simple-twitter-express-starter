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
      UserId: DataTypes.INTEGER
    },
    {}
  );
  Tweet.associate = function(models) {
    Tweet.belongsTo(models.User);
  };
  return Tweet;
};
