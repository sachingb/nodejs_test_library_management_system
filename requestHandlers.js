var bookTemplate = require("./bookTemplate");
var redis = require("redis");
var qs = require("querystring");
var utils = require("./util");

const BUCKET = "library";
const KEY_PREFIX = "book:store:id:";

const INVALID_REQUEST = "0";
const SUCCESS = "1";
const ERROR = "2";

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

   if (name == "" || id == ""){
      sendResponse(response, constructMessage(INVALID_REQUEST, "Request must have name and id"));
      return;
   }

   gid = utils.guid(name, id);
   //bookTemplate(na, i, aut, pub, pr, gid)
   bookEntry = bookTemplate.initialize(name, id, author, publisher, price, gid);

   var key = KEY_PREFIX+gid;
   client.hexists(BUCKET, key, function(err, reply){
      if (err){
         console.error("error response --- " + err );
         sendResponse(response, constructMessage(ERROR, "Something went wrong"));
         return;
      }

      if(reply === 1){
         console.log(key,"already exists");
         sendResponse(response, constructMessage(ERROR, "Entry with the book name already present"));
         return;
      }else{
         client.hset(BUCKET, key, JSON.stringify(bookEntry));
      }
   });

   sendResponse(response, constructMessage(SUCCESS,bookEntry));
}

function deleteRecord(response, postData){
   var post = qs.parse(postData);
   var key = KEY_PREFIX+post["guid"];
   client.hexists(BUCKET, key, function(err, reply){
      if(err){
         console.error("error response --- " + err);
         sendResponse(response, constructMessage(ERROR, "Something went wrong"));
         return;
      }

      if(reply === 1){
         client.hdel(BUCKET, key);
         sendResponse(response, constructMessage(SUCCESS, "Deleted record successfully"));
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
         sendResponse(response, constructMessage(ERROR, "Something went wrong"));
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

         sendResponse(response, constructMessage("SUCCESS",bookEntry));
      }
   });
}

function showAllRecords(response, postData){
   client.hgetall(BUCKET, function (err, replyObject) {
      if(err){
         console.error("Error while getting all --- "+err);
         sendResponse(response, constructMessage(ERROR, "Something went wrong"));
         return;
      }
      sendResponse(response, constructMessage(SUCCESS,replyObject));
   });
}

function sendResponse(response, responseData){
   response.setHeader('Access-Control-Allow-Origin', '*');
   response.writeHead(200, {"Content-Type" : "application/json"});
   response.write(JSON.stringify(responseData));
   response.end();
}

//Utility function to construct messages
function constructMessage(msg, data){
   return {"Msg" : msg, "Data": data};
}


exports.start = start;
exports.createNewRecord = createNewRecord;
exports.editRecord = editRecord;
exports.showAllRecords = showAllRecords;
exports.deleteRecord = deleteRecord;
