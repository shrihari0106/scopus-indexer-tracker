const express = require('express')
const app = express()
const PORT = process.env.PORT || 5000
const mongoose = require('mongoose')
const passport = require('passport')
const flash = require('connect-flash')
const session = require('express-session')

//Passport Config
require('./config/passport')(passport)

//Mongo
const db = require('./config/keys').MongoURI
mongoose.connect(db,{ useNewUrlParser : true})
 .then(()=> console.log("Database Connected"))
 .catch(err => console.log(err))

 //Exoress session,Passport and Flash 
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );

app.use(passport.initialize())
app.use(passport.session())

app.use(flash());

//Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });
  
//ejs
app.use(express.static('public'));
app.set('view engine','ejs')
app.use(express.urlencoded({extended : false}))

//routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))

app.listen(PORT, () =>{
    console.log(`server listening at port ${PORT} `)
})