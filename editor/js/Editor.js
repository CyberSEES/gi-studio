var Editor = function () {

	var SIGNALS = signals;

	this.signals = {

		// actions

		playAnimations: new SIGNALS.Signal(),

		// notifications

		themeChanged: new SIGNALS.Signal(),

		transformModeChanged: new SIGNALS.Signal(),
		snapChanged: new SIGNALS.Signal(),
		spaceChanged: new SIGNALS.Signal(),
		rendererChanged: new SIGNALS.Signal(),

		sceneGraphChanged: new SIGNALS.Signal(),

		cameraChanged: new SIGNALS.Signal(),

		locationChanged: new SIGNALS.Signal(),

		objectSelected: new SIGNALS.Signal(),
		objectAdded: new SIGNALS.Signal(),
		objectChanged: new SIGNALS.Signal(),
		objectRemoved: new SIGNALS.Signal(),

		helperAdded: new SIGNALS.Signal(),
		helperRemoved: new SIGNALS.Signal(),

		materialChanged: new SIGNALS.Signal(),
		fogTypeChanged: new SIGNALS.Signal(),
		fogColorChanged: new SIGNALS.Signal(),
		fogParametersChanged: new SIGNALS.Signal(),
		windowResize: new SIGNALS.Signal()

	};
	
	this.config = new Config();
	this.storage = new Storage();
	this.loader = new Loader( this );

	this.scene = new THREE.Scene();

	this.sceneBackground = new THREE.Scene();
	this.panorama = new THREE.Mesh(
        new THREE.SphereGeometry( 512, 32, 32 ), 
        new THREE.MeshBasicMaterial( {
            map: new THREE.Texture()
        } )
    );
    this.panorama.position.set( 0, 0, 0 );
    this.panorama.name = "panorama";
    this.sceneBackground.add( this.panorama );

	this.sceneHelpers = new THREE.Scene();

	this.object = {};
	this.geometries = {};
	this.materials = {};
	this.textures = {};

	this.selected = null;
	this.helpers = {};

};

Editor.prototype = {

	setTheme: function ( value ) {

		document.getElementById( 'theme' ).href = value;

		this.signals.themeChanged.dispatch( value );

	},

	setScene: function ( scene ) {

		this.scene.name = scene.name;
		this.scene.userData = JSON.parse( JSON.stringify( scene.userData ) );

		// avoid render per object

		this.signals.sceneGraphChanged.active = false;

		while ( scene.children.length > 0 ) {

			this.addObject( scene.children[ 0 ] );

		}

		this.signals.sceneGraphChanged.active = true;
		this.signals.sceneGraphChanged.dispatch();

	},

	setLocation: function ( coords ) {

    	var loader = new GSVPANO.PanoLoader();
    	var editor = this;

    	loader.onProgress = function( p ) {
        	//setProgress( p );
    	};
            
    	loader.onPanoramaData = function( result ) {
	        //showProgress( true );
    	    //showMessage( 'Panorama OK. Loading and composing tiles...' );
    	}
            
    	loader.onNoPanoramaData = function( status ) {
        	//showError("Could not retrieve panorama for the following reason: " + status);
    	}
            
    	loader.onPanoramaLoad = function() {

        	console.log( 'onPanoramaLoad' );
        	//activeLocation = this.location;
        	editor.panorama.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), this.rotation);
        	console.log(this.canvas);
        	editor.panorama.material.map = new THREE.Texture( this.canvas[0] ); 
        	editor.panorama.material.side = THREE.DoubleSide;
        	editor.panorama.material.map.needsUpdate = true;
        	onWindowResize();
    	
    	};
    
    	// 1 is very fuzzy, 2 is fuzzy, 3 is the highest resolution available.  
    	// 4 errors occur, possibly because 4 panels don't have resolution 3 available
    	loader.setZoom( 3 );
    	loader.load( new google.maps.LatLng( coords.lat, coords.lng ) );

    	/*
		$.ajax( {
            url: 'http://geoservice-freemancw.rhcloud.com/speciesforlatlng',   
            data: $.param( coords ),
            dataType: 'json',
            success: function( data ) {
            	console.log( data );
                editor.signals.locationChanged.dispatch( data );
            },
            error: function( jqXHR, textStatus, errorThrown ) {
            	console.log( textStatus );
            	console.log( errorThrown );
            }
	    } );
*/
	},

	//

	addObject: function ( object ) {

		var scope = this;

		object.traverse( function ( child ) {

			if ( child.geometry !== undefined ) scope.addGeometry( child.geometry );
			if ( child.material !== undefined ) scope.addMaterial( child.material );

			scope.addHelper( child );

		} );

		this.scene.add( object );

		this.signals.objectAdded.dispatch( object );
		this.signals.sceneGraphChanged.dispatch();

	},

	setObjectName: function ( object, name ) {

		object.name = name;
		this.signals.sceneGraphChanged.dispatch();

	},

	removeObject: function ( object ) {

		if ( object.parent === undefined ) return; // avoid deleting the camera or scene

		if ( confirm( 'Delete ' + object.name + '?' ) === false ) return;

		var scope = this;

		object.traverse( function ( child ) {

			scope.removeHelper( child );

		} );

		object.parent.remove( object );

		this.signals.objectRemoved.dispatch( object );
		this.signals.sceneGraphChanged.dispatch();

	},

	addGeometry: function ( geometry ) {

		this.geometries[ geometry.uuid ] = geometry;

	},

	setGeometryName: function ( geometry, name ) {

		geometry.name = name;
		this.signals.sceneGraphChanged.dispatch();

	},

	addMaterial: function ( material ) {

		this.materials[ material.uuid ] = material;

	},

	setMaterialName: function ( material, name ) {

		material.name = name;
		this.signals.sceneGraphChanged.dispatch();

	},

	addTexture: function ( texture ) {

		this.textures[ texture.uuid ] = texture;

	},

	//

	addHelper: function () {

		var geometry = new THREE.SphereGeometry( 20, 4, 2 );
		var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

		return function ( object ) {

			var helper;

			if ( object instanceof THREE.Camera ) {

				helper = new THREE.CameraHelper( object, 10 );

			} else if ( object instanceof THREE.PointLight ) {

				helper = new THREE.PointLightHelper( object, 10 );

			} else if ( object instanceof THREE.DirectionalLight ) {

				helper = new THREE.DirectionalLightHelper( object, 20 );

			} else if ( object instanceof THREE.SpotLight ) {

				helper = new THREE.SpotLightHelper( object, 10 );

			} else if ( object instanceof THREE.HemisphereLight ) {

				helper = new THREE.HemisphereLightHelper( object, 10 );

			} else {

				// no helper for this object type
				return;

			}

			var picker = new THREE.Mesh( geometry, material );
			picker.name = 'picker';
			picker.userData.object = object;
			picker.visible = false;
			helper.add( picker );

			this.sceneHelpers.add( helper );
			this.helpers[ object.id ] = helper;

			this.signals.helperAdded.dispatch( helper );

		};

	}(),

	removeHelper: function ( object ) {

		if ( this.helpers[ object.id ] !== undefined ) {

			var helper = this.helpers[ object.id ];
			helper.parent.remove( helper );

			delete this.helpers[ object.id ];

			this.signals.helperRemoved.dispatch( helper );

		}

	},

	//

	parent: function ( object, parent ) {

		if ( parent === undefined ) {

			parent = this.scene;

		}

		parent.add( object );

		this.signals.sceneGraphChanged.dispatch();

	},

	//

	// Simplify by reducing selectable objects for RHESSys users
	unselectable: function ( object ) {
		
		if ( object == null ) {
			return false;
		}

		if ( object.name == "ground" || object.name == "panorama" ) {
			return true;
		}

		return false;

	},

	//

	select: function ( object ) {

		if ( this.unselectable( object ) ) {

			//Don't allow selection of these things
			this.deselect();
			return;

			//Still allow selecting so that I can mess with them.

		}

		if ( object !== null ) {

			this.config.setKey( 'selected', object.uuid );

		} else {

			this.config.setKey( 'selected', null );

		}

		this.selected = object;

		this.signals.objectSelected.dispatch( object );

	},

	selectById: function ( id ) {

		var scope = this;

		this.scene.traverse( function ( child ) {

			if ( child.id === id ) {

				scope.select( child );

			}

		} );

	},

	selectByUuid: function ( uuid ) {

		var scope = this;

		this.scene.traverse( function ( child ) {

			if ( child.uuid === uuid ) {

				scope.select( child );

			}

		} );

	},

	deselect: function () {

		this.select( null );

	},

	// utils

	getObjectType: function ( object ) {

		var types = {

			'Scene': THREE.Scene,
			'PerspectiveCamera': THREE.PerspectiveCamera,
			'AmbientLight': THREE.AmbientLight,
			'DirectionalLight': THREE.DirectionalLight,
			'HemisphereLight': THREE.HemisphereLight,
			'PointLight': THREE.PointLight,
			'SpotLight': THREE.SpotLight,
			'Mesh': THREE.Mesh,
			'Sprite': THREE.Sprite,
			'Object3D': THREE.Object3D

		};

		for ( var type in types ) {

			if ( object instanceof types[ type ] ) return type;

		}

	},

	getGeometryType: function ( geometry ) {

		var types = {

			'BoxGeometry': THREE.BoxGeometry,
			'CircleGeometry': THREE.CircleGeometry,
			'CylinderGeometry': THREE.CylinderGeometry,
			'ExtrudeGeometry': THREE.ExtrudeGeometry,
			'IcosahedronGeometry': THREE.IcosahedronGeometry,
			'LatheGeometry': THREE.LatheGeometry,
			'OctahedronGeometry': THREE.OctahedronGeometry,
			'ParametricGeometry': THREE.ParametricGeometry,
			'PlaneGeometry': THREE.PlaneGeometry,
			'PolyhedronGeometry': THREE.PolyhedronGeometry,
			'ShapeGeometry': THREE.ShapeGeometry,
			'SphereGeometry': THREE.SphereGeometry,
			'TetrahedronGeometry': THREE.TetrahedronGeometry,
			'TextGeometry': THREE.TextGeometry,
			'TorusGeometry': THREE.TorusGeometry,
			'TorusKnotGeometry': THREE.TorusKnotGeometry,
			'TubeGeometry': THREE.TubeGeometry,
			'Geometry': THREE.Geometry,
			'Geometry2': THREE.Geometry2,
			'BufferGeometry': THREE.BufferGeometry

		};

		for ( var type in types ) {

			if ( geometry instanceof types[ type ] ) return type;

		}

	},

	getMaterialType: function ( material ) {

		var types = {

			'LineBasicMaterial': THREE.LineBasicMaterial,
			'LineDashedMaterial': THREE.LineDashedMaterial,
			'MeshBasicMaterial': THREE.MeshBasicMaterial,
			'MeshDepthMaterial': THREE.MeshDepthMaterial,
			'MeshFaceMaterial': THREE.MeshFaceMaterial,
			'MeshLambertMaterial': THREE.MeshLambertMaterial,
			'MeshNormalMaterial': THREE.MeshNormalMaterial,
			'MeshPhongMaterial': THREE.MeshPhongMaterial,
			'ParticleSystemMaterial': THREE.ParticleSystemMaterial,
			'ShaderMaterial': THREE.ShaderMaterial,
			'SpriteCanvasMaterial': THREE.SpriteCanvasMaterial,
			'SpriteMaterial': THREE.SpriteMaterial,
			'Material': THREE.Material

		};

		for ( var type in types ) {

			if ( material instanceof types[ type ] ) return type;

		}

	}

}
