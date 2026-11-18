class Am {
    constructor() {
        this.pendingTasks = new Map, this.taskMutex = new _e, this.nextTaskIndex = 0
    }
    run(e) {
        return b(this, void 0, void 0, function*() {
            const t = {
                id: this.nextTaskIndex++,
                enqueuedAt: Date.now(),
                status: ui.WAITING
            };
            this.pendingTasks.set(t.id, t);
            const n = yield this.taskMutex.lock();
            try {
                return t.executedAt = Date.now(), t.status = ui.RUNNING, yield e()
            } finally {
                t.status = ui.COMPLETED, this.pendingTasks.delete(t.id), n()
            }
        })
    }
    flush() {
        return b(this, void 0, void 0, function*() {
            return this.run(() => b(this, void 0, void 0, function*() {}))
        })
    }
    snapshot() {
        return Array.from(this.pendingTasks.values())
    }
}
