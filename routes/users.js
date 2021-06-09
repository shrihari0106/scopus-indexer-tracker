const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs');
const passport = require('passport')
const User = require('../models/User');
const nodemailer = require('nodemailer')
const Otpdb = require('../models/otp')
require('dotenv').config()

//mailer
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth :{
    user : 'scopusindexer@gmail.com',
    pass : 'scopusmail2021'
  }
})

router.get('/login',(req,res)=>{
    res.render('Login')
})

router.get('/register',(req,res)=>{
    res.render('register')
})

router.post('/register',(req,res) =>{
    const {first_name,last_name, email,password, password2} = req.body
    let errors = []

    if(!first_name || !last_name || !email || !password || !password2){
        errors.push({ msg : "Please fill in all the fields."})
    }

    if(password !== password2){
        errors.push({ msg : "Password match failed. Please re-enter"})
    }

    if(password.length < 6){
        errors.push({ msg : "Password is too short. Minimum 6 character required. "})
    }

    if( errors.length > 0){
        res.render('register',{
            errors,
            first_name,
            last_name,
            email,
            password,
            password2
        })
    }else {
        User.findOne({ email: email }).then(user => {
          if (user) {
            errors.push({ msg: 'Email already exists' });
            res.render('register', {
              errors,
              first_name,
              last_name,
              email,
              password,
              password2
            });
          } else {
            const newUser = new User({
              first_name,
              last_name,
              email,
              password
            });
    
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                  .save()
                  .then(user => {
                    req.flash(
                      'success_msg',
                      'You are now registered and can log in'
                    );
                    res.redirect('/users/login');
                  })
                  .catch(err => console.log(err));
              });
            });
          }
        });
      }
})

router.get('/forgotpassword', (req, res) =>{ 
  res.render('passconfirm')
})

router.post('/otp', async (req, res) =>{
  let pass = []
  const mail = req.body.email
  await User.findOne({ email: mail }).then(user => {
    if (!user) {
      pass.push({ msg : "Email is not registered"})
    }
  });
  if (pass.length>0){
    res.render('passconfirm',{pass})
  }
  else{
    let otpgen = parseInt(Math.random() * (999999 - 100000) + 999999); 
    let newotp = {
      email : mail,
      otp : otpgen
    }
    const otpsave = new Otpdb(newotp);
    otpsave.save().then(
      public =>{
        console.log('otp saved')
      }
    )
    let mailOptions = {
      from : process.env.EMAIL,
      to : mail,
      subject : 'OTP to change password',
      text :  `Hello User! Your One Time Password(OTP) to change your password is ${otpgen}`
    }
    transporter.sendMail(mailOptions,function(err,data){
      if (err){
          console.log(err)
      }
      else{
          console.log("Email Sent Successfully")
      }
    })
    res.render('otp')
  }
  
})

router.post('/otpconfirm', async (req, res) =>{
  creds = req.body
  var otpdetails;
  let errs = []
  const finder = await Otpdb.find({email : creds.email}).then((document) =>{
    otpdetails = document;
  })
  if (creds.otp != otpdetails[0].otp){
    errs.push({msg : 'Please Enter the correct otp'})
  }
  if (!creds.otp){
    errs.push({msg : 'OTP not entered'})
  }
  if (errs.length > 0){
    res.render('otp',{errs})
  } 
  else{
    const filter = {email : creds.email}
    await Otpdb.findOneAndDelete(filter)
    req.flash(
      'success_msg',
      'Your OTP has been confirmed. Update your password. '
    );
    res.redirect('/users/changepassword')
  }
})

router.get('/changepassword', (req, res) =>{
  res.render('password')
})

router.post('/login',(req, res, next)=>{
  passport.authenticate('local', {
     successRedirect: '/overview',
     failureRedirect: '/users/login',
     failureFlash: true })(req, res, next)
})

router.post('/forgotpassword', async (req, res) => {
  const creds= req.body
  let pass = []
  console.log(pass)
  console.log(creds)
  User.findOne({ email: creds.email }).then(user => {
    if (!user) {
      pass.push({ msg : "Email is not registered"})
      console.log(user)
    }
  });
  if ( !creds.email || !creds.password || !creds.password2){
    pass.push({ msg : "Please fill in all the fields."})
  }

  if ( creds.password != creds.password2 ){
    pass.push({ msg: " Passwords do not match."})
  }

  if (pass.length > 0){
    console.log(pass)
    res.render('password',{pass})
  }else {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(creds.password, salt, async (err, hash) => {
        if (err) throw err;
        filter={email : creds.email}
        updates= { password : hash }
        var updated = await User.findOneAndUpdate(filter, updates, {new : true })
        console.log(updated)
      });
    });
    req.flash(
      'success_msg',
      'Your password has been changed. You can now log in'
    );
    res.redirect('/users/login');
  }
})

router.get('/logo', (req, res) => {
  req.logout()
  req.flash('success_msg', 'You are logged out')
  res.redirect('/users/login')
})

module.exports = router