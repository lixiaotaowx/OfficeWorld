function U_(s, e, t, n, i, r) {
    const a = new Mn(e, t, {
        type: s,
        depthBuffer: i,
        stencilBuffer: r,
        samples: n ? 4 : 0,
        storeMultisampledDepthBuffer: !1,
        storeMultisampledStencilBuffer: !1,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1
    });
    let o = null,
        l = null,
        c = null;
    const h = new wt;
    h.setAttribute("position", new ut([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)), h.setAttribute("uv", new ut([0, 2, 0, 0, 2, 0], 2));
    const u = new qf({
            uniforms: {
                tDiffuse: {
                    value: null
                }
            },
            vertexShader: `
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,
            fragmentShader: `
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,
            depthTest: !1,
            depthWrite: !1
        }),
        d = new At(h, u),
        f = new Qo(-1, 1, 1, -1, 0, 1);
    let p = null,
        x = null,
        m = !1,
        g, M = null,
        E = [],
        v = !1;
    this.setSize = function(A, b) {
        a.setSize(A, b), o !== null && o.setSize(A, b), l !== null && l.setSize(A, b);
        for (let _ = 0; _ < E.length; _++) {
            const T = E[_];
            T.setSize && T.setSize(A, b)
        }
    }, this.setEffects = function(A) {
        E = A, v = E.length > 0 && E[0].isRenderPass === !0;
        const b = a.width,
            _ = a.height;
        E.length > 0 && o === null && (o = new Mn(b, _, {
            type: yn,
            depthBuffer: !1,
            stencilBuffer: !1
        }), l = new Mn(b, _, {
            type: yn,
            depthBuffer: !1,
            stencilBuffer: !1
        }));
        const T = i === !0 && E.some(I => I.needsDepthTexture === !0);
        T !== (a.depthTexture !== null) && (T === !0 && c === null && (c = new Vi(b, _), r === !0 && (c.format = Kn, c.type = ki)), a.dispose(), a.depthTexture = T ? c : null, a.resolveDepthBuffer = T, a.storeMultisampledDepthBuffer = T);
        for (let I = 0; I < E.length; I++) {
            const R = E[I];
            R.setSize && R.setSize(b, _), T && R.needsDepthTexture === !0 && R.setDepthTexture && R.setDepthTexture(c)
        }
    }, this.begin = function(A, b) {
        if (m || A.toneMapping === Un && E.length === 0) return !1;
        if (M = b, b !== null) {
            const _ = b.width,
                T = b.height;
            (a.width !== _ || a.height !== T) && this.setSize(_, T)
        }
        return v === !1 && A.setRenderTarget(a), g = A.toneMapping, A.toneMapping = Un, !0
    }, this.hasRenderPass = function() {
        return v
    }, this.end = function(A, b) {
        A.toneMapping = g, m = !0;
        let _ = a,
            T = o;
        for (let I = 0; I < E.length; I++) {
            const R = E[I];
            R.enabled !== !1 && (R.render(A, T, _, b), R.needsSwap !== !1 && (_ = T, T = T === o ? l : o))
        }
        if (p !== A.outputColorSpace || x !== A.toneMapping) {
            p = A.outputColorSpace, x = A.toneMapping, u.defines = {}, Qe.getTransfer(p) === ct && (u.defines.SRGB_TRANSFER = "");
            const I = D_[x];
            I && (u.defines[I] = ""), u.needsUpdate = !0
        }
        u.uniforms.tDiffuse.value = _.texture, A.setRenderTarget(M), A.render(d, f), M = null, m = !1
    }, this.isCompositing = function() {
        return m
    }, this.dispose = function() {
        a.dispose(), o !== null && o.dispose(), l !== null && l.dispose(), h.dispose(), u.dispose()
    }
}
