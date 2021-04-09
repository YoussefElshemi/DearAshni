const express = require('express');
const Event = require('../models/event');
const { ensureAuthenticated } = require('../config/auth');

const router = express.Router();

router.get('/', ensureAuthenticated, (req, res) => {
  res.render('calendar', {
    user: req.user,
    pageName: 'calendar'
  });
});

router.post('/new', ensureAuthenticated, (req, res) => {
  const { start, end, title, allDay } = req.body;
  
  if (!start || !end) {
    res.status(400).json({ message: 'Please highlight the dates for this event' });
  } else {
    if (!title) {
      res.status(400).json({ message: 'Please enter an event name' });
    } else {
      const event = new Event({
        author: req.user.id,
        title,
        start,
        end,
        allDay: allDay === 'true' ? true : false
      });

      event.save().then(() => {
        const eventJSON = { 
          id: event._id,
          start: event.start,
          end: event.end,
          title: event.title,
          allDay: event.allDay
        }

        res.status(200).json({ message: 'Successfully added event to your calendar', event: eventJSON });
      }).catch(() => {
        res.status(400).json({ message: 'Something wen\'t wrong, please try again' });
      });
    }
  } 
});

router.post('/delete', ensureAuthenticated, (req, res) => {
  if (!req.body.id) {
    res.status(400).json({ message: 'Please select an event to delete' });
  } else {
    Event.findById(req.body.id).then(foundEvent => {
      if (foundEvent && foundEvent.author === req.user.id) {
        Event.findByIdAndDelete(req.body.id).then(() => {
          const eventJSON = { 
            id: foundEvent._id,
            start: foundEvent.start,
            end: foundEvent.end,
            title: foundEvent.title
          }
          res.status(200).json({ message: 'Successfully deleted this event', event: eventJSON });
        }).catch(() => {
          res.status(400).json({ message: 'Something wen\'t wrong, please try again' });
        });
      }
    }).catch(() => {
      res.status(400).json({ message: 'Something wen\'t wrong, please try again' });
    });
  }
});

router.post('/update', ensureAuthenticated, (req, res) => {
  Event.findById(req.body.id).then(event => {
    if (event && event.author === req.user.id) {
      const { start, end, allDay } = req.body;
      event.start = start;
      event.end = end;
      event.allDay = allDay;

      event.save().then(() => {
        res.status(200);
      }).catch(() => {
        res.status(400);
      });
    }
  }).catch(() => {
    res.status(400);
  });
});

router.get('/query', ensureAuthenticated, (req, res) => {
  const { start, end } = req.query;
  Event.find({ 
    author: req.user.id,
    start: {
      $gte: start,
      $lt: end
    }
  }).then(events => { 
    events = events.map(({ _id, title, start, end, allDay }) => ({ id: _id, title, start, end, allDay })); 
    res.status(200).json(events);
  });
});

module.exports = router;