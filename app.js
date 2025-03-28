const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const logger = require('morgan');
const methodOverride = require('method-override');
const { rateLimit } = require('express-rate-limit');

const indexRouter = require('./routes/index');

app.use(bodyParser.json());
app.use(helmet());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(logger('common'));
app.use(compression());
app.use(rateLimit({
	windowMs: 1000,
	limit: 10,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
}));

const mongoose = require('mongoose');

const { DB_URI, DB_PORT, DB_NAME } = process.env;
const dbURI = `mongodb://${DB_URI}:${DB_PORT}/${DB_NAME}`;
const dbOption = {
    autoIndex: false,
};

mongoose.connect(dbURI, dbOption);

const dbConnection = mongoose.connection;

dbConnection.on('open', () => {
    const date = (new Date()).toString();
    console.log(`DB connected at ${date}`);
});

dbConnection.on('error', err => {
    const date = (new Date()).toString();
    console.error(`DB error at ${date} \n${err}`);
});

app.use('/', indexRouter);

app.get('/status', (req, res) => {
    res.status(200).json({
        msg: 'server status good'
    });
});

app.use((err, req, res, next) => {
    const { code, msg } = err;

    console.error(`error ${code}, ${msg}`);
    res.status(code).json({
        msg: code<500?`${msg}`:'Server Error'
    });
});

module.exports = app;