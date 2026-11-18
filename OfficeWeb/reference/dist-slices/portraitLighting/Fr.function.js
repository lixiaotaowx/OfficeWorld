function Fr(s) {
    switch (s.constructor) {
        case Uint32Array:
            return 4294967295;
        case Uint16Array:
            return 65535;
        case Uint8Array:
        case Uint8ClampedArray:
            return 255;
        case Int32Array:
            return 2147483647;
        case Int16Array:
            return 32767;
        case Int8Array:
            return 127;
        default:
            return
    }
}

