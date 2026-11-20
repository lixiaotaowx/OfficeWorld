// Hall characters: the actor class (L9) with walk/run/sit/ladder states, the
// people roster (pr), appearance application (Er) and raycast picking (mr).
// Recovered verbatim from chunks/HallView.js; only imports/exports added.
import { definePrivate as m } from './hallPrelude.js';
import { G as E0, l as A3, b0 as c3, r as h3, V as T, b as re } from '../chunks/portraitLighting.js';
import { I2, p2, m2, Ar, cr, S5, D1, P0, fr } from './hallParts.js';

let i9 = null;
class L9 {
  constructor(e, t) {
    m(this, "holder", new E0);
    m(this, "state", "stand");
    m(this, "route", null);
    m(this, "onArrive", null);
    m(this, "gait", "walk");
    m(this, "vy", 0);
    m(this, "stuck", 0);
    m(this, "current", "");
    m(this, "disposed", !1);
    m(this, "seatAnchor", null);
    m(this, "seatPose");
    m(this, "handTargets");
    m(this, "seatRotations", new Map);
    m(this, "jump", null);
    this.c = e, this.id = t, this.holder.add(e.model), this.holder.userData.person = t, this.play("idle")
  }
  static async create(e, t) {
    var i;
    const s = await A3(t);
    if (!i9) {
      const n = I2(s, s.walk.getClip()),
        o = I2(s, (i = s.run) == null ? void 0 : i.getClip());
      i9 = {
        walk: (n || .45) * p2,
        run: (o || n || .45) * m2
      }
    }
    return s.walk.timeScale = p2, s.run && (s.run.timeScale = m2), new L9(s, e)
  }
  get climbing() {
    var e, t;
    return !!((t = (e = this.route) == null ? void 0 : e[0]) != null && t.climb)
  }
  get falling() {
    return this.vy !== 0
  }
  get position() {
    return this.holder.position
  }
  dress(e) {
    c3(this.c, e)
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.holder.removeFromParent(), h3(this.c))
  }
  play(e, t = .25) {
    if (this.current === e) return;
    const s = e === "idle" ? this.c.idle : e === "walk" ? this.c.walk : e === "run" ? this.c.run || this.c.walk : e === "sit" ? this.c.action("SeatedTyping_Type", "Sitting", "Sit") : e === "jump" ? this.c.action("Jump") : this.c.action("Wave");
    if (!s) return;
    s.reset().fadeIn(t).play();
    const i = this.current && this.actionFor(this.current);
    i && i !== s && i.fadeOut(t), this.current = e
  }
  actionFor(e) {
    return e === "idle" ? this.c.idle : e === "walk" ? this.c.walk : e === "run" ? this.c.run || this.c.walk : e === "sit" ? this.c.action("SeatedTyping_Type", "Sitting", "Sit") : e === "jump" ? this.c.action("Jump") : this.c.action("Wave")
  }
  stand(e, t) {
    this.holder.position.set(e.x, e.y, e.z), t !== void 0 && (this.holder.rotation.y = t), this.state = "stand", this.route = null, this.onArrive = null, this.play("idle")
  }
  sit(e, t, s, i) {
    this.route = null, this.onArrive = null, this.play("sit", .3), this.holder.rotation.y = t, this.holder.position.set(e.x, e.y, e.z), this.seatAnchor = {
      ...e
    }, this.handTargets = s, this.seatPose = i, this.c.mixer.update(0), this.state = "sit", this.alignSeat()
  }
  restoreSeatPose() {
    for (const [e, t] of this.seatRotations) e.quaternion.copy(t);
    this.seatRotations.clear()
  }
  alignSeat() {
    if (this.restoreSeatPose(), !(this.state !== "sit" || !this.seatAnchor)) {
      for (const e of this.c.bones.values()) this.seatRotations.set(e, e.quaternion.clone());
      Ar(this.c, this.holder, this.seatAnchor, this.handTargets, this.seatPose)
    }
  }
  animate(e) {
    this.restoreSeatPose(), this.c.mixer.update(e), this.alignSeat()
  }
  getUp(e) {
    if (this.state !== "sit") return;
    const t = this.holder.position,
      s = this.holder.rotation.y,
      i = t.x + Math.sin(s) * .6,
      n = t.z + Math.cos(s) * .6;
    t.set(i, e.groundAt(i, n, t.y + .8) ?? 0, n), this.state = "stand", this.play("idle")
  }
  go(e, t, s) {
    return e ? (this.getUp(t), this.route = e.map(i => ({
      ...i
    })), this.onArrive = s || null, this.stuck = 0, !0) : !1
  }
  startJump(e, t, s) {
    this.jump = {
      from: this.holder.position.clone(),
      to: new T(e, s, t),
      t: 0,
      dur: .55
    }, this.state = "jump";
    const i = this.c.action("Jump");
    i && (i.timeScale = i.getClip().duration / .7), this.play("jump", .08)
  }
  step(e, t, s, i) {
    var a;
    const n = this.holder.position;
    if (this.animate(e), this.jump) {
      const l = this.jump;
      l.t = Math.min(1, l.t + e / l.dur), n.lerpVectors(l.from, l.to, l.t), n.y += Math.sin(l.t * Math.PI) * (.35 + Math.max(0, l.to.y - l.from.y) * .35), l.t >= 1 && (n.copy(l.to), this.jump = null, this.state = "walk", this.vy = 0);
      return
    }
    let o = null;
    for (; this.route && this.route.length;) {
      const l = this.route[0];
      if (l.climb) {
        const c = new T(l.x, l.y, l.z),
          h = n.distanceTo(c);
        if (h > .001) {
          const u = n.clone().lerp(c, Math.min(1, cr * e / h));
          if (!l.climb.every(d => t.list.some(g => g.partId === d)) || !(l.climbEntry ? S5(t, n, l, l.climb) : D1(t, n, u, l.climb))) {
            this.route = null, this.onArrive = null, this.state = "stand", this.play("idle"), i == null || i();
            return
          }
          n.copy(u), this.vy = 0, this.state = "walk", this.play("walk"), l.face !== void 0 && (this.holder.rotation.y = l.face);
          return
        }
      }
      const A = new T(l.x - n.x, 0, l.z - n.z);
      if (A.length() >= .08) {
        o = A.normalize();
        break
      }
      if (this.route.shift(), !this.route.length) {
        this.route = null;
        const c = this.onArrive;
        this.onArrive = null, this.state === "walk" && (this.state = "stand", this.play("idle")), c == null || c()
      }
    }
    if (!o && s && this.state !== "sit" && (o = s), o && (this.state === "stand" || this.state === "walk")) {
      let l = 0;
      if (this.route) {
        let C = n;
        for (const E of this.route) l += Math.hypot(E.x - C.x, E.z - C.z), C = E
      }
      this.route && (this.gait = l > (this.gait === "run" ? 1.2 : 2.5) ? "run" : "walk"), this.state = "walk", this.play(this.gait, .18), this.holder.rotation.y = Math.atan2(o.x, o.z);
      const A = (this.gait === "run" ? i9.run : i9.walk) * e,
        c = n.x + o.x * A,
        h = n.z + o.z * A,
        u = t.groundAt(c, h, n.y + P0 + .05),
        d = (a = this.route) == null ? void 0 : a[0];
      if (d && d.y > n.y + P0 && Math.hypot(d.x - n.x, d.z - n.z) < 1.05) {
        const C = t.canJump(n, d.x, d.z);
        if (C !== null) {
          this.startJump(d.x, d.z, C);
          return
        }
      }
      const g = t.groundAt(n.x + o.x * .28, n.z + o.z * .28, n.y + P0 + .05),
        p = Math.max(u ?? -9, n.y, g !== null && g <= n.y + P0 ? g : -9),
        I = !this.route && u !== null && t.blocksAt(n.x + o.x * (A + .05), n.z + o.z * (A + .05), p);
      if (!this.route && (I || u === null || u > n.y + P0))
        for (const C of [.4, .6]) {
          const E = n.x + o.x * C,
            x = n.z + o.z * C,
            B = t.canJump(n, E, x);
          if (B !== null) {
            this.startJump(E, x, B);
            return
          }
        }
      if (I || u === null || u > n.y + P0) {
        if (this.stuck += e, this.stuck > .25)
          if (this.stuck = 0, this.route && this.onArrive) {
            const C = this.route[this.route.length - 1];
            n.set(C.x, t.groundAt(C.x, C.z, C.y + 1) ?? C.y, C.z), this.route = null;
            const E = this.onArrive;
            this.onArrive = null, this.state = "stand", E()
          } else this.route = null, this.state = "stand", this.play("idle"), i == null || i()
      } else this.stuck = 0, n.x = c, n.z = h, u >= n.y - .02 && (n.y = u, this.vy = 0)
    } else this.state === "walk" && !o && (this.state = "stand", this.play("idle"));
    if (this.state === "stand" || this.state === "walk") {
      const l = t.groundAt(n.x, n.z, n.y + .05);
      if (l === null || l < n.y - .02) {
        this.vy === 0 && l !== null && l < n.y - .3 && this.play("jump", .1), this.vy -= fr * e, n.y += this.vy * e;
        const A = l ?? -20;
        n.y <= A && (n.y = A, this.vy = 0)
      }
    }
    n.y < -10 && (n.set(0, 0, 2.5), this.vy = 0)
  }
}
class pr {
  constructor(e, t) {
    m(this, "actor", null);
    m(this, "loading", null);
    m(this, "alive", !0);
    this.parent = e, this.create = t
  }
  async set(e, t, s) {
    !this.actor && !this.loading && (this.loading = this.create(e, t).then(n => (this.alive ? (this.actor = n, this.parent.add(n.holder), n.stand(s, .4)) : n.dispose(), n)).finally(() => {
      this.loading = null
    }));
    const i = this.actor || await this.loading;
    return this.alive && (i.holder.userData.person = e, i.dress(t)), i
  }
  dispose() {
    var e;
    this.alive = !1, (e = this.actor) == null || e.dispose(), this.actor = null
  }
}

function mr(r, e) {
  let t = null;
  for (const s of e) {
    const i = s.userData.part;
    if ((i == null ? void 0 : i.kind) !== "ladder") continue;
    let n = !0;
    for (let A = s; A; A = A.parent) A.visible || (n = !1);
    if (!n) continue;
    s.updateWorldMatrix(!0, !1);
    const a = r.ray.clone().applyMatrix4(s.matrixWorld.clone().invert()).intersectBox(new re(new T(-.31, 0, -.09), new T(.31, 2, .09)), new T);
    if (!a) continue;
    a.applyMatrix4(s.matrixWorld);
    const l = a.distanceTo(r.ray.origin);
    l < r.near || l > r.far || t && l >= t.distance || (t = {
      id: i.id,
      point: a,
      distance: l
    })
  }
  return t
}
const ms = r => JSON.stringify(r);
class Er {
  constructor(e, t) {
    m(this, "all", new Map);
    m(this, "alive", !0);
    this.parent = e, this.spots = t
  }
  set(e) {
    var s;
    if (!this.alive) return;
    const t = new Set(e.map(i => i.id));
    for (const [i, n] of this.all) t.has(i) || ((s = n.actor) == null || s.dispose(), this.all.delete(i));
    for (const i of e) {
      const n = this.all.get(i.id);
      if (n) {
        n.actor && n.key !== ms(i.appearance) && (n.actor.dress(i.appearance), n.key = ms(i.appearance)), n.person = i;
        continue
      }
      const o = {
        person: i,
        actor: null,
        loading: !0,
        target: null,
        key: ms(i.appearance)
      };
      this.all.set(i.id, o), L9.create(i.id, i.appearance).then(a => {
        if (this.all.get(i.id) !== o) {
          a.dispose();
          return
        }
        o.actor = a, o.loading = !1, this.parent.add(a.holder), this.place(o, !0)
      }).catch(() => {
        o.loading = !1
      })
    }
  }
  dispose() {
    var e;
    this.alive = !1;
    for (const t of this.all.values())(e = t.actor) == null || e.dispose();
    this.all.clear()
  }
  motion(e, t) {
    const s = this.all.get(e);
    s && (s.target = t)
  }
  get shadowMoving() {
    return [...this.all.values()].some(({
      actor: e,
      target: t
    }) => {
      if (!e || !t) return !1;
      const s = e.position,
        i = Math.atan2(Math.sin(t.rot - e.holder.rotation.y), Math.cos(t.rot - e.holder.rotation.y));
      return t.moving || t.sitting !== (e.state === "sit") || Math.abs(i) > .001 || Math.abs(s.x - t.x) > .001 || Math.abs(s.y - (t.y ?? 0)) > .001 || Math.abs(s.z - t.z) > .001
    })
  }
  resting(e) {
    const t = e.person.sittingSpot ? this.spots().find(n => n.id === e.person.sittingSpot) : void 0;
    if (t) return {
      x: t.at.x,
      y: t.at.y,
      z: t.at.z,
      rot: t.face,
      moving: !1,
      sitting: !0,
      sittingSpot: t.id
    };
    const s = e.person.seat !== null ? this.spots().find(n => n.workstation === e.person.seat) : void 0;
    if (s && e.person.atDesk !== !1) return {
      x: s.at.x,
      y: s.at.y,
      z: s.at.z,
      rot: s.face,
      moving: !1,
      sitting: !0,
      sittingSpot: s.id
    };
    let i = 0;
    for (const n of this.all.keys()) {
      if (n === e.person.id) break;
      i++
    }
    return {
      x: -5.5 + i % 4 * .8,
      y: 0,
      z: 4.3 - Math.floor(i / 4) * .8,
      rot: Math.PI * .8,
      moving: !1,
      sitting: !1
    }
  }
  place(e, t) {
    const s = e.actor;
    if (!s) return;
    const i = e.target || this.resting(e);
    if (i.sitting) {
      if (s.state !== "sit" || t || e.seatedAt !== i.sittingSpot) {
        e.seatedAt = i.sittingSpot;
        const A = this.spots().find(c => c.id === i.sittingSpot);
        s.sit(A ? A.at : {
          x: i.x,
          y: i.y ?? 0,
          z: i.z
        }, A ? A.face : i.rot, A == null ? void 0 : A.hands, A == null ? void 0 : A.pose)
      }
      return
    }
    s.state === "sit" && (s.state = "stand", e.seatedAt = null);
    const n = s.position,
      o = i.x - n.x,
      a = i.z - n.z,
      l = (i.y ?? 0) - n.y;
    return (t || Math.hypot(o, a) > 6) && n.set(i.x, i.y ?? 0, i.z), s.holder.rotation.y = i.rot, s.play(i.moving ? i.running ? "run" : "walk" : "idle", .2), {
      dx: o,
      dy: l,
      dz: a
    }
  }
  tick(e) {
    for (const t of this.all.values()) {
      const s = t.actor;
      if (!s) continue;
      s.animate(e);
      const i = this.place(t, !1);
      if (!i) {
        s.alignSeat();
        continue
      }
      const n = Math.min(1, e * 10);
      s.position.x += i.dx * n, s.position.z += i.dz * n, s.position.y += i.dy * Math.min(1, e * 14)
    }
  }
  holders() {
    return [...this.all.values()].flatMap(e => e.actor ? [e.actor.holder] : [])
  }
  actorOf(e) {
    var t;
    return ((t = this.all.get(e)) == null ? void 0 : t.actor) || null
  }
  list() {
    return [...this.all.values()].map(e => {
      var t, s;
      return {
        id: e.person.id,
        name: e.person.name,
        loaded: !!e.actor,
        at: (t = e.actor) == null ? void 0 : t.position.toArray().map(i => +i.toFixed(2)),
        state: (s = e.actor) == null ? void 0 : s.state
      }
    })
  }
}

export { L9, pr, mr, Er };
