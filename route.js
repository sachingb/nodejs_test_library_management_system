function route(handle, pathname, response, postData){
   console.log("About to route a request for "+pathname);

   //Route the requests to the specific request handler functions
   if(typeof handle[pathname] === 'function'){
      handle[pathname](response, postData);
   }else{
      console.log("No request found for the handler "+pathname)
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 not found");
      response.end();
   }
}

exports.route = route;
