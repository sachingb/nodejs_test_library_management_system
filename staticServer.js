var connect = require("connect");
var serveStatic = require("serve-static");

//to server index.html
function start(){
   connect().use(serveStatic("webpage")).listen(8080, function(){
      console.log("Http server running on 8080");
   });
}

exports.start = start;
