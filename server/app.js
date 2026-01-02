var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//my lib
const cors = require('cors');
const http = require('http');

var indexRouter = require('./routes/index');
//my router
const {router: usersRouter} = require('./routes/users');
const logInLinkRouter = require('./routes/authorization/logInLink');
const {router: tokenRouter} = require('./routes/userToken');
const listenWebhookRouter = require('./routes/getTrello/listenWebhook');
const socketHandler = require('./routes/getTrello/socketHandler');

var app = express();
//my server
const server = http.createServer(app);

//set Socket.io(it should put before routers)
socketHandler.init(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const corsOptions = {
  origin: [
    'https://stonereact-client.vercel.app'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};
app.use(cors(corsOptions));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/logInLink', logInLinkRouter);
app.use('/userToken', tokenRouter);
app.use('/listenWebhook', listenWebhookRouter);

//server listen
server.listen(3000, ()=>{
  console.log('server在 Port 3000 啟動');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
