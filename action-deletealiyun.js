/*\
title: $:/plugins/FSpark/file-uploads-Aliyun-OSS/action-deletealiyun.js
type: application/javascript
module-type: widget

Action widget to delete a tiddler with OSS files.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var OSSClient = require("$:/plugins/FSpark/file-uploads-Aliyun-OSS/aliyun-oss-client.js");

var DeleteOSSWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
DeleteOSSWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
DeleteOSSWidget.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();
	this.AliyunHelper = OSSClient;

	this.AliyunHelper.OSSInit();
};

/*
Compute the internal state of the widget
*/
DeleteOSSWidget.prototype.execute = function() {
	this.actionFilter = this.getAttribute("$filter");
	this.actionTiddler = this.getAttribute("$tiddler");
};

/*
Refresh the widget by ensuring our attributes are up to date
*/
DeleteOSSWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes["$filter"] || changedAttributes["$tiddler"]) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

/*
Invoke the action associated with this widget
*/
DeleteOSSWidget.prototype.invokeAction = function(triggeringWidget,event) {
	var tiddlers = [];
	if(this.actionFilter) {
		tiddlers = this.wiki.filterTiddlers(this.actionFilter,this);
	}
	if(this.actionTiddler) {
		tiddlers.push(this.actionTiddler);
	}
	var canonicalURIPrefix = this._getCanonicalURIPrefix()
	for(let t=0; t<tiddlers.length; t++) {
		var canonical_uri = $tw.wiki.getTiddler(tiddlers[t]).fields._canonical_uri
		if(canonical_uri.indexOf(canonicalURIPrefix) == 0){
			var filename = canonical_uri.substring(canonicalURIPrefix.length);
			this.AliyunHelper.client.delete(filename)
				.then(()=>{
					this.dispatchEvent({type: "tm-delete-tiddler", tiddlerTitle: tiddlers[t]})
				})
				.catch((err) => {
					self.logger.alert(`Error deleting from Aliyun OSS: ${err} in deleting ${filename}`);
				})
		} 		
		// this.wiki.deleteTiddler(tiddlers[t]);
	}
	return true; // Action was invoked
};

DeleteOSSWidget.prototype._getCanonicalURIPrefix = function(file) {
	return `https://${this.AliyunHelper.AliyunOSSInfo.bucket}.${this.AliyunHelper.AliyunOSSInfo.region}.aliyuncs.com/`;
};

exports["action-deletealiyun"] = DeleteOSSWidget;

})();
