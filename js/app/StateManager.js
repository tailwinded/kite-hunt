StateManager = function (init_state, canvas_object) {
	// The state manager most have some initial state
	this.ActiveAppState = init_state;

	// Create an empty object, we will store key presses here 
	this.KeysPressed = {};

	// Cursor state container
	this.Cursor = {
		'prevX' : 0,	// Previous x coordinate
		'prevY' : 0,	// Previous y coordinate
		'x' : 0,		// Current x coordinate
		'y' : 0,		// Current y coordinate
		'down' : false	// Is the mouse button pressed
	}

	// 'Self' for reference in events
	var self = this;


	/*

		EVENT HANDLING BEGIN

	*/


	// Key pressed
	canvas_object.addEventListener("keydown", function (event) {
		// For compatibility purposes we need to check whether we are dealing with 'charCode' or 'keyCode'
		var chCode = ('charCode' in event) ? event.charCode : event.keyCode;

		// Record key press in map for reference
		self.KeysPressed[chCode] = true;

		// We need to check if function exists
		if (typeof self.ActiveAppState.OnKeyDown === 'function')
			self.ActiveAppState.OnKeyDown(chCode);
	});

	// Key released
	canvas_object.addEventListener("keyup", function (event) {
		var chCode = ('charCode' in event) ? event.charCode : event.keyCode;
		self.KeysPressed[chCode] = false;

		if (typeof self.ActiveAppState.OnKeyUp === 'function')
			self.ActiveAppState.OnKeyUp(chCode);
	});

	// Mouse moved
	canvas_object.addEventListener("onmousemove", function (event) {
		var x = event.clientX;
		var y = event.clientY;

		if (typeof self.ActiveAppState.OnMouseMove === 'function')
			self.ActiveAppState.OnMouseMouve(self.Cursor.x, self.Cursor.y, x, y);

		self.Cursor.prevX = self.Cursor.x;
		self.Cursor.prevY = self.Cursor.y;
		self.Cursor.x = x;
		self.Cursor.y = y;
	});

	// Mouse clicked (down)
	canvas_object.addEventListener("onmousedown"), function() {
		if (typeof self.ActiveAppState.OnMouseDown === 'function')
			self.ActiveAppState.OnMouseDown(self.Cursor.x, self.Cursor.y);

		self.Cursor.down = true;
	});

	// Mouse released (up)
	canvas_object.addEventListener("onmouseup"), function() {
		if (typeof self.ActiveAppState.OnMouseUp === 'function')
			self.ActiveAppState.OnMouseDown(self.Cursor.x, self.Cursor.y);

		self.Cursor.down = false;
	});

	/*

		EVENT HANDLING FINISH

	*/
}

StateManager.prototype.OnLoop = function () {
	if (typeof ActiveAppState != undefined)
		this.ActiveAppState.OnLoop();
}

StateManager.prototype.OnRender = function () {
	if (typeof ActiveAppState != undefined)
		this.ActiveAppState.OnRender();
}

StateManager.prototype.SetActiveAppState = function (state) {
	if (typeof state != undefined) {
		this.ActiveAppState = state;
		this.ActiveAppState.OnActivation();

		// Reference self so that the state can access the state manager
		this.ActiveAppState.SetStateManager(this);
	} else {
		console.log("ERROR: Trying to set a state that was undefined");
	}
}