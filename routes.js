/**
 * Routes file.
 *
 * All routes you want to match in the app should appear here.
 * Upon match, a corresponding controller method should be called.
 *
 * Export as a function using `module.exports`,
 * to be imported (using `require(...)`) in `index.js`.
 */
 const users = require('./controllers/user');
 const events = require('./controllers/event');

 module.exports = (app, db) => {
   /*
    *  =========================================
    *  Users
    *  =========================================
    */
   // CRUD users
   app.get('/users/new', users.newForm); // done
   app.post('/users', users.create(db)); // done
   app.get('/users/:id/edit', users.updateForm(db));
   app.put('/users/:id/edit', users.update(db));

   // Authentication
   app.post('/users/logout', users.logout); // done
   app.get('/users/login', users.loginForm); // done
   app.post('/users/login', users.login(db)); // done
   app.get('/users/:id', users.get(db));

   app.post('/events', events.create(db)); // done
   app.get('/test', events.homePage(db));

  //    // Redirect the user to Facebook for authentication.  When complete,
  // // Facebook will redirect the user back to the application at
  // //     /auth/facebook/callback
  // app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
  //
  // // Facebook will redirect the user to this URL after approval.  Finish the
  // // authentication process by attempting to obtain an access token.  If
  // // access was granted, the user will be logged in.  Otherwise,
  // // authentication has failed.
  // app.get('/auth/facebook/callback',
  //   passport.authenticate('facebook', { successRedirect: '/',
  //                                       failureRedirect: '/users/login' }));

   /*
    *  =========================================
    *  Events
    *  =========================================
    */
   // CRUD articles
   // app.get('/articles', articles.articlesHomePage(db));
   // app.get('/articles/:id/edit', articles.updateForm(db)); // done
   // app.put('/articles/:id/edit', articles.update(db)); // done
   // app.get('/articles/new', articles.createForm); // done
   // app.post('/articles', articles.create(db)); // done
   // app.get('/articles/:id', articles.get(db)); // done
   // app.delete('/articles/:id', articles.deleteArticle(db));
   // app.delete('/deletearticle/:article_id/delete/:folder_id', folders.removeArticle(db));


 };
