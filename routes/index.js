var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./posts');
const passport = require('passport');
const upload = require('./multer');
//inn do lino se user login hota hein 
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', (req,res)=>{
  res.render('login', {error: req.flash('error')});
});


router.get('/profile',isLoggedIn, async(req, res, next)=>{
  const user= await  userModel.findOne({
    username: req.session.passport.user
  })
    .populate('posts');
      res.render("profile" ,{user : user, nav: true}) ;   //send
});

router.get('/feed',isLoggedIn, async (req,res)=>{
  const user= await  userModel.findOne({
    username: req.session.passport.user
  })
  const posts= await postModel.find()
  .populate("user");
  res.render('feed', {user: user,posts,nav:true});
});

router.get('/show/posts',isLoggedIn, async(req, res, next)=>{
  const user= await  userModel.findOne({
    username: req.session.passport.user
  })
    .populate('posts');
      res.render("show" ,{user : user, nav: true}) ;   //send
});

router.get('/add',(req,res)=>{
  res.render('add',{nav: true});
});

router.post('/fileupload', isLoggedIn, upload.single('image'), async (req,res,next)=>{
const user= await userModel.findOne({username:req.session.passport.user});
user.profileimage = req.file.filename;
await user.save();
res.redirect('/profile');
});

router.post('/upload', isLoggedIn, upload.single('file'),async(req,res)=>{
  if(!req.file){
    return res.status(404).send('No files were uploaded.');
  }
  //jo bhi file upload huyi hein usse save kro as a post and user id aur post id ka len den kro 
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.create({
    image: req.file.filename,
    title:req.body.title,
    description: req.body.fileCaption,
    user: user._id,
  });

    user.posts.push(post._id); 
    await user.save();
   res.redirect('/profile');
});

router.post("/register", (req, res) => {
  const userData = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname,
  });

  userModel.register(userData, req.body.password, (err) => {
    if (err) {
      if (err.name === 'UserExistsError') {
        // Handle the case where the username is already taken
        res.render('index', { error: 'Username is already taken. Please choose a different one.' });
      }
      else if (err.name === 'E11000') {
        // Render the registration page with an error message
        res.render('register', { error: 'Email is already associated with an existing account. Please choose a different one.', userData: userData }); 
      }
        else {
        // Handle other types of errors
        console.error('Registration error:', err);
        res.render('index', { error: 'An error occurred during registration. Please try again later.' });
        }
    } else {
      // User registration successful
      passport.authenticate("local")(req, res, () => {
        res.redirect('/profile');
      });
    }
  });
});


router.post("/login", passport.authenticate("local",{
  successRedirect: "/profile", // redirect to the secure profile section
  failureRedirect: "/login", // redirect back
  failureFlash: true // allow flash messages
}), (req,res)=>{
});

router.get("/logout", function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) return next();
  res.redirect('/');
}

module.exports = router;
















/*router.get('/createUser', async (req, res) => {
let createdUser = await userModel.find();/*userModel.create({
    username: "Kimi",
    password: "123456",
    email: "kimi@Mail.com",
    fullname: "kimi goyal "
  });
  res.send(createdUser);
});


router.get('/createPost', async (req, res) => {
  let createdPost =await postModel.create({
    postText: "Hi , I am your first post",
    user:"66080ac29f213ef4b5f2df74",
  });
  let user =  await userModel.findOne({_id: "66080ac29f213ef4b5f2df74"});
  user.posts.push(createdPost._id);
  await user.save();
  res.send(createdPost);
});*/