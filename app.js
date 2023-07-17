require('./database/db');
const route_user = require('./routes/user');
const route_auth = require('./routes/auth');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use('/api/user', route_user);
app.use('/api/auth', route_auth);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
