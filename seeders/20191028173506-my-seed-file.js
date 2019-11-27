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
          avatar: faker.image.imageUrl(),
          introduction: faker.lorem.text(),
          role: 'Admin'
        },
        {
          email: 'user1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          isAdmin: false,
          name: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
          avatar: faker.image.imageUrl(),
          introduction: faker.lorem.text(),
          role: 'User'
        },
        {
          email: 'user2@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          isAdmin: false,
          name: 'user2',
          createdAt: new Date(),
          updatedAt: new Date(),
          avatar: faker.image.imageUrl(),
          introduction: faker.lorem.text(),
          role: 'User'
        }
      ],
      {}
    );
    return queryInterface.bulkInsert(
      'Tweets',
      Array.from({ length: 50 }).map(d => ({
        description: faker.lorem.text(),
        createdAt: new Date(),
        updatedAt: new Date(),
        UserId: Math.floor(Math.random() * 3) + 1
      })),
      {}
    );
  },
  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Users', null, {});
    return queryInterface.bulkDelete('Tweets', null, {});
  }
};
