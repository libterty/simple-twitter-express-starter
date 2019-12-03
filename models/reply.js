'use strict';
module.exports = (sequelize, DataTypes) => {
  const Reply = sequelize.define(
    'Reply',
    {
      UserId: DataTypes.INTEGER,
      TweetId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Tweets',
          key: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      },
      comment: {
        type: DataTypes.STRING,
        notNull: true,
        notEmpty: true
      }
    },
    {}
  );
  Reply.associate = function(models) {
    Reply.belongsTo(models.Tweet);
    Reply.belongsTo(models.User);
  };
  return Reply;
};
