api.hookNative(api.findExport('send'), function(args) {
    var what = Memory.readByteArray(args[1], parseInt(args[2]));
    api.setData(Date.now() + ' send', what);
    return -1;
});

api.hookNative(api.findExport('SSL_write', 'libssl.so'), function(args) {
    var what = Memory.readByteArray(args[1], parseInt(args[2]));
    api.setData(Date.now() + ' SSL_write', what);
    return -1;
});