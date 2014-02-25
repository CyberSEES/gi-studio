/**
 * @author Clinton Freeman <freeman@cs.unc.edu>
 * @author Steven Love <slove13@cs.unc.edu>
 */

Sidebar.Vegetation = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();

    var veginfoPanel = new UI.Panel();
    var veglist = new UI.FancySelect().setId( 'veglist' ).onChange( function () {

        var vegAddButton = new UI.Button( 'Add' ).onClick( function() {

            var callback = function( obj3d ) {

                var tree = obj3d.scene.children[0];
                tree.name = "tree";
                tree.position.set(50,-100,250);
                tree.castShadow = true;
                tree.receiveShadow = true;
                tree.material = new THREE.MeshBasicMaterial( {
                    map: THREE.ImageUtils.loadTexture( 'media/river_birch.png' ),
                    transparent: true
                } );

                editor.addObject(tree);
                editor.select(tree);
            }
    
            var mloader = new THREE.ColladaLoader();
            mloader.load( 'media/river_birch.DAE', callback ); // FIXME


        } );

        veginfoPanel.clear();
        veginfoPanel.add( new UI.Text( veglist.options[veglist.getValue()].innerHTML ) );
        veginfoPanel.add( new UI.Break() );
        veginfoPanel.add( vegAddButton );

    } );

    signals.locationChanged.add( function( data ) {

        //veglist.setOptions( data );
        var options = [];
        var pan1 = new UI.Panel();
        pan1.add( new UI.Text( 'herp' ) );
        options.push( '<img src="http://www.charleycarlat.com/PlantModels/images/River%20Birch%20Tree.jpg" />' );
        veglist.setOptions( options );

    } );

    container.add( new UI.Text( 'NATIVE VEGETATION' ) );
    container.add( new UI.Break(), new UI.Break() );
    container.add( veglist );
    container.add( new UI.Break(), new UI.Break() );
    container.add( veginfoPanel );

	return container;
}
