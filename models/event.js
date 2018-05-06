/**
* Article model functions.
*
* Any time a database SQL query needs to be executed
* relating to an article (be it C, R, U, or D),
* one or more of the functions here should be called.
*
* Export all functions as a module using `module.exports`,
* to be imported (using `require(...)`) in `db.js`.
*/

/**
* ===========================================
* Export model functions as a module
* ===========================================
*/
module.exports = (dbPool) => {
  // `dbPool` is accessible within this function scope
  return {
    // create an event
    create: (user_id, username, event_, callback) => {

      var date = new Date(event_.date);

      // set up query
      var queryString = `INSERT INTO events (organizer_id, organizer_name, name, category, date_, starttime, endtime, description, venue, lat, lng)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`;

      var values = [
        user_id,
        username,
        event_.name,
        event_.category,
        date.toDateString(),
        event_.starttime,
        event_.endtime,
        event_.description,
        event_.venue,
        parseFloat(event_.lat),
        parseFloat(event_.lng)
      ];

      // execute query
      dbPool.query(queryString, values, (error, queryResult) => {
        // invoke callback function with results after query has executed
        callback(error, queryResult);
      });
    },

    // get all events
    getAllEvents: (callback) => {

      // set up query
      var queryString = `SELECT * FROM events`;

      // execute query
      dbPool.query(queryString, (error, queryResult) => {
        // invoke callback function with results after query has executed
        callback(error, queryResult);
      });
    },

    // update interests
    updateInterest: (id, increment, callback) => {
      increment = parseInt(increment);
      id = parseInt(id);

      var queryString;
      // set up query
      if (increment === 1) {
        queryString = `UPDATE events SET num_interests =  num_interests + 1 WHERE id=${id}`;
      }
      else if (increment === -1) {
        queryString = `UPDATE events SET num_interests =  num_interests - 1 WHERE id=${id}`;
      }

      // execute query
      dbPool.query(queryString, (error, queryResult) => {
        // invoke callback function with results after query has executed
        callback(error, queryResult);
      });
    },

    // update curr user interested boolean
    updateCurrUserInterest: (id, increment, callback) => {
      increment = parseInt(increment);
      id = parseInt(id);

      var queryString;
      // set up query
      if (increment === 1) {
        queryString = `UPDATE events SET curr_user_interested = true WHERE id=${id}`;
      }
      else if (increment === -1) {
        queryString = `UPDATE events SET curr_user_interested = false WHERE id=${id}`;
      }

      // execute query
      dbPool.query(queryString, (error, queryResult) => {
        // invoke callback function with results after query has executed
        callback(error, queryResult);
      });
    },

    update: (id, article, callback) => {
      // set up query

      var queryString = `UPDATE articles SET title='${article.title}', url='${article.url}', summary='${article.summary}' WHERE id='${id}';`;

      // execute query
      dbPool.query(queryString, (error, queryResult) => {
        // invoke callback function with results after query has executed

        callback(error, queryResult);
      });
    },

    deleteArticle: (id, callback) => {
      // set up query

      var queryString = `DELETE FROM articles WHERE id=${id};`;

      // execute query
      dbPool.query(queryString, (error, queryResult) => {
        var qs = `DELETE FROM organized_articles WHERE article_id=${id};`;
        // execute query
        dbPool.query(qs, (err, qr) => {
          // invoke callback function with results after query has executed
          callback(err, qr);
        });
      });
    },

    get: (id, callback) => {
      dbPool.query("SELECT * from articles WHERE id=" + id, (error, queryResult) => {
        callback(error, queryResult);
      });
    },

    getUserArticles: (username, callback) => {

      // select articles of each user
      var queryString = `SELECT articles.id, articles.title, articles.url, articles.summary from articles INNER JOIN users ON articles.user_id = users.id WHERE name='${username}';`;

      dbPool.query(queryString, (error, queryResult) => {
        callback(error, queryResult);
      });
    }

  };
};
