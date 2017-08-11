/*

Albert Chang CS290-400 Final? Assignment
Note that I went to great lengths (relatively speaking, probably not so great for you) 
to make sure that null values stay null. Please appreciate that.
I'll explain more about how this was accomplished in comments on the related files.

For now though, note the checks I have for whether incoming data is === to ''.
A field of '' means null, so I'm sure to pass that along to the database.

This is the main application file. Note the helper I have for parsing dates.
I think it's necessary because of how the mySQL library handles dates. Or maybe mySQL in general.

*/

var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create(
  {
    defaultLayout:'main', 
    helpers: {
      dateParser: function(dateString) {
        if (dateString) {
          var strDate = dateString;
          strDate = strDate.slice(0, -14);
          return strDate;
        }
      }
    }
  });

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);

app.use(express.static('public'));

app.get('/',function(req,res,next){
  //Table building is done client-side, so the GET is very simple.
  var context = {};
  res.render('home', context);
});

//This is only used upon the load of 'home'. Generally only one row (or parts of one row) is sent or received at a time.
app.post('/getData',function(req,res,next) {
  var context = {};
  mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields) {
    if(err){
      next(err);
      return;
    }
    res.send(rows);
  });
});

//I recently switched the '/edit' and '/' POST route handlers because it looks better in the address bar. To be clear though, the "edit" page (rendered as a response to the '/' route) is a separate page. A refresh happens for editing.
app.post('/edit',function(req,res,next){
  var context = {};
  mysql.pool.query("SELECT * FROM workouts WHERE id=?", [req.body.taskID], function(err, result) {
    if(err){
      next(err);
      return;
    }
    if(result.length == 1) {
      //I still use curVals in case the user tries to get clever and null out the name.
      var curVals = result[0];
      for (property in req.body) {
        if (req.body[property] === '') {
          req.body[property] = null;
        }
        if (req.body.lbs === '2') {
          req.body.lbs = null;
        }
      }
      mysql.pool.query("UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=?",
        [req.body.name || curVals.name, req.body.reps, req.body.weight, req.body.date, req.body.lbs, req.body.taskID],
        function(err, result){
        if(err){
          next(err);
          return;
        }
        console.log("Updated " + result.changedRows + " rows.");
        res.send();
      });
    }
  });
});

//I include some console.log calls to make things clearer on the server side. You won't ever see it while testing, but it made my own debugging easier.
app.post('/newTask',function(req,res,next){
  var context = {};
  newTask = req.body;
  console.log("The new task");
  console.log(newTask);
  for (property in newTask) {
    if (newTask[property] === '') {
      newTask[property] = null;
    }
  }
  mysql.pool.query("INSERT INTO workouts (name, reps, weight, date, lbs) VALUES (?, ?, ?, ?, ?)", [newTask.name, newTask.reps || null, newTask.weight || null, newTask.date || null, newTask.lbs], function(err, result){
    if(err){
      next(err);
      return;
    }
    console.log("Inserted id " + result.insertId);
    res.send(JSON.stringify(result.insertId) );
  });
});

//The 'res.send("success")' doesn't actually have any use. It's just because the event listener is waiting for a response back on the client side. The response happens, and is discarded.
app.post('/deleteTask',function(req,res,next) {
  var context = {};
  var delTask = req.body;
  console.log(delTask);
  mysql.pool.query("DELETE FROM workouts WHERE id=?", [delTask.taskID], function(err, result) {
    if(err){
      next(err);
      return;
    }
    console.log("Deleted task " + delTask.taskID);
    console.log("Deleted " + result.changedRows + " rows.");
    res.send("success");
  });
});

//Editing is done on separate page, as suggested in instructions. The edit page is really simple. I mentioned above that this route used to be '/edit'.
app.post('/',function(req,res,next){
  var context = {};
  mysql.pool.query("SELECT * FROM workouts WHERE id=?", [req.body.taskID], function(err, result) {
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      context = result[0];
    }
    else {
      context.compromised = true;
    }
    //The stringify/parse occurs to alter the date format slightly. Makes it easier to truncate later.
    context.date = JSON.parse(JSON.stringify(context.date) );
    if (context.lbs === null) {
      context.lbnull = true;
    }
    if (context.weight === null) {
      context.nullweight = true;
    }
    if (context.reps === null) {
      context.nullreps = true;
    }
    console.log(context);
    res.render('edit', context);
  });
});

//As provided.
app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    })
  });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
