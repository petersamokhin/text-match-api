const express = require('express');
const engine = require('consolidate');
const app = express();
const logger = require('morgan');
const fuzz = require('fuzzball');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', __dirname + '/public');
app.set('view engine', 'html');
app.engine('html', engine.mustache);
app.use(express.static(__dirname + '/public'));
app.use(errorHandler);

app.get('/text-matcher', function (req, res) {
    res.render('index')
});
app.post('/text-matcher', function (req, res) {
    let start = now();
    let json = req.body;
    let query = req.query;

    if (!query.access_token || query.access_token.length < 1) {
        res.statusCode = 403;
        res.send(err('access_token is required!', json, query, now() - start));
        return
    }

    let texts = json.texts;

    if (!texts) {
        res.send(err("No texts to compare.", json, query, now() - start));
        return
    }

    if (texts.length > 2) {
        res.send(err('Now it is possible to compare only two texts.', json, query, now() - start));
        return
    }

    if (!json.methods || json.methods.size < 1) {
        res.send(err('Please provide at least one matching method.', json, query, now() - start));
        return
    }

    let result = [];

    json.methods.forEach(x => {
        switch (x) {
            case 'ratio':
                result.push({method: x, result: fuzz.ratio(texts[0], texts[1])});
                break;
            case 'distance':
                result.push({method: x, result: fuzz.distance(texts[0], texts[1]) * 100, note: 'Distance is in range [0..1], but for average calculation it multiplied by 100.'});
                break;
        }
    });

    let sum = 0;
    result.forEach(x => sum += x.result);
    let avg = sum / result.length;

    res.send({
        result: 'ok',
        values: result,
        average: avg,
        response_time: now() - start
    });
});

function err(descr, req, query, time) {
    return {
        description: descr,
        result: 'failed',
        request_params: req,
        query_params: query,
        response_time: time
    };
}

function now() {
    return new Date().getTime();
}

const port = 3001;
app.listen(3001, () => console.log('Text matcher listening on port ' + port + '!'));

function errorHandler (err, req, res, next) {
    res.status(err.statusCode || 500);
    res.send({ result: 'failed', error: err })
}