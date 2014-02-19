// Helper functions:
function $id(id) {
	return document.getElementById(id);
}

function on(target, type, callback) {
	target.addEventListener(type, callback, false);
}

function off(target, type, callback) {
	target.removeEventListener(type, callback, false);
}

function el(name) {
	return document.createElement(name);
}

function padLeft(str, width) {
	return str.length >= width ? str : new Array(width - str.length + 1).join('0') + str;
}



// Listen for load events:
console.time('window.onload fired');
console.time('DOMContentLoaded fired');

on(window, 'load', function() {
	console.timeEnd('window.onload fired');
});
on(document, 'DOMContentLoaded', function() {
	console.timeEnd('DOMContentLoaded fired');
});



// Character search:
var searchField = $id('search');

function keyHandler(event) {
	var decimal = event.which == null ? event.keyCode : event.which;
    location.hash = "#k_" + decimal;
	searchField.focus();
}

var eventType = 'keypress';
on(searchField, eventType, keyHandler);

// Event type toggleing
on($id('event-toggle'), function() {
	off(searchField, eventType, keyHandler);
	on(searchField, this.value, keyHandler);
	eventType = this.value;
});



// Row creation:
function cellClickHandler() {
	var range = document.createRange();
	range.selectNode(this.firstChild);
	window.getSelection().addRange(range);
}

function createRow(id) {
	var char = String.fromCharCode(id);
	var hex = id.toString(16);

	var tr   = el("tr");
	var td1  = el("td");
	var td2  = el("td");
	var td3  = el("td");
	var td4  = el("td");
	var td5  = el("td");
	var code3 = el("code");
	var code4 = el("code");
	var code5 = el("code");

	tr.id = "k_" + i;

	td1.textContent = char;
	td2.textContent = id;
	code3.textContent = '&#' + id + ';';
	code4.textContent = '\\' + hex;
	code5.textContent = '\\u' + padLeft(hex, 4);


	// select text in cells when clicked:
	[td1, td2, td3, td4, td5].forEach(function(cell) {
		on(cell, 'click', cellClickHandler);
	});

	td3.appendChild(code3);
	td4.appendChild(code4);
	td5.appendChild(code5);

	tr.appendChild(td1);
	tr.appendChild(td2);
	tr.appendChild(td3);
	tr.appendChild(td4);
	tr.appendChild(td5);

	return tr;
}

var trParent = $id('data');

var numInsertions = 0;
var i = 0;

console.log('inserting 16^4 rows...');
console.time('16^4 rows inserted');
function insertRows() {
	console.time('16^3 rows inserted');
	var frag = document.createDocumentFragment();
	var stopNum = (++numInsertions) * 4096;

	for (; i < stopNum; i++) {
		frag.appendChild(createRow(i));
	}

	trParent.appendChild(frag);
	console.timeEnd('16^3 rows inserted');
	if (numInsertions < 16) insertRows(); //setTimeout(insertRows, 1000);
}
insertRows();
console.timeEnd('16^4 rows inserted');