var assert = require( 'assert' )
	, xit    = require( '../lib/xit' );

xit.start();

var xact = new xit.xact();
xit.add( xact );
xit.end( xact );

it( 'retrieve xact', function () {
	assert( typeof xit.get( xact ) != 'Error' );
} )
it( 'retrieve xact-by-id', function () {
	assert( typeof xit.get( xact.serial ) != 'Error' );
} );
