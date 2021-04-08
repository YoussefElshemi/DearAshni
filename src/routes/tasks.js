const express = require('express');
const Task = require('../models/task');
const { ensureAuthenticated } = require('../config/auth');

const router = express.Router();

router.get('/', ensureAuthenticated, (req, res) => {
  Task.find({ author: req.user.id }).sort( { datefield: 1 } ).then(tasks => {
    tasks = tasks.reverse();
    res.render('tasks', { 
      user: req.user,
      tasks,
      pageName: 'tasks'
    });
  }).catch(() => {
    res.render('tasks', { 
      user: req.user,
      tasks: [],
      pageName: 'tasks'
    });
  });
});

router.post('/new', ensureAuthenticated, (req, res) => {
  const { task } = req.body;

  if (!task) {
    req.flash('error_msg', 'Please enter a task');
    res.redirect('/tasks');
  } else {
    const newTask = new Task({ 
      author: req.user.id,
      complete: false,
      task
    });
    newTask.save().then(() => {
      res.redirect('/tasks');
    }).catch(() => {
      res.redirect('/tasks');
    });
  }
});

router.post('/delete', ensureAuthenticated, (req, res) => {
  Task.findById(req.body.id).then(foundTask => {
    if (foundTask && foundTask.author === req.user.id) {
      Task.findByIdAndDelete(req.body.id).then(() => {
        req.flash('success_msg', 'Successfully deleted this task');
        res.redirect('/tasks');
      }).catch(() => {
        res.redirect('/tasks');
      });
    }
  }).catch(() => {
    res.redirect('/tasks');
  });
});

router.post('/:id', ensureAuthenticated, (req, res) => {
  const { id, status } = req.body;

  if (!status || !id) {
    req.flash('error_msg', 'Please specify a task to update');
    res.redirect('/tasks');
  }
  Task.findById(id).then(task => {
    if (task && task.author === req.user.id) {
      task.complete = status === 'complete';
      task.save().then(() => {
        res.redirect('/tasks');
      }).catch(() => {
        res.redirect('/tasks');
      })
    }
  })
});

module.exports = router;