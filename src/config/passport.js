const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');


module.exports = passport => {
  passport.use(new LocalStrategy(
  (username, password, done) => {
    User.findOne({ username }).then(user => {
      if (!user) return done(null, false, { message: 'Invalid username or password' });
      return user.validPassword(password) ? done(null, user) : done(null, false, { message: 'Invalid username or password'});
    }).catch(err => {
      return done(err);
    });
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
      done(null, user);
    }).catch(err => {
      done(err, null);
    });
  });
};