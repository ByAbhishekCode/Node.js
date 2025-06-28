const http = require("http");
const fs = require("fs");

const myServer = http.createServer((req, res) => {
  const log = `${Date.now()}: ${req.url} New Req Recevied\n`;
  fs.appendFile("log.txt", log, (err, data) => {
    switch(req.url){
    case '/' : res.end("Home Page")
    break
    case '/about' : res.end("About page")
    break
    case '/contact' : res.end('contact')
    break
    default: req.end('404 server error')
    }
    res.end("Hello From sever");
  });
});

myServer.listen(1234, () => {
  console.log("server here started at:-> 1234 ");
});
