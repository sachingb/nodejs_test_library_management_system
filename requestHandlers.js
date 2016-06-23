var bookTemplate = require("./bookTemplate");
var redis = require("redis");
var qs = require("querystring");
var crypto = require('crypto');

const BUCKET = "library";
const KEY_PREFIX = "book:store:id:";

var client = redis.createClient();

function start(){

   client.on('connect', function() {
       console.log('connected');
   });
}

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

function sendResponse(response, responseData){
   response.setHeader('Access-Control-Allow-Origin', '*');
   response.writeHead(200, {"Content-Type" : "application/json"});
   response.write(JSON.stringify(responseData));
   response.end();
}

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
