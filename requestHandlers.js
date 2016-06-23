var bookTemplate = require("./bookTemplate");
var redis = require("redis");
var qs = require("querystring");
var crypto = require('crypto');

const BUCKET = "library";
const KEY_PREFIX = "book:store:id:";

//using redis for database
var client = redis.createClient();

function start(){

   client.on('connect', function() {
       console.log('connected');
   });
}


/*Function to create a new record
1) Create a hash by taking two items which are going to be unique(I'm asuming that the name and id
are going to be unique).
2) Create a hset with that as a key and store the value
*/
function createNewRecord(response, postData){
   var post = qs.parse(postData);

   console.log(post);

   name = post["bookname"];
   id = post["bookid"];
   author = post["author"];
   publisher = post["publisher"];
   price = post["price"];
   gid = guid(name, id);
   //bookTemplate(na, i, aut, pub, pr, gid)
   bookEntry = bookTemplate.initialize(name, id, author, publisher, price, gid);

   var key = KEY_PREFIX+gid;
   client.hexists(BUCKET, key, function(err, reply){
      if (err){
         console.error("error response --- " + err );
         return;
      }

      if(reply === 1){
         console.log(key,"already exists");
      }else{
         client.hset(BUCKET, key, JSON.stringify(bookEntry));
      }
   });

   sendResponse(response, bookEntry);
}

function deleteRecord(response, postData){
   var post = qs.parse(postData);
   var key = KEY_PREFIX+post["guid"];
   client.hexists(BUCKET, key, function(err, reply){
      if(err){
         console.error("error response --- " + err);
         return;
      }

      if(reply === 1){
         client.hdel(BUCKET, key);
         sendResponse(response, {"status" : "success"});
      }
   })
}

function editRecord(response, postData){
   post = qs.parse(postData);
   guid = post["guid"];
   if (guid === "new"){
      createNewRecord(response, postData);
      return;
   }
   key = KEY_PREFIX+guid;
   client.hexists(BUCKET, key, function(err, reply){
      if(err){
         console.error("error response --- " + err);
         return;
      }
      if(reply === 1){
         name = post["bookname"];
         id = post["bookid"];
         author = post["author"];
         publisher = post["publisher"];
         price = post["price"];
         bookEntry = bookTemplate.initialize(name, id, author, publisher, price, guid);
         client.hset(BUCKET, key, JSON.stringify(bookEntry));

         sendResponse(response, bookEntry);
      }
   });
}

function showAllRecords(response, postData){
   client.hgetall(BUCKET, function (err, replyObject) {
      if(err){
         console.error("Error while getting all --- "+err);
         return;
      }
      sendResponse(response, replyObject);
   });
}

//utility function to handle response
//TODO : handle cases for all responses , 404, 300 etc.
function sendResponse(response, responseData){
   response.setHeader('Access-Control-Allow-Origin', '*');
   response.writeHead(200, {"Content-Type" : "application/json"});
   response.write(JSON.stringify(responseData));
   response.end();
}

//TODO : Move all utility functions to a different js file
function guid(name, id) {
  var shasum = crypto.createHash("md5");
  shasum.update(name+id);
  var op = shasum.digest('hex');
  return op;
}

exports.start = start;
exports.createNewRecord = createNewRecord;
exports.editRecord = editRecord;
exports.showAllRecords = showAllRecords;
exports.deleteRecord = deleteRecord;
