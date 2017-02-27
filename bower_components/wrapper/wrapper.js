/*
	usage:

	var wrapper = new Wrapper({
		parent: element in document (required),
		cells: array (required),
		cellWidth: number (in pixels; required),
		cellHeight: number (in pixels; required),
		numCols: number (optional),
		fixedWidth: boolean (optional)
	});
*/

function Wrapper(options) {
	this.parent = options.parent;
	this.cells = options.cells;
	this.cellWidth = options.cellWidth;
	this.cellHeight = options.cellHeight;

	// defaults to true if numCols is passed otherwise false
	this.fixedWidth = this.fixedWidth !== undefined ? this.fixedWidth :
		options.numCols !== undefined;

	// defaults to as many columns as can fit in parent
	this.numCols = options.numCols || this.getColCount();

	this.render();

	if (this.fixedWidth) return;
	var instance = this;
	window.addEventListener('resize', function() {
		var newColCount = instance.getColCount();
		if (newColCount !== instance.numCols) {
			instance.numCols = newColCount;
			instance.render();
		}
	});
}

Wrapper.prototype.getColCount = function() {
	return Math.floor(this.parent.offsetWidth / this.cellWidth);
};

Wrapper.prototype.render = function() {
	for (var i = 0; i < this.cells.length; i++) {
		var style = this.cells[i].style;
		style.left = i % this.numCols * this.cellWidth + 'px';
		style.top = Math.floor(i / this.numCols) * this.cellHeight + 'px';
	}
};