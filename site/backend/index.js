const express = require("express");
const app = express();
const passport=require("passport");
const passportSetup=require("./config/passport-setup");
const session=require('express-session')
const port= 4000;

app.use(passport.initialize());
app.use(session({
     secret: 'keyboard cat',
     resave: true,
     saveUninitialized: true }
));



/* Path for auth/discord from browser*/
app.get('/auth/discord',passport.authenticate('discord',{permissions:8 }));
app.get('/auth/discord/callback',passport.authenticate('discord',{
    failureRedirect:'/'
}), function(req,res){
    res.redirect('http://localhost:3000/')
});

app.listen(port, () => console.log('Server is running on port '+ port));

