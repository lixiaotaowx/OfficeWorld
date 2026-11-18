class tl extends Mn {
    constructor(e = 1, t = {}) {
        super(e, e, t), this.isWebGLCubeRenderTarget = !0;
        const n = {
                width: e,
                height: e,
                depth: 1
            },
            i = [n, n, n, n, n, n];
        this.texture = new Ph(i), this._setTextureOptions(t), this.texture.isRenderTargetTexture = !0
    }
    fromEquirectangularTexture(e, t) {
        this.texture.type = t.type, this.texture.colorSpace = t.colorSpace, this.texture.generateMipmaps = t.generateMipmaps, this.texture.minFilter = t.minFilter, this.texture.magFilter = t.magFilter;
        const n = {
                uniforms: {
                    tEquirect: {
                        value: null
                    }
                },
                vertexShader: `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,
                fragmentShader: `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`
            },
            i = new qi(5, 5, 5),
            r = new fi({
                name: "CubemapFromEquirect",
                uniforms: Xi(n.uniforms),
                vertexShader: n.vertexShader,
                fragmentShader: n.fragmentShader,
                side: Wt,
                blending: Ui
            });
        r.uniforms.tEquirect.value = t;
        const a = new At(i, r),
            o = t.minFilter;
        return t.minFilter === vn && (t.minFilter = Ct), new So(1, 10, this).update(e, a), t.minFilter = o, a.geometry.dispose(), a.material.dispose(), this
    }
    clear(e, t = !0, n = !0, i = !0) {
        const r = e.getRenderTarget();
        for (let a = 0; a < 6; a++) e.setRenderTarget(this, a), e.clear(t, n, i);
        e.setRenderTarget(r)
    }
}
