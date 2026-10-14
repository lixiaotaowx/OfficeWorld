// 任务栏头像条的外观与交互：一排头像、悬停出卡片、三个按钮各自发起对应的邀请、
// 没有预览的人显示"这是规则"的占位文案（用户 2026-09-17 的方案 B）。
//
//   node test/browser/dock.cjs     (run from OfficeWeb/)
const { chromium } = require("./playwright.cjs");
const { createServer } = require("vite");
const react = require("@vitejs/plugin-react");
const { resolve } = require("node:path");
const assert = require("node:assert/strict");

/** 「有人来看我了」推给舞台的外观：尺子角色的配色 + 配件。 */
const GREET_APPEARANCE = { color: "navy", accessories: { glasses: "black", hair: "short", beard: "none", hat: "none" } };

(async () => {
  const vite = await createServer({
    configFile: false, root: resolve("."), plugins: [react()],
    server: { host: "127.0.0.1", port: 0 },
  });
  await vite.listen();
  const port = vite.httpServer.address().port;
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const errors = [];
  try {
    // 窗口开高一点：来电气泡挂在角色**头顶**（画布上方 380px 处），矮窗口里它落在视口外面，
    // 点不到「接听」（真实小窗那时会自己长到 40 + 452 高）。头像条仍然贴在页面底边。
    const page = await browser.newPage({ viewport: { width: 520, height: 620 } });
    page.on("pageerror", (error) => errors.push(error.message));
    // 「有人来看我了」要真的把那个人的角色模型拉下来渲染（下面断言用）。
    const models = [];
    page.on("response", (response) => {
      if (/\/assets\/characters\/[^/]+\.glb(?:\?.*)?$/.test(response.url())) models.push(response.url());
    });
    // 深色底 + 透明窗口：截图里能看清"贴在任务栏上"的样子。
    await page.goto(`http://127.0.0.1:${port}/test/dock-harness.html`);
    await page.waitForFunction(() => document.querySelectorAll(".dock-avatar").length === 4, null, { timeout: 30000 });
    await page.waitForTimeout(200);

    const strip = await page.evaluate(() => ({
      avatars: [...document.querySelectorAll(".dock-avatar")].map(node => ({
        label: node.getAttribute("aria-label"),
        title: node.getAttribute("title"),
        here: node.classList.contains("here"),
        mine: node.classList.contains("mine"),
        sharing: Boolean(node.querySelector(".dock-sharing")),
        voice: Boolean(node.querySelector(".dock-voice")),
        unread: node.querySelector(".dock-unread")?.textContent || "",
        dot: node.querySelector(".dock-dot")?.className || "",
        size: Math.round(node.getBoundingClientRect().height),
        face: getComputedStyle(node).backgroundSize + " " + getComputedStyle(node).backgroundPosition,
        filter: getComputedStyle(node).filter,
        hasImage: getComputedStyle(node).backgroundImage !== "none",
      })),
      grip: Boolean(document.querySelector(".dock-grip")),
      empty: document.querySelector(".dock-empty")?.textContent || "",
      // 条子本身不能有底色（用户："黑背景太明显了"）
      background: getComputedStyle(document.querySelector(".dock")).backgroundColor,
      height: Math.round(document.querySelector(".dock").getBoundingClientRect().height),
    }));
    console.log("strip:", JSON.stringify(strip));
    assert.equal(strip.grip, true, "要有一个拖动把手");
    assert.equal(strip.background, "rgba(0, 0, 0, 0)", "条子自己不该有底色，只留头像");
    assert.equal(strip.height, 40, "条子高度跟着任务栏（夹具里 40）");
    assert.deepEqual(strip.avatars.map(a => a.label), ["我", "同事乙", "客户丙", "小李"],
      "自己在最左，其余按规则排（未接来电/未读优先）");
    assert.equal(strip.avatars[0].mine, true, "自己的头像要有区分标记");
    assert.equal(strip.avatars[1].mine, false);
    assert.equal(strip.avatars.find(a => a.label === "同事乙").sharing, true, "正在共享要有标记");
    // 通话中的话筒标记（用户 2026-09-23）：共享标记在左上、话筒在左下，两个可以同时在。
    assert.equal(strip.avatars.find(a => a.label === "同事乙").voice, true, "通话中要有话筒标记");
    assert.equal(strip.avatars.find(a => a.label === "客户丙").voice, false, "没通话的不许标");
    assert.equal(strip.avatars.find(a => a.label === "客户丙").unread, "3", "未读要有红点数字");
    assert.equal(strip.avatars.find(a => a.label === "小李").unread, "!", "未接来电优先显示 !");
    assert.match(strip.avatars.find(a => a.label === "客户丙").dot, /away/, "离座是红点");
    // 头像只取"头+肩"：用缩略图的背景裁切，不再整张全身照。
    const face = strip.avatars.find(a => a.label === "同事乙");
    assert.equal(face.hasImage, true, "头像用角色缩略图");
    assert.match(face.face, /100% 100%/, "头像图直接铺满（不再靠放大取头）：" + face.face);
    assert.equal(face.filter, "none", "头像保留角色配色，不再叠加改色滤镜");
    assert.equal(face.size, 40, "头像与 40px 任务栏等高");
    await page.screenshot({ path: resolve("../Build/dock-strip.png") });

    // 自己的卡片：只显示画面，不给"呼叫自己"的按钮。
    await page.locator('.dock-avatar[aria-label="我"]').hover();
    await page.waitForTimeout(400);
    const mineCard = await page.evaluate(() => {
      const card = document.querySelector(".dock-card");
      return card ? { name: card.querySelector(".dock-card-name")?.textContent,
        buttons: card.querySelectorAll(".dock-card-actions button").length } : null;
    });
    console.log("my card:", JSON.stringify(mineCard));
    assert.ok(mineCard, "自己的头像也要能弹出卡片");
    assert.equal(mineCard.buttons, 0, "自己的卡片上没有呼叫按钮");
    assert.match(mineCard.name, /我/, "卡片上写明这是我自己");
    await page.screenshot({ path: resolve("../Build/dock-self.png") });
    await page.mouse.move(10, 10);
    await page.waitForTimeout(400);

    // 悬停有预览的人：先要一帧，主进程回帧后卡片里出现图片。
    await page.locator('.dock-avatar[aria-label="同事乙"]').hover();
    await page.waitForFunction(() => window.__want.filter(id => id === 'p1').length >= 2);
    const want = await page.evaluate(() => window.__want.slice());
    assert.ok(want.includes("me"), "悬停自己要过帧：" + JSON.stringify(want));
    assert.equal(want.at(-1), "p1", "悬停谁就索取谁的最近一帧");
    assert.ok(want.filter(id => id === "p1").length >= 2,
      "悬停期间要反复要：只问一次的话，悬停早了就永远是一片白：" + JSON.stringify(want));
    assert.match(await page.locator(".dock-shot-empty").textContent(), /正在获取|暂时没有/);
    await page.evaluate(() => window.__pushPreview({ id: "p1", image:
      "data:image/svg+xml;base64," + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="135"><rect width="240" height="135" fill="#e9e6dd"/><rect x="20" y="20" width="200" height="95" fill="#c9d6c2"/><rect x="40" y="40" width="120" height="10" fill="#3b4a3d"/><rect x="40" y="60" width="160" height="10" fill="#6d7c70"/></svg>') }));
    await page.waitForSelector(".dock-shot img");
    const card = await page.evaluate(() => {
      const node = document.querySelector(".dock-card");
      return { text: node.textContent.replace(/\s+/g, " ").trim(),
        buttons: [...node.querySelectorAll(".dock-card-actions button")].map(b => b.getAttribute("title")),
        image: node.querySelector("img")?.getAttribute("alt") };
    });
    console.log("card:", JSON.stringify(card));
    assert.equal(card.image, "同事乙 的屏幕小图");
    assert.deepEqual(card.buttons, ["请求观看对方屏幕", "把我的屏幕分享给对方", "邀请语音通话"]);
    await page.screenshot({ path: resolve("../Build/dock-hover-card.png") });

    // 鼠标从头像挪到卡片上：卡片不能消失，而且要能点（用户报的问题）。
    const cardBox = await page.locator(".dock-card").boundingBox();
    assert.ok(cardBox.width <= 340 && cardBox.height + 19 <= 210,
      '预览卡片与尖角必须放进已安装客户端的窗口');
    await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
    await page.waitForTimeout(600);
    assert.equal(await page.locator(".dock-card").count(), 1, "鼠标移到卡片上时卡片必须还在");
    await page.locator(".dock-card-actions button").nth(2).click();
    assert.deepEqual(await page.evaluate(() => window.__actions.at(-1)), ["call", "p1"],
      "在卡片上直接点按钮要能生效");
    await page.evaluate(() => { window.__actions.length = 0; });

    // 三个按钮：各自发起对应的动作，并且带回这个人的 id。
    for (const [index, kind] of [[0, "watch"], [1, "share"], [2, "call"]]) {
      await page.locator('.dock-avatar[aria-label="同事乙"]').hover();
      await page.waitForSelector(".dock-card");
      await page.locator(".dock-card-actions button").nth(index).click();
      await page.waitForTimeout(80);
      const last = await page.evaluate(() => window.__actions.at(-1));
      assert.deepEqual(last, [kind, "p1"], `第 ${index + 1} 个按钮应该是 ${kind}`);
    }
    assert.deepEqual(await page.evaluate(() => window.__actions),
      [["watch", "p1"], ["share", "p1"], ["call", "p1"]], "三个按钮都点了，各走一次");

    // 访客：没有预览，必须说清是规则如此；名字后面要跟着离座时长。
    await page.locator('.dock-avatar[aria-label="客户丙"]').hover();
    await page.waitForTimeout(1100);
    const placeholder = await page.locator(".dock-shot-empty").textContent();
    console.log("visitor placeholder:", placeholder);
    assert.match(placeholder, /不广播屏幕预览/);
    const awayName = await page.locator(".dock-card-name").textContent();
    console.log("name line:", JSON.stringify(awayName));
    assert.match(awayName, /客户丙/);
    assert.match(awayName, /离座 6 分钟/, "名字后面要跟离座时长");
    // 在座/离座写成字、暗绿 / 暗红（用户 2026-09-18）
    const awayChip = await page.evaluate(() => {
      const node = document.querySelector(".dock-card-state");
      return { text: node.textContent, background: getComputedStyle(node).backgroundColor };
    });
    console.log("away chip:", JSON.stringify(awayChip));
    assert.equal(awayChip.text, "离座 6 分钟", "离座要写成字");
    assert.match(awayChip.background, /143, 58, 44/, "离座是暗红：" + awayChip.background);
    await page.locator('.dock-avatar[aria-label="同事乙"]').hover();
    await page.waitForFunction(() => document.querySelector('.dock-card-state')?.textContent === '在座');
    const hereChip = await page.evaluate(() => {
      const node = document.querySelector(".dock-card-state");
      return { text: node.textContent, background: getComputedStyle(node).backgroundColor };
    });
    console.log("here chip:", JSON.stringify(hereChip));
    assert.equal(hereChip.text, "在座", "在座也要写成字");
    assert.match(hereChip.background, /47, 107, 60/, "在座是暗绿：" + hereChip.background);
    await page.screenshot({ path: resolve("../Build/dock-no-preview.png") });

    // 离座的人照样要有画面：他最后那一张（用户 2026-09-18「不在的话用最后一张」）。
    await page.evaluate(() => {
      const people = window.__dockState.people.map(row =>
        row.id === "p2" ? { ...row, hasPreview: true, atDesk: false } : row);
      window.__pushState({ ...window.__dockState, people });
    });
    await page.locator('.dock-avatar[aria-label="客户丙"]').hover();
    await page.waitForTimeout(150);
    await page.evaluate(() => window.__pushPreview({ id: "p2", image:
      "data:image/svg+xml;base64," + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="135"><rect width="240" height="135" fill="#dfe6d8"/><rect x="30" y="30" width="150" height="80" fill="#8fa88c"/></svg>') }));
    await page.waitForSelector(".dock-shot img");
    assert.equal(await page.evaluate(() =>
      document.body.innerText.includes("不在电脑前")), false, "不许再出现「此人不在电脑前」");
    // 空帧（对方停采）不能把最后一张擦掉
    await page.evaluate(() => window.__pushPreview({ id: "p2", image: "" }));
    await page.waitForTimeout(150);
    assert.equal(await page.locator(".dock-shot img").count(), 1, "空帧不要把最后一张顶掉");
    console.log("away frame kept:", await page.evaluate(() =>
      document.querySelector(".dock-shot img").getAttribute("alt")));

    // 窗口收放：悬停卡片开着时报 expanded=true（主进程据此长高窗口），离开后收回，并且
    // 一直把条子的真实宽度报上去（窗口宽度要严格等于条子宽度，差一点就会盖住任务栏）。
    await page.locator('.dock-avatar[aria-label="同事乙"]').hover();
    await page.waitForSelector(".dock-card");
    await page.waitForTimeout(80);
    const layouts = await page.evaluate(() => window.__layouts.slice());
    console.log("layouts:", JSON.stringify(layouts.slice(-4)));
    assert.equal(layouts.at(-1).expanded, true, "卡片开着时要请主进程把窗口长高");
    const stripWidth = await page.evaluate(() =>
      Math.ceil(document.querySelector(".dock").getBoundingClientRect().width));
    assert.equal(layouts.at(-1).width, stripWidth, "报的宽度 = 条子实际宽度");
    assert.ok(stripWidth > 0);
    await page.mouse.move(30, 20);         // 透明区：离开头像条与卡片
    await page.waitForTimeout(600);
    assert.equal((await page.evaluate(() => window.__layouts.at(-1))).expanded, false,
      "离开后要把窗口收回成头像条本身");

    // 有人来看我了：头像蹦出来，他的角色站在条子上。
    // 用户 2026-09-20：「只是鼠标放上的话人物出现会小一倍，不用打招呼」——所以只是悬停
    // （peek）时画布小一半、不演动作；「当用三个方式打电话过来…用当前角色大小打招呼」
    // 那一档是 call，画布 320×380 并且真的演招手。
    await page.evaluate(appearance => window.__pushGreet({ id: "p1", name: "同事乙", appearance }),
      GREET_APPEARANCE);
    await page.waitForSelector(".dock-stage.peek canvas", { timeout: 20000 });
    await page.waitForTimeout(1500);        // 等模型加载 + 待机动作跑起来
    const peek = await page.evaluate(() => {
      const stage = document.querySelector(".dock-stage");
      const canvas = stage?.querySelector("canvas");
      const avatar = document.querySelector(".dock-avatar.greeting");
      return { stage: !!stage, label: stage?.getAttribute("aria-label") || "",
        byId: stage?.getAttribute("data-greeting") || "",
        mode: stage?.getAttribute("data-mode") || "",
        canvas: canvas ? [canvas.width, canvas.height] : null,
        box: canvas ? [Math.round(canvas.getBoundingClientRect().width),
          Math.round(canvas.getBoundingClientRect().height)] : null,
        clip: canvas?.__dockStage?.clip ?? null,
        motion: canvas?.__dockStage?.motion ?? 0,
        avatarGreeting: avatar?.getAttribute("data-greeting") || "",
        layout: window.__layouts.at(-1) };
    });
    console.log("peek greeting:", JSON.stringify(peek));
    assert.equal(peek.stage, true, "要出现舞台");
    assert.equal(peek.byId, "p1", "舞台属于来看我的那个人");
    assert.match(peek.label, /同事乙/, "无障碍标签要说清是谁来了");
    assert.equal(peek.mode, "peek", "只是鼠标停在头像上");
    assert.deepEqual(peek.canvas, [160, 190], "人物小一倍：画布只有大舞台的一半");
    assert.deepEqual(peek.box, [160, 190], "画在屏幕上的框也是小一半");
    assert.equal(peek.clip, "", "不用打招呼：不演动作，站着就好");
    assert.equal(peek.avatarGreeting, "1", "他那个头像要蹦出来");
    assert.equal(peek.layout.stageMode, "peek", "窗口据此只留一半地方");
    assert.ok(models.some(url => /characters\/ruler\.glb/.test(url)),
      "要真的把那个人的角色模型拉下来：" + JSON.stringify(models));
    const peekShot = await page.locator(".dock-stage").screenshot({ path: resolve("../Build/dock-greet-peek.png") });
    assert.ok(peekShot.length > 2000, "peek 舞台上应该真的画着一个人：" + peekShot.length);

    // 有人用三种方式打过来：还是那个人，但场合变成 call —— 换成大舞台并演招手。
    await page.evaluate(appearance => window.__pushGreet({ id: "p1", name: "同事乙", appearance, mode: "call" }),
      GREET_APPEARANCE);
    await page.waitForSelector(".dock-stage.call canvas", { timeout: 20000 });
    await page.waitForTimeout(1500);
    const call = await page.evaluate(() => {
      const stage = document.querySelector(".dock-stage");
      const canvas = stage?.querySelector("canvas");
      return { mode: stage?.getAttribute("data-mode") || "",
        canvas: canvas ? [canvas.width, canvas.height] : null,
        clip: canvas?.__dockStage?.clip ?? null,
        motion: canvas?.__dockStage?.motion ?? 0,
        frames: canvas?.__dockStage?.frames ?? 0,
        layout: window.__layouts.at(-1) };
    });
    console.log("call greeting:", JSON.stringify(call));
    assert.equal(call.mode, "call", "场合换成了打电话过来");
    assert.deepEqual(call.canvas, [320, 380], "用当前角色大小：画布够大才叫站在状态栏上很大");
    assert.equal(call.clip, "招手_Wave", "这一档要招手");
    assert.equal(call.layout.stageMode, "call", "窗口要长到放得下那个大角色");
    assert.ok(call.frames > 20, "舞台真的在出帧：" + call.frames);
    assert.ok(call.motion > 0.05, "招手真的在动（手腕位置的累计变化）：" + call.motion);
    const shot = await page.locator(".dock-stage").screenshot({ path: resolve("../Build/dock-greet.png") });
    assert.ok(shot.length > 4000, "舞台截图上应该真的画着一个人：" + shot.length);
    // 有人打电话过来：角色下面挂一条来电气泡，写清是谁、怎么打过来的，并直接给接听/拒绝
    // （用户 2026-09-21：「通话请求时，需要在人物上加上是谁来电，再加一个接听的按钮」）。
    await page.evaluate(appearance => window.__pushGreet({ id: "p1", name: "同事乙", appearance,
      mode: "call", requestId: "inv-9", kind: "voice" }), GREET_APPEARANCE);
    await page.waitForSelector(".dock-call");
    await page.waitForTimeout(150);
    const bar = await page.evaluate(() => {
      const node = document.querySelector(".dock-call");
      const stage = document.querySelector(".dock-stage").getBoundingClientRect();
      const rect = node.getBoundingClientRect();
      const strip = document.querySelector(".dock").getBoundingClientRect();
      return { text: node.textContent.replace(/\s+/g, " ").trim(),
        buttons: [...node.querySelectorAll(".dock-call-actions button")].map(b => b.textContent.trim()),
        // 气泡底边离头像条上边缘有多远（= 角色那一格的高度：站在条子上的人有多高）
        aboveStrip: Math.round(strip.top - rect.bottom),
        // 气泡底边和角色画布上边缘之间只该有 0：气泡正挂在头顶
        barToStage: Math.round(rect.bottom - stage.top),
        // 气泡中心 vs 角色中心：人物站在画布正中，气泡要挂在他头顶而不是偏一边
        centerOff: Math.round((rect.left + rect.right) / 2 - (stage.left + stage.right) / 2),
        stageClass: document.querySelector(".dock-stage").className,
        layout: window.__layouts.at(-1) };
    });
    console.log("call bar:", JSON.stringify(bar));
    assert.match(bar.text, /同事乙 来电 · 语音通话/, "气泡上要写清是谁、怎么打过来的");
    assert.deepEqual(bar.buttons, ["拒绝", "接听"], "两个按钮：拒绝 + 接听");
    // 用户 2026-09-21 纠正：「我是说打招呼的人站在状态栏上的人物头顶」——气泡在角色**上面**。
    assert.ok(Math.abs(bar.barToStage) <= 1, "气泡挂在角色头顶（画布上边缘）：" + bar.barToStage);
    assert.equal(bar.aboveStrip, 380, "气泡底边离头像条的高度 = 角色那一格：" + bar.aboveStrip);
    assert.ok(Math.abs(bar.centerOff) <= 1, "气泡对准人物头顶正中：" + bar.centerOff);
    assert.ok(!/over-call/.test(bar.stageClass), "角色不再给下面的气泡让位：" + bar.stageClass);
    assert.equal(bar.layout.stagePx, 380 + 62 + 10, "窗口高度要把气泡算进去，不然会被裁");
    await page.screenshot({ path: resolve("../Build/dock-call.png") });
    // 点「接听」：把这一通交给主窗口去应答（浏览器里是假桥，只记下来），气泡随即收起。
    await page.locator(".dock-call-answer").click();
    assert.deepEqual(await page.evaluate(() => window.__answers.at(-1)), ["inv-9", true]);
    assert.equal(await page.evaluate(() => !!document.querySelector(".dock-call")), false, "接听完气泡收起");
    // 「拒绝」走同一条路，文案跟着邀请的种类变。
    await page.evaluate(appearance => window.__pushGreet({ id: "p1", name: "同事乙", appearance,
      mode: "call", requestId: "inv-10", kind: "screen", offer: false }), GREET_APPEARANCE);
    await page.waitForSelector(".dock-call");
    assert.match(await page.locator(".dock-call-text").textContent(), /想看你的屏幕/);
    await page.locator(".dock-call-decline").click();
    assert.deepEqual(await page.evaluate(() => window.__answers.at(-1)), ["inv-10", false]);
    assert.equal(await page.evaluate(() => !!document.querySelector(".dock-call")), false);

    // 心跳停了（GREET_MS 之后）舞台自己收掉，头像条回到原样。
    await page.waitForTimeout(3200);
    assert.equal(await page.evaluate(() => !!document.querySelector(".dock-stage")), false,
      "没人再看就把舞台收起来");
    assert.equal(await page.evaluate(() => !!document.querySelector(".dock-avatar.greeting")), false);

    // 卡片往哪边画（用户 2026-09-20：「小窗口出现的方向多变一下」+「出现大窗口时头像会
    // 自适应位移，需要锁定」）：主进程说这一侧是右边（Win11 条子在屏幕最左端）时，头像条要
    // 钉在窗口左边、卡片也左对齐——这样窗口往右长时条子一个像素都不会动。
    await page.mouse.move(30, 200);
    await page.waitForTimeout(400);
    await page.evaluate(() => window.__pushState({ ...window.__dockState, popup: "right" }));
    await page.waitForTimeout(150);
    const right = await page.evaluate(() => {
      const strip = document.querySelector(".dock");
      return { cls: strip.className, left: Math.round(strip.getBoundingClientRect().left) };
    });
    console.log("popup-right strip:", JSON.stringify(right));
    assert.match(right.cls, /popup-right/, "主进程说往右画时要带上这个类");
    assert.equal(right.left, 0, "条子钉在窗口左边（老样子是右对齐）");
    await page.locator('.dock-avatar[aria-label="同事乙"]').hover();
    await page.waitForSelector(".dock-card");
    await page.waitForTimeout(150);
    const popup = await page.evaluate(() => {
      const strip = document.querySelector(".dock").getBoundingClientRect();
      const card = document.querySelector(".dock-card").getBoundingClientRect();
      return { gap: Math.round(card.left - strip.left), cardLeft: Math.round(card.left) };
    });
    console.log("popup-right card:", JSON.stringify(popup));
    assert.ok(Math.abs(popup.gap) <= 2, "卡片左对齐条子左边，不会被窗口边界裁掉：" + JSON.stringify(popup));
    await page.screenshot({ path: resolve("../Build/dock-popup-right.png") });
    // 说回左边（Win10 贴托盘）时立刻恢复老样子。
    await page.evaluate(() => window.__pushState({ ...window.__dockState, popup: "left" }));
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => document.querySelector(".dock").className.includes("popup-right")),
      false, "换回左边就不要那个类了");

    // 头像外面那圈框（用户 2026-09-20）：「把所有的头像整体框起来，像是同一个系统内感觉，
    // 有个大的圆角框，另外要根据当前状态栏的颜色去适配」。
    await page.mouse.move(30, 200);
    await page.waitForTimeout(400);
    const readFrame = () => page.evaluate(() => {
      const node = document.querySelector(".dock-frame");
      const style = getComputedStyle(node);
      const box = node.getBoundingClientRect();
      const avatars = [...document.querySelectorAll(".dock-frame .dock-avatar")]
        .map(avatar => avatar.getBoundingClientRect());
      // 两端是纯半圆（灵动岛那种）：圆心的横坐标 = 框高的一半，头像最外侧的角必须落在
      // 内圈里，否则方角会戳出弧线、把边框切断。
      const radius = box.height / 2;
      const cornerInside = (x, y) => x >= radius ||
        Math.hypot(x - radius, y - radius) <= radius - 1 + 0.5;
      const first = avatars[0], last = avatars[avatars.length - 1];
      return { avatars: avatars.length,
        radius: parseFloat(style.borderTopLeftRadius),
        padding: parseFloat(style.paddingLeft),
        background: style.backgroundColor, border: style.borderTopColor,
        height: Math.round(box.height),
        stripHeight: Math.round(document.querySelector(".dock").getBoundingClientRect().height),
        theme: document.querySelector(".dock").getAttribute("data-theme"),
        // 框必须真的把头像都圈住：所有头像的矩形都落在框里面。
        wraps: avatars.every(avatar => {
          const f = box;
          return avatar.left >= f.left - 0.5 && avatar.right <= f.right + 0.5;
        }),
        capsClear: first && last
          ? cornerInside(first.left - box.left, first.top - box.top) &&
            cornerInside(box.right - last.right, last.top - box.top)
          : false };
    });
    const framed = await readFrame();
    console.log("frame:", JSON.stringify(framed));
    assert.equal(framed.avatars, 4, "所有头像都在同一个框里");
    assert.equal(framed.wraps, true, "框要真的把每个头像圈住");
    assert.ok(framed.radius >= framed.height / 2 - 0.5,
      "两端要收到纯半圆（半径 ≥ 框高的一半）：" + framed.radius + " / 高 " + framed.height);
    assert.equal(framed.capsClear, true, "最边上的头像方角不能戳出半圆：" + framed.padding + "px 留白");
    assert.ok(framed.padding >= 8, "两侧留白要够：" + framed.padding);
    assert.ok(framed.height < framed.stripHeight, "框不能比任务栏还高，否则会被窗口裁掉");
    assert.equal(framed.theme, "dark", "没说就是深色任务栏（默认那套）");
    assert.match(framed.background, /255, 255, 255/, "深色任务栏 → 白色浮层：" + framed.background);
    assert.match(framed.border, /255, 255, 255/, "边框同色系：" + framed.border);
    await page.screenshot({ path: resolve("../Build/dock-frame-dark.png") });

    // 系统切成浅色：框立刻变黑色浮层。
    await page.evaluate(() => window.__pushState({ ...window.__dockState,
      theme: { light: true, transparent: true } }));
    await page.waitForTimeout(150);
    const lightFrame = await readFrame();
    console.log("light frame:", JSON.stringify(lightFrame));
    assert.equal(lightFrame.theme, "light");
    assert.match(lightFrame.background, /0, 0, 0/, "浅色任务栏 → 黑色浮层：" + lightFrame.background);
    await page.screenshot({ path: resolve("../Build/dock-frame-light.png") });

    // 任务栏被"强调色"着色（Win 设置里勾了那个开关）：边框跟强调色走。
    await page.evaluate(() => window.__pushState({ ...window.__dockState,
      theme: { light: false, tinted: true, accent: "#0078d7", transparent: true } }));
    await page.waitForTimeout(150);
    const tinted = await readFrame();
    console.log("tinted frame:", JSON.stringify(tinted));
    assert.match(tinted.border, /0, 120, 215/, "强调色边框：" + tinted.border);
    await page.screenshot({ path: resolve("../Build/dock-frame-accent.png") });
    await page.evaluate(() => window.__pushState({ ...window.__dockState }));

    // 短暂掉线（休眠、切网、服务器重启）：主窗口会先推一份空名单，几秒后才推回真的。
    // 小窗要**保留上一次的头像**，别整排消失再冒出来（用户 2026-09-20：「有时候头像会消失闪烁」）。
    await page.evaluate(() => window.__pushState({ ...window.__dockState, people: [], connected: false }));
    await page.waitForTimeout(150);
    assert.equal(await page.locator(".dock-avatar").count(), 4, "掉线期间头像留着，不许整排闪掉");
    // 连着的时候服务器说没人了就是没人了。
    await page.evaluate(() => window.__pushState({ ...window.__dockState, people: [], connected: true }));
    await page.waitForTimeout(150);
    assert.equal(await page.locator(".dock-avatar").count(), 0, "连着时以服务器为准");
    await page.evaluate(() => window.__pushState({ ...window.__dockState }));

    // 头像顺序要**粘住**（用户 2026-09-21：「状态栏的头像位置尽量不要频繁的切换顺序，不然本来
    // 鼠标看着一个人闪烁到另一个人了」）：主窗口重排名次后，指针停在条子上时一个都不许挪。
    const orderNow = () => page.evaluate(() =>
      [...document.querySelectorAll(".dock-avatar")].map(node => node.getAttribute("aria-label")));
    const shuffled = () => page.evaluate(() => window.__pushState({ ...window.__dockState, people: [
      window.__dockState.people[0], window.__dockState.people[3],
      window.__dockState.people[2], window.__dockState.people[1]] }));
    await page.mouse.move(400, 600);           // 停在条子上（视口 520×620，条子贴在底边）
    await page.waitForTimeout(200);
    await shuffled();
    await page.waitForTimeout(300);
    assert.deepEqual(await orderNow(), ["我", "同事乙", "客户丙", "小李"],
      "指针在条子上时，名次变了也不许挪位置：" + JSON.stringify(await orderNow()));
    // 指针移开也要稳住 2 秒（`ORDER_SETTLE_MS`）才换，抖一下的排名不会落地。
    await page.mouse.move(20, 20);
    await page.waitForTimeout(2600);
    assert.deepEqual(await orderNow(), ["我", "小李", "客户丙", "同事乙"],
      "稳定之后才换过来：" + JSON.stringify(await orderNow()));
    await page.evaluate(() => window.__pushState({ ...window.__dockState }));

    // 没有人在线：给一句人话，而不是一条空条。
    await page.evaluate(() => window.__pushState({ people: [], sharing: false, missed: 0, hidden: false }));
    await page.waitForTimeout(120);
    assert.match(await page.locator(".dock-empty").textContent(), /没有其他人在线/);

    // 共享屏幕时整条隐藏。
    await page.evaluate(() => window.__pushState({ people: [], sharing: true, missed: 0, hidden: true }));
    await page.waitForTimeout(120);
    assert.equal(await page.evaluate(() => document.querySelectorAll(".dock").length), 0, "隐藏时整条不渲染");

    // Emulate the installed bridge: only its existing character string survives.
    await page.evaluate(() => window.__pushState({ people: [{ id:'portrait', name:'配件头像',
      character:'look:'+JSON.stringify({color:'navy',accessories:{hat:'tophat',hair:'none',beard:'none',glasses:'black'}}),
      atDesk:true, unread:0 }], sharing:false, missed:0, hidden:false }));
    await page.waitForFunction(() => document.querySelector('.dock-avatar')?.style.backgroundImage.includes('data:image/png'));
    await page.screenshot({ path: resolve('../Build/dock-outfit-portrait.png') });
    assert.deepEqual(errors, []);
    console.log("PASS 头像条：一排头像、悬停缩略图、三个按钮、占位文案、空/隐藏状态");
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });




