var crypto = require('crypto');


function guid(name, id) {
  var shasum = crypto.createHash("md5");
  shasum.update(name+id);
  var unique_id = shasum.digest('hex');
  return unique_id;
}

exports.guid = guid;
