class t1 extends dt {
    constructor(e, t = 1, s, i) {
        super(), this.strength = t, this.radius = s, this.threshold = i, this.resolution = e !== void 0 ? new k0(e.x, e.y) : new k0(256, 256), this.clearColor = new be(0, 0, 0), this.needsSwap = !1, this.renderTargetsHorizontal = [], this.renderTargetsVertical = [], this.nMips = 5;
        let n = Math.round(this.resolution.x / 2),
            o = Math.round(this.resolution.y / 2);
        this.renderTargetBright = new We(n, o, {
            type: T0,
            depthBuffer: !1
        }), this.renderTargetBright.texture.name = "UnrealBloomPass.bright", this.renderTargetBright.texture.generateMipmaps = !1;
        for (let c = 0; c < this.nMips; c++) {
            const h = new We(n, o, {
                type: T0,
                depthBuffer: !1
            });
            h.texture.name = "UnrealBloomPass.h" + c, h.texture.generateMipmaps = !1, this.renderTargetsHorizontal.push(h);
            const u = new We(n, o, {
                type: T0,
                depthBuffer: !1
            });
            u.texture.name = "UnrealBloomPass.v" + c, u.texture.generateMipmaps = !1, this.renderTargetsVertical.push(u), n = Math.round(n / 2), o = Math.round(o / 2)
        }
        const a = k8;
        this.highPassUniforms = fe.clone(a.uniforms), this.highPassUniforms.luminosityThreshold.value = i, this.highPassUniforms.smoothWidth.value = .01, this.materialHighPassFilter = new Y0({
            uniforms: this.highPassUniforms,
            vertexShader: a.vertexShader,
            fragmentShader: a.fragmentShader
        }), this.separableBlurMaterials = [];
        const l = [6, 10, 14, 18, 22];
        n = Math.round(this.resolution.x / 2), o = Math.round(this.resolution.y / 2);
        for (let c = 0; c < this.nMips; c++) this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[c])), this.separableBlurMaterials[c].uniforms.invSize.value = new k0(1 / n, 1 / o), n = Math.round(n / 2), o = Math.round(o / 2);
        this.compositeMaterial = this._getCompositeMaterial(this.nMips), this.compositeMaterial.uniforms.blurTexture1.value = this.renderTargetsVertical[0].texture, this.compositeMaterial.uniforms.blurTexture2.value = this.renderTargetsVertical[1].texture, this.compositeMaterial.uniforms.blurTexture3.value = this.renderTargetsVertical[2].texture, this.compositeMaterial.uniforms.blurTexture4.value = this.renderTargetsVertical[3].texture, this.compositeMaterial.uniforms.blurTexture5.value = this.renderTargetsVertical[4].texture, this.compositeMaterial.uniforms.bloomStrength.value = t, this.compositeMaterial.uniforms.bloomRadius.value = .1;
        const A = [1, .8, .6, .4, .2];
        this.compositeMaterial.uniforms.bloomFactors.value = A, this.bloomTintColors = [new T(1, 1, 1), new T(1, 1, 1), new T(1, 1, 1), new T(1, 1, 1), new T(1, 1, 1)], this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, this.copyUniforms = fe.clone(Tt.uniforms), this.blendMaterial = new Y0({
            uniforms: this.copyUniforms,
            vertexShader: Tt.vertexShader,
            fragmentShader: Tt.fragmentShader,
            premultipliedAlpha: !0,
            blending: s3,
            depthTest: !1,
            depthWrite: !1,
            transparent: !0
        }), this._oldClearColor = new be, this._oldClearAlpha = 1, this._basic = new Ye, this._fsQuad = new L1(null)
    }
    dispose() {
        for (let e = 0; e < this.renderTargetsHorizontal.length; e++) this.renderTargetsHorizontal[e].dispose();
        for (let e = 0; e < this.renderTargetsVertical.length; e++) this.renderTargetsVertical[e].dispose();
        this.renderTargetBright.dispose();
        for (let e = 0; e < this.separableBlurMaterials.length; e++) this.separableBlurMaterials[e].dispose();
        this.compositeMaterial.dispose(), this.blendMaterial.dispose(), this._basic.dispose(), this._fsQuad.dispose()
    }
    setSize(e, t) {
        let s = Math.round(e / 2),
            i = Math.round(t / 2);
        this.renderTargetBright.setSize(s, i);
        for (let n = 0; n < this.nMips; n++) this.renderTargetsHorizontal[n].setSize(s, i), this.renderTargetsVertical[n].setSize(s, i), this.separableBlurMaterials[n].uniforms.invSize.value = new k0(1 / s, 1 / i), s = Math.round(s / 2), i = Math.round(i / 2)
    }
    render(e, t, s, i, n) {
        e.getClearColor(this._oldClearColor), this._oldClearAlpha = e.getClearAlpha();
        const o = e.autoClear;
        e.autoClear = !1, e.setClearColor(this.clearColor, 0), n && e.state.buffers.stencil.setTest(!1), this.renderToScreen && (this._fsQuad.material = this._basic, this._basic.map = s.texture, e.setRenderTarget(null), e.clear(), this._fsQuad.render(e)), this.highPassUniforms.tDiffuse.value = s.texture, this.highPassUniforms.luminosityThreshold.value = this.threshold, this._fsQuad.material = this.materialHighPassFilter, e.setRenderTarget(this.renderTargetBright), e.clear(), this._fsQuad.render(e);
        let a = this.renderTargetBright;
        for (let l = 0; l < this.nMips; l++) this._fsQuad.material = this.separableBlurMaterials[l], this.separableBlurMaterials[l].uniforms.colorTexture.value = a.texture, this.separableBlurMaterials[l].uniforms.direction.value = t1.BlurDirectionX, e.setRenderTarget(this.renderTargetsHorizontal[l]), e.clear(), this._fsQuad.render(e), this.separableBlurMaterials[l].uniforms.colorTexture.value = this.renderTargetsHorizontal[l].texture, this.separableBlurMaterials[l].uniforms.direction.value = t1.BlurDirectionY, e.setRenderTarget(this.renderTargetsVertical[l]), e.clear(), this._fsQuad.render(e), a = this.renderTargetsVertical[l];
        this._fsQuad.material = this.compositeMaterial, this.compositeMaterial.uniforms.bloomStrength.value = this.strength, this.compositeMaterial.uniforms.bloomRadius.value = this.radius, this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, e.setRenderTarget(this.renderTargetsHorizontal[0]), e.clear(), this._fsQuad.render(e), this._fsQuad.material = this.blendMaterial, this.copyUniforms.tDiffuse.value = this.renderTargetsHorizontal[0].texture, n && e.state.buffers.stencil.setTest(!0), this.renderToScreen ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(s), this._fsQuad.render(e)), e.setClearColor(this._oldClearColor, this._oldClearAlpha), e.autoClear = o
    }
    _getSeparableBlurMaterial(e) {
        const t = [],
            s = e / 3;
        for (let o = 0; o < e; o++) t.push(.39894 * Math.exp(-.5 * o * o / (s * s)) / s);
        const i = [],
            n = [];
        for (let o = 1; o < e; o += 2) {
            const a = t[o],
                l = o + 1 < e ? t[o + 1] : 0,
                A = a + l;
            i.push((o * a + (o + 1) * l) / A), n.push(A)
        }
        return new Y0({
            defines: {
                KERNEL_PAIRS: i.length
            },
            uniforms: {
                colorTexture: {
                    value: null
                },
                invSize: {
                    value: new k0(.5, .5)
                },
                direction: {
                    value: new k0(.5, .5)
                },
                centerWeight: {
                    value: t[0]
                },
                gaussianOffsets: {
                    value: i
                },
                gaussianWeights: {
                    value: n
                }
            },
            vertexShader: `

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,
            fragmentShader: `

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`
        })
    }
    _getCompositeMaterial(e) {
        return new Y0({
            defines: {
                NUM_MIPS: e
            },
            uniforms: {
                blurTexture1: {
                    value: null
                },
                blurTexture2: {
                    value: null
                },
                blurTexture3: {
                    value: null
                },
                blurTexture4: {
                    value: null
                },
                blurTexture5: {
                    value: null
                },
                bloomStrength: {
                    value: 1
                },
                bloomFactors: {
                    value: null
                },
                bloomTintColors: {
                    value: null
                },
                bloomRadius: {
                    value: 0
                }
            },
            vertexShader: `

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,
            fragmentShader: `

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`
        })
    }
}
t1.BlurDirectionX = new k0(1, 0);
t1.BlurDirectionY = new k0(0, 1);

