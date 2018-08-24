http = require('http');

let ip = "0.0.0.0";
let port = 8200;

function onRequest(request, response) {
    console.log("Backend request received.");
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.write("Hello Backend");
    response.end();
}

http.createServer(onRequest).listen(port, ip);
console.log("Backend server has started.");