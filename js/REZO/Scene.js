/**
 * @author eleventigers / http://jokubasdargis.com/
 */

REZO.Scene = function (camera) {

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
    this.sounds = [];

    var cameraPosition = new THREE.Vector3(),
    oldCameraPosition = new THREE.Vector3(),
    cameraDelta = new THREE.Vector3(),
    cameraFront = new THREE.Vector3(),
    cameraUp = new THREE.Vector3();
    			
    this.loadBuffer = function(file, callback) {
        var ctx = this.context;
        var request = new XMLHttpRequest();
        request.open("GET", file, true);
        request.responseType = "arraybuffer";
        request.onload = function() {
            var buffer = ctx.createBuffer(request.response, false);
            callback(buffer);
        };
        request.send();
        return request;
    };

    this.loadEnvironment = function(file) {
        var self = this;
        this.loadBuffer(file, function(buffer) {
            self.environments[name] = buffer;
        });
    };

    this.update = function() {

        oldCameraPosition.copy( cameraPosition );
        cameraPosition.copy( this.camera.matrixWorld.getPosition() );
        cameraDelta.sub( cameraPosition, oldCameraPosition );
        cameraUp.copy( this.camera.up );
        cameraFront.set( 0, 0, -1 );
        this.camera.matrixWorld.rotateAxis( cameraFront );
        cameraFront.normalize();

        this.context.listener.setPosition( cameraPosition.x, cameraPosition.y, cameraPosition.z );
        this.context.listener.setVelocity( cameraDelta.x, cameraDelta.y, cameraDelta.z );
        this.context.listener.setOrientation( cameraFront.x, cameraFront.y, cameraFront.z, cameraUp.x, cameraUp.y, cameraUp.z );
        
  };

};

