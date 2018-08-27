const express = require("express")
const router = express.Router()
const User = require("../model/user")
const bodyparser = require("body-parser")
const auth = require("../middlewares/auth")
const crypto = require("crypto")

const app = express()

const urlencoder = bodyparser.urlencoded({
  extended : true
})

router.use(urlencoder)
// localhost:3000/post/

router.post("/login", (req, res) => { //controller/user
    console.log("POST /login");

    var username = req.body.logusername;
    var password = encrypt(req.body.logpassword);

    console.log("encrypted pw:" +password);

    User.getOneByUnameAndPword({
        username,
        password
    }).then((user)=>{
        if(user != null){
            console.log(user.username + ": " + user.password);
            req.session.username = user.username;
            console.log("uname sesh: "+req.session.username);

            res.redirect("/")
        }
        else{
            res.redirect("/")
            console.log("cannot login")
        }
    }, (err)=>{
        res.render("landing.hbs")
    })
});

router.post("/register", urlencoder, (req, res) => { //user
    console.log("POST /register");

    var username = req.body.regusername;
    var name = req.body.regname;
    var password = req.body.regpassword;
    var conpassword = req.body.regconfirmpassword;
    var description = req.body.regshortdescription;

    User.getOneByUname(
        username
    ).then((user)=>{
        if(user == null){
            if(password == conpassword){
                var hashedpassword = encrypt(password);

                var f = new User({
                    username, name, password: hashedpassword, description
                })

                User.createNew(f)

                req.session.username = username
            }
            else{
                // not same password
                console.log("ERROR: Not same password")
                res.render("landing.hbs")
            }
        }
        else{
            console.log("ERROR: Username taken")
            res.render("landing.hbs")
            // username exists
        }
    }, (err)=>{
        res.render("landing.hbs")
    })
});


//functions:
function encrypt(text) {
  return crypto.createHash("md5").update(text).digest("hex")
}

module.exports = router