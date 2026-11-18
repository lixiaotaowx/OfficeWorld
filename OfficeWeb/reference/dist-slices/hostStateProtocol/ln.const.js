const ln = typeof ArrayBuffer == "function",
    un = n => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(n) : n.buffer instanceof ArrayBuffer,
    Ye = Object.prototype.toString,
    dn = typeof Blob == "function" || typeof Blob < "u" && Ye.call(Blob) === "[object BlobConstructor]",
    pn = typeof File == "function" || typeof File < "u" && Ye.call(File) === "[object FileConstructor]";

