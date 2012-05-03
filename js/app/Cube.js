Cube = function (side, position, soundObject) {

	THREE.Mesh.call( this );	

	this.geometry = new THREE.CubeGeometry(side, side, side);
	var color = '0x'+Math.floor(Math.random()*16777215).toString(16);
	this.material = new THREE.MeshPhongMaterial({color: color});

	this.castShadow = true;
	this.receiveShadow  = false;
	this.geometry.computeBoundingSphere();
	this.geometry.dynamic = true;
	this.geometry.__dirtyVertices = true;
	this.geometry.__dirtyNormals = true;
	console.log(this)

	this.position.set( position.x, position.y, position.z );
	this.rotation.y = Math.PI/2;

	var sound = soundObject;

	this.add(sound);
	this.sound = soundObject;

}

Cube.prototype = new THREE.Mesh();
Cube.prototype.constructor = Cube;

Cube.prototype.update = function(){

	for (var i = 0; i < this.children.length; i++){
		this.children[ i ].update();
	}
} 
