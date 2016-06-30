// get element by CSS selector:
function qs(selector, scope) {
	return (scope || document).querySelector(selector);
}

// add and remove event listeners:
function on(target, type, callback, useCapture) {
	target.addEventListener(type, callback, !!useCapture);
}
function off(target, type, callback, useCapture) {
	target.removeEventListener(type, callback, !!useCapture);
}
function once(target, type, callback, useCapture) {
	function oneTimeHandler() {
		callback.apply(this, arguments);
		off(target, type, oneTimeHandler, useCapture);
	}
	on(target, type, oneTimeHandler, useCapture);
}

// pad string with leading zeros:
function padLeft(str, width) {
	return str.length >= width ? str : new Array(width - str.length + 1).join('0') + str;
}



function App() {
	this.curSelected = null;
}


// select text in cells when clicked
function selectNode(node) {
	var range = document.createRange();
	range.selectNode(node);
	var selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
}

// copy text in cells when clicked
function copyNode(node) {
	// select contents
	selectNode(node.firstChild || node);

	// copy contents
	document.execCommand('copy');

	// unselect
	var selection = window.getSelection();
	selection.removeAllRanges();

	// calculate optimal tooltip position
	var coords = node.getBoundingClientRect();
	var pageWidth = document.documentElement.clientWidth;
	var attr = coords.top < 200 ?
		(coords.left < 80 ? 'tipBr' :
			(pageWidth - coords.right < 80 ? 'tipBl' :
			'tipBm')) :
		(coords.left < 80 ? 'tipTr' :
			(pageWidth - coords.right < 80 ? 'tipTl' :
			'tipTm'));

	// show tooltip until mouseout
	node.dataset[attr] = 'Copied to clipboard';
	once(node, 'mouseout', function() {
		delete node.dataset[attr];
	});
}


var previewChar = (function() {
	var dataParent = qs('.char-data');
	var cur = null;

	// select text in cell when clicked
	on(dataParent, 'click', function(event) {
		copyNode(event.target);
	}, true);

	return function(decimalInt) {
		if (decimalInt === cur) return;

		// get view model
		hex = decimalInt.toString(16);
		char = String.fromCharCode(decimalInt);

		// render cells
		dataParent.innerHTML =
		'<td>' + decimalInt + '</td>' +
		'<td>&amp;#' + decimalInt + ';</td>' +
		'<td>\\' + hex + '</td>' +
		'<td>\\u' + padLeft(hex, 4) + '</td>';

		cur = decimalInt;
	};
})();


var cellParent = qs('.table');
function generateCells() {
	var src = '',
	entityMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;'
	},
	hex, char;

	// generate cells
	console.log('inserting 16^4 cells...');
	console.time('16^4 cells inserted');
	for (var i = 0; i < 65536; i++) {
		hex = i.toString(16);
		char = String.fromCharCode(i);
		src += '<div id="k_' + i + '">' +
			(entityMap[char] || char) +
		'</div>';
	}
	cellParent.innerHTML = src;
	console.timeEnd('16^4 cells inserted');
}

App.prototype.selectCell = function(cell) {
	// if a cell is selected, unselect it
	if (this.curSelected) this.curSelected.classList.remove('selected');

	// if a new cell was clicked, select and preview it
	if (cell !== this.curSelected) {
		cell.classList.add('selected');
		this.curSelected = cell;
		previewCell(cell);
	} else {
		this.curSelected = null;
	}
};

function previewCell(cell) {
	previewChar(+cell.id.slice(2));
}




// init

var app = new App();
previewChar(0);
setTimeout(generateCells, 0);

// select character in cell when clicked
on(cellParent, 'click', function() {
	// make sure a cell is clicked
	if (event.target === cellParent) return;

	app.selectCell(event.target);
	copyNode(event.target);
}, true);

// show preview of character data on hover
on(cellParent, 'mouseover', function cellHoverHandler(event) {
	if ((event.target === cellParent) || app.curSelected) return;
	previewCell(event.target);
}, true);


// character search:
(function() {
	var searchField = qs('#search-field');

	// press any key
	on(window, 'keydown', function keyHandler(event) {
		if (event.target === searchField) return;
		var decimal = event.which == null ? event.keyCode : event.which;
		location.hash = "#k_" + decimal;
		app.selectCell(qs('#k_' + decimal));
	});

	// search field
	on(searchField, 'input', function() {
		var val = this.value;
		if (val.length === 0) return;
		var lastCharCode = val.charCodeAt(val.length - 1);
		location.hash = "#k_" + lastCharCode;
		app.selectCell(qs('#k_' + lastCharCode));
		searchField.focus();
	});
})();