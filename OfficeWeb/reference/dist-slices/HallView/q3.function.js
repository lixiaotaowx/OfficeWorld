function q3(r) {
    const e = new E0,
        t = new K(new U0(1, .025, 1), new Ie({
            color: "#32666a",
            roughness: .85
        }));
    t.position.y = .0125, t.receiveShadow = !0, t.userData.waterBounds = !0, e.add(t);
    const s = new Sn({
            color: r,
            roughness: .18,
            metalness: 0,
            transparent: !0,
            opacity: .48,
            depthWrite: !1,
            clearcoat: 1,
            clearcoatRoughness: .12,
            side: C9
        }),
        i = {
            value: 0
        };
    s.userData.waterTime = i, s.onBeforeCompile = o => {
        o.uniforms.waterTime = i, o.vertexShader = `varying vec3 waterPosition;
` + o.vertexShader, o.vertexShader = o.vertexShader.replace("#include <worldpos_vertex>", `#include <worldpos_vertex>
waterPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`), o.fragmentShader = `uniform float waterTime; varying vec3 waterPosition;
      float waterHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float waterNoise(vec2 p) {
        vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(waterHash(i), waterHash(i + vec2(1,0)), f.x),
          mix(waterHash(i + vec2(0,1)), waterHash(i + vec2(1,1)), f.x), f.y);
      }
      float waterHeight(vec2 p, float t) {
        vec2 drift = vec2(t * .07, -t * .045);
        float broad = waterNoise(p * 1.8 + drift);
        float fine = waterNoise(p * 5.3 - drift * 1.4);
        return broad * .055 + fine * .018
          + sin(p.x * 5.1 + p.y * 2.7 + broad * 3.0 - t * .65) * .009;
      }
    ` + o.fragmentShader, o.fragmentShader = o.fragmentShader.replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
      vec2 p = waterPosition.xz;
      float t = waterTime;
      float height = waterHeight(p, t);
      vec2 slope = vec2(waterHeight(p + vec2(.025, 0), t) - height,
        waterHeight(p + vec2(0, .025), t) - height) / .025;
      vec3 rippleNormal = normalize(vec3(-slope.x, 1.0, -slope.y));
      normal = normalize(normal + mat3(viewMatrix) * (rippleNormal - vec3(0.0, 1.0, 0.0)));
    `), o.fragmentShader = o.fragmentShader.replace("#include <clearcoat_normal_fragment_begin>", `#include <clearcoat_normal_fragment_begin>
#ifdef USE_CLEARCOAT
clearcoatNormal = normal;
#endif`), o.fragmentShader = o.fragmentShader.replace("#include <opaque_fragment>", `
      float waterFresnel = .025 + .35 * pow(1.0 - max(dot(normal, normalize(vViewPosition)), 0.0), 4.0);
      vec3 waterReflection = inverseTransformDirection(reflect(-normalize(vViewPosition), normal), viewMatrix);
      vec3 waterSky = mix(vec3(.23, .32, .35), vec3(.58, .69, .75), smoothstep(-.15, .85, waterReflection.y));
      outgoingLight = mix(outgoingLight, waterSky, waterFresnel);
      #include <opaque_fragment>
    `)
    }, s.customProgramCacheKey = () => "pond-water-v2";
    const n = new K(new k9(1, 1), s);
    n.rotation.x = -Math.PI / 2, n.position.y = .25, n.userData.token = "c", n.userData.waterSurface = !0, n.receiveShadow = !0, e.add(n);
    for (let o = 0; o < 3; o++) {
        const a = new E0;
        a.userData.fish = o;
        const l = new Ie({
                color: ["#e69a42", "#f4e9d4", "#db633d"][o],
                roughness: .4
            }),
            A = new K(new u9(1, 12, 8), l);
        A.scale.set(.035, .022, .085), a.add(A);
        const c = new K(new ni(.04, .07, 3), l);
        c.rotation.x = -Math.PI / 2, c.position.z = -.09, c.scale.y = .7, c.name = "tail", a.add(c);
        for (const u of [-1, 1]) {
            const d = new K(new u9(1, 8, 4), l);
            d.scale.set(.035, .004, .022), d.position.set(u * .03, 0, .005), d.rotation.y = u * .6, a.add(d);
            const g = new K(new u9(.006, 6, 4), new Ye({
                color: "#1a2224"
            }));
            g.position.set(u * .022, .014, .05), a.add(g)
        }
        const h = new E0;
        h.name = "swimmer", h.add(...a.children), a.add(h), a.traverse(u => {
            u.userData.nohit = !0
        }), e.add(a)
    }
    return k4(e, 0), e
}

