function dd(s, e, t) {
    return new Promise(function(n, i) {
        function r() {
            switch (s.clientWaitSync(e, s.SYNC_FLUSH_COMMANDS_BIT, 0)) {
                case s.WAIT_FAILED:
                    i();
                    break;
                case s.TIMEOUT_EXPIRED:
                    setTimeout(r, t);
                    break;
                default:
                    n()
            }
        }
        setTimeout(r, t)
    })
}
