xact-id-tiny
====

Keeping state sucks. Nobody wants to do it.

If you find yourself in a situation where you are tracking transaction IDs
(because, say, you have an asynchronous network app and you want to know how
many are outstanding at any given time) you may feel like the code required to
track your transactions is too large and pollutes and otherwise small codebase
that just does whatever it's supposed to do.

So let something else do the lifting for tracking transaction IDs and
generating unique values for those transactions. That's what this package is
for.

quickly
===

I know you're busy. Here's the real simple use pattern:

```
var xit  = require( 'xact-id-tiny' )
  , xact = xit.add_xact( );

database.do_a_thing( args, function (e, rvalue) {
  if (e) { return new Error( 'gasp! database breakage!' ) }
  else   { xit.end_xact( xact ); return rvalue;           }
} );
```

Easy, right? The rest of the API is defined below.

api
===

```
var n = xit.nonce()
```

Returns a guaranteed-to-be-unique string. Note that this string is not
actually stored in the register of open transactions. If you would like
`xact-id-tiny` to use your fancy unique ID generator, just overwrite the
`nonce()` function with your own.

```
var t = new xit.xact()
var t = new xit.xact(serial)
```

Returns a `transaction` object suitable for use with `add_xact()` and
`end_xact()`. If you wish to use your own serial (because you have a means of
providing your own or whatever), pass it in as an optional argument. The
`transaction` object is very simple:

```
{
  'serial'  : nonce,
  'state'   : scalar, // 'open' or 'closed'
  'opened'  : scalar, // the return from moment().format()
  'closed'  : scalar, // the return from moment().format()
}
```

You may pass in any object that contains these four keys and use it to keep
state through transactions.

```
var xact = xit.add_xact( transaction );
var xact = xit.add_xact( );
```

Attempts to "open" a new transaction, Returns the transaction object stored in the
transaction register. Any failures will result in an `Error` being returned with
a hopefully-useful string.

When called without arguments, it will create the transaction object for you,
using the internal `nonce()` function.

```
var xact = xit.end_xact( transaction );
var xact = xit.end_xact( serial );
```

Attempts to "close" the transaction specified. Returns an `Error` with a
hopefully-useful string in the event something goes wrong.
