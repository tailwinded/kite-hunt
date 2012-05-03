/**
 * @author eleventigers / http://jokubasdargis.com/
 * parts taken from Mohit Cheppudira - http://0xfe.blogspot.com code here: https://github.com/0xfe/experiments/blob/master/www/tone/js/sinewave.js
 */

Audio.Sine = function (parameters) {

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

  this.filter = this.scene.context.createBiquadFilter();
  this.filter.frequency.value = 10000;
  this.filter.connect(this.volume);

  this.source = this.scene.context.createJavaScriptNode(2048, 0, 2);
  

  this.x = 0;
  this.sampleRate = this.scene.context.sampleRate;
  this.frequency = 440;
  this.next_frequency = this.frequency;
  this.amplitude = 0.5;
  this.playing = false;
  this.nr = true; // noise reduction
  
  this.oldPosition = new THREE.Vector3();
  this.posDelta = new THREE.Vector3();
  this.posFront = new THREE.Vector3();
  this.posUp = new THREE.Vector3();

  var that = this;
  this.source.onaudioprocess = function(e) { that.process(e) };

  return this;

};

Audio.Sine.prototype = new THREE.Object3D();
Audio.Sine.prototype.constructor = Audio.Buffer; 

Audio.Sine.prototype.setAmplitude = function(amplitude) {
  this.amplitude = amplitude;
};

// Enable/Disable Noise Reduction
Audio.Sine.prototype.setNR = function(nr) {
  this.nr = nr;
};

Audio.Sine.prototype.setFrequency = function(freq) {
  this.next_frequency = freq;

  // Only change the frequency if not currently playing. This
  // is to minimize noise.
  if (!this.playing) this.frequency = freq;
};

Audio.Sine.prototype.update = function() {

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


  this.setFrequency(440/this.parent.scale.x);
  //this.volume.gain.value = 0.1 * (Math.exp(this.parent.scale.x));

};

Audio.Sine.prototype.process = function(e) {
  // Get a reference to the output buffer and fill it up.
  var left = e.outputBuffer.getChannelData(0),
      right = e.outputBuffer.getChannelData(1);

  // We need to be careful about filling up the entire buffer and not
  // overflowing.
  for (var i = 0; i < right.length; ++i) {
    right[i] = left[i] = this.amplitude * Math.sin(this.x++ / (this.sampleRate / (this.frequency * 2 * Math.PI)));

    // A vile low-pass-filter approximation begins here.
    //
    // This reduces high-frequency blips while switching frequencies. It works
    // by waiting for the sine wave to hit 0 (on it's way to positive territory)
    // before switching frequencies.
    if (this.next_frequency != this.frequency) {
      if (this.nr) {
        // Figure out what the next point is.
        next_data = this.amplitude * Math.sin(this.x / (this.sampleRate / (this.frequency * 2 * Math.PI)));

        // If the current point approximates 0, and the direction is positive,
        // switch frequencies.
        if (right[i] < 0.001 && right[i] > -0.001 && right[i] < next_data) {
          this.frequency = this.next_frequency;
          this.x = 0;
        }
      } else {
        this.frequency = this.next_frequency;
        this.x = 0;
      }
    }
  }
}

Audio.Sine.prototype.play = function () {

  this.source.connect(this.filter);
  this.playing = true;

};

Audio.Sine.prototype.pause = function() {
  // Unplug the node.
  this.source.disconnect();
  this.playing = false;
};