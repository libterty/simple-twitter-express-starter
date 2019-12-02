'use strict';
const moment = require('moment');

module.exports = {
  moment: function (a) {
    return moment(a).fromNow();
  },
  replace: function (a) {
    if (!a) return 'New User';
    return a.replace(/@example.com/g, '');
  },
  postLength: function (a) {
    if (!a) return 0;
    return a.length;
  },
  reduceLength: function (a) {
    return a.substring(0, 50);
  },
  remainLength: function (a) {
    return a.substring(50);
  },
  /**
   * @param {array} tweetId
   * @param {number} tweetId
   * @return {Boolean}
   */
  isLikedTweets: function (arr, id) {
    if (arr.indexOf(id) !== -1) {
      // already add like
      return true;
    } else {
      // unlike
      return false;
    }
  },
  /**
   * @param {array} followingid
   * @param {number} params.id
   * @return {Boolean}
   */
  isFollowingUser: function (arr, id) {
    if (arr.indexOf(id) !== -1) {
      // already add like
      return true;
    } else {
      // unlike
      return false;
    }
  },
  compare: function (a, b) {
    if (a == b) {
      return true
    } else {
      return false
    }
  }

};
