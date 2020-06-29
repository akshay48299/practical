/**
* Created by Akshay Sangani.
* User: theta-ubuntu-1
* Date: 05/05/20
* Time: 12:40 PM
*/
let fs = require('fs');
module.exports = {
  isNotEmpty: function(value) {
    return ((value != '') && (value != 0) && (value != undefined) && (value != null))
  }
};
