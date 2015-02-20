var assert = require( 'assert' )
	, xit    = require( '../lib/xit' );

xit.start();

var xact = new xit.xact();
xit.add( xact );
xit.end( xact );

it( 'retrieve xact', function () {
	xit.get( xact );
} )
