/*\
title: $:/plugins/FSpark/file-uploads-Aliyun-OSS/uploader.js
type: application/javascript
module-type: uploader

Handles uploading files to Aliyun OSS
Uses the accessKeyId, repository and accessKeySecret from the AliyunOSS saver
Files are saved to the "files" directory in the root of repository, existing files are overwritten.

\*/
(function(){


/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.name = "Aliyun-OSS";

var OSSClient = require("$:/plugins/FSpark/file-uploads-Aliyun-OSS/aliyun-oss-client.js");
var CompressorJS =  require("$:/plugins/FSpark/file-uploads-Aliyun-OSS/compressor.min.js");
var utils = require("$:/plugins/FSpark/file-uploads-Aliyun-OSS/utils.js");

exports.create = function(params) {
	
	var AliyunHelper = OSSClient;
	
	AliyunHelper.OSSInit()
	if(!AliyunHelper.client)
		return null;

	return new AliyunOSSUploader(params,AliyunHelper);
};

function AliyunOSSUploader(params,AliyunHelper) {
	this.params = params || {};
	this.AliyunHelper = AliyunHelper;
	this.logger = new $tw.utils.Logger("oss-uploader");
	this.files = [];
	this.logger.log("AliyunOSSUploader",params);	
	this.needImgCompress = $tw.wiki.getTiddlerText("$:/config/file-uploads/aliyun-oss/imgcompress","yes").trim() === "yes";
	if(this.needImgCompress)
		this.imgCompressConfig = $tw.wiki.getTiddlerData("$:/config/file-uploads/aliyun-oss/imgCompressConfig")
};

AliyunOSSUploader.prototype.initialize = function(callback) {
	this.logger.log("uploader initialize");
	callback();
};

//https://foobar.oss-cn-shenzhen.aliyuncs.com/img/202110302313240.png
// Returns the canonical_uri for a file that has been uploaded
AliyunOSSUploader.prototype._getCanonicalURI = function(file) {
	return `https://${this.AliyunHelper.AliyunOSSInfo.bucket}.${this.AliyunHelper.AliyunOSSInfo.region}.aliyuncs.com/${this._getFilePath()}/${file.filename}`;
};

AliyunOSSUploader.prototype._getFilePath = function() {
	return $tw.wiki.getTiddlerText("$:/config/file-uploads/aliyun-oss/uploadpath","files").trim().replace(/^\/|\/$/gm,"");
};

/*
Arguments:
uploadItem: object of type UploadItem representing tiddler to be uploaded
callback accepts two arguments:
	err: error object if there was an error
	uploadItemInfo: object corresponding to the tiddler being uploaded with the following properties set:
	- title
	- canonical_uri (if available)
	- uploadComplete (boolean)
	- getUint8Array()
	- getBlob()
*/
AliyunOSSUploader.prototype.uploadFile = function(uploadItem,callback) {  
	var self = this;
	// uploadInfo = { title: uploadItem.title };

	var fileblob = uploadItem.getBlob();
	var fileExtension = utils.imageTypeToExtension(fileblob.type);

	function filesPush(content) {
		self.files.push({
			filename: uploadItem.filename,
			path: `${self._getFilePath()}/${uploadItem.filename}`,
			content: content,
			encoding: uploadItem.isBase64 ? "base64" : "utf8"
		});
	}

	if (this.needImgCompress && !utils.isInArray(fileExtension, ["", ".gif"])) {
		new CompressorJS(fileblob, {
			...self.imgCompressConfig,
			success(result) {
				$tw.notifier.display("$:/plugins/FSpark/file-uploads-Aliyun-OSS/ui/Notifications/Compressed",
					{
						variables: {
							filename: uploadItem.filename,
							oldsize: utils.bytesToSize(fileblob.size),
							newsize: utils.bytesToSize(result.size),
							ratio: ((fileblob.size - result.size) * 100 / fileblob.size).toPrecision(3) + '%'
						}
					});
				filesPush(result);
				callback(null, { title: uploadItem.title });
			},
			error(err) {
				callback(err);
			}
		})
	} else {
		filesPush(fileblob);
	}
	
};

/*
Arguments:
callback accepts two arguments:
	status: true if there was no error, otherwise false
	uploadInfoArray (optional): array of uploadInfo objects corresponding to the tiddlers that have been uploaded
		this is needed and should set the canonical_uri for each uploadItem if:
		- (a) uploadInfo.uploadComplete was not set to true in uploadFile AND 
		- (b) uploadInfo.canonical_uri was not set in uploadFile
*/
AliyunOSSUploader.prototype.deinitialize = function(callback) {
	var self = this,
	tasks = []; 
	this.uploadInfoArray = [],
		// uploadInfo = {  };
	this.logger.log("uploader deinitialize",this.files);

	//To be fixed: should take into account the successful status of each file upload 
	//and set it to "uploadComplete" only when it is truly successful
	this.files.forEach(file => {
		tasks.push(this.AliyunHelper.client.put(file.path,file.content)
			.then(()=>{
				this.uploadInfoArray.push({
					title: file.filename,
					canonical_uri : this._getCanonicalURI(file),
					uploadComplete : true,
					fields:{
						tags:["AliyunAssets"]
					}
				})
			})
			.catch((err) => {
				self.logger.alert(`Error uploading to Aliyun OSS: ${err} in upload ${file.filename}`);
			})
		);
	});
	//(new Array(this.files.length)).fill({})
	Promise.all(tasks)
		.then(() => callback(false,this.uploadInfoArray))
		.catch((err) => {
			self.logger.alert(`Error uploading to Aliyun OSS: ${err} in uploader deinitialize`);
			callback(err);
		});
};

})();
