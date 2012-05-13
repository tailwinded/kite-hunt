/**
 * @author eleventigers / http://jokubasdargis.com/
 */

 Audio.ADSR = function(gate, a, d, s, r, parameter, onComplete) {
 	this.gate = gate;
 	this.parameter = parameter;
 	this.a = a || 0;
 	this.d = d || 0;
 	this.s = s || 1;
 	this.r = r || 0;

 	this.gateOn = false;
 	this.onComplete = onComplete;

 };

 Audio.ADSR.prototype.constructor = Audio.ADSR;

