const express = require('express');
const path = require('path');
const mainRouter = require('./routes/text-matcher');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/text-matcher', mainRouter);
app.use(errorHandler);

const port = 3001;
app.listen(3001, () => console.log('Text matcher listening on port ' + port + '!'));

function errorHandler (err, req, res, next) {
    res.status(err.statusCode);
    res.send({ result: 'failed', error: err })
}