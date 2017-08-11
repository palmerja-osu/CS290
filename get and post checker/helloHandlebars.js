
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);

app.get('/show-data',function(req,res){
  var context = {};	 
  context.sentData = req.query.myData;
 
  res.render('show-data', context);
});

//GET request to homepage

app.get('/', function(req,res){

  var qParams = [];
  for (var p in req.query){
    qParams.push({'name':p,'value':req.query[p]})
  }
  var context = {};
  context.dataList = qParams;

  res.render('get', context);

});


app.get('/get-loopback',function(req,res){
  var qParams = [];
  for (var p in req.query){
    qParams.push({'name':p,'value':req.query[p]})
  }
  var context = {};
  context.dataList = qParams;
  res.render('get-loopback', context);
});


//POST request to homepage
app.post('/', function (req, res) {
	
	
  var qParams1 = [];
  for (var p in req.query){
    qParams1.push({'name':p,'value':req.query[p]})
  }
  var context = {};
  context.queryList = qParams1;
  

	var qParams2 = [];
  for (var p in req.body){
    qParams2.push({'name':p,'value':req.body[p]})
  }
  //console.log(qParams);
  //console.log(req.body);
  context.bodyList = qParams2;
  console.log(context);
  res.render('post', context);
	
   //res.render('post');
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});