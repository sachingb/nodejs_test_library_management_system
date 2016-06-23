var server = require("./server");
var route = require("./route");
var requestHandlers = require("./requestHandlers");

handle = {};
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/createNewRecord"] = requestHandlers.createNewRecord;
handle["/editRecord"] = requestHandlers.editRecord;
handle["/showAllRecords"] = requestHandlers.showAllRecords;
handle["/deleteRecord"] = requestHandlers.deleteRecord;

server.start(route.route, handle);
