function hn() {
    const s = Math.random() * 4294967295 | 0,
        e = Math.random() * 4294967295 | 0,
        t = Math.random() * 4294967295 | 0,
        n = Math.random() * 4294967295 | 0;
    return (zt[s & 255] + zt[s >> 8 & 255] + zt[s >> 16 & 255] + zt[s >> 24 & 255] + "-" + zt[e & 255] + zt[e >> 8 & 255] + "-" + zt[e >> 16 & 15 | 64] + zt[e >> 24 & 255] + "-" + zt[t & 63 | 128] + zt[t >> 8 & 255] + "-" + zt[t >> 16 & 255] + zt[t >> 24 & 255] + zt[n & 255] + zt[n >> 8 & 255] + zt[n >> 16 & 255] + zt[n >> 24 & 255]).toLowerCase()
}

