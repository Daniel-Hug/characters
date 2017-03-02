var Windower = (function() {
	// JS throttle and debounce functions
	// Credit: https://remysharp.com/2010/07/21/throttling-function-calls
	function throttle(fn, threshhold, scope) {
		if (!threshhold) threshhold = 250;
		var last, deferTimer;
		return function () {
			var args = arguments;
			var context = scope || this;
			var now = new Date().getTime();

			if (last && now < last + threshhold) {
				// hold on to it
				clearTimeout(deferTimer);
				deferTimer = setTimeout(function () {
					last = now;
					fn.apply(context, args);
				}, threshhold);
			} else {
				last = now;
				fn.apply(context, args);
			}
		};
	}

	function debounce(fn, delay, scope) {
		var timer = null;
		return function() {
			var context = scope || this;
			var args = arguments;
			clearTimeout(timer);
			timer = setTimeout(function () {
				fn.apply(context, args);
			}, delay);
		};
	}

	function getScrollParent(element, includeHidden) {
		var style = getComputedStyle(element);
		var excludeStaticParent = style.position === "absolute";
		var overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;

		if (style.position === "fixed") return document.body;
		for (var parent = element; (parent = parent.parentElement);) {
			style = getComputedStyle(parent);
			if (excludeStaticParent && style.position === "static") {
				continue;
			}
			if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) return parent;
		}

		return document.body;
	}

	function getViewportHeight() {
		return document.documentElement.clientHeight;
	}

	/*
		input:
		{
			parent: element in document (required)
			cells: array (required)
			cellWidth: number (in pixels; required)
			cellHeight: number (in pixels; required)
			numCols: number (optional)
			fixedWidth: boolean (optional)
			fixedHeight: (optional)
			extraRowFactor: number (optional)
		}
	*/
	function Windower(options) {
		this.parent = options.parent;
		this.cells = options.cells;
		this.cellWidth = options.cellWidth;
		this.cellHeight = options.cellHeight;

		this.grandParent = options.parent.parentNode;
		this.scrollParent = getScrollParent(this.parent);

		// defaults to true if numCols is passed otherwise false
		this.fixedWidth = this.fixedWidth !== undefined ? this.fixedWidth :
			options.numCols !== undefined;

		// defaults to as many columns as can fit in parent
		this.numCols = options.numCols || this.getColCount();

		this.fixedHeight = options.fixedHeight || false;
		this.extraRowFactor = options.extraRowFactor || 1.5;
		this.topPaddingPerUnit = (this.extraRowFactor - 1) / 2;
		this.numRowsRendered = this.getProperRowCount();
		this.indexOfFirstRowToRender = this.getIndexOfFirstRowToRender();

		// handle scroll
		window.addEventListener('scroll', throttle(function() {
			var newIndexOfFirstRowToRender = this.getIndexOfFirstRowToRender();
			if (newIndexOfFirstRowToRender !== this.indexOfFirstRowToRender) {
				this.indexOfFirstRowToRender = newIndexOfFirstRowToRender;
				this.cropContent();
			}
		}, 20, this), true);

		this.render();

		// handle resize
		if (this.fixedWidth && this.fixedHeight) return;
		window.addEventListener('resize', debounce(function() {
			var isRendering;

			// handle parent width resize
			if (!this.fixedWidth) {
				var newColCount = this.getColCount();
				if (newColCount !== this.numCols) {
					this.numCols = newColCount;
					this.render();
					isRendering = true;
				}
			}

			// handle parent height resize
			if (!isRendering && !this.fixedHeight) {
				var newRowCount = this.getProperRowCount();
				if (newRowCount !== this.numRowsRendered) {
					this.numRowsRendered = newRowCount;
					this.render();
				}
			}
		}, 50, this));
	}

	// calculate number of rows that should be rendered based on parent height
	Windower.prototype.getProperRowCount = function() {
		return Math.ceil(getViewportHeight() * this.extraRowFactor / this.cellHeight);
	};

	Windower.prototype.getColCount = function() {
		var computedStyle = getComputedStyle(this.grandParent);
		var contentAreaWidth = this.grandParent.clientWidth - 
			(parseFloat(computedStyle.paddingLeft) + 
			parseFloat(computedStyle.paddingRight));
		return Math.max(1, Math.floor(contentAreaWidth / this.cellWidth));
	};

	// get index of first row to render based on scroll position
	Windower.prototype.getIndexOfFirstRowToRender = function() {
		var topPadding = getViewportHeight() * this.topPaddingPerUnit;
		var firstTopPos = this.scrollParent.scrollTop - topPadding;
		firstTopPos = Math.max(0, firstTopPos);
		return Math.floor(firstTopPos / this.cellHeight);
	};

	Windower.prototype.cropContent = function() {
		var newFirstCellIndex = this.indexOfFirstRowToRender * this.numCols;
		var numCellsToShow = this.numRowsRendered * this.numCols;
		var newLastCellIndex = Math.min(newFirstCellIndex + numCellsToShow, this.cells.length) - 1;

		// hide shown cells before first one that should be shown
		for (var i = this.firstCellIndex || 0; i < newFirstCellIndex; i++) {
			this.cells[i].hidden = true;
		}

		// show cells that should be shown
		for (var i = newFirstCellIndex; i <= newLastCellIndex; i++) {
			this.cells[i].hidden = false;
		}

		// hide shown cells after last one that should be shown
		var upperBound = this.lastCellIndex + 1 || this.cells.length;
		for (var i = newLastCellIndex + 1; i < upperBound; i++) {
			this.cells[i].hidden = true;
		}

		this.firstCellIndex = newFirstCellIndex;
		this.lastCellIndex = newLastCellIndex;
	};

	Windower.prototype.render = function() {
		// set parent size
		var numRows = Math.ceil(this.cells.length / this.numCols);
		this.parent.style.height = this.cellHeight * numRows + 'px';
		this.parent.style.width = this.cellWidth * this.numCols + 'px';

		// position cells
		for (var i = 0; i < this.cells.length; i++) {
			var style = this.cells[i].style;
			style.left = i % this.numCols * this.cellWidth + 'px';
			style.top = Math.floor(i / this.numCols) * this.cellHeight + 'px';
		}

		this.indexOfFirstRowToRender = this.getIndexOfFirstRowToRender();
		this.cropContent();
	};

	return Windower;
})();