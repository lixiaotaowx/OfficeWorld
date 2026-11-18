    try { this.environment = pmrem.fromScene(room, .04); this.scene.environment = this.environment.texture; this.scene.environmentIntensity = .08; }\
    try { this.environment = pmrem.fromScene(room, .04); this.scene.environment = this.environment.texture; this.scene.environmentIntensity = .035; }\
    this.ao.updateGtaoMaterial({ radius: .65, thickness: .35, samples: 16, scale: 1.1 });\
    this.ao.blendIntensity = .9;\
    // Contact shading only: broad, dark halos are not bounced illumination.\
    this.ao.updateGtaoMaterial({ radius: .3, thickness: .2, samples: 16, scale: 1 });\
    this.ao.blendIntensity = .65;\
