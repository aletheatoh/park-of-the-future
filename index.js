const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const db = require('./db');
const http = require("https");
// var passport = require('passport')
//   , FacebookStrategy = require('passport-facebook').Strategy;

// load environment variables
require('dotenv').load();
// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').load();
// }

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
app.use(cookieParser());

// -webkit-animation: bounce 1.2s ease-out;
// 	-moz-animation: bounce 800ms ease-out;
// 	-o-animation: bounce 800ms ease-out;
// 	animation: bounce 1.2s ease-out;


// Set handlebars to be the default view engine
const handlebarsConfigs = {
  extname: '.handlebars',
  layoutsDir: 'views',
  helpers: {
      careerIcon: function () { return '<img style="width:35px;margin-right:5px;margin-bottom:5px;" src=\\"img/career-icon.svg\\" style=\\"margin-left:-3.5;\\">'; },
      techIcon: function () { return '<img class="map-icon" style="width:35px;margin-right:5px;margin-bottom:5px;" src=\\"img/tech-icon.svg\\" style=\\"margin-left:-3.5;\\">'; },
      sportsIcon: function () { return '<img style="width:35px;margin-right:5px;margin-bottom:5px;" src=\\"img/sports-wellness-icon.svg\\" style=\\"margin-left:-3.5;\\">'; },
      learningIcon: function () { return '<img style="width:35px;margin-right:5px;margin-bottom:5px;" src=\\"img/learning-icon.svg\\" style=\\"margin-left:-3.5;\\">'; },
      artsIcon: function () { return '<img style="width:35px;margin-right:5px;margin-bottom:5px;" src=\\"img/arts-icon.svg\\" style=\\"margin-left:-3.5;\\">'; },
      othersIcon: function () { return '<img style="width:35px;margin-right:5px;margin-bottom:5px;" src=\\"img/others-icon.svg\\" style=\\"margin-left:-3.5;\\">'; },
      currUserEvent: function(event_id, organizer_id, user_id) {
        if (parseInt(organizer_id) === parseInt(user_id)) {
          return '<div class=\"ui right floated compact red label\">Your event</div>'
        }
        else {
          return `<div id=\"interest-icon-${event_id}\" class=\"right floated ui massive star rating\" data-max-rating="1"></div>`
        }
      }
  }
  // defaultLayout: 'layout'
};

app.engine('.handlebars', handlebars(handlebarsConfigs));
app.set('view engine', 'handlebars');

// Import routes to match incoming requests
require('./routes')(app, db);

// tell Express to look into the public/ folder for assets that should be publicly available (eg. CSS files, JavaScript files, images, etc.)
app.use(express.static('public'));

// Root GET request (it doesn't belong in any controller file)
app.get('/', (request, response) => {

  // retrieve cookies
  let loggedIn = request.cookies['loggedIn'];
  let username = request.cookies['username'];
  let user_id = request.cookies['user-id'];
  let email = request.cookies['email'];

  // redirect user to sign in page if not signed in
  if (loggedIn === undefined) response.render('user/signin');

  else {
    // load all events to be displayed on the map
    db.event_.getAllEvents((error, queryResult) => {

      if (error) {
        console.error('error getting event:', error);
        response.sendStatus(500);
      }

      // need to filter events by category
      // 1) Career & Business, 2) Tech, 3) Sports & Wellness, 4) Learning, 5) Arts & Culture, 6) Others
      let career = queryResult.rows.filter( event => event.category === "Career and Business");
      let tech = queryResult.rows.filter( event => event.category === "Tech");
      let sports = queryResult.rows.filter( event => event.category === "Sports and Wellness");
      let learning = queryResult.rows.filter( event => event.category === "Learning");
      let arts = queryResult.rows.filter( event => event.category === "Arts and Culture");
      let others = queryResult.rows.filter( event => event.category === "Others");

      // further filter these category to get MY events
      let my_career = career.filter( event => event.organizer_id === parseInt(user_id));
      let my_tech = tech.filter( event => event.organizer_id === parseInt(user_id));
      let my_sports = sports.filter( event => event.organizer_id === parseInt(user_id));
      let my_learning = learning.filter( event => event.organizer_id === parseInt(user_id));
      let my_arts = arts.filter( event => event.organizer_id === parseInt(user_id));
      let my_others = others.filter( event => event.organizer_id === parseInt(user_id));

      var context = {
        // all events
        events: queryResult.rows,
        career: career,
        tech: tech,
        sports: sports,
        learning: learning,
        arts: arts,
        others: others,
        // my events
        my_career: my_career,
        my_tech: my_tech,
        my_sports: my_sports,
        my_learning: my_learning,
        my_arts: my_arts,
        my_others: my_others,
        // username
        username: username,
        user_id: user_id,
        loggedIn: loggedIn,
        email: email
      }

      // if a new event was created
      var create_event = request.query.create_success;
      if (create_event === "true") {
        context['create_success'] = true;
        context['created_event_lng'] = parseFloat(request.query.lng);
        context['created_event_lat'] = parseFloat(request.query.lat);
      }

      var returning_user = request.query.returning_user;
      if (returning_user === "true") context['returning_user'] = true;
      var new_user = request.query.new_user;
      if (new_user === "true") context['new_user'] = true;

      response.render('home', context);
    });
  }
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
