const mongoose = require('mongoose');
const { MONGODB_URI } = require('./environment');

mongoose.connect(MONGODB_URI, { useUnifiedTopology: true });

const con = mongoose.connection;
con.on('error', (err) => console.error(`Could not connect to MongoDB, ${err}`));
con.once('open', () => console.log('Connected to MongoDB...'));

process.on('exit', () => {
  mongoose.disconnect();
});

module.exports = con;
