// Get element by CSS selector:
function qs(selector, scope) {
	return (scope || document).querySelector(selector);
}

// Add and remove event listeners:
function on(target, type, callback, useCapture) {
	target.addEventListener(type, callback, !!useCapture);
}
function off(target, type, callback, useCapture) {
	target.removeEventListener(type, callback, !!useCapture);
}

// Pad string with leading zeros:
function padLeft(str, width) {
	return str.length >= width ? str : new Array(width - str.length + 1).join('0') + str;
}



// Character search:
(function() {
	var eventSelect = qs('#event-toggle');
	var searchField = qs('#search');
	var eventType = eventSelect.value;

	// Search:
	function keyHandler(event) {
		var decimal = event.which == null ? event.keyCode : event.which;
		location.hash = "#k_" + decimal;
		searchField.focus();
	}
	on(searchField, eventType, keyHandler);

	// Event type toggle:
	on(eventSelect, function toggleEvent() {
		off(searchField, eventType, keyHandler);
		on(searchField, (eventType = eventSelect.value), keyHandler);
	});
})();



function init() {
	var src = '',
	trParent = qs('#data'),
	entityMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;'
	},
	hex, char;

	// Generate rows:
	console.log('inserting 16^4 rows...');
	console.time('16^4 rows inserted');
	for (var i = 0; i < 65536; i++) {
		hex = i.toString(16);
		char = String.fromCharCode(i);
		src += '<tr id="k_' + i + '">' +
			'<td>' + (entityMap[char] || char) + '</td>' +
			'<td>' + i + '</td>' +
			'<td>&amp;#' + i + ';</td>' +
			'<td>\\' + hex + '</td>' +
			'<td>\\u' + padLeft(hex, 4) + '</td>' +
		'</tr>';
	}
	trParent.innerHTML = src;
	console.timeEnd('16^4 rows inserted');


	// select text in cells when clicked:
	on(trParent, 'click', function cellClickHandler(event) {
		var range = document.createRange();
		range.selectNode(event.target.firstChild);
		window.getSelection().addRange(range);
	}, true);
}

setTimeout(init, 1000)