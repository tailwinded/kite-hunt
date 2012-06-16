Sphere = function (radius, position, soundObject) {

	THREE.Mesh.call( this );	

	this.geometry = new THREE.SphereGeometry(radius, radius/2, radius/2);
	var color = '0x'+Math.floor(Math.random()*16777215).toString(16);
	this.material = new THREE.MeshPhongMaterial({color: color});

	this.castShadow = true;
	this.receiveShadow  = true;
	this.geometry.dynamic = true;
	this.geometry.__dirtyVertices = true;
	this.geometry.__dirtyNormals = true;

	this.position.set( position.x, position.y, position.z );
	this.rotation.y = Math.PI/2;

	var sound = soundObject;

	this.add(sound);
	this.sound = soundObject;

	this.nearbyOld = [];
	this.nearbyNew = [];


}

Sphere.prototype = new THREE.Mesh();
Sphere.prototype.constructor = Sphere;

Sphere.prototype.update = function(){

	// for (var i = 0; i < this.children.length; i++){
	// 	this.children[ i ].update();
	// }
	
} 

