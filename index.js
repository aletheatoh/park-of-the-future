const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
// const cookieParser = require('cookie-parser');
// const db = require('./db');
const http = require("https");
// var passport = require('passport')
//   , FacebookStrategy = require('passport-facebook').Strategy;

/**
 * ===================================
 * Configurations and set up
 * ===================================
 */

// Init express app
const app = express();

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// app.use(cookieParser());

// Set handlebars to be the default view engine
const handlebarsConfigs = {
  extname: '.handlebars',
  layoutsDir: 'views'
  // defaultLayout: 'layout'
};

app.engine('.handlebars', handlebars(handlebarsConfigs));
app.set('view engine', 'handlebars');

/**
 * ===================================
 * Routes
 * ===================================
 */

// Import routes to match incoming requests
// require('./routes')(app, db);

// tell Express to look into the public/ folder for assets that should be publicly available (eg. CSS files, JavaScript files, images, etc.)
app.use(express.static('public'));

// Root GET request (it doesn't belong in any controller file)
app.get('/signin', (request, response) => {

  response.render('signin');
});

app.get('/home', (request, response) => {

  response.render('home');
});

app.get('/add', (request, response) => {

  response.render('add');
});

app.get('/', (request, response) => {
  var create = request.query.create;
  if (create === "true") {
    response.render('new');
  }
  else response.render('signin');
});

// Catch all unmatched requests and return 404 not found page
app.get('*', (request, response) => {
  response.render('404');
});

/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => console.log('~~~ Tuning in to the waves of port '+PORT+' ~~~'));

// Run clean up actions when server shuts down
server.on('close', () => {
  console.log('Closed express server');

  db.pool.end(() => {
    console.log('Shut down db connection pool');
  });
});
