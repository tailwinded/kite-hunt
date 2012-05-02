/**
 * @author eleventigers / http://jokubasdargis.com/
 */

Audio.Buffer = function (parameters) {

	THREE.Object3D.call( this );
	this.initParams = parameters;

	this.scene = parameters.scene;	
	this.directionalSource = false;

	this.panner = this.scene.context.createPanner();
	this.panner.refDistance = 100.0;
	this.panner.panningModel = 1;
	this.panner.rolloffFactor = 2;
	this.volume = this.scene.context.createGainNode();

	this.volume.connect(this.panner);
	this.panner.connect(this.scene.context.destination);

	this.source = this.scene.context.createBufferSource(mixToMono = false);
	this.source.connect(this.volume);
	this.source.loop = parameters.loop;
	
	this.oldPosition = new THREE.Vector3();
	this.posDelta = new THREE.Vector3();
	this.posFront = new THREE.Vector3();
	this.posUp = new THREE.Vector3();
	
	return this;

};

Audio.Buffer.prototype = new THREE.Object3D();
Audio.Buffer.prototype.constructor = Audio.Buffer; 

Audio.Buffer.prototype.update = function() {

	this.oldPosition.copy( this.position );
	this.position.copy( this.parent.position );
	this.posDelta.sub( this.position, this.oldPosition );
	this.panner.setPosition( this.position.x, this.position.y, this.position.z );
	this.panner.setVelocity( this.posDelta.x, this.posDelta.y, this.posDelta.z );

	if ( this.directionalSource ) {

		this.posFront.set( 0, 0, -1 );
		this.matrixWorld.rotateAxis( this.posFront );
		this.posFront.normalize();
		this.posUp.copy( this.parent.up);
		this.panner.setOrientation( this.posFront.x, this.posFront.y, this.posFront.z, this.posUp.x, this.posUp.y, this.posUp.z );

	}

	this.source.playbackRate.value = 1/this.parent.scale.x;
	this.volume.gain.value = 0.5 * (Math.exp(this.parent.scale.x));

};

Audio.Buffer.prototype.play = function () {
	var self = this;
	this.scene.loadBuffer(this.initParams.stream, function(buffer){
		self.source.buffer = buffer;		     
	});
	this.source.noteOn(0);

};





