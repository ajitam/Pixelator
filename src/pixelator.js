/**
 * Pixelator
 * 
 * @author Matija Urh <jest@matijaurh.com>
 *
 * License DWYW (Do Whatever You Want)
 */
var pixelator = {

	workspace: null,
	workspace_width: 0,
	workspace_height: 0,

	/**
	 * Inital setup
	 * 
	 * @param char selector_id Id of the div/section where we want to display pixels
	 * @param array prefs Preferences for pixels (see documentation for more info)
	 */
	init: function(selector_id, prefs) {
		// Set default preferences
		pixelator.element_size = (typeof prefs.size === "undefined") ? 10 : prefs.size;
		pixelator.element_fill = (typeof prefs.fill === "undefined") ? '#000' : prefs.fill;
		pixelator.element_border = (typeof prefs.border === "undefined") ? 'none' : prefs.border;

		// Set workspace
		pixelator.workspace = document.getElementById(selector_id);

	},

	/**
	 * Function if we want just draw pixels
	 *
	 * @param array matrix Matrix of 0 & 1 for the image
	 */
	draw: function(matrix) {
		// Check if workspace is set
		if (pixelator.workspace == null) {
			console.log("Please run pixelator.init first");
			return;
		}

		// Get and set workspace dimensions
		pixelator.workspace_width = matrix[0].length * pixelator.element_size;
		pixelator.workspace_height = matrix.length * pixelator.element_size;
		
		pixelator.workspace.style.width = pixelator.workspace_width;
		pixelator.workspace.style.height = pixelator.workspace_height;
		
		// Create canvas
		var paper = Raphael(pixelator.workspace, pixelator.workspace_width, pixelator.workspace_height);
		var element_count = 0;

		// Loop rows
		for(var row = 0; row < matrix.length; row++) {
			y = row * pixelator.element_size;
			// Loop columns
			for(var col = 0; col < matrix[row].length; col++) {
				x = col * pixelator.element_size;
				if (matrix[row][col] == 1) {
					var element = paper.rect(x, y, pixelator.element_size, pixelator.element_size);
					element.attr('fill', pixelator.element_fill);
					element.attr('stroke', pixelator.element_border);
					element.attr('id', element_count);

					element_count++;
				}
			}
		}
	},

	/**
	 * Function to display one image and transform it into another
	 *
	 * @param array matrix_in First matrix
	 * @param array matrix_out Second matrix
	 */
	transform: function(matrix_in, matrix_out) {
		// Check if workspace is set
		if (pixelator.workspace == null) {
			console.log("Please run pixelator.init first");
			return;
		}

		// See which matrix is bigger
		var matrix_in_count = pixelator.count(matrix_in);
		var matrix_out_count = pixelator.count(matrix_out);

		// Get and set workspace dimensions
		pixelator.workspace_width = matrix_in[0].length * pixelator.element_size;
		pixelator.workspace_height = matrix_in.length * pixelator.element_size;
		
		pixelator.workspace.style.width = pixelator.workspace_width;
		pixelator.workspace.style.height = pixelator.workspace_height;
		
		// Create canvas
		pixelator.paper = Raphael(pixelator.workspace, pixelator.workspace_width, pixelator.workspace_height);
		var element_count = 0;

		// Generate number array (how pixels rearrange after transform)
		var number_array = pixelator.randomize(pixelator.onesArray(matrix_out));

		// How many pixels extra we must create
		var extra_element = Math.ceil(matrix_out_count/matrix_in_count);
		number_array_index = 0;

		// Loop rows
		for(var row = 0; row < matrix_in.length; row++) {
			y = row * pixelator.element_size;
			// Loop columns
			for(var col = 0; col < matrix_in[row].length; col++) {
				x = col * pixelator.element_size;
				if (matrix_in[row][col] == 1) {
					extra_step = 0;

					while(extra_step < extra_element) {
						var element = pixelator.paper.rect(x, y, pixelator.element_size, pixelator.element_size);
						element.attr('fill', pixelator.element_fill);
						element.attr('stroke', pixelator.element_border);
						element.attr('id', element_count);

						number_array_index++;
						if (number_array_index >= number_array.length) {number_array_index = 0;}
						var coor_in = [x,y];
						var coor_out = number_array[number_array_index];

						element.data('in', coor_in);
						element.data('out', coor_out);


						element_count++;
						extra_step++;
					}

				}
			}
		}

		// Set triggers
		pixelator.workspace.onmouseover = function() {
			pixelator.reorder('out');
		};

		pixelator.workspace.onmouseout = function() {
			pixelator.reorder('in');
		};
	},

	/**
	 * Rearrange pixels
	 *
	 * @param string action Can be 'in' or 'out'
	 */
	reorder: function(action) {
		pixelator.paper.forEach(function (el) {
			el.animate({x: el.data(action)[0], y: el.data(action)[1]}, 200, 'easeInOut');
		});
	},

	/**
	 * Generate array with coordinates of ones in matrix
	 *
	 * @param array matrix Matrix to operate on
	 */
	onesArray: function(matrix) {
		var number_array = [];
		for(var row = 0; row < matrix.length; row++) {
			// Loop rows
			y = row * pixelator.element_size;
			for(var col = 0; col < matrix[row].length; col++) {
				x = col * pixelator.element_size;
				if (matrix[row][col] == 1) {
					number_array.push([x,y]);
				};
			}
		}
		return number_array;
	},

	/**
	 * Count ones (1) in matrix
	 *
	 * @param array matrix Matrix to operate on
	 */
	count: function(matrix) {
		var count = 0;

		// Loop rows
		for(var row = 0; row < matrix.length; row++) {
			// Loop columns
			for(var col = 0; col < matrix[row].length; col++) {
				if (matrix[row][col] == 1) { count++; }
			}
		}

		return count;
	},

	/**
	 * Switch order of number is array - so that pixels randomly rearrange on every page load
	 *
	 * @param array array_in Array to operate on
	 */
	randomize: function(array_in) {
		var i = array_in.length;
		if ( i == 0 ) return false;
		while ( --i ) {
			var j = Math.floor( Math.random() * ( i + 1 ) );
			var tempi = array_in[i];
			var tempj = array_in[j];
			array_in[i] = tempj;
			array_in[j] = tempi;
		}
		return array_in;
	}
};