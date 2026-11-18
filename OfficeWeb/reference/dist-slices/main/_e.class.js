class _e {
    constructor() {
        yr(this, "_locking"), yr(this, "_locks"), this._locking = Promise.resolve(), this._locks = 0
    }
    isLocked() {
        return this._locks > 0
    }
    lock() {
        this._locks += 1;
        let e;
        const t = new Promise(s => e = () => {
                this._locks -= 1, s()
            }),
            n = this._locking.then(() => e);
        return this._locking = this._locking.then(() => t), n
    }
}

