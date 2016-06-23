var http = require("http");
var url = require("url");
var bookTemplate = require("./bookTemplate");
var requestHandlers = require("./requestHandlers");


function start(route, handle){
   function onRequest(request,response){
      var postData = "";
      var pathname = url.parse(request.url).pathname;

      console.log("Reuest for "+ pathname + "received.");

      request.setEncoding("utf8");

      request.addListener("data", function(postChunkData){
         postData += postChunkData;
         console.log("Received post data chunk "+postChunkData);
      });

      request.addListener("end", function(){
         route(handle, pathname, response, postData);
      });
   }

   requestHandlers.start();
   http.createServer(onRequest).listen(8888);
   console.log("Server has started");
}

exports.start = start;
