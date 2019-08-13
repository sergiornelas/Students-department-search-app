var express = require("express");
var router = express.Router(); //para utilizar toodo este código en app.js
var Campground = require("../models/campground");
var middleware = require("../middleware"); //automaticamente se selecciona "index.js"

//display all campgrounds page (INDEX)
router.get("/",  function(req, res){
    //Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){ //this campgrounds
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index",{campgrounds:allCampgrounds}); //is refering to this.
        }
    });
});

//add new yelpcamp to database (CREATE)
router.post("/", middleware.isLoggedIn, function(req, res){ // "/campgrounds"
    //get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, price: price, image: image, description: desc, author:author}

    //Create a new campground and save it to database
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
});

//display form-page to create new campground (NEW)
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

//Shows more info about one campground (SHOW)
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });  
});

        //RECUERDA QUE DEBEN ESTAR EN ORDEN LOS RESTFUL METHODS!!!
        //SI COLOCAS PRIMERO router.get("/campgrounds/:id".. QUE ESTE router.get("/campgrounds/new"..
        //router.get("/campgrounds/:id".. va a interpretar /new como si fuera un id

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        } else {
            // redirect somewhere (show page)
            res.redirect("/campgrounds/" + req.params.id);
        }
    });    
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

// PARA BORRAR CAMPGROUND JUNTO SUS COMENTARIOS, REEMPLAZAR CON (//DESTROY CAMPGROUND ROUTE)
// router.delete("/:id", checkCampgroundOwnership, (req, res) => {
//     Campground.findByIdAndRemove(req.params.id, (err, campgroundRemoved) => {
//         if (err) {
//             console.log(err);
//         }
//         Comment.deleteMany( {_id: { $in: campgroundRemoved.comments } }, (err) => {
//             if (err) {
//                 console.log(err);
//             }
//             res.redirect("/campgrounds");
//         });
//     })
// });

module.exports = router;