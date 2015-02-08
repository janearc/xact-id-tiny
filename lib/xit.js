var book = function () { return require( 'singleton' ).get() };

exports.book = book;

// add memoization because these calls are expensive
// add option to destroy transactions, even though that call is expensive

exports.start = function () {
	var b = exports.book();
	b.records = { };
	b.add     = function (xact) {
		// No checking here.
		//
		console.log( 'we added something' );
		exports.records[xact.serial] = xact;
	}
	b.get = function (serial) {
		// hm, how to fail gracefully
		//
		return this.records[serial]
	}
}

exports.is_unique = function (serial) {
	// Until deep-grep has unique()
	//
	return true;
}

function body (s) {
	return {
		'serial' : (s != undefined) ? s : exports.nonce(),
		'state'  : 'open',
		'opened' : '',
		'closed' : ''
	};
}

exports.xact = function (serial) { // {{{
	if (!exports.is_unique(serial)) {
		return new Error( 'Supplied serial, ' + serial + ' fails the uniqueness test.' );
	}
	else {
		return new body ( serial );
	}
} // }}}

exports.nonce = function () { return require('crypto').randomBytes(Math.ceil(32)).toString('hex') }

exports.add_xact = function (xact) { // {{{
	var x = book().get( xact.serial );

	if (x == undefined) {
		return new Error( 'Requested new transaction ID ' + xact.serial + ' but this is already-existing transaction.' );
	}
	if (x.state === 'closed') {
		return new Error( 'Requested new transaction ID ' + xact.serial + ' but this transaction happened in the past and is now closed.' );
	}

	xact.opened = moment().format();
	xact.state  = 'opened';
	this.book.add( xact );
	return xact;
} // }}}

exports.end_xact = function (serial) { // {{{
	if (this.book.has_xid( serial )) {
		if (transactions[serial].state === 'closed') {
			return new Error( 'Attempted to close transaction ID ' + serial + ' but this transaction happened in the past and is already closed.' );
		}
		else if (this.book.get_xact(serial).state != 'open') {
			return new Error( 'Request to close transaction ID ' + serial + ' but this transaction is in an unknown state.' );
		}
	}
	else if (! this.book.has_xid( serial )) {
		return new Error( 'Attempted to close transaction ID ' + serial + ' but this does not look like an open transaction ID.' );
	}
	else {
		return new Error( 'Well, this is peculiar.' );
	}
	var x = book.get(serial);
	x.state = 'closed';
	x.closed = moment().format();

	return x;
} // }}}

exports.get_xact = function (xact) { // {{{
	return book().get( ((typeof xact) == 'string') ? xact : xact.serial );
} // }}}
