//Dwarf >= 2.0.0 required!
addNativeHook(findExport('send'), function (args) {
    var what = args[1].readByteArray(parseInt(args[2]));
    // send data to ui (data panel)
    showData('hex', 'send', what);
});

addNativeHook(findExport('recv'), {
    onEnter: function (args) {
        this.buf = args[1];
    },
    onLeave: function (ret) {
        var what = this.buf.readByteArray(parseInt(ret));
        // send data to ui (data panel)
        showData('hex', 'recv', what);
    }
});

addNativeHook(findExport('SSL_write', 'libssl.so'), function (args) {
    var what = args[1].readByteArray(parseInt(args[2]));
    // send data to ui (data panel)
    showData('hex', 'SSL_write', what);
});

addNativeHook(findExport('SSL_read', 'libssl.so'), {
    onEnter: function (args) {
        this.buf = args[1];
    },
    onLeave: function (ret) {
        var what = this.buf.readByteArray(parseInt(ret));
        // send data to ui (data panel)
        showData('hex', 'SSL_read', what);
    }
});

addJavaHook('okhttp3.Response', '$init', {
    onLeave: function (result) {
        if (isDefined(this.body())) {
            var dataToShow = "*** REQUEST ***\n\n";
            var request = this.request();
            dataToShow += request.method() + ' ' + request.url();
            dataToShow += "\n\n[HEADERS]\n\n" + request.headers().toString();
            dataToShow += '----------------------------------';
            dataToShow += '\n\n*** RESPONSE ***\n';
            var body = this.peekBody(1024);
            dataToShow += "\n\[HEADERS]\n\n" + this.headers().toString();
            dataToShow += "\n\n[BODY]\n\n" + body.string();
            // send data to ui (data panel)
            showData('text', 'okhttp3.Response', dataToShow);
        }
    }
});
