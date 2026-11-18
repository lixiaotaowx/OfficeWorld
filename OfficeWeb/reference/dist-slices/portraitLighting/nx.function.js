function nx() {
    const s = {};
    return {
        get: function(e) {
            if (s[e.id] !== void 0) return s[e.id];
            let t;
            switch (e.type) {
                case "SunLight":
                case "DirectionalLight":
                    t = {
                        direction: new N,
                        color: new Fe
                    };
                    break;
                case "SpotLight":
                    t = {
                        position: new N,
                        direction: new N,
                        color: new Fe,
                        distance: 0,
                        coneCos: 0,
                        penumbraCos: 0,
                        decay: 0
                    };
                    break;
                case "PointLight":
                    t = {
                        position: new N,
                        color: new Fe,
                        distance: 0,
                        decay: 0
                    };
                    break;
                case "HemisphereLight":
                    t = {
                        direction: new N,
                        skyColor: new Fe,
                        groundColor: new Fe
                    };
                    break;
                case "RectAreaLight":
                    t = {
                        color: new Fe,
                        position: new N,
                        halfWidth: new N,
                        halfHeight: new N
                    };
                    break
            }
            return s[e.id] = t, t
        }
    }
}

