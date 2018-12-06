const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const app = express();
const port = 3000;

const auth = require('./auth');
// Middleware
app.use(bodyParser.json());                         // application/json
app.use(bodyParser.urlencoded({ extended: true })); // application/x-www-form-urlencoded
app.use(session({ secret: 'passport-tutorial', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));
app.use(express.static('static'));

/* enable cors */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
    next();
});


/* Mongoose */
mongoose.connect('mongodb://mongo:27017/local');

var Schema = mongoose.Schema;

const itemSchema = new Schema({
    name: {type: String, unique: true, required: true}
});



// User schema
const UserSchema = new Schema({
    email: String,
    hash: String,
    salt: String,
});

UserSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.validatePassword = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

UserSchema.methods.generatejsonwebtoken = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);
    
    return jsonwebtoken.sign({
        email: this.email,
        id: this._id,
        exp: parseInt(expirationDate.getTime() / 1000, 10),
    }, 'secret');
}

UserSchema.methods.toAuthJSON = function() {
    return {
        _id: this._id,
        email: this.email,
        token: this.generatejsonwebtoken(),
    };
};

/* models */
var Item = mongoose.model('Item', itemSchema);
var User = mongoose.model('User', UserSchema);

require('./passport');



/* Endpoints */
app.get('/api/item', (req, res) => {
    
    console.log("get request arrived:");
    
    Item.find({}, (err, data) => {
        console.log(err, data);
        res.send(data);
    });
    
});

app.post('/api/item', (req, res) => {
    /* res.send('Posting to Item list...') */
    //let item = new Item(req.body);
    
    console.log("post request arrived: ", req.body);
    let item = new Item(req.body);
    item.save((err) => {
        if (err) console.log(err);
        else Item.find({}, (error, dta) => {
            console.log(error, dta);
            res.send(dta);
        })
    });
    
});


app.delete('/api/item', (req, res) => {
    console.log('Delete request received: ', req.body);
    Item.deleteOne({_id: req.body._id}, err => {
        if (err) console.log(err);
    });
    Item.find({}, (err, dta) => {
        console.log(err, dta);
        res.send(dta);
    });
});

/* register */
app.post('/api/register', auth.optional, (req, res, next) => {
    const { body: { user } } = req;
    
    if(!user.email) {
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }
    
    if(!user.password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }
    
    const finalUser = new User(user);
    
    finalUser.setPassword(user.password);
    
    return finalUser.save()
    .then(() => res.json({ user: finalUser.toAuthJSON() }));
});

// login
app.post('/api/login', auth.optional, (req, res, next) => {
    const { body: { user } } = req;
    
    if(!user.email) {
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }
    
    if(!user.password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }
    
    return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
        if(err) {
            return next(err);
        }
        
        if(passportUser) {
            const user = passportUser;
            user.token = passportUser.generatejsonwebtoken();
            
            return res.json({ user: user.toAuthJSON() });
        }
        
        return status(400).info;
    })(req, res, next);
});

//GET current route (required, only authenticated users have access)
app.get('/api/current', auth.required, (req, res, next) => {
    const { payload: { id } } = req;
    
    return User.findById(id)
    .then((user) => {
        if(!user) {
            return res.sendStatus(400);
        }
        
        return res.json({ user: user.toAuthJSON() });
    });
});


app.listen(port, () => console.log(`App listening on port ${port}`));