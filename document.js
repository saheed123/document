require('./model/database');
const express = require('express');
require('dotenv').config();
const multipart = require('connect-multiparty');

const app = express();
const route = require('./route/route');
const morgan = require('morgan');
const port = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('tiny'));
app.use('/', route);







app.listen(port, console.log(`you are logged in with port ${port}`));