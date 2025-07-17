const http = require("http");
const fs = require("fs");
const myServer = http.createServer((req, res) => {
  const log = `${Date.now()} and Path is:-> ${req.url} <-: New Req Recevied\n`;
  fs.appendFile("log.txt", log, (err, data) => {
    switch (req.url) {
      case "/":
        res.end("Hello From Home");
        break;
      case "/about":
        res.end("Hello From Abhishek form about");
        break;
      default:
        res.end("404 Not Found");
    }
  });
  console.log("New Request Recived");
});

myServer.listen(8000, () => console.log("Server Started..."));

