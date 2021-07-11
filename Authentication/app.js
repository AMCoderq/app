const express               =  require('express'),
      app                   =  express(),
      mongoose              =  require("mongoose"),
      passport              =  require("passport"),
      bodyParser            =  require("body-parser"),
      LocalStrategy         =  require("passport-local"),
      passportLocalMongoose =  require("passport-local-mongoose"),
      User                  =  require("./models/user");

      const ShortUrl = require('./models/shortUrl')

mongoose.connect("mongodb://localhost/auth_demo");
app.use(require("express-session")({
    secret:"Any normal Word",       
    resave: false,          
    saveUninitialized:false    
}));
passport.serializeUser(User.serializeUser());       
passport.deserializeUser(User.deserializeUser());   
passport.use(new LocalStrategy(User.authenticate()));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded(
      { extended:true }
))
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req,res) =>{
    res.render("home");
})
app.get("/userprofile",isLoggedIn ,(req,res) =>{
    res.render("userprofile");
})

app.get("/login",(req,res)=>{
    res.render("login");
});
app.post("/login",passport.authenticate("local",{
    successRedirect:"/url",
    failureRedirect:"/login"
}),function (req, res){
});
app.get("/register",(req,res)=>{
    res.render("register");
});
app.post("/register",(req,res)=>{
    
    User.register(new User({username: req.body.username,phone:req.body.phone,telephone: req.body.telephone}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.render("register");
        }
    passport.authenticate("local")(req,res,function(){
        res.redirect("/login");
    })    
    })
})
app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});
function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
app.get('/url', async (req, res) => {
    const shortUrls = await ShortUrl.find()
    res.render('index', { shortUrls: shortUrls })
  })
  
  app.post('/shortUrls', async (req, res) => {
    await ShortUrl.create({ full: req.body.fullUrl })
  
    res.redirect('/url')
  })
  
  app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
    if (shortUrl == null) return res.sendStatus(404)
  
    shortUrl.clicks++
    shortUrl.save()
  
    res.redirect(shortUrl.full)
  })

app.listen(process.env.PORT ||3000,function (err) {
    if(err){
        console.log(err);
    }else {
        console.log("Server Started At Port 3000");
    }
      
});