class Qo {
    constructor(e, t) {
        m(this, "active", !1);
        m(this, "armed", null);
        m(this, "color", Vs[0]);
        m(this, "ghostRot", 0);
        m(this, "placementHeight", null);
        m(this, "selected", null);
        m(this, "onChange", () => {});
        m(this, "ghost", null);
        m(this, "ghostAt", null);
        m(this, "selection");
        m(this, "savingGroup", !1);
        m(this, "hover", null);
        m(this, "gz", new E0);
        m(this, "rings", new E0);
        m(this, "handles", []);
        m(this, "gzDrag", null);
        m(this, "gzHover", null);
        m(this, "modal", null);
        m(this, "undo", []);
        m(this, "redo", []);
        m(this, "queue", Promise.resolve());
        m(this, "last", null);
        m(this, "ray", new M9);
        m(this, "onAddMenu", () => {});
        this.hall = e, this.client = t, this.selection = new bo(e, s => this.draft(s)), Object.assign(this, Bo()), e.scene.add(this.gz)
    }
    start() {
        this.active || (this.active = !0, this.hall.host.classList.add("building"), this.onChange())
    }
    end() {
        this.active && (this.cancelModal(), this.arm(null), this.deselect(), this.setHover(null), this.active = !1, this.hall.host.classList.remove("building", "placing", "pointing"), this.onChange())
    }
    hint() {
        const e = this.modal;
        return this.savingGroup ? "正在保存整组选中物体…" : this.selection.multiple && !e ? `已选 ${this.selection.ids.size} 件 · Ctrl/Shift 点击增减选择 · G 整体移动 · S 等比缩放 · R/Shift R 水平转15° · 拖绿色圆环旋转 · Shift D 整组复制 · Ctrl Z 整组撤销` : e ? `${e.kind==="grab"?"移动":"尺寸增减"}${e.axis?` · 锁定 ${e.axis.toUpperCase()} 轴`:e.kind==="grab"?" · 沿地面":" · 等比"}${e.input?` · ${e.input} 米`:""} · <kbd>X</kbd><kbd>Y</kbd><kbd>Z</kbd> 锁轴 · 输数字 · <kbd>Enter</kbd>/点击 确认 · <kbd>Esc</kbd>/右键 取消` : this.armed ? `放置：${this.label(this.armed)} · ${this.placementHeight===null?"跟随表面":`高度 ${this.placementHeight} 米`} · <kbd>PageDown</kbd> 降低 / <kbd>PageUp</kbd> 升高 · <kbd>Home</kbd> 跟随表面 · 点一下放 · <kbd>Shift</kbd> 连续放 · <kbd>R</kbd> 旋转 · 右键取消` : this.selected ? "移动/缩放固定每格 0.25 米· 拖箭头移动 · 拖圆环转 · 拖方块缩放· <kbd>G</kbd> 移动 <kbd>S</kbd> 缩放 <kbd>R</kbd> 转 15° · <kbd>Shift D</kbd> 复制 · <kbd>Del</kbd> 删除" : "装修中 · Ctrl/Shift 点击多选 · 点东西选中 · 从下面的零件栏挑一件放 · <kbd>Shift A</kbd> 加零件 · <kbd>E</kbd> 吸取 · <kbd>Ctrl Z</kbd> 撤销 · <kbd>Tab</kbd> 结束"
    }
    label(e) {
        var s, i;
        const t = He(e);
        return t ? ((s = this.hall.models.get(t)) == null ? void 0 : s.name) || "导入的模型" : ((i = X0(e)) == null ? void 0 : i.label) || e
    }
    arm(e) {
        this.placementHeight = null, this.ghostAt = null, this.armed = e, this.deselect(), this.setHover(null), this.dropGhost(), e && this.makeGhost(), this.hall.host.classList.toggle("placing", !!e), this.onChange()
    }
    setColor(e) {
        if (this.onlySingle()) return;
        this.color = e, this.ghost && this.armed && this.makeGhost();
        const t = this.selected && this.hall.parts.get(this.selected);
        t && !He(t.userData.part.kind) && t.userData.part.color !== e && (Ys(t, e), this.change(this.selected, {
            ...ke(this.draft(this.selected)),
            color: e
        })), this.onChange()
    }
    ghostPart() {
        const e = this.ghostAt || {
            x: 0,
            y: 0,
            z: 0
        };
        return {
            id: "ghost",
            kind: this.armed,
            color: this.color,
            x: e.x,
            y: e.y,
            z: e.z,
            rotation: this.ghostRot,
            version: 0
        }
    }
    makeGhost() {
        this.dropGhost();
        const e = this.ghostPart(),
            t = He(e.kind),
            s = t ? pi(e, this.hall.models.get(t), () => {
                s && this.fade(s)
            }) : di(e);
        s && (this.fade(s), s.visible = !1, this.ghost = s, this.hall.scene.add(s))
    }
    dropGhost() {
        const e = this.ghost;
        if (!e) return;
        const t = li(e.children[0]);
        t ? t.dispose() : M1(e) || R9(e), this.hall.scene.remove(e), this.ghost = null
    }
    fade(e) {
        e.traverse(t => {
            const s = t;
            if (!s.isMesh) return;
            s.userData.nohit = !0, s.castShadow = !1;
            const i = Array.isArray(s.material) ? s.material : [s.material],
                n = i.map(o => {
                    const a = b9(o.clone());
                    return a.transparent = !0, a.opacity = .5, a.depthWrite = !1, a
                });
            i.forEach(T5), s.material = Array.isArray(s.material) ? n : n[0]
        })
    }
    select(e, t = !1) {
        if (this.savingGroup) return;
        this.cancelModal(), this.selection.select(e, t), this.selected = this.selection.primary, this.hover === e && (this.hover = null);
        const s = this.selected && this.hall.parts.get(this.selected);
        s && !He(s.userData.part.kind) && (this.color = s.userData.part.color), this.onChange()
    }
    deselect() {
        this.cancelModal(), this.restoreSelection(), this.selection.clear(), this.selected = null, this.gzDrag = null, this.gzHover = null, this.onChange()
    }
    onlySingle() {
        return this.selection.multiple ? (this.hall.onNotice("多选支持整体移动、等比缩放和水平旋转，其他操作请先单选"), !0) : !1
    }
    editPart() {
        return this.selection.multiple ? this.selection.capture() : this.draft(this.selected)
    }
    restoreSelection() {
        for (const e of this.selection.originals) {
            const t = this.hall.parts.get(e.id);
            t && (delete t.userData.draft, this.restore(e.id))
        }
        this.selection.reset()
    }
    commitEdit(e, t) {
        if (this.selection.multiple) {
            const s = this.selection.drafts;
            this.selection.reset(), s.length && this.changeMany(s)
        } else t ? this.change(e, ke(t)) : this.restore(e)
    }
    setHover(e) {
        if (this.hover === e) return;
        const t = this.hover && this.hall.parts.get(this.hover);
        t && !this.selection.ids.has(this.hover) && b1(t, 0), this.hover = e;
        const s = e && this.hall.parts.get(e);
        s && !this.selection.ids.has(e) && b1(s, .12, "#ffffff"), this.hall.host.classList.toggle("pointing", !!e)
    }
    worldChanged() {
        this.selection.originals.some(t => this.version(t.id) !== t.version) && !this.savingGroup && this.busy && (this.cancelModal(), this.gzDrag = null, this.restoreSelection(), this.hall.onNotice("所选零件已被其他人修改，请重新操作"));
        for (const t of this.selection.ids) this.hall.parts.has(t) || this.selection.remove(t);
        this.selected = this.selection.primary, this.selection.update(), this.hover && !this.hall.parts.has(this.hover) && (this.hover = null), this.modal && !this.hall.parts.has(this.modal.id) && (this.modal = null)
    }
    highlight(e) {
        for (const t of this.handles) t.mat.color.set(t === e ? "#f2c230" : N5[t.axis]), t.mat.opacity = !e || t === e ? .95 : .55
    }
    pickHandle(e) {
        return this.gz.visible ? (this.ray.setFromCamera(this.hall.ndc(e), this.hall.camera), this.ray.intersectObjects(this.handles.filter(s => !this.selection.multiple || s.kind !== "rot" || s.axis === "y").map(s => s.picker), !1).map(s => this.handles[s.object.userData.h]).sort((s, i) => i.prio - s.prio)[0] || null) : null
    }
    centre(e) {
        return (this.selection.multiple ? this.selection.bounds() : new re().setFromObject(e)).getCenter(new T)
    }
    frame() {
        var t;
        const e = this.selected && this.hall.parts.get(this.selected);
        if (this.gz.visible = !!e && !this.modal, e) {
            this.gz.position.copy(this.gzDrag ? this.gzDrag.centre : this.centre(e)), this.gz.scale.setScalar(y1(this.hall.camera, this.gz.position, this.hall.host.clientHeight) * 70), this.rings.visible = !0;
            for (const s of this.handles) s.kind === "rot" && (s.mat.visible = !this.selection.multiple || s.axis === "y");
            this.rings.rotation.set(0, this.selection.multiple ? 0 : (e.userData.part.rotation || 0) * K0, 0), (t = this.selection) == null || t.update()
        }
        this.ghost && !this.ghostAt && (this.ghost.visible = !1)
    }
    get busy() {
        return !!(this.gzDrag || this.modal)
    }
    cameraChanged() {
        const e = this.modal;
        e && !e.input && (e.draft && (e.from = structuredClone(e.draft)), e.start = this.last ? {
            ...this.last
        } : e.start, e.anchor = null);
        const t = this.gzDrag;
        if (t && this.selected && this.last) {
            const s = this.hall.parts.get(this.selected);
            s && (t.from = structuredClone(this.selection.preview || s.userData.draft || this.draft(this.selected)), t.centre = this.centre(s), t.x = this.last.x, t.y = this.last.y)
        }
        this.onChange()
    }
    draft(e) {
        const t = this.hall.parts.get(e);
        return structuredClone(t.userData.pending ? t.userData.shown : t.userData.part)
    }
    pose(e, t) {
        var n;
        if (t.kind === w1) {
            try {
                this.selection.pose(t)
            } catch (o) {
                this.hall.onNotice(o.message)
            }
            return
        }
        const s = this.hall.parts.get(e);
        if (!s) return;
        const i = s.userData.part;
        n1(s, t), s.userData.part = i, this.hall.markDirty(), (n = this.selection) == null || n.update()
    }
    restore(e) {
        const t = this.hall.parts.get(e);
        if (!t) return;
        const s = t.userData.pending ? t.userData.shown : t.userData.part;
        this.pose(e, s), Ys(t, s.color)
    }
    settle(e) {
        const t = this.hall.parts.get(e);
        t && (t.userData.pending = Math.max(0, (t.userData.pending || 0) - 1), t.userData.pending || (delete t.userData.shown, this.restore(e)))
    }
    run(e, t) {
        const s = this.queue.then(e).catch(i => (this.hall.onNotice(i.message || "没存上"), t == null || t(), null));
        return this.queue = s, s
    }
    version(e) {
        var t, s;
        return ((s = (t = this.hall.parts.get(e)) == null ? void 0 : t.userData.part) == null ? void 0 : s.version) ?? -1
    }
    remap(e, t) {
        for (const s of [...this.undo, ...this.redo])
            if (s.id === e && (s.id = t), s.type === "many" || s.type === "copyMany")
                for (const i of s.items) i.id === e && (i.id = t);
        this.selected === e && (this.selected = t)
    }
    change(e, t, s = !0) {
        const i = this.hall.parts.get(e),
            n = this.draft(e),
            o = ke(n);
        if (JSON.stringify(o) === JSON.stringify(t)) {
            this.restore(e);
            return
        }
        s && (this.undo.push({
            type: "move",
            id: e,
            before: o,
            after: t
        }), this.redo.length = 0), i.userData.shown = {
            ...n,
            ...t
        }, i.userData.pending = (i.userData.pending || 0) + 1, this.run(() => this.client.send({
            action: "move",
            id: e,
            version: this.version(e),
            part: t
        })).then(() => this.settle(e))
    }
    changeMany(e) {
        const t = e.map(s => ({
            id: s.id,
            before: ke(this.draft(s.id)),
            after: ke(s),
            version: s.version
        })).filter(s => JSON.stringify(s.before) !== JSON.stringify(s.after));
        if (t.length) {
            this.savingGroup = !0, this.onChange();
            for (const s of e) {
                const i = this.hall.parts.get(s.id);
                i.userData.shown = s, i.userData.pending = (i.userData.pending || 0) + 1
            }
            this.run(async () => {
                await this.client.send({
                    action: "moveMany",
                    items: t.map(s => ({
                        id: s.id,
                        version: s.version,
                        part: s.after
                    }))
                }), this.undo.push({
                    type: "many",
                    id: t[0].id,
                    items: t
                }), this.redo.length = 0
            }).then(() => {
                for (const s of e) this.settle(s.id);
                this.savingGroup = !1, this.onChange()
            })
        }
    }
    place(e, t) {
        this.run(async () => {
            const s = await this.client.send({
                action: "add",
                part: e
            });
            s.changed && (this.undo.push({
                type: "add",
                id: s.changed.id,
                fields: ke(s.changed)
            }), this.redo.length = 0), !t && s.changed && this.select(s.changed.id)
        })
    }
    removeSelected() {
        if (this.onlySingle()) return;
        const e = this.selected;
        if (!e) return;
        const t = ke(this.hall.parts.get(e).userData.part);
        this.deselect(), this.run(async () => {
            await this.client.send({
                action: "remove",
                id: e,
                version: this.version(e)
            }), this.undo.push({
                type: "remove",
                id: e,
                fields: t
            }), this.redo.length = 0
        })
    }
    duplicate() {
        if (this.savingGroup) return;
        if (this.selection.multiple) {
            const t = [...this.selection.ids].map(s => ({
                id: s,
                version: this.version(s)
            }));
            this.savingGroup = !0, this.onChange(), this.run(async () => {
                var n;
                const s = await this.client.send({
                    action: "duplicateMany",
                    items: t
                });
                if (!((n = s.created) != null && n.length)) throw Error("整组复制失败");
                const i = s.created.map(({
                    part: o,
                    cinemaContent: a
                }) => ({
                    id: o.id,
                    fields: ke(o),
                    cinemaContent: a
                }));
                this.undo.push({
                    type: "copyMany",
                    id: i[0].id,
                    items: i
                }), this.redo.length = 0, this.savingGroup = !1, this.deselect();
                for (const o of i) this.select(o.id, !0);
                this.beginModal("grab")
            }).finally(() => {
                this.savingGroup = !1, this.onChange()
            });
            return
        }
        if (this.onlySingle()) return;
        const e = this.selected;
        e && this.run(async () => {
            const t = await this.client.send({
                action: "duplicate",
                id: e,
                version: this.version(e)
            });
            t.changed && (this.undo.push({
                type: "add",
                id: t.changed.id,
                fields: ke(t.changed)
            }), this.redo.length = 0, this.select(t.changed.id), this.beginModal("grab"))
        })
    }
    replay(e, t) {
        return e.type === "copyMany" ? (this.cancelModal(), this.savingGroup = !0, this.onChange(), this.run(async () => {
            var s;
            if (t) await this.client.send({
                action: "removeMany",
                items: e.items.map(i => ({
                    id: i.id,
                    version: this.version(i.id)
                }))
            });
            else {
                const i = await this.client.send({
                    action: "addMany",
                    items: e.items.map(n => ({
                        part: n.fields,
                        cinemaContent: n.cinemaContent
                    }))
                });
                if (((s = i.created) == null ? void 0 : s.length) !== e.items.length) throw Error("整组恢复失败");
                i.created.forEach(({
                    part: n
                }, o) => {
                    this.remap(e.items[o].id, n.id), e.items[o].id = n.id
                }), e.id = e.items[0].id, this.savingGroup = !1, this.deselect();
                for (const n of e.items) this.select(n.id, !0)
            }(t ? this.redo : this.undo).push(e)
        }, () => {
            (t ? this.undo : this.redo).push(e)
        }).finally(() => {
            this.savingGroup = !1, this.onChange()
        })) : (e.type === "many" && (this.savingGroup = !0, this.onChange()), this.run(async () => {
            const s = e.type === "add" === t;
            if (e.type === "many") await this.client.send({
                action: "moveMany",
                items: e.items.map(i => ({
                    id: i.id,
                    version: this.version(i.id),
                    part: t ? i.before : i.after
                }))
            });
            else if (e.type === "move") await this.client.send({
                action: "move",
                id: e.id,
                version: this.version(e.id),
                part: t ? e.before : e.after
            });
            else if (s) this.selected === e.id && this.deselect(), await this.client.send({
                action: "remove",
                id: e.id,
                version: this.version(e.id)
            });
            else {
                const i = await this.client.send({
                    action: "add",
                    part: e.fields
                });
                i.changed && (this.remap(e.id, i.changed.id), e.id = i.changed.id)
            }(t ? this.redo : this.undo).push(e)
        }, () => {
            (t ? this.undo : this.redo).push(e)
        }).finally(() => {
            e.type === "many" && (this.savingGroup = !1, this.onChange())
        }))
    }
    undoLast() {
        if (this.savingGroup) return;
        const e = this.undo.pop();
        e ? this.replay(e, !0) : this.hall.onNotice("没有可以撤销的了")
    }
    redoLast() {
        if (this.savingGroup) return;
        const e = this.redo.pop();
        e && this.replay(e, !1)
    }
    turnSelected(e) {
        if (!this.savingGroup) {
            if (this.selection.multiple) {
                const t = this.editPart();
                t.rotation = Wt(e), this.pose(t.id, t), this.commitEdit(t.id, t), this.onChange();
                return
            }
            if (this.selected) {
                const t = this.draft(this.selected);
                t.rotation = Wt(t.rotation + e), this.pose(this.selected, t), this.change(this.selected, ke(t));
                return
            }
            this.ghostRot = Wt(this.ghostRot + e), this.ghost && (this.ghost.rotation.y = this.ghostRot * K0)
        }
    }
    beginModal(e) {
        this.selected && (this.cancelModal(), this.modal = {
            kind: e,
            id: this.selected,
            from: this.editPart(),
            axis: null,
            input: "",
            start: this.last ? {
                ...this.last
            } : {
                x: 0,
                y: 0
            },
            anchor: null
        }, this.onChange())
    }
    updateModal(e) {
        const t = this.modal;
        if (!t) return;
        const s = structuredClone(t.from),
            i = !!He(s.kind);
        if (t.kind === "grab") {
            const n = t.input ? parseFloat(t.input) || 0 : null;
            if (n !== null && t.axis) s[t.axis] = Et(s[t.axis] + ge(n));
            else if (t.axis === "y") {
                const o = y1(this.hall.camera, new T(t.from.x, t.from.y, t.from.z), this.hall.host.clientHeight);
                s.y = Et(t.from.y + ge(-(e.clientY - t.start.y) * o))
            } else {
                this.ray.setFromCamera(this.hall.ndc(e), this.hall.camera);
                const o = new T;
                if (this.ray.ray.intersectPlane(new ii(je.y, -t.from.y), o)) {
                    t.anchor || (t.anchor = o.clone().sub(new T(t.from.x, t.from.y, t.from.z)));
                    const a = o.sub(t.anchor);
                    t.axis !== "z" && (s.x = Et(t.from.x + ge(a.x - t.from.x))), t.axis !== "x" && (s.z = Et(t.from.z + ge(a.z - t.from.z)))
                }
            }
        } else {
            const n = y1(this.hall.camera, new T(t.from.x, t.from.y, t.from.z), this.hall.host.clientHeight),
                o = t.input ? parseFloat(t.input) || 0 : ge((e.clientX - t.start.x) * n);
            s.scale = bs(t.from, this.sizeOf(t.from), o, i, t.axis)
        }
        t.kind === "scale" ? M2(t.from, s, this.sizeOf(s)) : I9(s, this.sizeOf(s), t.axis ? [t.axis] : ["x", "z"]), this.pose(t.id, s), t.draft = s.kind === w1 ? this.selection.preview || void 0 : s
    }
    sizeOf(e) {
        var s;
        if (e.kind === w1) return this.selection.size;
        const t = He(e.kind);
        return t ? ((s = this.hall.models.get(t)) == null ? void 0 : s.size) || [1, 1, 1] : vo(e.kind)
    }
    confirmModal() {
        const e = this.modal;
        e && (this.modal = null, this.commitEdit(e.id, e.draft), this.onChange())
    }
    cancelModal() {
        var t;
        const e = this.modal;
        e && (this.modal = null, (t = this.selection) != null && t.multiple ? this.restoreSelection() : this.restore(e.id), this.onChange())
    }
    down(e) {
        if (!this.active) return !1;
        if (this.savingGroup) return !0;
        if (this.modal) return e.button === 0 ? this.confirmModal() : e.button === 2 && this.cancelModal(), !0;
        if (this.selected && e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            const t = this.pickHandle(e);
            if (t) {
                const s = this.hall.parts.get(this.selected);
                return this.gzDrag = {
                    h: t,
                    x: e.clientX,
                    y: e.clientY,
                    from: this.editPart(),
                    centre: this.centre(s)
                }, this.highlight(t), !0
            }
        }
        return !1
    }
    move(e, t) {
        var s;
        if (this.last = {
                x: e.clientX,
                y: e.clientY
            }, !this.active) return !1;
        if (this.gzDrag) return this.dragHandle(e), !0;
        if (this.modal) return this.updateModal(e), !0;
        if (t) return !1;
        if (this.selected) {
            const i = this.pickHandle(e);
            if (i !== this.gzHover && (this.gzHover = i, this.highlight(i)), i) return this.hall.host.classList.add("pointing"), !0
        }
        return this.armed && this.ghost ? (this.aim(e), !0) : (this.setHover(((s = this.hall.partHit(e)) == null ? void 0 : s.id) || null), !0)
    }
    aim(e) {
        var s;
        if (!this.ghost) return;
        this.ray.setFromCamera(this.hall.ndc(e), this.hall.camera);
        const t = wo(this.ray.ray, this.placementHeight === null ? (s = this.hall.floorHit(e)) == null ? void 0 : s.point : null, this.placementHeight);
        if (t) {
            this.ghostAt = {
                x: T2(t.x),
                y: Et(t.y),
                z: T2(t.z)
            };
            const i = this.ghostPart();
            I9(i, this.sizeOf(i), ["x", "z"]), this.ghostAt = {
                x: i.x,
                y: i.y,
                z: i.z
            }, n1(this.ghost, this.ghostPart()), this.ghost.visible = !0
        } else this.ghostAt = null, this.ghost.visible = !1
    }
    up(e, t) {
        var i;
        if (!this.active) return !1;
        if (this.gzDrag) {
            const n = this.gzDrag;
            this.gzDrag = null, this.highlight(this.gzHover);
            const o = (i = this.hall.parts.get(n.from.id)) == null ? void 0 : i.userData.draft;
            this.commitEdit(n.from.id, o);
            const a = this.hall.parts.get(n.from.id);
            return a && delete a.userData.draft, !0
        }
        if (!t) return !0;
        if (e.button === 2) return this.armed ? this.arm(null) : this.deselect(), !0;
        if (e.button !== 0) return !0;
        if (this.armed) {
            if (this.aim(e), !this.ghostAt) return !0;
            const n = this.ghostPart();
            return this.place({
                kind: n.kind,
                color: n.color,
                x: n.x,
                y: n.y,
                z: n.z,
                rotation: n.rotation
            }, e.shiftKey), e.shiftKey || this.arm(null), !0
        }
        if (this.hall.shellRemoval.pick(e)) return this.deselect(), !0;
        const s = this.hall.partHit(e);
        return s ? this.select(s.id, e.ctrlKey || e.metaKey || e.shiftKey) : !e.ctrlKey && !e.metaKey && !e.shiftKey && this.deselect(), !0
    }
    dragHandle(e) {
        const t = this.gzDrag,
            s = t.h,
            i = this.hall.camera,
            n = this.hall.renderer.domElement.getBoundingClientRect(),
            o = u => {
                const d = u.clone().project(i);
                return new k0((d.x + 1) / 2 * n.width, (1 - d.y) / 2 * n.height)
            },
            a = e.clientX - t.x,
            l = e.clientY - t.y,
            A = structuredClone(t.from),
            c = !!He(A.kind),
            h = u => {
                const d = o(t.centre),
                    g = o(t.centre.clone().add(u)).sub(d);
                return (a * g.x + l * g.y) / Math.max(1e-6, g.lengthSq())
            };
        if (s.kind === "move") {
            const u = h(je[s.axis]),
                d = s.axis;
            A[d] = Et(t.from[d] + ge(u))
        } else if (s.kind === "scale")
            if (s.axis === "u") {
                const u = y1(i, t.centre, n.height);
                A.scale = bs(t.from, this.sizeOf(t.from), ge((a - l) * u), c, null)
            } else {
                const u = this.hall.parts.get(A.id),
                    d = je[s.axis].clone().applyQuaternion(u.quaternion.clone().invert()),
                    g = t.from.kind === w1 ? s.axis : ["x", "y", "z"].reduce((p, I) => Math.abs(d[I]) > Math.abs(d[p]) ? I : p, "x");
                A.scale = bs(t.from, this.sizeOf(t.from), ge(h(je[s.axis])), c, g)
            }
        else {
            const u = (t.from.rotation || 0) * K0,
                d = s.axis === "y" ? je.y : s.axis === "x" ? new T(Math.cos(u), 0, -Math.sin(u)) : new T(Math.sin(u), 0, Math.cos(u)),
                g = o(t.centre),
                p = Math.atan2(t.y - n.top - g.y, t.x - n.left - g.x),
                I = Math.atan2(e.clientY - n.top - g.y, e.clientX - n.left - g.x),
                C = d.dot(new T().subVectors(i.position, t.centre).normalize()) > 0 ? -1 : 1;
            let E = (I - p) * C;
            E = Math.atan2(Math.sin(E), Math.cos(E));
            const x = Math.round(E / K0);
            s.axis === "y" ? A.rotation = Wt((t.from.rotation || 0) + x) : s.axis === "x" ? A.pitch = Wt((t.from.pitch || 0) + x) : A.roll = Wt((t.from.roll || 0) + x), A.pitch || delete A.pitch, A.roll || delete A.roll
        }
        s.kind === "scale" ? M2(t.from, A, this.sizeOf(A)) : s.kind === "move" && I9(A, this.sizeOf(A), [s.axis]), this.pose(A.id, A), this.hall.parts.get(A.id).userData.draft = A
    }
    key(e) {
        var i, n, o, a;
        if (!this.active) return !1;
        if (this.savingGroup) return !0;
        const t = e.key.toLowerCase(),
            s = this.modal;
        if (s) {
            if (t === "escape") this.cancelModal();
            else if (t === "enter") this.confirmModal();
            else if (t === "x" || t === "y" || t === "z") s.axis = s.axis === t ? null : t, s.anchor = null;
            else if (/^[0-9.]$/.test(e.key) || t === "-" || t === "backspace") s.input = t === "backspace" ? s.input.slice(0, -1) : t === "-" ? s.input.startsWith("-") ? s.input.slice(1) : "-" + s.input : s.input + e.key;
            else return !0;
            return this.modal && this.updateModal({
                clientX: ((i = this.last) == null ? void 0 : i.x) || 0,
                clientY: ((n = this.last) == null ? void 0 : n.y) || 0,
                shiftKey: e.shiftKey
            }), this.onChange(), !0
        }
        if (t === "escape") return this.armed ? this.arm(null) : this.selected ? this.deselect() : this.end(), !0;
        if ((e.ctrlKey || e.metaKey) && t === "z") return e.preventDefault(), e.shiftKey ? this.redoLast() : this.undoLast(), !0;
        if ((e.ctrlKey || e.metaKey) && t === "y") return e.preventDefault(), this.redoLast(), !0;
        if ((e.ctrlKey || e.metaKey) && t === "a") {
            e.preventDefault(), this.deselect();
            for (const l of this.hall.parts.keys()) this.selection.select(l, !0);
            return this.selected = this.selection.primary, this.onChange(), !0
        }
        if (e.ctrlKey || e.metaKey || e.altKey) return !1;
        if (this.armed && ["pagedown", "pageup", "home"].includes(t)) return e.preventDefault(), this.placementHeight = t === "home" ? null : Et((this.placementHeight ?? ((o = this.ghostAt) == null ? void 0 : o.y) ?? 0) + (t === "pagedown" ? -1 : 1) * .25), this.last && this.aim({
            clientX: this.last.x,
            clientY: this.last.y
        }), this.onChange(), !0;
        if (t === "a" && e.shiftKey) return e.preventDefault(), this.onAddMenu(this.last), !0;
        if (t === "d" && e.shiftKey) return e.preventDefault(), this.duplicate(), !0;
        if (t === "g") return this.beginModal("grab"), !0;
        if (t === "s") return this.beginModal("scale"), !0;
        if (t === "r") return this.turnSelected(e.shiftKey ? -1 : 1), !0;
        if (t === "e" && this.last) {
            const l = this.hall.partHit({
                    clientX: this.last.x,
                    clientY: this.last.y
                }),
                A = l && ((a = this.hall.parts.get(l.id)) == null ? void 0 : a.userData.part);
            return A && (this.ghostRot = A.rotation || 0, He(A.kind) || (this.color = A.color), this.arm(A.kind), this.hall.onNotice("吸取了：" + this.label(A.kind))), !0
        }
        if (t === "f") {
            const l = this.selected && this.hall.parts.get(this.selected);
            return l && this.hall.lookAt(this.centre(l), 3), !0
        }
        return (t === "delete" || t === "backspace") && this.selected ? (this.removeSelected(), !0) : ["w", "a", "s", "d"].includes(t)
    }
}
