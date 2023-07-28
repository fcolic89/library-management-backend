require('./service/cronjobs');
require('./database/db');
const route_user = require('./routes/user');
const route_auth = require('./routes/auth');
const route_book = require('./routes/books');
const route_checkout = require('./routes/checkout');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use('/api/user', route_user);
app.use('/api/auth', route_auth);
app.use('/api/book', route_book);
app.use('/api/checkout', route_checkout);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
