function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	// SCENE

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0xBCD2EE, 0.0001 );


	setupScene();
	initPostprocessing();

	// AUDIO

	audio = new Audio.Scene();
	audio.init(camera);
	audio.loadBuffers(['sound/Crackling.wav', 'sound/sine_440.wav', 'sound/square_440.wav', 'sound/saw_440.wav' ], function(status){
		if (status == 'success'){
			//do something
		}
	});

	// RENDERER

	projector = new THREE.Projector();

	renderer = new THREE.WebGLRenderer( { clearColor: 0x000000, clearAlpha: 1, antialias: false } );
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
	renderer.setClearColor( scene.fog.color, 1 );
	renderer.autoClear = false;
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;
	renderer.physicallyBasedShading = false;
	renderer.domElement.style.position = "relative";
	renderer.domElement.style.top = MARGIN + 'px';
	container.appendChild( renderer.domElement );
	
	// FP CONTROLS

	controls = new THREE.FirstPersonControls( camera, renderer.domElement );
	controls.lookSpeed = 0.05;
	controls.movementSpeed = 500;
	controls.noFly = false;
	controls.lookVertical = true;
	controls.heightCoef  = 0.5
	controls.constrainVertical = false;
	controls.verticalMin = 1.5;
	controls.verticalMax = 2.0;
	controls.lon = -110;

	// TRACKBALL CONTROLS

	// controls = new THREE.TrackballControls( camera, renderer.domElement );
	// controls.rotateSpeed = 1.0;
	// controls.zoomSpeed = 1.2;
	// controls.panSpeed = 0.8;
	// controls.noZoom = false;
	// controls.noPan = false;
	// controls.staticMoving = true;
	// controls.dynamicDampingFactor = 0.3;
	// controls.keys = [ 65, 83, 68 ];

	// STATS

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	//GUI

	var effectController  = {

		focus: 		0.42,
		aperture:	0.0486,
		maxblur:	1.0,
		terrain: "#ffffff",
		light: "#ffffff"

	};


	var matChanger = function( ) {

		var hexColor = function(stdHex) {
			return '0x'+stdHex.slice(1, 7);

		} 

		var hextorgb = function(hex){
			var r = ( hex >> 16 & 255 ) / 255;
			var g = ( hex >> 8 & 255 ) / 255;
			var b = ( hex & 255 ) / 255;
			return [r, g, b];
		};

		postprocessing.bokeh_uniforms[ "focus" ].value = effectController.focus;
		postprocessing.bokeh_uniforms[ "aperture" ].value = effectController.aperture;
		postprocessing.bokeh_uniforms[ "maxblur" ] = effectController.maxblur;
		var terrainRGB = hextorgb(hexColor(effectController.terrain));
		ground.material.color.setRGB(terrainRGB[0], terrainRGB[1], terrainRGB[2]);
		var lightRGB = hextorgb(hexColor(effectController.light));
		light.color.setRGB(lightRGB[0], lightRGB[1], lightRGB[2]);

	};


	var gui = new dat.GUI();
	gui.domElement.parentNode.style.zIndex = 11;
	gui.add( effectController, "focus", -1.0, 3.0, 0.025 ).onChange( matChanger );
	gui.add( effectController, "aperture", 0.001, 0.2, 0.001 ).onChange( matChanger );
	gui.add( effectController, "maxblur", 0.0, 3.0, 0.025 ).onChange( matChanger );
	gui.addColor(effectController, 'terrain').onChange( matChanger );
	gui.addColor(effectController, 'light').onChange( matChanger );
	gui.close();


	//EXTRA CONTROLS

	

	renderer.domElement.addEventListener('keydown', function(ev) {
			switch (ev.keyCode) {
				case 16: 
					SHIFT = true; break;

				case '1'.charCodeAt(0): 
					var obj = new Sphere(100, camera.position, new Audio.Buffer({scene:audio, stream:'sine_440.wav', loop: true}) ); 
					scene.add(obj);
					objects.push(obj);
					break;
				
				case '2'.charCodeAt(0): 
					var obj = new Cube(100, camera.position, new Audio.Buffer({scene:audio, stream:'square_440.wav', loop: true}) ); 
					scene.add(obj);
					objects.push(obj);
					break;
				case '3'.charCodeAt(0): 
					var obj = new Pyramid(100, camera.position, new Audio.Buffer({scene:audio, stream:'saw_440.wav', loop: true}) ); 
					scene.add(obj);
					objects.push(obj);
					break;	
			}
	}, false);

	renderer.domElement.addEventListener('keyup', function(ev) {
			switch (ev.keyCode) {
			case 16: 
				SHIFT = false; break;
			}
	}, false);

	renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
	renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
	renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );


}

function setupScene( ) {

	// SCENE CAMERA

	camera = new THREE.PerspectiveCamera( 30, SCREEN_WIDTH / SCREEN_HEIGHT, NEAR, FAR );
	camera.position.set( 5000, 1000, 3000 );
	camera.useQuarternion = true;

	scene.add( camera );

	// LIGHTS

	var ambient = new THREE.AmbientLight( 0x333333 );
	scene.add( ambient );

	light = new THREE.SpotLight( 0xF0F0F0 );
	light.position.set( -1000, 3000, 8500 );
	light.dynamic = true;

	light.castShadow = true;

	light.shadowCameraNear = 700;
	light.shadowCameraFar = camera.far;
	light.shadowCameraFov = 50;

	light.shadowBias = 0.0001;
	light.shadowDarkness = 0.6;

	light.shadowMapWidth = SHADOW_MAP_WIDTH;
	light.shadowMapHeight = SHADOW_MAP_HEIGHT;

	scene.add( light );

	plane = new THREE.Mesh( new THREE.PlaneGeometry( 10000, 10000, 16, 16 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
	plane.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI / 2 ) );
	plane.visible = false;
	scene.add( plane );

	// GROUND

	geometry = new THREE.PlaneGeometry( 200000, 200000, worldWidth - 1, worldDepth - 1 );
	geometry.dynamic = true;

	var i, j, il, jl;

	for ( i = 0, il = geometry.vertices.length; i < il; i ++ ) {

		//console.log(geometry.vertices[ i ]);

		geometry.vertices[ i ].y = 200 * Math.sin( i/2 )*Math.sin(Math.random()*i);
	
		//geometry.vertices[ i ].position.x = -35 * Math.sin( i/2 )*Math.random()*1;

	}

	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	material = new THREE.MeshPhongMaterial( { color: 0xffffff, wireframe: false } );

	ground = new THREE.Mesh( geometry, material );
	ground.rotation.y = - 90 * Math.PI / 180;
	

	// var geometry = new THREE.PlaneGeometry( 1000, 1000 );
	// var planeMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff } );
	// THREE.ColorUtils.adjustHSV( planeMaterial.color, 0, 0, 0.9 );
	// planeMaterial.ambient = planeMaterial.color;

	// var ground = new THREE.Mesh( geometry, planeMaterial );

	 ground.position.set( 0,  0, FLOOR);
	// ground.rotation.x = -Math.PI/2;
	//ground.scale.set( 100, 100, 100 );

	ground.castShadow = false;
	ground.receiveShadow = true;

	scene.add( ground );

	// PARTICLES

	geometry = new THREE.Geometry();
	geometry.dynamic = true;


	for ( i = 0; i < 50000; i ++ ) {

		vector = new THREE.Vector3( Math.random() * 5000 - i/100, Math.random() * 5000 - i/1000, Math.random() * 5000 - i/1000 );
		vector.velocity = new THREE.Vector3(0,-Math.random(), 0); 
		geometry.vertices.push(  vector  );

	}

	//parameters = [ [ [1.0, 1.0, 1.0], 5 ], [ [0.95, 1, 1], 4 ], [ [0.90, 1, 1], 3 ], [ [0.85, 1, 1], 2 ], [ [0.80, 1, 1], 1 ] ];
	parameters = [ [ 0xff0000, 50 ], [ 0xff3300, 40 ], [ 0xff6600, 30 ], [ 0xff9900, 20 ], [ 0xffaa00, 10 ] ];
	//parameters = [ [ 0xffffff, 25 ], [ 0xdddddd, 15 ], [ 0xaaaaaa, 10 ], [ 0x999999, 5 ], [ 0x777777, 3 ] ];

	for ( i = 0; i < parameters.length; i ++ ) {

		size  = parameters[i][1];
		color = parameters[i][0];

		materials[i] = new THREE.ParticleBasicMaterial( { size: size} );

		// materials[i] = new THREE.ParticleBasicMaterial( { size: size } );
		materials[i].color.setHSV( color[0], color[1], color[2] );

		particles = new THREE.ParticleSystem( geometry, materials[i] );

		particles.rotation.x = Math.random() * 60;
		particles.rotation.y = Math.random() * 60;
		particles.rotation.z = Math.random() * 60;
		

	}
	//particles.receiveShadow = true;
	//particles.castShadow = true;

	scene.add( particles );


	// CUBES

	var planeMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff } );

	var mesh = new THREE.Mesh( new THREE.CubeGeometry( 1500, 1500, 1500 ), planeMaterial );

	mesh.position.y = FLOOR + 750;
	mesh.position.z = 20;

	mesh.castShadow = true;
	mesh.receiveShadow = true;
	console.log(mesh);

	scene.add( mesh );

	objects.push(mesh);

	// var mesh = new THREE.Mesh( new THREE.CubeGeometry( 1500, 170, 20 ), planeMaterial );

	// mesh.position.y = FLOOR - 50;
	// mesh.position.z = 20;

	// mesh.castShadow = true;
	// mesh.receiveShadow = true;

	// scene.add( mesh );

	//objects.push(mesh);

	console.log(scene);
}

function initPostprocessing () {

	var height = SCREEN_HEIGHT;

	postprocessing.scene = new THREE.Scene();

	postprocessing.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2,  window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
	postprocessing.camera.position.z = 100;

	postprocessing.scene.add(postprocessing.camera);

	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
	postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget( window.innerWidth, height*2, pars );
	postprocessing.rtTextureColor = new THREE.WebGLRenderTarget( window.innerWidth, height*2, pars );

	var bokeh_shader = THREE.ShaderExtras[ "bokeh" ];

	postprocessing.bokeh_uniforms = THREE.UniformsUtils.clone( bokeh_shader.uniforms );
	postprocessing.bokeh_uniforms[ "tColor" ].texture = postprocessing.rtTextureColor;
	postprocessing.bokeh_uniforms[ "tDepth" ].texture = postprocessing.rtTextureDepth;
	postprocessing.bokeh_uniforms[ "focus" ].value = 0.42;
	postprocessing.bokeh_uniforms[ "aperture" ].value = 0.0486;
	postprocessing.bokeh_uniforms[ "maxblur" ].value = 1;
		postprocessing.bokeh_uniforms[ "aspect" ].value = window.innerWidth / height ;

	postprocessing.materialBokeh = new THREE.ShaderMaterial( {

			uniforms:  postprocessing.bokeh_uniforms,
			vertexShader: bokeh_shader.vertexShader,
			fragmentShader: bokeh_shader.fragmentShader

	} );

	postprocessing.quad = new THREE.Mesh( new THREE.PlaneGeometry( window.innerWidth, window.innerHeight ), postprocessing.materialBokeh );
	postprocessing.quad.position.z = - 500;
	postprocessing.quad.rotation.x = Math.PI / 2;
	postprocessing.scene.add( postprocessing.quad );

}


function onDocumentMouseMove( event ) {

	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	//

	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	if ( SELECTED ) {

		var intersects = ray.intersectObject( plane );
		SELECTED.position.copy( intersects[ 0 ].point.subSelf( offset ) );
		return;

	}


	var intersects = ray.intersectObjects( objects );

	if ( intersects.length > 0 ) {

		if ( INTERSECTED != intersects[ 0 ].object ) {

			if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

			INTERSECTED = intersects[ 0 ].object;
			if (typeof INTERSECTED.sound !== 'undefined'){
				if (typeof INTERSECTED.sound.play !== 'undefined'){
					INTERSECTED.sound.play();
				}
			}
			INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
			plane.position.copy( INTERSECTED.position );
			plane.lookAt( camera.position );
			//send object and camera to autofocus bokeh
			autofocus(INTERSECTED.position, camera.position); 
			container.style.cursor = 'pointer';

		}

		else if (SHIFT && MOUSEDOWN) {

			controls.freeze = true;
			var diff = Math.sin(MOUSEDOWNx - mouse.x);

			INTERSECTED.scale.x += diff;
			INTERSECTED.scale.y += diff;
			INTERSECTED.scale.z += diff;
			container.style.cursor = 'e-resize';
			
		}

		

	} else {

		if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
		INTERSECTED = null;
		container.style.cursor = 'auto';

	}

}

function onDocumentMouseDown( event ) {

	event.preventDefault();
	MOUSEDOWN = true;
	MOUSEDOWNx = mouse.x;

	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	var intersects = ray.intersectObjects( objects );

	if ( intersects.length > 0 && !SHIFT ) {

		controls.freeze = true;

		SELECTED = intersects[ 0 ].object;
		
		var intersects = ray.intersectObject( plane );
		offset.copy( intersects[ 0 ].point ).subSelf( plane.position );
		container.style.cursor = 'move';

	} 
		

}

function onDocumentMouseUp( event ) {

	event.preventDefault();
	MOUSEDOWN = false;

	controls.freeze = false;

	if ( INTERSECTED ) {

		plane.position.copy( INTERSECTED.position );

		SELECTED = null;

	}

	container.style.cursor = 'auto';

}


function autofocus(objPos, camPos){

	var distance = objPos.distanceTo(camPos);
	var focus = postprocessing.bokeh_uniforms[ "focus" ].value = distance / 4000 / Math.log(distance);
	var aperture = postprocessing.bokeh_uniforms[ "aperture" ].value = focus / distance * 100;

}


function animate() {
	requestAnimationFrame( animate );
	render();
	stats.update();
}

function render() {

	var delta = clock.getDelta();
	var time = clock.getElapsedTime() * 10;
	//var seconds		= Date.now()/1000;
	//var piPerSeconds	= seconds * Math.PI;

	audio.update(camera);
	controls.update( delta );

	// for (var i = 0, l = objects.length; i < l; i++){
	// 	objects[ i ].sound.update();
	// }

	for ( var i = 0; i < objects.length; i ++ ){
		if (typeof objects[i].update !== 'undefined'){
			objects[i].update();
		}
	}
	

	if (this.postprocessing.enabled ) {

			renderer.clear();
			// Render scene into texture
			scene.overrideMaterial = null;
			renderer.render( scene, camera, postprocessing.rtTextureColor, true );
			// Render depth into texture
			scene.overrideMaterial = material_depth;
			renderer.render( scene, camera, postprocessing.rtTextureDepth, true );
			// Render bokeh composite
			renderer.render( postprocessing.scene, postprocessing.camera );

	} else {

			renderer.clear();
			renderer.render(scene, camera );

	}

	particles.rotation.x += 0.001;
	particles.geometry.__dirtyVertices = true;

}
