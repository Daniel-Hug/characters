// Helper functions:
function $id(id) {
	return document.getElementById(id);
}

function el(name) {
	return document.createElement(name);
}

function padLeft(str, width) {
	return str.length >= width ? str : new Array(width - str.length + 1).join('0') + str;
}



function cellClickHandler() {
	var range = document.createRange();
	range.selectNode(this.firstChild);
	window.getSelection().addRange(range);
}

function createRow(id, char) {
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
	var hex = id.toString(16);
	code4.textContent = '\\' + hex;
	code5.textContent = '\\u' + padLeft(hex, 4);


	// select text in cells when clicked:
	[td1, td2, td3, td4, td5].forEach(function(cell) {
		cell.addEventListener('click', cellClickHandler, false);
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

function insert1000Rows() {
	var frag = document.createDocumentFragment();
	var stopNum = (++numInsertions) * 1000;
	
	for (; i <= stopNum; i++) {
		frag.appendChild(createRow(i, String.fromCharCode(i)));
	}
	
	trParent.appendChild(frag);
	if (numInsertions < 10) setTimeout(insert1000Rows, 1000);
}
insert1000Rows();




// Character search:
var searchField = $id('search');

function keyHandler(event) {
    location.hash = "#k_" + (event.which || window.event.keyCode);
	searchField.focus();
}

var eventType = 'keypress';
searchField.addEventListener(eventType, keyHandler);


// Event type toggleing
$id('event-toggle').onchange = function() {
	searchField.removeEventListener(eventType, keyHandler);
	searchField.addEventListener(this.value, keyHandler);
	eventType = this.value;
};