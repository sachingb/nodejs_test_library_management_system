var $TABLE = $('#table');

const SHOW_ALL_RECORDS_END_POINT = "http://localhost:8888/showAllRecords";
const DELETE_RECORD_END_POINT = "http://localhost:8888/deleteRecord";
const UPDATE_RECORD_END_POINT = "http://localhost:8888/editRecord";
const CREATE_RECORD_END_POINT = "http://localhost:8888/createNewRecord";

const COLUMN_NAMES = ["bookname","bookid","author","publisher","price"];


function attachHandlers(){

  $('.table-add').click(function () {
    var $clone = $TABLE.find('tr.hide').clone(true).removeClass('hide table-line');
    $TABLE.find('table').append($clone);
  });

  $('.table-remove').click(function () {
    $(this).parents('tr').detach();
  });

};

function loadAllEntries(){

  $.post(SHOW_ALL_RECORDS_END_POINT,{},
    function(data){
      //map of all the book entries
      console.log(data);
      for (var key in data) {

        if(data.hasOwnProperty(key)){
          console.log(key + " " + data[key]);
          makeRow(JSON.parse(data[key]));
        }

      }
    });
}

function deleteEntry(param){
  var key = param.split("_")[1];
  console.log("Key to be deleted is "+key);

  $.post(DELETE_RECORD_END_POINT, {"guid" : key},
    function(data){
      document.location.href = document.location.href.split("?")[0];
    });
}

function createEntry(param){
  var key = "new"

  postObj = {};
  $("#"+key).each(function(){
      var i = 0;
      $('td', this).each(function(){
        var item = $(this).find(":input").val();
        postObj[COLUMN_NAMES[i]] = item;
        i++;
      });
  });
  postObj["guid"] = key;

  $.post(CREATE_RECORD_END_POINT, postObj,
    function(data){
      document.location.href = document.location.href.split("?")[0];
    });
}

function updateEntry(param){
  var key = "new"

  if(param != "new"){
    key = param.split("_")[1];
  }

  postObj = {};
  $("#"+key).each(function(){
      var i = 0;
      $('td', this).each(function(){
        var item = $(this).find(":input").val();
        postObj[COLUMN_NAMES[i]] = item;
        i++;
      });
  });
  postObj["guid"] = key;

  // console.log(postObj);

  $.post(UPDATE_RECORD_END_POINT, postObj,
    function(data){
      document.location.href = document.location.href.split("?")[0];
    });
}

function newRow($table,cols, id){
    $row = $("<tr id = '"+id+"'/>");
    for(i=0; i<cols.length; i++){
        $col = $("<td/>");
        $col.append(cols[i]);
        $row.append($col);
    }
    $table.append($row);
}

function makeRow(data){
  $table = $("#book_table");
  var dataID = data["guid"];
  var deleteID = "delete_"+dataID;
  var saveID = "save_"+dataID;

  //Disabling edit option for name and id field as these are used to create the hash
  tdName = ("<textarea id=bookname disabled='true'>"+data["bookname"]+"</textarea>");
  tdId = ("<textarea id=bookid disabled='true'>"+data["bookid"]+"</textarea>");

  tdAuthor = ("<textarea id=author >"+data["author"]+"</textarea>");
  tdPublisher = ("<textarea id=publisher >"+data["publisher"]+"</textarea>");
  tdPrice = ("<textarea id=price >"+data["price"]+"</textarea>");
  tdDelete = ("<span class='table-remove glyphicon glyphicon-remove' id = '"+deleteID+"' onclick='deleteEntry( \""+deleteID+"\")'></span>");
  tdSave = ("<button class='btn btn-info' id = '"+saveID+"' onclick='updateEntry( \""+saveID+"\")'>Save Data</button>");

  newRow($table,[tdName, tdId, tdAuthor,tdPublisher, tdPrice, tdDelete, tdSave],dataID);

}
