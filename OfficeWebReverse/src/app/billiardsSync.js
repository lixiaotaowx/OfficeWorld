// billiards table sync store.
// Recovered verbatim from the production bundle; bindings renamed to semantic names.
function createBilliardsSync(n) {
  const e = new Map(),
    t = new Set();
  return {
    snapshot: s => e.get(s) || null,
    states: () => e,
    subscribe: s => (t.add(s), () => {
      t.delete(s);
    }),
    receive: s => {
      "removed" in s ? e.delete(s.tableId) : e.set(s.tableId, s), t.forEach(r => r());
    },
    async act(s, r) {
      const i = n.current;
      if (!(i != null && i.connected)) throw Error("连接已断开，请等重新连接后再试");
      let o;
      try {
        o = await i.timeout(6e3).emitWithAck("billiards-action", {
          ...r,
          tableId: s
        });
      } catch {
        throw i.emit("billiards-sync"), Error("操作没有确认，请等待球桌同步后再试");
      }
      if (!(o != null && o.ok)) throw Error((o == null ? void 0 : o.error) || "操作没有完成，请重试");
    }
  };
}

export { createBilliardsSync };
