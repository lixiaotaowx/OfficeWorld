function ut(r) {
    var i, n, o;
    let e;
    try {
        e = new URL(r)
    } catch {
        return null
    }
    if (!["https:", "http:"].includes(e.protocol) || e.username || e.password || e.port) return null;
    const t = e.hostname.toLowerCase();
    if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(t) || t === "youtu.be") {
        const a = t === "youtu.be" ? (i = e.pathname.match(/^\/([\w-]{11})\/?$/)) == null ? void 0 : i[1] : e.pathname === "/watch" ? e.searchParams.get("v") : (n = e.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})\/?$/)) == null ? void 0 : n[1];
        return !a || !/^[\w-]{11}$/.test(a) ? {
            platform: "YouTube",
            message: "要用某一个 YouTube 视频的链接"
        } : {
            platform: "YouTube",
            embed: `https://www.youtube-nocookie.com/embed/${a}?autoplay=0`
        }
    }
    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(t)) {
        const a = (o = e.pathname.match(/^\/(?:video\/)?(\d{1,12})\/?$/)) == null ? void 0 : o[1];
        return a ? {
            platform: "Vimeo",
            embed: `https://player.vimeo.com/video/${a}?autoplay=0`
        } : {
            platform: "Vimeo",
            message: "要用某一个 Vimeo 视频的链接"
        }
    }
    return null
}
