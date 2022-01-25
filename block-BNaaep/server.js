var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");

var server = http.createServer(handleRequest);

var userPath = __dirname + "/contacts/";

function handleRequest(req, res) {
  let parsedURl = url.parse(req.url, true);
  console.log(parsedURl.query);

  let pathname = parsedURl.pathname;

  var store = "";
  req.on("data", (chunk) => {
    store += chunk;
  });

  req.on("end", () => {
    //Web Pages
    if (req.method === "GET" && pathname === "/") {
      fs.createReadStream(__dirname + "/index.html").pipe(res);
    } else if (req.method === "GET" && pathname === "/about") {
      fs.createReadStream(__dirname + "/about.html").pipe(res);
    }

    //CSS
    else if (
      (req.method === "GET" && pathname.split(".").pop() === "css") ||
      pathname.split(".").pop() === "scss"
    ) {
      res.setHeader("Content-Type", "text/css");
      fs.readFile("./assets/" + pathname, (err, content) => {
        if (err) return console.log(err);
        return res.end(content);
      });
    }

    //Images
    else if (
      req.method === "GET" &&
      (pathname.split(".").pop().toLowerCase() === "jpg" ||
        pathname.split(".").pop().toLowerCase() === "webp")
    ) {
      res.setHeader(
        "Content-Type",
        `image/${pathname.split(".").pop().toLowerCase()}`
      );
      fs.readFile("./assets/" + pathname, (err, content) => {
        if (err) return console.log(err);
        return res.end(content);
      });
    }

    //Form methods

    //To display users
    else if (pathname === "/users" && req.method === "GET") {
      var username = parsedURl.query.username;
      fs.readFile(userPath + username + ".json", (err, content) => {
        if (err) return console.log(err);
        res.setHeader("Content-Type", "application/json");
        return res.end(content);
      });
    }

    //To get user
    else if (pathname === "/contact" && req.method === "GET") {
      res.setHeader("Content-Type", "text/html");
      fs.createReadStream("./contact.html").pipe(res);
    }

    //To save user
    else if (pathname === "/form" && req.method === "POST") {
      var parsedData = qs.parse(store);
      if (!parsedData.username) return res.end("Username is required");
      if (!parsedData.name) return res.end("Name is required");
      fs.open(userPath + parsedData.username + ".json", "wx", (err, fd) => {
        if (err) return console.log(err);
        fs.writeFile(fd, JSON.stringify(parsedData), (err) => {
          if (err) return console.log(err);
          fs.close(fd, () => {
            return res.end(`${parsedData.username} created successfully`);
          });
        });
      });
    }

    //Error
    else {
      res.statusCode = 404;
      res.end("Page not found");
    }
  });
}

server.listen(5000, () => {
  console.log("Server listening to port 5000");
});
