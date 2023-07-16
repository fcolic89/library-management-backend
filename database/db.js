const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://admin:admin@localhost:27017/library?retryWrites=true&w=majority'

mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB, ' + err));
