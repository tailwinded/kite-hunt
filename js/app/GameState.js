GameState = function () {

	// Function on fired on every iteration of the game loop
	this.OnLoop = null;

	// Function fired when asked to render state
	this.OnRender = null;
	
	// Function fired when state is activated
	this.OnActivation = null;

	// Function fired when key is pressed
	this.OnKeyDown = null;

	// Function fired when key is released
	this.OnKeyUp = null;

	// Function fired on mouse move (receives previous x, previous y, current x, current y)
	this.OnMouseMove  = null;
}

GameState.prototype.SetStateManager = function (state_manager) {
	this.StateManager = state_manager;
}