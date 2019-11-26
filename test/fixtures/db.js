const db = require('../../models/'),
  User = db.User;
const bcrypt = require('bcrypt-nodejs');

const adminOne = {
    name: 'root',
    email: 'root@example.com',
    password: '12345678',
    role: 'admin'
  },
  userOne = {
    name: 'userOne',
    email: 'user1@example.com',
    password: '12345678',
    role: 'user'
  };

const setupDatabase = async () => {
  await User.destroy({ where: {}, truncate: true });
  await new User({
    name: adminOne.name,
    email: adminOne.email,
    password: bcrypt.hashSync(adminOne.password, bcrypt.genSaltSync(10), null)
  }).save();
  await new User({
    name: userOne.name,
    email: userOne.email,
    password: bcrypt.hashSync(userOne.password, bcrypt.genSaltSync(10), null)
  }).save();
};

module.exports = {
  adminOne,
  userOne,
  setupDatabase
};
