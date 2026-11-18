const GLOW_WHITE=new THREE.Color('#ffffff');\
    emissive:source.color.clone().offsetHSL(0,.18,-.06),emissiveIntensity:.8,\
    emissive:source.color.clone(),emissiveIntensity:.16,\
    color:source.color.clone().lerp(GLOW_WHITE,.3),\
    transparent:true,opacity:.2,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,\
    color:source.color.clone(),\
    transparent:true,opacity:.04,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,\
    halo.scale.setScalar(1.3);\
    halo.scale.setScalar(1.12);\
      panel.position.z=.08*Math.pow(Math.sin(Math.PI*phase),4);\
      panel.position.z=root.userData.chestUnread ? .16*phase : .08*Math.pow(Math.sin(Math.PI*phase),4);\
      if(body.emissive)body.emissiveIntensity=.9*pulse;\
      if(body.emissive)body.emissiveIntensity=.16*pulse;\
      if(shell?.transparent)shell.opacity=.5*pulse;\
      if(shell?.transparent)shell.opacity=.08*pulse;\
