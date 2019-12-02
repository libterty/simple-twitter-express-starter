'use strict';
module.exports = (sequelize, DataTypes) => {
  // Sequelize issue Not returning id on create #7689
  // Therefore adding autoIncrement on ID
  const Like = sequelize.define(
    'Like',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      UserId: DataTypes.INTEGER,
      TweetId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Tweets',
          key: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }
    },
    {}
  );
  Like.associate = function(models) {
    Like.belongsTo(models.Tweet);
    Like.belongsTo(models.User);
  };
  return Like;
};
