/*\
title: $:/plugins/FSpark/file-uploads-Aliyun-OSS/browse-wrap.js
type: application/javascript
module-type: widget

Browse wrapper widget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var BrowseWrapWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
BrowseWrapWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
BrowseWrapWidget.prototype.render = function(parent,nextSibling) {
	var self = this,
	readFileCallback = function(tiddlerFieldsArray) {
		self.readFileCallback(tiddlerFieldsArray);
	};
	this.addEventListener( "tm-browse-wrap", function(event){
		this.wiki.readFiles(event.files,{
			callback: readFileCallback,
			deserializer: this.dropzoneDeserializer
		});
	}
	);
	
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();

	var domNode = this.document.createElement("div");
	domNode.setAttribute("class","tc-file-input-wrapper");
	
	parent.parentNode.insertBefore(domNode,parent.nextElementSibling);
	domNode.appendChild(parent);

	domNode = this.document.createElement("div");

	parent.insertBefore(domNode,nextSibling);
	this.renderChildren(domNode,null);
	this.domNodes.push(domNode);
};

/*
Compute the internal state of the widget
*/
BrowseWrapWidget.prototype.execute = function() {
	this.importTitle = this.getAttribute("importTitle");
	this.contentTypesFilter = this.getAttribute("contentTypesFilter");
	this.autoOpenOnImport = this.getAttribute("autoOpenOnImport");
	this.actions = this.getAttribute("actions");
	this.dropzoneDeserializer = this.getAttribute("deserializer");
	this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
BrowseWrapWidget.prototype.refresh = function(changedTiddlers) {

	return this.refreshChildren(changedTiddlers);

};

BrowseWrapWidget.prototype.filterByContentTypes = function(tiddlerFieldsArray) {
	var filteredTypes,
		filtered = [],
		types = [];
	$tw.utils.each(tiddlerFieldsArray,function(tiddlerFields) {
		types.push(tiddlerFields.type || "");
	});
	filteredTypes = this.wiki.filterTiddlers(this.contentTypesFilter,this,this.wiki.makeTiddlerIterator(types));
	$tw.utils.each(tiddlerFieldsArray,function(tiddlerFields) {
		if(filteredTypes.indexOf(tiddlerFields.type) !== -1) {
			filtered.push(tiddlerFields);
		}
	});
	return filtered;
};

BrowseWrapWidget.prototype.readFileCallback = function(tiddlerFieldsArray) {
	if(this.contentTypesFilter) {
		tiddlerFieldsArray = this.filterByContentTypes(tiddlerFieldsArray);
	}
	if(tiddlerFieldsArray.length) {
		this.dispatchEvent({type: "tm-import-tiddlers", param: JSON.stringify(tiddlerFieldsArray), autoOpenOnImport: this.autoOpenOnImport, importTitle: this.importTitle});
		if(this.actions) {
			this.invokeActionString(this.actions,this,event,{importTitle: this.importTitle});
		}
	}
};

exports.bwrap = BrowseWrapWidget;

})();
