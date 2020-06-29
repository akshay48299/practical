/**
* Created by Akshay Sangani.
* User: theta-ubuntu-1
* Date: 05/05/20
* Time: 12:40 PM
*/
let fs = require('fs');
module.exports = {
  deleteFiles: function(files, callback){
    var i = files.length;
    files.forEach(function(filepath){
      fs.exists(filepath, function (exists) {
        if (exists) {
          fs.unlink(filepath, function(err) {
            i--;
            if (err) {
              callback(err);
              return;
            } else if (i <= 0) {
              callback(null);
            }
          });
        } else {
          i--;
          if (i <= 0) {
            callback(null);
          }
        }
      });
    });
  }
};
