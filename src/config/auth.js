module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    
    req.flash('error_msg', 'Please log in to view that resource');
    req.session.returnTo = req.originalUrl; 
    res.redirect('/login');
  },
  forwardAuthenticated: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    
    res.redirect('/diary?id=1');      
  }
};