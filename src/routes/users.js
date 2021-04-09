const express = require('express');
const passport = require('passport');

const User = require('../models/user');
const { forwardAuthenticated } = require('../config/auth');

const router = express.Router();

router.get('/register', forwardAuthenticated, (req, res) => {
  res.render('register', { errors: { } });
});

router.post('/register', (req, res) => {
  const errors = {};
  const { username, password, password2 } =  req.body;

  if (!username || !password || !password2) {
    errors['all'] = 'Please enter all fields';
  }

  if (password.length < 6) {
    errors['password'] = 'Password must be at least 6 characters' ;
  }

  if (password != password2) {
    errors['password2'] = 'Passwords do not match';
  }

  User.findOne({ username }).then(user => {
    if (user) {
      errors['username'] = 'Sorry, that username\'s taken. Try another?';
    }

    if (Object.keys(errors).length > 0) {
      res.render('register', {
        errors,
        username,
        password,
        password2
      });
    } else {
      const newUser = new User({
        username
      });

      newUser.setPassword(password);
      newUser.save().then(() => {
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/login');
      }).catch(() => {
        req.flash('error_msg', 'Something went wrong, please try again');
        res.redirect('/register');
      });
    }
  }).catch(() => {
    req.flash('error_msg', 'Something went wrong, please try again');
    res.redirect('/register');
  });
});

router.get('/login', forwardAuthenticated, (req, res) => {
  res.render('login');
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: req.session.returnTo || '/diary',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);

  delete req.session.returnTo;
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});

module.exports = router;