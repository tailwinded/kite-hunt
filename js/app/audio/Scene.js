/**
 * @author eleventigers / http://jokubasdargis.com/
 */

Audio.Scene = function (camera) {

    this.context = new webkitAudioContext();
    this.camera = camera;

    this.convolver = this.context.createConvolver();
    this.convolverGain = this.context.createGainNode();
    this.volume = this.context.createGainNode();
    this.mixer = this.context.createGainNode();
    this.flatGain = this.context.createGainNode();
    this.destination = this.mixer;
    this.mixer.connect(this.flatGain);
    this.mixer.connect(this.convolver);
    this.convolver.connect(this.convolverGain);
    this.flatGain.connect(this.volume);
    this.convolverGain.connect(this.volume);
    this.volume.connect(this.context.destination);

    this.environments = { enabled : false };

    this.bufferList = {};

};

Audio.Scene.prototype.constructor = Audio.Scene;
Audio.Scene.prototype.init = function(listener){

    this.listener = listener; // attach context listener to a camera e.g.
    this.listener.newPosition = new THREE.Vector3();
    this.listener.oldPosition = new THREE.Vector3();
    this.listener.posDelta = new THREE.Vector3();
    this.listener.posFront = new THREE.Vector3();

};

Audio.Scene.prototype.update = function() {

        this.listener.oldPosition.copy( this.listener.newPosition );
        this.listener.newPosition.copy( this.listener.matrixWorld.getPosition() );
        this.listener.posDelta.sub( this.listener.newPosition, this.listener.oldPosition );

        this.listener.posFront.set( 0, 0, -1 );
        this.listener.matrixWorld.rotateAxis( this.listener.posFront );
        this.listener.posFront.normalize();

        this.context.listener.setPosition( this.listener.newPosition.x, this.listener.newPosition.y, this.listener.newPosition.z );
        this.context.listener.setVelocity( this.listener.posDelta.x, this.listener.posDelta.y, this.listener.posDelta.z );
        this.context.listener.setOrientation( this.listener.posFront.x, this.listener.posFront.y, this.listener.posFront.z, this.listener.up.x, this.listener.up.y, this.listener.up.z );
        
};

    			
// Audio.Scene.prototype.loadBuffer = function(file, callback) {
//     var ctx = this.context;
//     var request = new XMLHttpRequest();
//     request.open("GET", file, true);
//     request.responseType = "arraybuffer";
//     request.onload = function() {
//         var buffer = ctx.createBuffer(request.response, false);
//         callback(buffer);
//     };
//     request.send();
//     return request;
// };




Audio.Scene.prototype.loadEnvironment = function(file) {
        var self = this;
        this.loadBuffer(file, function(buffer) {
            self.environments[name] = buffer;
        });
};


Audio.Scene.prototype.loadBuffer = function(url, callback) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  var filename = url.replace(/^.*[\\\/]/, '');
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var scene = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    scene.context.decodeAudioData(
        request.response,
        function(buffer) {
            if (!buffer) {
              alert('error decoding file data: ' + url);
              return;
            }
            scene.bufferList[filename] = buffer;
            callback('success');
        }
    );
  }

  request.onerror = function() {
    alert('Audio.Loader: XHR error');
  }

  request.send();
}

Audio.Scene.prototype.loadBuffers = function(urlList, callback) {
    var count = 0;
    for (var i = 0; i < urlList.length; ++i)
    this.loadBuffer(urlList[i], function(status){
        if (status == 'success') ++count;
        if (count == urlList.length) {
            callback('success');
        }
    });
}

    

