    this.rim.position.set(-8, 6, -4); this.group.add(this.rim);\
    this.rim.position.set(-8, 6, -4);\
    // The fill must respect the building instead of lighting through solid walls.\
    this.rim.castShadow = true;\
    this.rim.shadow.mapSize.set(1024, 1024);\
    Object.assign(this.rim.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: .5, far: 50 });\
    this.rim.shadow.camera.updateProjectionMatrix();\
    this.rim.shadow.bias = -.00008; this.rim.shadow.normalBias = .012;\
    this.rim.shadow.radius = 3;\
    this.group.add(this.rim, this.rim.target);\
    this.rim.intensity = night ? .65 : .55;\
    this.rim.intensity = night ? .25 : .18;\
  dispose() { this.group.removeFromParent(); this.strip.dispose(); this.glow.dispose(); }\
  dispose() { this.group.removeFromParent(); this.rim.shadow.dispose(); this.strip.dispose(); this.glow.dispose(); }\
