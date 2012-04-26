/**
 * @author eleventigers / http://jokubasdargis.com/
 */

REZO.Buffer = function (parameters, obj3D) {

	var self = this;
	this.obj3D = obj3D;
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
	this.scene.loadBuffer(parameters.stream, function(buffer){
		self.source.buffer = buffer;		     
	});

	this.soundPosition = new THREE.Vector3();
	this.oldSoundPosition = new THREE.Vector3();
	this.soundDelta = new THREE.Vector3();
	this.soundFront = new THREE.Vector3();
	this.soundUp = new THREE.Vector3();

	this.scene.sounds.push(this);	
	return this;

};


REZO.Buffer.prototype.constructor = REZO.Buffer; 

REZO.Buffer.prototype.update = function() {

	this.oldSoundPosition.copy( this.soundPosition );
	this.soundPosition.copy( this.obj3D.matrixWorld.getPosition() );
	this.soundDelta.sub( this.soundPosition, this.oldSoundPosition );
	this.panner.setPosition( this.soundPosition.x, this.soundPosition.y, this.soundPosition.z );
	this.panner.setVelocity( this.soundDelta.x, this.soundDelta.y, this.soundDelta.z );

	if ( this.directionalSource ) {

		this.soundFront.set( 0, 0, -1 );
		this.obj3D.matrixWorld.rotateAxis( this.soundFront );
		this.soundFront.normalize();
		this.soundUp.copy( this.obj3D );
		this.panner.setOrientation( this.soundFront.x, this.soundFront.y, this.soundFront.z, this.soundUp.x, this.soundUp.y, this.soundUp.z );

	}

	this.source.playbackRate.value = 1/this.obj3D.scale.x;
	this.volume.gain.value = 0.5 * (Math.exp(this.obj3D.scale.x));

};

REZO.Buffer.prototype.play = function () {

	this.source.noteOn(this.scene.context.currentTime + 0.020);

};





