const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const logger = require('morgan');
const methodOverride = require('method-override');

const authenticationRouter = require('./routes/authentication');
const userRouter = require('./routes/user');
const postRouter = require('./routes/post');
const mplEffRouter = require('./routes/maple_eff');

app.use(bodyParser.json());
app.use(helmet());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(logger('common'));
app.use(compression());

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

app.use('/authentications', authenticationRouter)
app.use('/users', userRouter);
app.use('/posts', postRouter);
app.use('/mpleff', mplEffRouter);

app.get('/status', (req, res) => {
    res.status(200).json({
        msg: 'server status good'
    });
});

app.use((err, req, res, next) => {
    console.error(`Server error ${err.code}, ${err.msg}`);
    res.status(err.code).json({
        msg: err.code<500?`${err.msg}`:'Server Error'
    });
});

module.exports = app;