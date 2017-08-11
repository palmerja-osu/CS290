var express = require('express');
var mysql = require('./dbcon.js');
var app = express();
var handlebars = require('express-handlebars').create({
    defaultLayout: 'main'
});
var request = require('request');
var bodyParser = require('body-parser');

console.log("for taya");

//app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);


app.get('/reset-table', function (req, res, next) {
    console.log("resetting stuff");
    var context = {};
    mysql.pool.query("DROP TABLE IF EXISTS workouts", function (err) {
        var createString = "CREATE TABLE workouts(" +
            "id INT PRIMARY KEY AUTO_INCREMENT," +
            "name VARCHAR(255) NOT NULL," +
            "reps INT," +
            "weight INT," +
            "date DATE," +
            "lbs BOOLEAN)";
        console.log("yikes");
        mysql.pool.query(createString, function (err) {
            context.results = "Table reset";
            res.render('home', context);
            //res.sendFile('public/htmlform.html', {root: __dirname


        });
        // res.sendFile(__dirname + '/public/htmlform.html');    
    });
});

app.use(express.static('public'));

app.get('/',function(req,res,next){
  //Table building is done client-side, so the GET is very simple.
  var context = {};
  res.render('home', context);
});


app.get('/', function (req, res, next) {
    var context = {};
    mysql.pool.query('SELECT * FROM workouts', function (err, rows, fields) {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        context.results.forEach(function (current, index, array) {
            if (current.lbs == 1) {
                current.lbs = "lbs";
            } else {
                current.lbs = "kilos";
            }
        });
        res.render('home', context);
    });
});


app.post('/', function (req, res, next) {
         var context = {};

            //if(req.body['Exercise']){
            console.log(req.body);
            console.log("1");
            if (req.body.name && req.body.reps && req.body.weight && req.body.date && req.body.lbs) {
                mysql.pool.query("INSERT INTO workouts (name, reps, weight, date, lbs) VALUES (?, ?, ?, ?, ?)", [req.body.name, req.body.reps, req.body.weight,
				       req.body.date, req.body.lbs], function (err, result) {
						console.log("fuckthisassignment")
                    if (err) {
                        next(err);
                        return;
                    }
							
                    var addedId = result.insertId;

                   mysql.pool.query('SELECT * FROM workouts WHERE id=?', [addedId], function (err, rows, fields) {
                        if (err) {
                            next(err);
                            return;
                        }

                        var data = rows;
                        if (data.lbs === 0) {
                            data.lbs = "kilos";
                        } else {
                            data.lbs = "lbs";
                        }

                        res.type('text/plain');
                        data = JSON.stringify(data);
                        console.log(data);
						res.send(data);
						
                    });
                 });
            }
            	//}

       /*     if (req.body['edit']) {
                context = {}
                mysql.pool.query("SELECT * FROM workouts WHERE id = ?", [req.body.id], function (err, rows, fields) {
                    if (err) {
                        next(err);
                        return;
                    }
                    context.edit = rows;
                    res.render('changes', context);
                });
            }

            if (req.body['deleted']){
                mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.body.id], function (err, result) {
                if (err) {
                    next(err);
                    return;
                }
                mysql.pool.query("SELECT * FROM workouts", function (err, rows, fields) {
                    if (err) {
                        next(err);
                        return;
                    }
                    res.send(JSON.stringify(rows));
                });
            });
			}   
		*/
	
});


        app.use(function (req, res) {
            res.status(404);
            res.render('404');
        });

        app.use(function (err, req, res, next) {
            console.error(err.stack);
            res.status(500);
            res.render('500');
        });

        app.listen(app.get('port'), function () {
            console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
        });