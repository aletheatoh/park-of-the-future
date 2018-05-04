/**
* ===========================================
* Controller logic
* ===========================================
*/

const bcrypt = require('bcrypt');

const newForm = (request, response) => {
  response.render('user/new');
};

const get = (db) => {
  return (request, response) => {
    let username = request.cookies['username'];
    // use user model method `get` to retrieve user data
    db.user.get(request.params.id, (error, queryResult) => {
      // queryResult contains user data returned from the user model
      if (e) {
        console.error('error getting user details:', e);
        response.sendStatus(500);
      } else {

        let context = {
          user: queryResult.rows[0],
        }

        response.render('user/user', context);
      }
    });

  };
};

const create = (db) => {
  return (request, response) => {

    db.user.checkUsernameAvailability(request.body.username, (err, res) => {

      if (res != undefined && res.rows.length >= 1) {

        let context = {
          usernameTaken: true
        }

        response.render('user/new', context);
        return;
      }

      // use user model method `create` to create new user entry in db
      db.user.create(request.body, (error, queryResult) => {

        db.user.getUserId(request.body.username, (err, res) => {

          if (err) {
            console.error('error getting user:', err);
            response.sendStatus(500);
          }

          console.log('User created successfully');

          response.cookie('loggedIn', true);
          response.cookie('username', request.body.username);
          response.cookie('email', request.body.email);
          response.cookie('user-id', res.rows[0].id);
        }

          // if (res.rowCount >= 1) {
          //   console.log('User created successfully');
          //
          //   response.cookie('loggedIn', true);
          //   response.cookie('username', request.body.username);
          //   response.cookie('email', request.body.email);
          //   response.cookie('user-id', res.rows[0].id);
          // }

          else {
            console.log('User could not be created');
          }

          var context = {
            newUser: true
          }

          // redirect to home page after creation
          response.redirect('/?new_user=true')
        });
      });
    });

  };
};

const updateForm = (db) => {
  return (request, response) => {

    db.user.get(request.params.id, (error, queryResult) => {
      // queryResult contains article data returned from the article model

      let context = {
        user: queryResult.rows[0]
      }

      response.render('user/edit', context);

    });
  };
};

const update = (db) => {
  return (request, response) => {

    db.user.update(request.params.id, request.body, (error, queryResult) => {

      if (error) {
        console.error('error getting user:', error);
        response.sendStatus(500);
        return;
      }

      // update cookies
      response.clearCookie('loggedIn');
      response.clearCookie('username');
      response.clearCookie('email');
      response.clearCookie('user-id');

      response.cookie('loggedIn', true);
      response.cookie('username', request.body.username);
      response.cookie('email', request.body.email);
      response.cookie('user-id', request.params.id);

      response.redirect(`/users/${request.params.id}?success=true`);
      return;
    })

  };
};

const logout = (request, response) => {
  // clear all cookies
  response.clearCookie('loggedIn');
  response.clearCookie('username');
  response.clearCookie('email');
  response.clearCookie('user-id');

  // redirect to home page
  response.redirect(301, '/');
};

const loginForm = (request, response) => {
  response.render('user/login');
};

const login = (db) => {
  return (request, response) => {
    console.log('loggin in in users controller');
    response.clearCookie('loggedIn');
    response.clearCookie('username');
    response.clearCookie('email');
    response.clearCookie('user-id');

    // Hint: All SQL queries should happen in the corresponding model file
    // ie. in models/user.js - which method should this controller call on the model?
    db.user.login(request.body, (error, queryResult) => {

      if (queryResult.rowCount === 0) {

        console.error('error getting user:', error);

        let context = {
          needToRegister: true
        }

        response.render('user/new', context);
        return;
      }

      var hash = queryResult.rows[0].password;

      bcrypt.compare(request.body.password, hash, function(err, res) {

        if( res === true ){
          // set cookie
          response.cookie('loggedIn', 'true');
          response.cookie('username', request.body.username);
          response.cookie('email', request.body.email);
          response.cookie('user-id', queryResult.rows[0].id);

          response.redirect('/?returning_user=true');
        }

        else {
          console.log('incorrect password');

          let context = {
            loginFailure: true
          }

          response.render('user/login', context);
          return;
        }
      });

      if (error) {
        console.error('error getting user:', error);
        response.sendStatus(500);
      }
    });
  };
};

/**
* ===========================================
* Export controller functions as a module
* ===========================================
*/
module.exports = {
  newForm,
  get,
  create,
  update,
  updateForm,
  logout,
  loginForm,
  login
};
