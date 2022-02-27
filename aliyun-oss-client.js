/*\
title: $:/plugins/FSpark/file-uploads-Aliyun-OSS/aliyun-oss-client.js
type: application/javascript
module-type: library

Get a single OSS instance.

\*/
(function () {

	/*jslint node: false, browser: true */
	/*global $tw: false */
	"use strict";

	var AliyunOSS = require("$:/plugins/FSpark/file-uploads-Aliyun-OSS/aliyun-oss-sdk.min.js");

	exports.OSSInit = OSSClient;

	function OSSClient() {
		// if (!exports.AliyunOSSInfo || JSON.stringify(exports.AliyunOSSInfo) !== JSON.stringify(AliyunOSSInfo)) {
		if (!exports.AliyunOSSInfo || !exports.client) {
			var bucket = $tw.wiki.getTiddlerText("$:/AliyunOSS/Bucket"),
				region = $tw.wiki.getTiddlerText("$:/AliyunOSS/Region"),
				accessKeyId = $tw.wiki.getTiddlerText("$:/AliyunOSS/AccessKeyId"),
				accessKeySecret = $tw.utils.getPassword("AliyunOSS-KeySecret");
			if (!accessKeyId || !bucket || !region || !accessKeySecret) {
				if (!exports.logger)
					exports.logger = new $tw.utils.Logger("oss-uploader");
				exports.logger.alert("AliyunOSS bucket details are not properly configured. Cannot upload files.");
				return null;
			}
			var AliyunOSSInfo = {
				accessKeyId: accessKeyId.trim(),
				region: region.trim(),
				bucket: bucket.trim().split("/").pop(),
				accessKeySecret: accessKeySecret.trim()
			}
			exports.AliyunOSSInfo = AliyunOSSInfo;
			exports.client = new AliyunOSS(AliyunOSSInfo)
		}
	}

	//module.exports = OSSClient;

})();