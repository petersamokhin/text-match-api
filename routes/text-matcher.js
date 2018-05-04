const express = require('express');
const router = express.Router();
const fuzz = require('fuzzball');

const tokens = ['4ed935d550ccd355c32b55f7e0b5305bdcf4a1bb', '1439a69802b7b0c29e70f70240c1d994fa6b849c', '86a1d65ebdff153878b814d30bcf3e98e7cf0aaa'];

router.post('/', function (req, res) {
    let start = now();
    let json = req.body;
    let query = req.query;

    if (tokens.indexOf(query.access_token) === -1) {
        res.send(err('Access token required!', json, query, now() - start));
        return
    }

    let texts = json.texts;

    if (!texts) {
        res.send(err("No texts to compare", json, query, now() - start));
        return
    }

    if (texts.length > 2) {
        res.send(err('Now supported only 2 texts compare', json, query, now() - start));
        return
    }

    let method = json.method;

    let result;

    switch (method) {
        case 'ratio':
            result = fuzz.ratio(texts[0], texts[1]);
            break;
        case 'distance':
            result = fuzz.distance(texts[0], texts[1]);
            break;
        case 'ratio_distance':
            let r = fuzz.ratio(texts[0], texts[1]);
            let d = fuzz.distance(texts[0], texts[1]) * 100;
            result = (r + d) / 2;

            res.send({
                result: 'ok',
                ratio: r,
                distance: d,
                avg: result,
                response_time: now() - start
            });
            return;
        default:
            res.send(err('Unknown method name', json, query));
            return;
    }

    res.send({
        result: 'ok',
        value: result,
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