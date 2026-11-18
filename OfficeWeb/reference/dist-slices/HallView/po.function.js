function po(r) {
    if (r.altKey || r.metaKey || r.shiftKey || r.isComposing) return null;
    const e = r.ctrlKey;
    switch (r.code) {
        case "Numpad7":
            return {
                yaw: 0, pitch: e ? -Math.PI / 2 : Math.PI / 2, label: e ? "底视图" : "顶视图"
            };
        case "Numpad1":
            return {
                yaw: e ? Math.PI : 0, pitch: 0, label: e ? "后视图" : "前视图"
            };
        case "Numpad3":
            return {
                yaw: e ? -Math.PI / 2 : Math.PI / 2, pitch: 0, label: e ? "左视图" : "右视图"
            };
        default:
            return null
    }
}

