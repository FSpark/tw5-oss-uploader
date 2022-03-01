/*\
title: $:/plugins/FSpark/file-uploads-Aliyun-OSS/utils.js
type: application/javascript
module-type: library
\*/

const REGEXP_IMAGE_TYPE = /^image\/.+$/;
exports.bytesToSize = function (bytes) {
    if (bytes === 0) return '0 B';
    var k = 1024, 
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
 
   return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

exports.isImageType=function (value) {
  return REGEXP_IMAGE_TYPE.test(value);
}

exports.imageTypeToExtension=function (value) {
  let extension = exports.isImageType(value) ? value.substr(6) : '';

  if (extension === 'jpeg') {
    extension = 'jpg';
  }

  return `.${extension}`;
}

exports.isInArray=function (arr,value){
    for(var i = 0; i < arr.length; i++){
        if(value === arr[i]){
            return true;
        }
    }
    return false;
}