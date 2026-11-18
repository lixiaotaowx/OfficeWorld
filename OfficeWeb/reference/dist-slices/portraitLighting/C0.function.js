function C0(s) {
    Qe._getMatrix(Ic, Qe.workingColorSpace, s);
    const e = `mat3( ${Ic.elements.map(t=>t.toFixed(4))} )`;
    switch (Qe.getTransfer(s)) {
        case Ar:
            return [e, "LinearTransferOETF"];
        case ct:
            return [e, "sRGBTransferOETF"];
        default:
            return Ce("WebGLProgram: Unsupported color space: ", s), [e, "LinearTransferOETF"]
    }
}

