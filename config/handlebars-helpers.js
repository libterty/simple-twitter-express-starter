'use strict';
const moment = require('moment');

module.exports = {
  moment: function(a) {
    return moment(a).fromNow();
  },
  replace: function(a) {
    if (!a) return 'New User';
    return a.replace(/@example.com/g, '');
  },
  postLength: function(a) {
    return a.length;
  },
  reduceLength: function(a) {
    return a.slice(0, 50);
  }
};
