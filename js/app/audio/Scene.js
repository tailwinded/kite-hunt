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

    			
Audio.Scene.prototype.loadBuffer = function(file, callback) {
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

Audio.Scene.prototype.loadEnvironment = function(file) {
        var self = this;
        this.loadBuffer(file, function(buffer) {
            self.environments[name] = buffer;
        });
};

    

