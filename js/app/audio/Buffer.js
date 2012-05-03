/**
 * @author eleventigers / http://jokubasdargis.com/
 */

Audio.Buffer = function (parameters) {

	THREE.Object3D.call( this );
	this.initParams = parameters;
	this.playing = false;

	this.scene = parameters.scene;	
	this.directionalSource = false;

	this.panner = this.scene.context.createPanner();
	this.panner.refDistance = 100.0;
	this.panner.panningModel = 1;
	this.panner.rolloffFactor = 2;
	this.volume = this.scene.context.createGainNode();

	this.volume.connect(this.panner);
	this.panner.connect(this.scene.context.destination);

	// this.adsr = this.scene.context.createJavaScriptNode(2048, 2, 2);
	// this.adsr.connect(this.volume);


	this.sampleRate = this.scene.context.sampleRate;
	
	this.oldPosition = new THREE.Vector3();
	this.posDelta = new THREE.Vector3();
	this.posFront = new THREE.Vector3();
	this.posUp = new THREE.Vector3();

	var self = this;
	// this.adsr.onaudioprocess = function(e) { self.process(e) };

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

	if (typeof this.source !== 'undefined') this.source.playbackRate.value = 1/this.parent.scale.x;
	//this.volume.gain.value = 0.1 * (Math.exp(this.parent.scale.x));

	

};

// Audio.Buffer.prototype.process = function(event){

// 	var inputArrayL = event.inputBuffer.getChannelData(0);
//     var inputArrayR = event.inputBuffer.getChannelData(1);
//     var outputArrayL = event.outputBuffer.getChannelData(0);
//     var outputArrayR = event.outputBuffer.getChannelData(1);
    
//     var n = inputArrayL.length;


// 	for (var i = 0; i < n; ++i) {
// 		outputArrayL[i] = inputArrayL[i];
//         outputArrayR[i] = inputArrayR[i];
// 	}

// };

Audio.Buffer.prototype.play = function () {
	

	// if (!this.playing){
		this.playing = true;
		this.volume.gain.value = 1;
		this.source = this.scene.context.createBufferSource(mixToMono = true);
		this.source.buffer = this.scene.bufferList[this.initParams.stream];
		this.source.loop = this.initParams.loop;
		this.source.connect(this.volume);
		this.source.noteOn(0);
	
		var self = this;
		setTimeout(function() { self.stop(); }, 1000);
		this.intervalId = setInterval(function() { if(self.volume.gain.value >= 0) self.volume.gain.value -= 0.01;  }, 1);
			
	// }
};

Audio.Buffer.prototype.stop = function () {
	this.source.noteOff(0);
	this.playing = false;
	clearInterval(this.intervalId);
};







