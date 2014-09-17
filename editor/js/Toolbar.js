var Toolbar = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();

	var location = new UI.Panel().setId( 'location' ).setClass( 'locdiv' );
	var locationInput = new UI.Input().setWidth( '248px' ).setColor( '#444' );
	var autocomplete = new google.maps.places.Autocomplete( locationInput.dom );
	var goButton = new UI.Button( 'Go' ).onClick( function() {
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': locationInput.getValue() }, function( results, status ) {
            if (status == google.maps.GeocoderStatus.OK) {
                var coords = {
            		lat: results[0].geometry.location.lat(),
            		lng: results[0].geometry.location.lng()
            	};

            	editor.setLocation( coords );

            } else {
            	console.log( "Geocoding error. Status: " + status );
            }
        } );
	} );

	location.add( locationInput );
	location.add( goButton );
	container.add( location );

	var buttons = new UI.Panel();
	container.add( buttons );

	// translate / rotate / scale

	var translate = new UI.Button( 'translate' ).onClick( function () {

		signals.transformModeChanged.dispatch( 'translate' );

	} );
	buttons.add( translate );

	var rotate = new UI.Button( 'rotate' ).onClick( function () {

		signals.transformModeChanged.dispatch( 'rotate' );

	} );
	buttons.add( rotate );

	var scale = new UI.Button( 'scale' ).onClick( function () {

		signals.transformModeChanged.dispatch( 'scale' );

	} );
	buttons.add( scale );


	var sendToNotebook = new UI.Button( 'Send to GI Notebook' ).onClick( function() {
    // window.alert("Send to GI Notebook Pressed");
	
	dispLngLat(); //convert the x,y,z coordinates to longitutd and latitude. Then, give an alert
		
    var index = 0;
    var length = editor.scene.children.length;
    for(index = 0; index < length; index++) 
    {
      var THREE_object = editor.scene.children[index];
      console.log(THREE_object);
      if (THREE_object.name === "River Birch")
      {
        window.alert("PlantID = 0 (River Birch)\n UniqueID = " + THREE_object.uuid + "\n coordinates <x,y,z> = <" + THREE_object.position.x + ", " + THREE_object.position.y + ", " + THREE_object.position.z + ">");
      }
      else if (THREE_object.name === "Gray Oak")
      {
        window.alert("PlantID = 1 (Gray Oak)\n UniqueID = " + THREE_object.uuid + "\n coordinates <x,y,z> = <" + THREE_object.position.x + ", " + THREE_object.position.y + ", " + THREE_object.position.z + ">");
      }
      else if (THREE_object.name === "Tussock Sedge")
      {
        window.alert("PlantID = 2 (Tussock Sedge)\n UniqueID = " + THREE_object.uuid + "\n coordinates <x,y,z> = <" + THREE_object.position.x + ", " + THREE_object.position.y + ", " + THREE_object.position.z + ">");
      }
    } 
	} );
	buttons.add( sendToNotebook );


	// grid
	var grid = new UI.Number( 25 ).onChange( update );
	grid.dom.style.width = '42px';
	//buttons.add( new UI.Text( 'Grid: ' ) );
	//buttons.add( grid );

	var snap = new UI.Checkbox( false ).onChange( update );
	//buttons.add( snap );
	//buttons.add( new UI.Text( 'snap' ) );

	var local = new UI.Checkbox( false ).onChange( update );
	//buttons.add( local );
	//buttons.add( new UI.Text( 'local' ) );


	container.init = function( addr ) {
		locationInput.setValue( addr );
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': locationInput.getValue() }, function( results, status ) {
            if (status == google.maps.GeocoderStatus.OK) {
                var coords = {
            		lat: results[0].geometry.location.lat(),
            		lng: results[0].geometry.location.lng()
            	};

            	// hack for demo...
            	coords.lat = 39.29533;
            	coords.lng = -76.74360;

            	editor.setLocation( coords );

            } else {
            	console.log( "Geocoding error. Status: " + status );
            }
        } );
	}

	function update() {

		signals.snapChanged.dispatch( snap.getValue() === true ? grid.getValue() : null );
		signals.spaceChanged.dispatch( local.getValue() === true ? "local" : "world" );

	}
	
	function dispLngLat()
	{
		var object = editor.selected;
		
		if( object == undefined)
		{
			
			alert("please select an object first!");
			
		}
		
		else
		{
			var xyzCoord = new THREE.Vector3 (object.position.x,  object.position.z ,object.position.y);
			var camLatLng = new google.maps.LatLng (39.2952463 , -76.743785);

			alert("the latitude and longitude is: " + threeToLatlng(xyzCoord , camLatLng));
			
		}
	}
	
	update();

	return container;

}
