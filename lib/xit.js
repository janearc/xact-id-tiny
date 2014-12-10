exports.is_unique = function (serial) {
	// Until deep-grep has unique()
	//
	return true;
}

exports.xact = function (serial) { // {{{
	if (serial) {
		if (exports.is_unique(serial)) {
			return {
				'serial' : serial,
				'state'  : 'open',
				'opened' : '',
				'closed' : ''
			};
		}
		else {
			return new Error( 'Supplied serial, ' + serial + ' fails the uniqueness test.' );
		}
	}
	else {
		return {
			'serial' : exports.nonce(),
			'state'  : 'open',
			'opened' : '',
			'closed' : ''
		};
	}
} // }}}

exports.nonce = function () { return require('crypto').randomBytes(Math.ceil(32)).toString('hex') }

exports.add_xact = function (transaction) { // {{{
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

exports.end_xact = function (serial) { // {{{
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
