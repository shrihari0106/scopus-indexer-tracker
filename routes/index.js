const express = require('express')
const router = express.Router()
const User = require('../models/User');
const Publist = require('../models/Publist');
const Aulist = require('../models/aulist');
const request = require('request')
const xml = require('xml-parse')
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const { query } = require('express');
const { json } = require('sequelize');

var userinfo;
var curr_mail;
const MY_API_KEY = '6b3c0f1da8cbe2e6596cc73867fd0965';
var publ_creator = [];


// Dashboard
router.get('/overview', ensureAuthenticated, (req, res) =>{
  userinfo=req.user
  curr_mail = userinfo.email;
  console.log(userinfo)
  res.render('homepage', {
    user: userinfo
  })
}  
);

router.get('/', (req, res) =>{
  res.render('main')
})

router.get('/search', (req, res)  => {
    res.render('search')
})

router.get('/profile', ensureAuthenticated, async (req, res) => {
  var Pub_list;
  const quer1 = await Publist.find({email : curr_mail}).then((pubs) => {
      Pub_list = pubs;
  })
  console.log(Pub_list)
  var Auth_list;
  const quer2 = await Aulist.find({email : curr_mail}).then((auths) => {
    Auth_list = auths;
})
  res.render('profile', {
  user: userinfo, publist : Pub_list, aulist : Auth_list
})}  
);

router.post('/editinfo', async (req, res) => {
  try {
    filter={email : req.body.email}
    updates= { first_name : req.body.first_name, last_name : req.body.last_name}
    var updated = await User.findOneAndUpdate(filter, updates, {new : true })
    console.log(updated)
    res.render('profile2', {user : updated, publist : Pub_list, aulist : Auth_list})
  } catch (error) {
    console.log(error)
  }
})

router.get('/deleteaccount', (req, res) => {
  var del;
  del = { msg : "Your account has been deleted"}
  res.render('login', { del })
})


router.post('/query', (req, res) => {
  quer = req.body;
  var json;

  //Author Search
  if (quer.category === "Author"){
    var reg = /^-?\d*\.?\d*$/
    if (quer.query=="" || !(quer.query.match(reg)))
    {
        console.log("Empty keyword");
        res.render('search');
        
    }
    else{
      const options1 = {
        url: `http://api.elsevier.com/content/author?author_id=${quer.query}&view=metrics&apiKey=${MY_API_KEY}`,
        method: 'GET',
        headers: {'Accept':'application/json', 'X-ELS-APIKey': MY_API_KEY}
      };
      request(options1, function(err, response, body) {
        if (err){
          console.log(err)
          res.send(err)
        }else{
        console.log('test2')
        json = JSON.parse(body)
        console.log(json)
        res.render('author', {data : json, auid : quer.query})
        }
    });
    }
    
  }

  //scopus ID search
  else if(quer.category === "Publication"){ 
    var reg = /^-?\d*\.?\d*$/
    if (quer.query=="" || !(quer.query.match(reg)))
    {
        console.log("Empty/Faulty keyword");
        res.render('search');
        
    }
    else{
      const options2 = {
        url: `https://api.elsevier.com/content/abstract/scopus_id/${quer.query}`,
        method: 'GET',
        headers: {'Accept':'application/json', 'X-ELS-APIKey': MY_API_KEY}
      };
      let json;
      request(options2, function(err, response, body) {
        if (err){
          console.log(err)
          res.send(err)
        }else{
        json = JSON.parse(body)
        var results = json["abstracts-retrieval-response"]["coredata"];
        publ_creator = results["dc:creator"]["author"];
        res.render('publication', {data : json })
        }
      });
    }
  }

  //keyword search
  else if(quer.category === "Keyword"){
    var letterNumber = /^[0-9a-zA-Z]+$/;
    if (quer.query=="" || !(quer.query.match(letterNumber)))
   {
       console.log("Empty keyword");
       res.render('search');
   }
   else{
    const options3 = {
      url: `https://api.elsevier.com/content/search/scopus?query=all(${quer.query})`,
      method: 'GET',
      headers: {'Accept':'application/json', 'X-ELS-APIKey': MY_API_KEY}
     };
     let json;
      request(options3, function(err, response, body) {
        if (err){
          console.log(err)
          res.send(err)
        }else{
        json = JSON.parse(body)
        res.render('keyword', {data : json })
        }
      });
   }
  }
  else{
    console.log("No choice made");
    res.render('search');
  }
})




router.post('/saveauth', (req, res) => {
  var info =req.body
  info["email"] = curr_mail
  const newAuth = new Aulist(info);
  newAuth.save()
  .then(public => {
  req.flash(
  'success_msg',
  'Saved to list'
  );
  res.redirect('/profile');
  })
  .catch(err => console.log(err));

})

router.post('/savepubl', (req, res) => {
  var info =req.body
  info["authors"] = publ_creator
  info["email"] = curr_mail
  const newPubl = new Publist(info);
  newPubl.save()
  .then(public => {
  req.flash(
  'success_msg',
  'Saved to list'
  );
  res.redirect('/profile');
  })
  .catch(err => console.log(err));

})

module.exports = router

//7004212771
//0033001756
/* Publication
    - results = json["abstracts-retrieval-response"]["coredata"]"
    - What we need:
      results["dc:creator"]["0"] - array of objects containing author details, we take first creator - Iterate through this 
      results["dc:title"]
      results["dc:description"]
      results["citedby-count"]
      results["prism:publicationname"]
      results["link"]
*/ 

/* Author
  - results = json['author-retrieval-response'][0]
  - coredata = json['author-retrieval-response'][0]['coredtata']
  What we need:
    results["h-index"]
    results["coauthor-count"]
    coredata["document-count"]
    coredata["cited-by-count"]
    coredaata["citation-count"]
    */

/* Keyword 
  - results = json["search-results"]["entry"]
  what we need
    Scoppus Link : json["search-results"]["entry"][i]["link"][2]
    Scopus ID : json["search-results"]["entry"][i]["dc:identifier"]
    Title : json["search-results"]["entry"][i]["dc:title"]
    Creator : json["search-results"]["entry"][i]["dc:creator"]
    Publication : json["search-results"]["entry"][i]["prism:publicationName"]
    Cover Date : json["search-results"]["entry"][i]["prism:coverDisplayDate"]
*/