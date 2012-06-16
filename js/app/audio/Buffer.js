/**
 * @author eleventigers / http://jokubasdargis.com/
 */

Audio.Buffer = function (parameters) {

	var self = this;

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

	this.posUpdateTimer = this.scene.context.createJavaScriptNode(2048, 1, 1);
	this.posUpdateTimer.connect(this.volume);
	this.posUpdateTimer.onaudioprocess = function(e) { self.posUpdate(); self.scan(1000); self.proxy(); };

	this.sampleRate = this.scene.context.sampleRate;
	
	this.oldPosition = new THREE.Vector3();
	this.posDelta = new THREE.Vector3();
	this.posFront = new THREE.Vector3();
	this.posUp = new THREE.Vector3();

	this.voices = [];
	this.maxVoices = 4;

	this.analysisFilters = ['spectral_centroid', 'pitch'];

	this.topics = [];
	this.oldTopics = [];
	this.topicsMap = {};

	this.nearbyOld = [];
	this.nearby = [];

	this.sink = function(topic, data){
		
	}

	return this;

}

Audio.Buffer.prototype = new THREE.Object3D();
Audio.Buffer.prototype.constructor = Audio.Buffer; 


Audio.Buffer.prototype.posUpdate = function() {

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

	//if (typeof this.source !== 'undefined') this.source.playbackRate.value = 1/this.parent.scale.x;

}

Audio.Buffer.prototype.scan = function(distance){

	var maxDis = (!distance) ? 1000 : distance;

	this.nearby = [];

	for (var i = 0; i < this.parent.parent.children.length; i++){

		var neighbour = this.parent.parent.children[i];

		if (neighbour != this && typeof neighbour.sound !== 'undefined'){

			var dist = this.position.distanceTo(neighbour.position);
			if (dist < maxDis && dist != 0){
					this.nearby.push(neighbour);
			}
		}
	}
}

Audio.Buffer.prototype.proxy = function(){

	if (this.nearby.length != this.nearbyOld.length ) {
		this.updateTopics(this.nearby);
	}

	this.nearbyOld = this.nearby;

}

Audio.Buffer.prototype.updateTopics = function(neighbours) {

	this.oldTopics = this.topics;

	this.topics = [];

	for (var i = 0; i < neighbours.length; i++){

		var neighbour = neighbours[i];

		for (var i = 0; i < this.analysisFilters.length; i++){
			var topic =  neighbour.id+'.'+this.analysisFilters[i];	
			this.topics.push(topic);
		}			
	}

	if (this.oldTopics.length != this.topics){

		var addTopics = [];
		var removeTopics = [];

		for (var i = 0; i < this.topics.length; i++){
			var index = this.oldTopics.indexOf(this.topics[i]);
			if(index == -1){
				addTopics.push(this.topics[i]);
			}
		}

		for (var i = 0; i < this.oldTopics.length; i++){
			var index = this.topics.indexOf(this.oldTopics[i]);
			if(index == -1){
				removeTopics.push(this.oldTopics[i]);
			}
		}

		if (addTopics.length > 0) {
			this.subscription('su', addTopics);	
		}

		if (removeTopics.length > 0) {
			this.subscription('un', removeTopics);	
		} 
		
	}
}

Audio.Buffer.prototype.subscription = function(action, topics) {

	if (action == 'su'){
		for (var i = 0; i < topics.length; i++){
			var token = PubSub.subscribe(topics[i], this.sink);
			this.topicsMap[topics[i]] = token;
		}
	}

	if (action == 'un'){
		for (var i = 0; i < topics.length; i++){
			if (this.topicsMap.hasOwnProperty(topics[i])){
				var token = this.topicsMap[topics[i]];
				PubSub.unsubscribe( token );
				delete this.topicsMap[topics[i]];
			}
		}		
	}
	
}

Audio.Buffer.prototype.play = function (smp, smpSt, smpDur) {


	var playingCount = 0;

	var sample = (!sample) ? this.initParams.stream : smp;
	var sampleStart = (!smpSt) ? 0 : smpSt;
	var sampleDuration = (!smpDur) ? 0 : smpDur;

	if (this.voices.length <= this.maxVoices){

		for (var i = 0; i < this.voices.length; i++){
			if (this.voices[i].playing){
				playingCount ++;
			}
			if (!this.voices[i].playing){
				this.voices.splice(i, 1);
			}
		}

		if (playingCount == this.maxVoices){
			this.voices[0].stop();
			this.voices.splice(0, 1);
			var voice = new Voice(this, sample);
			this.voices.push(voice);
			voice.play(sampleStart, sampleDuration);
		} else {
			var voice = new Voice(this, sample);
			this.voices.push(voice);
			voice.play(sampleStart, sampleDuration);
		}
	}
	
}

function Voice (parent, buffer) {

	this.parent = parent;

	this.source = this.parent.scene.context.createBufferSource(mixToMono = true);
	this.source.buffer = this.parent.scene.bufferList[buffer];
	this.source.loop = this.parent.initParams.loop;
	this.source.connect(this.parent.volume);
	this.source.start = 0;
	this.playing = false;

	var self = this;
	
	this.play = function (smpSt, smpDur) {

		this.sampleStart = (!smpSt) ? 0 : smpSt;
		this.sampleDuration = (!smpDur || sampDur == 0) ? this.source.buffer.duration : smpDur;

		this.playHead = this.parent.scene.context.createJavaScriptNode(2048, 1, 1);
		this.playHead.onaudioprocess = function(e) {self.follow(); self.info()};

		this.source.noteGrainOn(0, this.sampleStart, this.sampleDuration);
		this.playHead.connect(this.parent.volume);

		this.source.start = this.parent.scene.context.currentTime;
		this.playing = true;
	};

	this.stop = function () {
		this.playHead.disconnect(this.parent.volume);
		this.source.noteOff(0);
		this.playing = false;
	};

	this.follow = function() {
		if (this.playing) {
			this.playHeadPos = this.parent.scene.context.currentTime - this.source.start;
		}
		if (this.playHeadPos >= this.sampleDuration){
			this.stop();
		}
	};	

	this.info = function() {

		var pathToLowLevel = this.source.buffer.meta.properties.analysis_frames.lowlevel;
		var filters = [];
		
		for (var i = 0; i < this.parent.analysisFilters.length; i++){
			filters.push(pathToLowLevel[this.parent.analysisFilters[i]]);	
		}


		for (var i = 0; i < filters.length; i++) {
			var filter = filters[i];
			var windowSize = this.source.buffer.duration * this.source.buffer.sampleRate / filter.length;
			var currentWindow = Math.floor(this.playHeadPos *  this.source.buffer.sampleRate / windowSize) - 1;
		
			var topic = this.parent.parent.id+'.'+this.parent.analysisFilters[i];
			PubSub.publish(topic, filter[currentWindow]);
		}
		
	}		
}

function Sink (topic, data){
	console.log(topic, data);
}








