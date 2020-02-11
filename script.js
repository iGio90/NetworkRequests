//Dwarf >= 2.0.0 required
addNativeHook(findExport('send'), function(args) {
    var what = Memory.readByteArray(args[1], parseInt(args[2]));
    // send data to ui (data panel)
    showData('hex', 'send', what);
});

addNativeHook(findExport('SSL_write', 'libssl.so'), function(args) {
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

// api.hookJava is a global shortcut to hook both java methods and class constructor
if (Java.available) {
    Java.perform(function () {
        var String = Java.use('java.lang.String');

        var mediaType;
        var bodyContent;
        api.hookJava('okhttp3.RequestBody.create', function (args) {
            mediaType = args[0];
            bodyContent = args[1];
        });

        api.hookJava('okhttp3.Request$Builder.build', function () {
            var a = this.build();
            var s = a + '\n\n' +
                '-=url=-\n' + a.url() + '\n\n' +
                '-=headers=-\n' + a.headers();
            if (a.body() !== null) {
                s += '\n\n' + '-=body=-\n' + mediaType + '\n' + String.$new(bodyContent)
            }
            api.setData(Date.now() + ' okhttp3.Request', s);
            return a;
        });

        api.hookJava('okhttp3.Response$Builder.build', function () {
            var a = this.build();
            var u;
            try {
                var source = a.peekBody(a.body().contentLength());
                var buffer = Java.array('byte', source.bytes());
                u = new Uint8Array(buffer);
            } catch (e) {
                return a;
            }

            var s = a + '\n\n' +
                '-=headers=-\n' + a.headers() + '\n\n' +
                '-=buffer=-\n' + hexdump(u.buffer);
            api.setData(Date.now() + ' okhttp3.Response', s);
            return a;
        });
    });
}
