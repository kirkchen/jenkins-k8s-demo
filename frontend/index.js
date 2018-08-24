let http = require('http');
let request = require('request');

let ip = "0.0.0.0";
let port = 8100;
let backendUrl = process.env.BACKEND_URL || 'http://localhost:8200'

function onRequest(req, resp) {
    request(backendUrl, function (error, backendResp, body) {
        console.log("Frontend request received.");
        resp.writeHead(200, { "Content-Type": "text/plain" });
        resp.write("Hello Frontend\n" + body);
        resp.end();
    })
}

http.createServer(onRequest).listen(port, ip);
console.log("Frontend server has started.");