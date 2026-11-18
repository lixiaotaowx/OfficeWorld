function X(n) {
    n = n || {}, this.ms = n.min || 100, this.max = n.max || 1e4, this.factor = n.factor || 2, this.jitter = n.jitter > 0 && n.jitter <= 1 ? n.jitter : 0, this.attempts = 0
}
X.prototype.duration = function() {
    var n = this.ms * Math.pow(this.factor, this.attempts++);
    if (this.jitter) {
        var e = Math.random(),
            t = Math.floor(e * this.jitter * n);
        n = Math.floor(e * 10) & 1 ? n + t : n - t
    }
    return Math.min(n, this.max) | 0
};
X.prototype.reset = function() {
    this.attempts = 0
};
X.prototype.setMin = function(n) {
    this.ms = n
};
X.prototype.setMax = function(n) {
    this.max = n
};
X.prototype.setJitter = function(n) {
    this.jitter = n
};
