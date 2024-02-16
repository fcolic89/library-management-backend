const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://admin:admin@localhost:27017/library?directConnection=true&authSource=library&replicaSet=replica-set-name&retryWrites=true';

mongoose.connect(uri, { useUnifiedTopology: true });

const con = mongoose.connection;
con.on('error', (err) => console.error(`Could not connect to MongoDB, ${err}`));
con.once('open', () => console.log('Connected to MongoDB...'));

process.on('exit', () => {
  mongoose.disconnect();
});

module.exports = con;
