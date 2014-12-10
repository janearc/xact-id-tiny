function nonce () { return require('crypto').randomBytes(Math.ceil(32)).toString('hex') }

function xact (serial) { // {{{
	return {
		'serial' : serial,
		'state'  : 'open',
		'opened' : '',
		'closed' : ''
	};
} // }}}

function add_xact (transaction) { // {{{
	if (transactions[transaction.serial]) {
		return new Error( 'Requested new transaction ID ' + serial + ' but this is already-existing transaction.' );
	}
	if (transactions[transaction.serial].state === 'closed') {
		return new Error( 'Requested new transaction ID ' + serial + ' but this transaction happened in the past and is now closed.' );
	}

	transactions[transaction.serial] = transaction;
	transactions[transaction.serial].opened = moment().format();
	return transaction.serial;
} // }}}

function end_xact (serial) { // {{{
	if (transactions[serial] ) {
		if (transactions[serial].state === 'closed') {
			return new Error( 'Attempted to close transaction ID ' + serial + ' but this transaction happened in the past and is already closed.' );
		}
		else if (transactions[serial].state != 'open') {
			return new Error( 'Request to close transaction ID ' + serial + ' but this transaction is in an unknown state.' );
		}
	}
	else if (! transactions[serial]) {
		return new Error( 'Attempted to close transaction ID ' + serial + ' but this does not look like an open transaction ID.' );
	}
	else {
		return new Error( 'Well, this is peculiar.' );
	}
	transactions[serial].state  = 'closed';
	transactions[serial].closed = moment().format();
	return transactions[serial];
} // }}}
