/*####Require de Extenciones####*/
var express = require('express');
var hbs = require('express-handlebars');
var app = express();
app.use(express.static('public'));
var session = require('express-session');
app.use(session({ secret: 'oCMLKyLc' }));
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');
moment.locale('es'); // change the global locale to Spanish
mongoose.Promise = global.Promise;
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'main', layoutsDir: __dirname + '/views/layouts/' }));
app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: true }));

async function conectar() {
  await mongoose.connect('mongodb://127.0.0.1:27017/curso', {
    useNewUrlParser: true,
  }); /*estas lineas se encargan de conectar con la base de datos*/
  console.log('######Conectado a MongoDB######');
}
conectar();
/*#####--------#####*/

/*### Esquema para la Base de Datos Animo###*/
var animoSchema = new Schema({
  animo: String,
  detalle: String,
  date: String,
  user: String
});
var Animo = mongoose.model('Animo', animoSchema);
/*#####--------#####*/

/*### Esquema para la Base de Datos Usuarios###*/

var usersSchema = new Schema({
  user: String,
  pass: String,
  email: String,
});

var AnimoUsers = mongoose.model('AnimoUsers', usersSchema);
/*#####--------#####*/

/*#####Login dentro de la Pagina#####*/
app.get('/salir', (req, res) => {
  req.session.destroy(function(err) {
 });
  res.redirect('login');
});
/*#####--------#####*/

/*#####Login dentro de la Pagina#####*/
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res, next) => {
  // el match lo hace la base de datos al encontrar una coincidencia
  try{var userfind = await AnimoUsers.find({ user: req.body.user, pass: req.body.pass });
  if (userfind.lenght != 0) {
    req.session.user_id = userfind[0]._id; //user_id se define solo para esta linea y queda asignado al usuario para hacer seguimiento a la navegacion
    req.session.user = userfind[0].user
    res.redirect('/animo');
  } else {
    res.redirect('/login');
  }}catch(err){
    next(res.render('login', {error: 'Usuario o Contraseña Invalido'}));
  }
});
/*#####--------#####*/

/*#####Acerca del Autor#####*/
app.get('/acerca', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
  res.render('acerca');
});
/*#####--------#####*/

/*#####Realizar el ALta de Un Usuario#####*/
app.get('/checkin', (req, res) => {
  res.render('checkin');
});

app.post('/checkin', async function(req, res) {
  var nUser = await AnimoUsers.create({ user: req.body.user, pass: req.body.pass, email: req.body.email });
  console.log(nUser);
  res.redirect('/login');
});
/*#####--------#####*/

/*#####Crear Nuevos Estados de Animo#####*/
app.get('/animo', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
  res.render('animo');
});

app.post('/animo', async function(req, res) {
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
  var nAnimo = await Animo.create({ animo: req.body.animo, detalle: req.body.detalle, date: moment().format('lll'), user: req.session.user });
  console.log(nAnimo);
  res.redirect('/listado');
});
/*#####--------#####*/

/*#####Mostrar los listados de Animo#####*/
app.get('/listado', async function(req, res) {
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
  var ListAnimo = await Animo.find({ user: req.session.user}).lean();
  res.render('listado', { listado: ListAnimo });
});
/*#####--------#####*/

/*#####Editar Estados de Animo#####*/
app.get('/editar/:id', async function(req, res) {
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
    var UpdateAnimo = await Animo.findOne({ _id: req.params.id }).lean();
    console.log(UpdateAnimo);
    res.render('animo', { datos: UpdateAnimo });
});
app.post('/editar/:id', async function(req, res) {
    await Animo.findByIdAndUpdate({ _id: req.params.id },{ animo: req.body.animo, detalle: req.body.detalle });
    res.redirect('/listado');
});
/*#####--------#####*/

/*#####Borrar un Estado#####*/
app.get('/borrar/:id', async function(req, res) {
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
    // recibo una variable por el :id
    await Animo.findByIdAndRemove({ _id: req.params.id }); //parms vienen de un boton
    res.redirect('/listado');
  });
/*#####--------#####*/

app.get('*', (req, res) => {
  res.redirect('login');
});

/*#####Server Connection#####*/
app.listen(80, function() {
  console.log('App escuchando en el puerto 80');
});
/*#####--------#####*/
