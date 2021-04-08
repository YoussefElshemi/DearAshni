const express = require('express');
const { forwardAuthenticated } = require('../config/auth');

const router = express.Router();

router.get('/', forwardAuthenticated, (req, res) => {
  res.render('welcome', { pageName: 'welcome' });
});

module.exports = router;