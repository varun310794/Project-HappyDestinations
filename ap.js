var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var passport=require("passport");
var localStrategy=require("passport-local");
var methodOverride = require("method-override");
var campground=require("./modules/campground.js");
var comment=require("./modules/comment.js");
var user=require("./modules/user.js");
var seedDB=require("./seeds.js");
var flash=require("connect-flash");
app.use(express.static(__dirname+"/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(flash());


mongoose.connect('mongodb://varun:database1@ds155293.mlab.com:55293/knowyourdestination',  { useNewUrlParser: true });

//mongoose.connect('mongodb://localhost:27017/yelpCamp', { useNewUrlParser: true });
//--------------------------------------------------------------------------------------------------

//seedDB();


        
//--------------------------------------------------------------------------------------------------
// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});
//-------------------------------------------------------------------------------------------------------
app.get("/", function(req, res){
    res.render("homepage.ejs");
});
//--------------------------------------------------------------------------------------------------
app.get("/campgrounds", function(req, res){
   campground.find({}, function(err, allCamps){
       if(err){
           console.log("error");
       }else{
           res.render("campgrounds/index.ejs", {grounds:allCamps});
       }
   });

});
//--------------------------------------------------------------------------------------------------
app.post("/campgrounds",isLoggedIn, function(req, res){
    var n=req.body.name;
    var i=req.body.image;
    var d=req.body.description;
    var a = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground={name:n,img:i, body:d, author:a};
   campground.create(newCampground, function(err, camps){
       if(err){
         console.log("err");  
       }else{
         res.redirect("/campgrounds");  
       }
   });
});
//--------------------------------------------------------------------------------------------------
app.get("/campgrounds/new",isLoggedIn, function(req, res){
    res.render("campgrounds/new.ejs");
});
//--------------------------------------------------------------------------------------------------
app.get("/campgrounds/:id", function(req, res){
    campground.findById(req.params.id).populate("comments").exec(function(err, foundCamp){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/show.ejs", {foundCamp:foundCamp});
        }
    });
});
//--------------------------------------------------------------------------------------------------
app.get("/campgrounds/:id/comments/new",isLoggedIn, function(req, res){
    campground.findById(req.params.id, function(err, foundCamp){
        if(err){
            console.log(err);
        }else{
        res.render("comments/new.ejs",{foundCamp:foundCamp});
    
        }
    });
    
});


app.post("/campgrounds/:id/comment",isLoggedIn, function(req, res){

campground.findById(req.params.id, function(err, foundCamp){
    if(err){
        console.log("First Error: "+err);
    }else{
    
        var newComment=req.body.comment;
        comment.create(newComment, function(err, newComment){
            if(err){
                console.log("Second Error: "+err);
            }else{
                newComment.author.id=req.user._id;
                newComment.author.username=req.user.username;
                newComment.save();
                foundCamp.comments.push(newComment);
                foundCamp.save(function(err){
                    if(err){
                        console.log("Third Error: "+err);
                    }else{
                        res.redirect('/campgrounds/'+ foundCamp._id);
                    }
                });
            }
        });
    }
});

    
});

// COMMENT EDIT ROUTE
app.get("/campgrounds/:id/comments/:comment_id/edit",checkCommentOwnership, function(req, res){
   comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
          res.redirect("back");
      } else {
        res.render("comments/edit.ejs", {campground_id: req.params.id, comment: foundComment});
      }
   });
});


// COMMENT UPDATE
app.put("/campgrounds/:id/comments/:comment_id", function(req, res){
    campground.findById(req.params.id, function(err, foundCamp){
    if(err){
        console.log(err);
    }
    else{
    comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
    
      if(err){
        res.redirect("back");
      } else {
          res.redirect("/campgrounds/" + req.params.id );
      }
   });
}});
});


// COMMENT DESTROY ROUTE
app.delete("/campgrounds/:id/comments/:comment_id",checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});


function checkCommentOwnership(req, res, next) {
 if(req.isAuthenticated()){
        comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               res.redirect("back");
           }  else {
               // does user own the comment?
            if(foundComment.author.id.equals(req.user._id)) {
                next();
            } else {
                res.redirect("back");
            }
           }
        });
    } else {
        res.redirect("back");
    }
}



//--------------------------------------------------------------------------------------------------
// show register form
app.get("/register", function(req, res){
    res.render("register.ejs");
});

//handle sign up logic
app.post("/register", function(req, res){
    var newUser = new user({username: req.body.username});
    user.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/campgrounds"); 
        });
    });
}); 

// show login form
app.get("/login", function(req, res){
   res.render("login.ejs"); 
});

// handling login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
});

// logic route
app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//---------------------------------------------------------------------------------------------------
//Edit route
app.get("/campgrounds/:id/edit", function(req, res){
    campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit.ejs", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
app.put("/campgrounds/:id",checkCampgroundOwnership, function(req, res){
    // find and update the correct campground
    campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       } else {
           //redirect somewhere(show page)
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

// DESTROY CAMPGROUND ROUTE
app.delete("/campgrounds/:id",checkCampgroundOwnership, function(req, res){
   campground.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/campgrounds");
      } else {
          res.redirect("/campgrounds");
      }
   });
});


function checkCampgroundOwnership(req, res, next) {
 if(req.isAuthenticated()){
        campground.findById(req.params.id, function(err, foundCampground){
           if(err){
               res.redirect("back");
           }  else {
               // does user own the campground?
            if(foundCampground.author.id.equals(req.user._id)) {
                next();
            } else {
                res.redirect("back");
            }
           }
        });
    } else {
        res.redirect("back");
    }
}


//----------------------------------------------------------------------------------------------------   
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The server has started");
});


//, middleware.checkCampgroundOwnership
