    shader.fragmentShader = 'uniform float waterTime; varying vec3 waterPosition;\
' + shader.fragmentShader;\
    shader.fragmentShader = `uniform float waterTime; varying vec3 waterPosition;\
      float waterHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\
      float waterNoise(vec2 p) {\
        vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);\
        return mix(mix(waterHash(i), waterHash(i + vec2(1,0)), f.x),\
          mix(waterHash(i + vec2(0,1)), waterHash(i + vec2(1,1)), f.x), f.y);\
      }\
      float waterHeight(vec2 p, float t) {\
        vec2 drift = vec2(t * .07, -t * .045);\
        float broad = waterNoise(p * 1.8 + drift);\
        float fine = waterNoise(p * 5.3 - drift * 1.4);\
        return broad * .055 + fine * .018\
          + sin(p.x * 5.1 + p.y * 2.7 + broad * 3.0 - t * .65) * .009;\
      }\
    ` + shader.fragmentShader;\
      vec2 slope = vec2(1.0, .35) * cos(dot(p, vec2(7.0, 2.45)) - t * 1.3) * .075;\
      slope += vec2(-.45, 1.0) * cos(dot(p, vec2(-5.4, 12.0)) - t * 1.7) * .05;\
      slope += vec2(.7, .7) * cos(dot(p, vec2(22.0, 22.0)) + t * 2.1) * .022;\
      float height = waterHeight(p, t);\
      vec2 slope = vec2(waterHeight(p + vec2(.025, 0), t) - height,\
        waterHeight(p + vec2(0, .025), t) - height) / .025;\
      float shimmer = pow(max(0.0, sin(dot(p, vec2(14.0, 9.0)) + t) * sin(dot(p, vec2(-8.0, 17.0)) - t * .8)), 8.0);\
      diffuseColor.rgb += vec3(.08, .11, .12) * shimmer;\
    `);\
    shader.fragmentShader = shader.fragmentShader.replace('#include <clearcoat_normal_fragment_begin>', '#include <clearcoat_normal_fragment_begin>\
#ifdef USE_CLEARCOAT\
clearcoatNormal = normal;\
#endif');\
    shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `\
      float waterFresnel = .025 + .35 * pow(1.0 - max(dot(normal, normalize(vViewPosition)), 0.0), 4.0);\
      vec3 waterReflection = inverseTransformDirection(reflect(-normalize(vViewPosition), normal), viewMatrix);\
      vec3 waterSky = mix(vec3(.23, .32, .35), vec3(.58, .69, .75), smoothstep(-.15, .85, waterReflection.y));\
      outgoingLight = mix(outgoingLight, waterSky, waterFresnel);\
      #include <opaque_fragment>\
    `);\
  material.customProgramCacheKey = () => 'pond-water-v1';\
  material.customProgramCacheKey = () => 'pond-water-v2';\
    fish.traverse(o => { o.userData.nohit = true; }); root.add(fish);\
    const swimmer = new THREE.Group(); swimmer.name = 'swimmer';\
    swimmer.add(...[...fish.children]); fish.add(swimmer);\
    fish.traverse(o => { o.userData.nohit = true; }); root.add(fish);\
export function updateWater(root: THREE.Object3D, seconds: number) {\
  const scale = root.getWorldScale(new THREE.Vector3());\
  const fishSize = Math.min(.8, Math.abs(scale.x) * .8, Math.abs(scale.z) * .8, Math.abs(scale.y) * 2);\
      o.rotation.y = Math.atan2(-Math.sin(angle) * rx, Math.cos(angle) * rz);\
      // Cancel pond scaling before rotating the swimmer, including non-uniform resizing.\
      o.scale.set(fishSize / Math.max(.001, Math.abs(scale.x)), fishSize / Math.max(.001, Math.abs(scale.y)), fishSize / Math.max(.001, Math.abs(scale.z)));\
      const swimmer = o.getObjectByName('swimmer');\
      if (swimmer) swimmer.rotation.y = Math.atan2(-Math.sin(angle) * rx * scale.x, Math.cos(angle) * rz * scale.z);\
