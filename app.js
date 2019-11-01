let express = require('express');
let path = require('path');
let logger = require('morgan');
let cors = require('cors');
const Response = require('./util/Response'); 

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
//app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    //res.sendStatus(resp.headers.status);
    res.json(Response.error('Invalid Resource'));
});

let routeV1 = require('./routes/v1/index');
app.use('/v1', routeV1);

module.exports = app;
