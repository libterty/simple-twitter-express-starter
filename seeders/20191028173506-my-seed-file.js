'use strict';
const bcrypt = require('bcrypt-nodejs');
const faker = require('faker');

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.bulkInsert(
      'Users',
      [
        {
          email: 'root@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          isAdmin: true,
          name: 'root',
          createdAt: new Date(),
          updatedAt: new Date(),
          avatar: 'https://i.imgur.com/ZJIb6zp.png',
          introduction: faker.lorem.text(),
          role: 'Admin',
          followerCounts: 0
        },
        {
          email: 'user1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          isAdmin: false,
          name: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
          avatar: 'https://i.imgur.com/ZJIb6zp.png',
          introduction: faker.lorem.text(),
          role: 'User',
          followerCounts: 0
        },
        {
          email: 'user2@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          isAdmin: false,
          name: 'user2',
          createdAt: new Date(),
          updatedAt: new Date(),
          avatar: 'https://i.imgur.com/ZJIb6zp.png',
          introduction: faker.lorem.text(),
          role: 'User',
          followerCounts: 0
        }
      ],
      {}
    );
    queryInterface.bulkInsert(
      'Tweets',
      Array.from({ length: 50 }).map(d => ({
        description: faker.lorem.words(15),
        createdAt: new Date(),
        updatedAt: new Date(),
        UserId: Math.floor(Math.random() * 3) + 1,
        likeCounts: 0,
        replyCounts: 0
      })),
      {}
    );
    return queryInterface.bulkInsert(
      'Replies',
      Array.from({ length: 50 }).map(d => ({
        comment: faker.lorem.words(15),
        createdAt: new Date(),
        updatedAt: new Date(),
        TweetId: Math.floor(Math.random() * 3) + 1,
        UserId: Math.floor(Math.random() * 3) + 1
      })),
      {}
    );
  },
  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Users', null, {});
    queryInterface.bulkDelete('Tweets', null, {});
    return queryInterface.bulkDelete('Replies', null, {});
  }
};
