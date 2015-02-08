var book = { };

// add memoization because these calls are expensive
// add option to destroy transactions, even though that call is expensive

function start () { // {{{
	book.records = { };
	book.add = function (xact) {
		// No checking here.
		//
		book.records[xact.serial] = xact;
	}
	book.get = function (serial) {
		// XXX: hm, how to fail gracefully
		//
		return book.records[serial]
	}
} // }}}

function xact (serial) { // {{{
	if (!exports.is_unique(serial)) {
		return logwrap.error( 'Supplied serial, '.concat( serial, ' fails the uniqueness test.' ) );
	}
	else {
		return new body( serial );
	}
} // }}}

function add_xact (xact) { // {{{
	var x = book.get( xact.serial );

	if (x == undefined) {
		return logwrap.error( 'Requested new transaction ID '.concat( xact.serial, ' but this is already-existing transaction.' ) );
	}
	if (x.state === 'closed') {
		return logwrap.error( 'Requested new transaction ID ' + xact.serial + ' but this transaction happened in the past and is now closed.' );
	}

	xact.opened = moment().format();
	xact.state  = 'opened';
	this.book.add( xact );
	return xact;
} // }}}

function end_xact (serial) { // {{{
	if (this.book.has_xid( serial )) {
		if (transactions[serial].state === 'closed') {
			return logwrap.error( 'Attempted to close transaction ID ' + serial + ' but this transaction happened in the past and is already closed.' );
		}
		else if (this.book.get_xact(serial).state != 'open') {
			return logwrap.error( 'Request to close transaction ID ' + serial + ' but this transaction is in an unknown state.' );
		}
	}
	else if (! this.book.has_xid( serial )) {
		return logwrap.error( 'Attempted to close transaction ID ' + serial + ' but this does not look like an open transaction ID.' );
	}
	else {
		return logwrap.error( 'Well, this is peculiar.' );
	}
	var x = book.get(serial);
	x.state = 'closed';
	x.closed = moment().format();

	return x;
} // }}}

function nonce () { return require('crypto').randomBytes(Math.ceil(32)).toString('hex') }

module.exports = {
	// methods
	//
	end_xact: end_xact,
	add_xact: add_xact,
	xact:     xact,
	nonce:    nonce,
	start:    start,

	// objects
	//
	book:     book

};

// NOTHING BELOW THIS LINE EXPORTED
//

function is_unique (serial) {
	// Until deep-grep has unique()
	//
	return true;
}

// The transaction body
//
function body (s) {
	return {
		'serial' : (s != undefined) ? s : nonce(),
		'state'  : 'open',
		'opened' : '',
		'closed' : ''
	};
}

var log4js = require( 'log4js' );

var config = {
	"appenders": [
		{
			"type": "console",
			"layout": {
				"type": "pattern",
				'pattern': '%d{ABSOLUTE} [%[%5.5p%]] [%12c] - %m',
				"tokens": {
					"pid" : function() { return process.pid; }
				}
			}
		}
	]
};

log4js.configure( config, {} );

var logger = log4js.getLogger( 'xit' )
	, logwrap = {
		debug : function (s) { if (process.env.DEBUG != undefined) { logger.debug(s) } },
		info  : function (s) { if (process.env.DEBUG != undefined) { logger.info(s) } },
		warn  : function (s) { if (process.env.DEBUG != undefined) { logger.warn(s) } },
		error : function (s) { if (process.env.DEBUG != undefined) { logger.error(s); return new Error(s) } },
	};

// jane@cpan.org // vim:tw=79:ts=2:noet
