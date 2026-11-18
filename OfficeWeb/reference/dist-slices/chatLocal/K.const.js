const K = ["happy", "busy", "sleepy", "focused", "wave", "away"],
    H = [{
        id: "kraft",
        label: "原色",
        hex: "#d9a441"
    }, {
        id: "ink",
        label: "墨黑",
        hex: "#3a3a3e",
        accentHex: "#141416"
    }, {
        id: "snow",
        label: "雪白",
        hex: "#f2efe6",
        accentHex: "#43434a"
    }, {
        id: "sage",
        label: "鼠尾草绿",
        hex: "#9db08a"
    }, {
        id: "sky",
        label: "天蓝",
        hex: "#8fb6d9"
    }, {
        id: "mint",
        label: "薄荷",
        hex: "#8ed0b4"
    }, {
        id: "rose",
        label: "玫瑰",
        hex: "#e0a0a8"
    }, {
        id: "lilac",
        label: "丁香紫",
        hex: "#b3a3d9"
    }, {
        id: "navy",
        label: "藏青",
        hex: "#3f5680"
    }, {
        id: "rust",
        label: "陶土",
        hex: "#c1613f"
    }],
    b = new Map(H.map(e => [e.id, e])),
    y = {
        glasses: [{
            id: "none",
            label: "不戴",
            mesh: ""
        }, {
            id: "black",
            label: "黑框眼镜",
            mesh: "Glasses"
        }],
        beard: [{
            id: "none",
            label: "不留",
            mesh: ""
        }, {
            id: "mustache",
            label: "小胡子",
            mesh: "Beard_Mustache"
        }, {
            id: "goatee",
            label: "山羊胡",
            mesh: "Beard_Goatee"
        }, {
            id: "full",
            label: "络腮胡",
            mesh: "Beard_Full"
        }, {
            id: "longwhite",
            label: "白长须",
            mesh: "Beard_LongWhite"
        }, {
            id: "handlebar",
            label: "八字胡",
            mesh: "Beard_Handlebar"
        }, {
            id: "squared",
            label: "方胡子",
            mesh: "Beard_Squared"
        }],
        hair: [{
            id: "none",
            label: "光头",
            mesh: ""
        }, {
            id: "short",
            label: "短发",
            mesh: "Hair_Short"
        }, {
            id: "bangs",
            label: "刘海",
            mesh: "Hair_Bangs"
        }, {
            id: "afro",
            label: "爆炸头",
            mesh: "Hair_Afro"
        }, {
            id: "long",
            label: "长直发",
            mesh: "Hair_Long"
        }, {
            id: "bob",
            label: "波波头",
            mesh: "Hair_Bob"
        }, {
            id: "twintails",
            label: "双马尾",
            mesh: "Hair_TwinTails"
        }],
        hat: [{
            id: "none",
            label: "不戴",
            mesh: ""
        }, {
            id: "cap",
            label: "棒球帽",
            mesh: "Hat_Cap"
        }, {
            id: "tophat",
            label: "礼帽",
            mesh: "Hat_TopHat"
        }, {
            id: "beanie",
            label: "毛线帽",
            mesh: "Hat_Beanie"
        }, {
            id: "straw",
            label: "草帽",
            mesh: "Hat_Straw"
        }, {
            id: "party",
            label: "派对帽",
            mesh: "Hat_Party"
        }, {
            id: "beret",
            label: "贝雷帽",
            mesh: "Hat_Beret"
        }]
    },
    g = ["glasses", "hair", "beard", "hat"],
    X = {
        glasses: "眼镜",
        hair: "发型",
        beard: "胡子",
        hat: "帽子"
    },
    A = {
        color: "kraft",
        accessories: {
            glasses: "none",
            beard: "none",
            hair: "none",
            hat: "none"
        }
    };

