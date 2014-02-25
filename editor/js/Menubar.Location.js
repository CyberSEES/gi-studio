Menubar.Location = function ( editor ) {

	var container = new UI.Panel().setId( 'location' );
	var locationInput = new UI.Input().setWidth( '248px' ).setColor( '#444' );
	var autocomplete = new google.maps.places.Autocomplete( locationInput.dom );
	var goButton = new UI.Button( 'Go' ).onClick( function() {
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': locationInput.getValue() }, function( results, status ) {
            if (status == google.maps.GeocoderStatus.OK) {
            	console.log(results[0].geometry.location.lat());
                var coords = {
            		lat: results[0].geometry.location.lat(),
            		lng: results[0].geometry.location.lng()
            	};
            	console.log( coords );

            	$.ajax( {
            		url: 'http://geoservice-freemancw.rhcloud.com/speciesforlatlng',   
                	data: $.param( coords ),
                	dataType: 'json',
                	success: function( data ) {
                    	console.log( 'success' );
                        //veglist.setOptions( data );
                	},
                	error: function( jqXHR, textStatus, errorThrown ) {
                		console.log( textStatus );
                		console.log( errorThrown );
                	}
	            } );

            } else {
            	console.log( "Geocoding error. Status: " + status );
            }
        } );
	} );

	container.add( locationInput );
	container.add( goButton );

	return container;

}
