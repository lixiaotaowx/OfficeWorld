  private helper = new THREE.BoxHelper(undefined, 0xffce54);\
  private helper = new THREE.BoxHelper(new THREE.Object3D(), 0xffce54);\
  sync(removed: string[]) {\
    const ids = new Set(removed);\
    this.undo = removed.filter(id => this.meshes.has(id));\
  tick(enabled: boolean) {\
    if (!enabled) this.clear();\
    if (!enabled || this.hall.build?.armed) this.clear();\
      if (restore) this.undo.pop(); else this.undo.push(id);\
