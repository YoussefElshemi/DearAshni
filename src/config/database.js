const mongoose = require('mongoose');
const { server, database } = require('./config');

mongoose.connect(`mongodb://${server}/${database}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).catch(console.error);

module.exports = mongoose;