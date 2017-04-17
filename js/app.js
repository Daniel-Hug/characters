// get element by CSS selector
function qs(selector, scope) {
	return (scope || document).querySelector(selector);
}

// add event listeners
function on(target, type, callback, useCapture) {
	target.addEventListener(type, callback, !!useCapture);
}

// removes all of an element's childNodes
function removeChilds(el) {
	var last;
	while ((last = el.lastChild)) el.removeChild(last);
}

// pad string with leading zeros
function padLeft(str, width) {
	return str.length >= width ? str : new Array(width - str.length + 1).join('0') + str;
}



function App() {
	this.curSelected = null;
}


// select text in node
function selectNode(node) {
	var range = document.createRange();
	range.selectNode(node);
	var selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
}

// copy text in node and display tooltip
function copyNode(node) {
	// select contents
	selectNode(node.firstChild || node);

	// copy contents
	document.execCommand('copy');

	// unselect
	var selection = window.getSelection();
	selection.removeAllRanges();

	// show tooltip until mouseout
	node.dataset.tip = 'Copied to clipboard';
	node.classList.add('tip-bm');
	setTimeout(function() {
		delete node.dataset.tip;
		node.classList.remove('tip-bm');
	}, 3050);
}

var previewChar = (function() {
	var dataParent = qs('.char-data');
	var charPreview = qs('.char-preview');
	var cur = null;

	// copy text in cell when clicked
	on(dataParent, 'click', function(event) {
		copyNode(event.target);
	}, true);

	// copy char in preview when clicked
	on(charPreview, 'click', function(event) {
		copyNode(event.target);
	}, true);

	return function(decimalInt) {
		if (decimalInt === cur) return;

		// get view model
		hex = decimalInt.toString(16);

		// render cells
		dataParent.innerHTML =
		'<td>' + decimalInt + '</td>' +
		'<td>&amp;#' + decimalInt + ';</td>' +
		'<td>\\' + hex + '</td>' +
		'<td>\\u' + padLeft(hex, 4) + '</td>';

		charPreview.textContent = String.fromCharCode(decimalInt);

		cur = decimalInt;
	};
})();


var cellParent = qs('.table');
function generateCells() {
	console.log('generating 16^4 cells...');
	console.time('16^4 cells generated');

	var cells = [];
	var docFrag = document.createDocumentFragment();
	for (var i = 0; i < 65536; i++) {
		var cell = document.createElement('div');
		cell.id = 'k_' + i;
		cell.textContent = String.fromCharCode(i);
		cells.push(docFrag.appendChild(cell));
	}

	var windower = new Windower({
		parent: cellParent,
		cells: cells,
		cellWidth: 40,
		cellHeight: 40
	});
	console.timeEnd('16^4 cells generated');

	console.log('inserting 16^4 cells...');
	console.time('16^4 cells inserted');
	removeChilds(cellParent);
	cellParent.appendChild(docFrag);

	// wait until layout is known for children before stopping the stopwatch
	cellParent.lastChild.getBoundingClientRect();
	console.timeEnd('16^4 cells inserted');

	return windower;
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
(function() {
	var app = new App();

	// default char
	previewChar(9924);

	// generate cells asynchronously to not block rendering of initial character
	var windower;
	setTimeout(function() {
		windower = generateCells()
	}, 0);

	// copy character in cell when clicked
	var charPreview = qs('.char-preview');
	on(cellParent, 'click', function() {
		// make sure a cell is clicked
		if (event.target === cellParent) return;

		// update hash in URL
		var hash = '#' + event.target.id;
		if(history.pushState) {
			history.pushState(null, null, hash);
		}
		else {
			location.hash = hash;
		}

		// highlight cell
		app.selectCell(event.target);

		// copy char
		copyNode(charPreview);
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
			var cell = windower.cells[lastCharCode];
			cell.hidden = false;
			app.selectCell(cell);
			location.hash = "#k_" + lastCharCode;
			searchField.focus();
		});
	})();
})();