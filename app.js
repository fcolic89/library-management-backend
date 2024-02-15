require('./service/cronjobs');
require('./database/db');
const cors = require('cors');
const express = require('express');
const routeUser = require('./routes/user');
const routeAuth = require('./routes/auth');
const routeBook = require('./routes/books');
const routeCheckout = require('./routes/checkout');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors({
  origin: ['http://127.0.0.1:4200', 'http://localhost:4200'],
  // origin: ['*'],
  methods: ['GET', 'PUT', 'POST', 'OPTIONS', 'DELETE'],
}));

app.use('/api/user', routeUser);
app.use('/api/auth', routeAuth);
app.use('/api/book', routeBook);
app.use('/api/checkout', routeCheckout);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
