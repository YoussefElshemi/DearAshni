const express = require('express');
const cors = require('cors');
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const favicon = require('serve-favicon');

const app = express();

require('./config/passport')(passport);
const { port, secret } = require('./config/config');

app.set('views', __dirname + '/views');
app.use(favicon(__dirname + '/views/imgs/favicon.png'));
app.use('/static', express.static(__dirname + '/views/static'));

app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret,
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.alert_msg = req.flash('alert_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', require('./routes/index.js'));
app.use('/', require('./routes/users.js'));
app.use('/diary', require('./routes/diary.js'));
app.use('/calendar', require('./routes/calendar.js'));
app.use('/tasks', require('./routes/tasks.js'));

app.get('*', (req, res) => {
  res.render('error', { pageName: 'error', user: req.user });
});

app.listen(port, console.log(`Server running on port: ${port}`));