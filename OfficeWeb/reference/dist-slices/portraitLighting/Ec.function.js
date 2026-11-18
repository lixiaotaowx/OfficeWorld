function Ec() {
    return Fs("PMREMCubemapToCubemap", {
        envMap: {
            value: null
        },
        flipEnvMap: {
            value: -1
        }
    }, `

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)
}

