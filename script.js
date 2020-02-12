//Dwarf >= 2.0.0 required!
addNativeHook(findExport('send'), function (args) {
    var what = Memory.readByteArray(args[1], parseInt(args[2]));
    // send data to ui (data panel)
    showData('hex', 'send', what);
});

addNativeHook(findExport('SSL_write', 'libssl.so'), function (args) {
    var what = Memory.readByteArray(args[1], parseInt(args[2]));
    // send data to ui (data panel)
    showData('hex', 'SSL_write', what);
});

addNativeHook(findExport('recv'), {
    onEnter: function (args) {
        this.buf = args[1];
    },
    onLeave: function (ret) {
        var what = Memory.readByteArray(this.buf, parseInt(ret));
        // send data to ui (data panel)
        showData('hex', 'recv', what);
    }
});

addNativeHook(findExport('SSL_read', 'libssl.so'), {
    onEnter: function (args) {
        this.buf = args[1];
    },
    onLeave: function (ret) {
        var what = Memory.readByteArray(this.buf, parseInt(ret));
        // send data to ui (data panel)
        showData('hex', 'SSL_read', what);
    }
});

var mediaType;
var bodyContent;

addJavaHook('okhttp3.RequestBody', 'create', function (args) {
    mediaType = args[0];
    bodyContent = args[1];
});

addJavaHook('okhttp3.Request$Builder', 'build', {
    onLeave: function (result) {
        var dataToShow = result + '\n\n' + '-=url=-\n' + result.url() + '\n\n' + '-=headers=-\n' + result.headers();
        if (isDefined(result.body())) {
            dataToShow += '\n\n' + '-=body=-\n' + mediaType + '\n' + String.$new(bodyContent);
        }
        showData('text', 'okhtt3.Request', dataToShow);
    }
});

addJavaHook('okhttp3.Response$Builder', 'build', {
    onLeave: function (result) {
        var u;
        try {
            var source = result.peekBody(result.body().contentLength());
            var buffer = Java.array('byte', source.bytes());
            u = new Uint8Array(buffer);
        } catch (e) {
            return;
        }

        var s = result + '\n\n' +
            '-=headers=-\n' + result.headers() + '\n\n' +
            '-=buffer=-\n' + hexdump(u.buffer);
        showData('text', 'okhttp3.Response', s);
    }
});
