const express = require('express');
const router = express.Router();
const fuzz = require('fuzzball');

const tokens = ['4ed935d550ccd355c32b55f7e0b5305bdcf4a1bb', '1439a69802b7b0c29e70f70240c1d994fa6b849c', '86a1d65ebdff153878b814d30bcf3e98e7cf0aaa'];

router.get('/text-matcher', function (req, res) {
    res.render('index')
});

router.post('/text-matcher', function (req, res) {
    let start = now();
    let json = req.body;
    let query = req.query;

    if (tokens.indexOf(query.access_token) === -1) {
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

module.exports = router;