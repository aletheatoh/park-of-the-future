/**
 * Event controller functions.
 *
 * Each event-related route in `routes.js` will call
 * one controller function here.
 *
 * Export all functions as a module using `module.exports`,
 * to be imported (using `require(...)`) in `routes.js`.
 */
 /**
  * ===========================================
  * Controller logic
  * ===========================================
  */

 const get = (db) => {
   return (request, response) => {
     // use article model method `get` to retrieve article data
     db.article.get(request.params.id, (error, queryResult) => {
       // queryResult contains article data returned from the article model
       db.folder.getArticleFolders(request.params.id, (err, res) => {
         // queryResult contains article data returned from the article model
         if (error) {
           console.error('error getting article:', error);
           response.sendStatus(500);
         }

         else {

           var context = {
             article: queryResult.rows[0],
             folders: uniq(res.rows),
             numFolders: uniq(res.rows).length,
             noFolders: (uniq(res.rows).length == 0)
           }

           if (request.query.success == "true") {
             context['edit_success'] = true;
           }

           // render article.handlebars in the article folder
           response.render('article/article', context);
         }
       });
     });
   };
 };

 const articlesHomePage = (db) => {
   return (request, response) => {
     // retrieve cookies
     let loggedIn = request.cookies['loggedIn'];
     let username = request.cookies['username'];
     let user_id = request.cookies['user-id'];

     console.log('user_id is ' + user_id);

     db.article.getUserArticles(username, (error, queryResult) => {
       // queryResult contains article data returned from the article model
       db.writing_piece.getUserWritingPieces(username, (anotherErr, anotherQr) => {

         db.folder.getUserFolders(username, (err, qr) => {

           db.folder.folders_and_articles((e, res) => {

             db.folder.folders_and_writing_pieces((er, r) => {

               if (er) {
                 console.error('error getting article:', er);
                 response.sendStatus(500);
               }

               else {

                 var folder_articles = {};

                 res.rows.forEach(function(item){
                   var folder_id = parseInt(item.folder_id);
                   var article_id = item.article_id;
                   if (folder_articles[item.folder_id] === undefined) {
                     folder_articles[item.folder_id] = {};
                     folder_articles[item.folder_id]['folder_id'] = folder_id;
                     folder_articles[item.folder_id]['articles'] = [];
                   }
                   folder_articles[item.folder_id]['articles'].push(article_id);
                 });

                 var folder_writing_pieces = {};

                 r.rows.forEach(function(item){
                   var folder_id = parseInt(item.folder_id);
                   var writing_id = item.writing_id;
                   if (folder_writing_pieces[item.folder_id] === undefined) {
                     folder_writing_pieces[item.folder_id] = {};
                     folder_writing_pieces[item.folder_id]['folder_id'] = folder_id;
                     folder_writing_pieces[item.folder_id]['writing_pieces'] = [];
                   }
                   folder_writing_pieces[item.folder_id]['writing_pieces'].push(writing_id);
                 });

                 var context = {
                   loggedIn: loggedIn,
                   username: username,
                   id: user_id,
                   articles: queryResult.rows,
                   writing_pieces: anotherQr.rows,
                   folders: qr.rows,
                   folder_articles: folder_articles,
                   folder_writing_pieces: folder_writing_pieces
                 };

                 if (queryResult.rows.length == 0 ) context['noArticles'] = true;

                 if (user_id == undefined) {
                   console.log('yes');
                   console.log('usernae is ' + username);

                   db.user.getUserId(username, (errorUser, qrUserID) => {
                     if (errorUser) {
                       console.error('error getting user details:', errorUser);
                       response.sendStatus(500);
                     }

                     else {
                       context['id'] = qrUserID.rows[0].id;
                       console.log(qrUserID.rows[0].id);
                       console.log(context);
                       response.clearCookie('user-id');
                       response.cookie('user-id', queryResult.rows[0].id);
                       response.render('article/articles', context);
                     }
                   });
                 }
                 else response.render('article/articles', context);
               }
             });
           });
         });
       });
     });
   };
 };

 const updateForm = (db) => {
   return (request, response) => {

     db.article.get(request.params.id, (error, queryResult) => {
       // queryResult contains article data returned from the article model
       let username = request.cookies['username'];
       db.folder.getUserFolders(username, (err, qr) => {

         if (err) {
           console.error('error getting article:', err);
           response.sendStatus(500);
         } else {
           let context = {
             article: queryResult.rows[0],
             folders: qr.rows
           }
           // render article.handlebars in the article folder
           response.render('article/edit', context);
         }
       });
     });
   };
 };

 const update = (db) => {
   return (request, response) => {

     db.article.update(request.params.id, request.body, (error, queryResult) => {

       if (request.body.folders != '') {
         var array = request.body['folders'].split('<i class=&quot;folder icon&quot;></i>');

         array.forEach(function(item, index) {
           array[index] = item.replace(',', '');
         });
         var removed = array.splice(0,1);

         var res = request.body;
         res['folders'] = array;

         var folder_ids = [];

         if (typeof request.body['id'] == 'string') {
           let folder = request.body['name'];

           if (array.includes(folder.toLowerCase())) folder_ids.push(request.body['id']);
         }

         else request.body['id'].forEach(function(item, index) {
           let folder = request.body['name'][index];
           if (array.includes(folder.toLowerCase())) {
             folder_ids.push(item);
           }
         });

         folder_ids.forEach(function(id, index) {
           db.folder.addArticleToFolder(parseInt(request.params.id), parseInt(id), (err, ar) => {
             if (err) {
               console.error('error:', err);
               response.sendStatus(500);
             }
           });
           // request completed
           if (index ===  folder_ids.length - 1) {
             response.redirect(`/articles/${request.params.id}?success=true`);
           }
         });
       }
       else response.redirect(`/articles/${request.params.id}?success=true`);

     });
   };
 };

 const deleteArticle = (db) => {
   return (request, response) => {
     db.article.deleteArticle(request.params.id, (error, queryResult) => {

       if (error) {
         console.error('error getting article:', error);
         response.sendStatus(500);
       }
       let context = {
         delete_success: true
       }
       response.render('article/edit', context);
     });
   };
 };

 const createForm = (request, response) => {
   response.render('article/new');
 };

 const create = (db) => {
   return (request, response) => {

     let user_id = parseInt(request.cookies['user-id']);
     let username = request.cookies['username'];

     db.event_.create(user_id, username, request.body, (error, queryResult) => {
       // queryResult of creation is not useful to us, so we ignore it

       if (error) {
         console.error('error getting event:', error);
         response.sendStatus(500);
       }

       response.redirect(`/?create_success=true&lng=${request.body.lng}&lat=${request.body.lat}`);
     });
   };
  };

   const updateInterest = (db) => {
     return (request, response) => {

       db.event_.updateInterest(request.params.id, request.body.increment, (error, queryResult) => {

         if (error) {
           console.error('error updating interest:', error);
           response.sendStatus(500);
         }
         // return true;
       });
     };
   };


 /**
  * ===========================================
  * Export controller functions as a module
  * ===========================================
  */
 module.exports = {
   get,
   articlesHomePage,
   updateForm,
   update,
   deleteArticle,
   createForm,
   create,
   updateInterest
 };
