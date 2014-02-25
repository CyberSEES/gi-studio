/**
 * @author Steven Love <slove13@cs.unc.edu>
 */

function createGround() {

    var ground = new THREE.Mesh(
        new THREE.PlaneGeometry( 2048, 2048 ),
        new THREE.MeshLambertMaterial( {
            emissive: 'white', 
            transparent: true, 
            opacity: 0.5
        } )
    );
    //ground.overdraw = true;
    ground.receiveShadow = true;
    ground.rotation.set( 1.5 * Math.PI, 0, 0 );
    ground.position.set( 0, -64, 0 );
    ground.name = 'ground';
    editor.addObject( ground );

}     

/** 
 * notes on problems with spotlight in the editor: 
 * instantiating a spotlight creates an Object3d that is the target. that 
 * target's parent is the scene, but we can make it a child of the spotlight 
 * when saved to json, the spotlight
 *
 * if shadowcameravisible = true, instantiating a spotlight creates a
 * PerspectiveCamera that is the shadow frustum.  this stops being linked
 * to the location of the light and its target after refresh
 * instantiating a spotlight creates a perspectiveCamera that has a
 * rotation decided by the position of the light and its target. upon
 * refreshing, the perspective camera can rotate on its own and looks
 * like a shadow frustum, but won't generate shadows.  
 */ 
function createLightAtPos( x, y, z ) {

    // some problem with directional light creating empty objects visible in 
    // the editor list of objects...
    var dlight = new THREE.DirectionalLight( 0xffffff );
    dlight.position.set( x, y, z );        
    
    
    dlight.castShadow = true;
    dlight.shadowDarkness = 0.5;
    dlight.shadowCameraVisible = true;
    
    dlight.target.name = "lightTarget";
    dlight.target.position.set( 0, 0, 0 );

    dlight.name = "light";
    dlight.intensity = 1;
    editor.addObject( dlight );

}

function loadTreeAtPos( x, y, z ) {
    
    var callback = function( obj3d ) {

        console.log( obj3d );

        var tree = obj3d.scene.children[0];
        //tree.name = "tree";
        tree.position.set( x, y, z );
        tree.scale.set( 1.5, 1.5, 1.5 );
        tree.castShadow = true;
        tree.receiveShadow = true;
        tree.material = new THREE.MeshLambertMaterial( {
            map: THREE.ImageUtils.loadTexture( 'media/river_birch.png' ),
            transparent: true,
            side: THREE.DoubleSide
        } );

        editor.addObject( tree );
        editor.select( tree );

    }
    
    var mloader = new THREE.ColladaLoader();
    mloader.load( 'media/river_birch.DAE', callback ); // FIXME
}

function loadPanorama() {

    var mesh = new THREE.Mesh(
        new THREE.SphereGeometry( 512, 32, 32 ), 
        new THREE.MeshBasicMaterial( {
            map: new THREE.Texture()
        } )
    );
    var loader = new GSVPANO.PanoLoader();

    // create the spherical background mesh before we attach the panorama to it 
    mesh.position.set( 0, 0, 0 );
    mesh.name = "panorama";
    editor.sceneBackground.add( mesh );

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
        mesh.material.map = new THREE.Texture( this.canvas ); 
        mesh.material.side = THREE.DoubleSide;
        mesh.material.map.needsUpdate = true;
        onWindowResize();

    };
    
    // 1 is very fuzzy, 2 is fuzzy, 3 is the highest resolution available.  
    // 4 errors occur, possibly because 4 panels don't have resolution 3 available
    loader.setZoom( 3 );
    loader.load( new google.maps.LatLng( 39.29533, -76.74360 ) );

}

function setFloorHeight( floorh ) {
    
    var cam = {
        position: [ 0, floorh, 0 ],
        target: [ 1, floorh, 0 ]
    };
    editor.config.setKey( "camera", cam ); 
    editor.config.setKey( "floorh", floorh );

}

function logThings() {

    editor.scene.traverse( function( child ) {
        if ( child.parent != undefined ) {
            console.log( child.name+ "\'s parent is " + child.parent.name );
        }
    } );

}

function raiseThings( amt ) {

    editor.scene.traverse( function( child ) {
        if ( child.parent != undefined &&   //don't raise the scene
             child.name != "ground" ) {     //don't raise the ground
            child.translateY(amt);
        }
    } );

}

/*
function createTreeAtPos( x, y, z ) {

    var callback = function( geometry, materials ) {

        
        var default_mat = new THREE.MeshLambertMaterial( { color: 0x223311 } );        
        var tree = new THREE.Mesh( geometry, default_mat );
        var scale = 64;
        tree.castShadow = true;
        tree.receiveShadow = true;
        tree.position.set( x, y, z );
        tree.scale.set( scale, scale, scale );
                 
        // obj3d.castShadow = true;
        // obj3d.receiveShadow = true;
        // obj3d.name = "ModelContainer"
        tree.name = "TreeModel";
        editor.addObject( tree );
               
    }
    
    var mloader = new THREE.JSONLoader();
    mloader.load("../../streetview-studio/models/tree.js", callback); // FIXME
    
}
*/
