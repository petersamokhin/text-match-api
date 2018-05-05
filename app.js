const express = require('express');
const mainRouter = require('./routes/text-matcher');
const engine = require('consolidate');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', __dirname + '/public');
app.set('view engine', 'html');
app.engine('html', engine.mustache);
app.use(express.static(__dirname + '/public'));

app.use('/text-matcher', mainRouter);
app.use(errorHandler);

const port = 3001;
app.listen(3001, () => console.log('Text matcher listening on port ' + port + '!'));

function errorHandler (err, req, res, next) {
    res.status(err.statusCode || 500);
    res.send({ result: 'failed', error: err })
}