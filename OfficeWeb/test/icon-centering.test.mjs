// The header's top-right person chip and the bottom-bar identity chip are 34px
// circles whose icon / name initial must sit dead centre. The global `button`
// rule pads `10px 15px`; with `box-sizing: border-box` that left a 2px content
// box inside the 34px chip, so the 19px person icon could not be centred and
// spilled out of the right/bottom of the circle — the top-right icon looked
// crooked (user report 2026-09-15: "右上角的 svg 图标歪了"). The `.avatar` rule
// must keep resetting that padding.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

/** The declaration block of the first `selector { ... }` rule. */
function rule(selector) {
  const start = css.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `styles.css 里找不到 ${selector} 规则`);
  const end = css.indexOf("}", start);
  return css.slice(start, end);
}

test("头像圆片自己清掉按钮内边距，图标才能居中", () => {
  const avatar = rule(".avatar");
  assert.match(avatar, /display:\s*grid;/, ".avatar 必须继续用 grid 居中");
  assert.match(avatar, /place-items:\s*center;/, ".avatar 必须继续 place-items: center");
  assert.match(avatar, /padding:\s*0;/, ".avatar 必须把全局 button 的 10px 15px 内边距清零");
});

test("全局按钮内边距仍然存在，说明这条清零是必要的而不是多余的", () => {
  const button = rule("button");
  assert.match(button, /padding:\s*10px 15px;/, "全局 button 规则变了，请重新核对头像居中");
});
