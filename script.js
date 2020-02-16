//Dwarf >= 2.0.0 required!
addNativeHook(findExport('send'), function (args) {
    //ssize_t send(int sockfd, const void *buf, size_t len, int flags);
    var buf = args[1];
    var len = parseInt(args[2]);
    if(len > 0) {
        var what = buf.readByteArray(len);
        // show the data in ui
        showData('hex', 'send', what);
    }
});

addNativeHook(findExport('recv'), {
    //ssize_t recv(int sockfd, void *buf, size_t len, int flags);
    onEnter: function (args) {
        this.buf = args[1];
    },
    onLeave: function (ret) {
        ret |= 0;
        if(ret > 0) {
            var what = this.buf.readByteArray(parseInt(ret));
            // show the data in ui
            showData('hex', 'recv', what);
        }
    }
});

addNativeHook(findExport('SSL_write', 'libssl.so'), function (args) {
    //int SSL_write(SSL *ssl, const void *buf, int num);
    var num = args[2];
    if(num > 0) {
        var buf = args[1].readByteArray(parseInt(args[2]));
        // show the data in ui
        showData('hex', 'SSL_write', buf);
    }
});

addNativeHook(findExport('SSL_read', 'libssl.so'), {
    //int SSL_read(SSL *ssl, void *buf, int num);
    onEnter: function (args) {
        this.buf = args[1];
    },
    onLeave: function (ret) {
        ret |= 0;
        if(ret > 0) { // The read operation was successful.
            var what = this.buf.readByteArray(parseInt(ret));
            // send data to ui (data panel)
            showData('hex', 'SSL_read', what);
        }
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
            showData('text', 'okhttp3.Response', dataToShow);
        }
    }
});
