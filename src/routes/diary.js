const express = require('express');
const moment = require('moment');
const Page = require('../models/page');
const { ensureAuthenticated } = require('../config/auth');

const router = express.Router();

router.get('/', ensureAuthenticated, (req, res) => {
  const { id } = req.query;
  if (!id || (id && isNaN(id))) {
    res.redirect('/diary?id=1');
  } else {
    Page.find({ author: req.user.id }).then(pages => {
      let paginated = [];
      if (pages.length) {
        while (pages.length > 0) paginated.push(pages.splice(0, 12));
        if (Number(id) > paginated.length || Number(id) <= 0) {
          res.redirect('/diary?id=1');
        } else {
          pages = paginated.splice(Number(id) - 1, 1)[0];
          res.render('diary', {
            pageName: 'diary',
            user: req.user,
            pages,
            paginated,
            currentPage: Number(id)
          });
        }
      } else {
        res.render('diary', {
          pageName: 'diary',
          user: req.user,
          pages,
          paginated,
          currentPage: Number(id)
        });
      }
    }).catch(() => {
      res.render('diary', {
        pageName: 'diary',
        user: req.user,
        pages: [],
        paginated: [],
        currentPage: 1
      })
      res.redirect('/register');
    });
  }
});

router.post('/delete', ensureAuthenticated, (req, res) => {
  Page.findById(req.body.id).then(foundPage => {
    if (foundPage && foundPage.author === req.user.id) {
      Page.findByIdAndDelete(req.body.id).then(() => {
        req.flash('success_msg', 'Successfully deleted this diary page');
        res.redirect('/diary?id=1');
      }).catch(() => {
        res.redirect('/diary?id=1');
      });
    }
  }).catch(() => {
    res.redirect('/diary?id=1');
  });
});

router.get('/new', ensureAuthenticated, (req, res) => {
  const today = moment().startOf('day');
  
  Page.findOne({
    author: req.user.id,
    createdAt: {
      $gte: today.toDate(),
      $lt: moment(today).endOf('day').toDate()
    }
  }).then(foundPage => {
    if (!foundPage) {
      const page = new Page({
        author: req.user.id,
        text: '',
        weather: '',
        mood: ''
      });
    
      page.save().then(createdPage => {
        res.redirect(`/diary/${createdPage.id}`);
      }).catch(() => {
        res.redirect('/diary?id=1');
      });
    } else {
      req.flash('alert_msg', 'You already have a page for today, so we\'ve gone ahead and loaded it up for you');
      res.redirect(`/diary/${foundPage.id}`);
    }
  }).catch(() => {
    const page = new Page({
      author: req.user.id,
      text: '',
      weather: '',
      mood: ''
    });
  
    page.save().then(createdPage => {
      res.redirect(`/diary/${createdPage.id}`);
    }).catch(() => {
      res.redirect('/diary?id=1');
    });
  });
});

router.get('/:id', ensureAuthenticated, (req, res) => {
  Page.find({ author: req.user.id }).sort( { datefield: 1 } ).then(pages => {
    pages = pages.map(c => c.id);
    const currentPage = pages.findIndex(c => c === req.params.id);
    Page.findById(req.params.id).then(page => {
      if (page && page.author === req.user.id) {
        res.render('page', { 
          user: req.user,
          pageName: 'pages',
          page, 
          previous: pages[currentPage - 1], 
          next: pages[currentPage + 1]
        });
      } else {
        res.redirect('/diary?id=1');
      }
    }).catch(() => {
      res.redirect('/diary?id=1');
    });
  }).catch(() => {
    res.redirect('/diary?id=1');
  });
  });
  

router.post('/:id', ensureAuthenticated, (req, res) => {
  Page.findById(req.params.id).then(page => {
    if (page && page.author === req.user.id) {
      const { text, weather, mood } = req.body;
      page.text = text;
      page.weather = weather;
      page.mood = mood;

      page.save().then(() => {
        req.flash('success_msg', 'Successfully saved this diary page');
        res.redirect(`/diary/${req.params.id}`);
      }).catch(() => {
        res.redirect('/diary?id=1');
      });
    }
  }).catch(() => {
    res.redirect('/diary?id=1');
  });
});

module.exports = router;