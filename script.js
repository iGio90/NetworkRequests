// api.hookNative is a shortcut of Interceptor attach
// api.findExport is a shortcut of Module.findExportByName
api.hookNative(api.findExport('send'), function(args) {
    var what = Memory.readByteArray(args[1], parseInt(args[2]));
    // send data to ui (data panel)
    api.setData(Date.now() + ' send', what);
    // return -1 to prevent thread break
    return -1;
});

api.hookNative(api.findExport('SSL_write', 'libssl.so'), function(args) {
    var what = Memory.readByteArray(args[1], parseInt(args[2]));
    // send data to ui (data panel)
    api.setData(Date.now() + ' SSL_write', what);
    // return -1 to prevent thread break
    return -1;
});

rcv_buf = null;
api.hookNative(api.findExport('recv'), {
    onEnter: function (args) {
        rcv_buf = args[1];
        // return -1 to prevent thread break
        return -1;
    },
    onLeave: function (ret) {
        var what = Memory.readByteArray(rcv_buf, parseInt(ret));
        // send data to ui (data panel)
        api.setData(Date.now() + ' recv', what);
    }

});

ssl_rcv_buf = null;
api.hookNative(api.findExport('SSL_read'), {
    onEnter: function (args) {
        ssl_rcv_buf = args[1];
        return -1;
    },
    onLeave: function (ret) {
        var what = Memory.readByteArray(ssl_rcv_buf, parseInt(ret));
        // send data to ui (data panel)
        api.setData(Date.now() + ' SSL_read', what);
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