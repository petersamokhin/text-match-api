$(document).ready(function () {
    setListeners();
    matchTexts();
    $.ajaxSetup({traditional: true});
});

function setListeners() {
    ['#text-0', '#text-1'].forEach(x => $(x).on("change keyup paste", matchTexts))
}

function matchTexts() {
    let text0 = $('#text-0').val();
    let text1 = $('#text-1').val();
    let out = $('#output');

    let body = {};

    body.texts = [text0, text1];
    body.methods = ['ratio', 'distance'];

    console.log(body);

    $.post('/text-matcher?access_token=4ed935d550ccd355c32b55f7e0b5305bdcf4a1bb', body, function (response) {
        console.log(JSON.stringify(response));
        switch (response.result) {
            case 'failed':
                out.removeClass('success');
                out.addClass('error');
                out.html('<b>Error:</b> ' + response.description);
                break;
            case 'ok':
                out.removeClass('error');
                out.addClass('success');
                out.html(parseOutput(response.values));
                break;
            default:
                out.removeClass('success');
                out.addClass('error');
                out.html('<b>Unknown error:</b> ' + JSON.stringify(response));
                break;
        }
    });
}

function parseOutput(items) {
    return items.map(item => item.method + ': ' + item.result + '<br>')
}