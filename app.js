const express = require('express');
const path = require('path');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const Handlebars = require('handlebars');
const H = require('just-handlebars-helpers');
const helpers = require('./_helpers');

const app = express();
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const passport = require('./config/passport');

app.engine(
  'handlebars',
  handlebars({
    defaultLayout: 'main',
    helpers: require('./config/handlebars-helpers'),
    partialsDir: [path.join(__dirname, 'views/share')]
  })
);
app.set('view engine', 'handlebars');
app.use('/upload', express.static(__dirname + '/upload'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
// setup passport
app.use(passport.initialize());
app.use(passport.session());
// setup flash message
app.use(flash());
// use helpers.getUser(req) to replace req.user
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages');
  res.locals.error_messages = req.flash('error_messages');
  res.locals.user = helpers.getUser(req);
  next();
});
app.use(methodOverride('_method'));
app.use(express.static('public'));
H.registerHelpers(Handlebars);

// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
require('./routes')(app);

module.exports = app;
