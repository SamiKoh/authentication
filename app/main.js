const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());                         // application/json
app.use(bodyParser.urlencoded({ extended: true })); // application/x-www-form-urlencoded

app.use(express.static('static'));
mongoose.connect('mongodb://mongo:27017/local');

var Schema = mongoose.Schema;

const itemSchema = new Schema({
    name: {type: String, unique: true, required: true}
});

var Item = mongoose.model('Item', itemSchema);

/* enable cors */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
    next();
});


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





app.listen(port, () => console.log(`App listening on port ${port}`));