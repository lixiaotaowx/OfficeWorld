function sp(s) {
    switch (s.toLowerCase()) {
        case "scalar":
        case "double":
        case "float":
        case "number":
        case "integer":
            return Ps;
        case "vector":
        case "vector2":
        case "vector3":
        case "vector4":
            return Pr;
        case "color":
            return $h;
        case "quaternion":
            return Is;
        case "bool":
        case "boolean":
            return Ki;
        case "string":
            return Ji
    }
    throw new Error("THREE.KeyframeTrack: Unsupported typeName: " + s)
}

