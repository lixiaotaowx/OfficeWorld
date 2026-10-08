// 登录后"还没捏过角色"时弹一次捏人面板（用户 2026-09-28）。
//
// 为什么单独一个组件：`App.tsx` 已经贴着 500 行上限，而且这块的规则很独立：
//   * 只对**从没捏过**的账号弹（服务端 `lookConfirmed` 记着；老账号第一次登录会补上）；
//   * 判据用 `account.lookConfirmed`，**不**看 `appearance` 是否为空——因为本机缓存
//     可能已经有外观，但账号里没有；
//   * 确认后就地消失，并把选择交给 `onAppearance` 存到账号里。
import { useEffect, useRef, useState } from "react";
import LookChooser from "./LookChooser";
import { resolveAppearance, type Appearance } from "./look";

interface Props {
  /** 账号信息；`lookConfirmed` 为假才弹。 */
  account: { lookConfirmed?: boolean };
  /** 当前外观（本机缓存里那份，面板打开时先显示它）。 */
  appearance: Appearance;
  /** 选好之后交给 App：写本机缓存 + 发服务端。 */
  onAppearance: (next: Appearance) => void;
}

export default function LookOnboarding({ account, appearance, onAppearance }: Props) {
  // 打开时先显示"当前这套"（本机缓存或默认），确认后原样提交也算"捏过了"。
  const [open, setOpen] = useState(() => account.lookConfirmed !== true);
  const [draft, setDraft] = useState<Appearance>(() => resolveAppearance(appearance));
  // 账号里明确说"捏过了"就不再弹（服务端返回之后可能才知道）。
  const confirmedRef = useRef(account.lookConfirmed === true);
  useEffect(() => {
    if (account.lookConfirmed === true) {
      confirmedRef.current = true;
      setOpen(false);
    }
  }, [account.lookConfirmed]);
  if (!open || confirmedRef.current) return null;
  return (
    <div className="seat-picker-hint" role="dialog" aria-label="设置我的角色">
      <strong>先捏一下你的角色</strong>
      <p>选个颜色，再挑眼镜、头发、胡子、帽子。以后想改就在「设置 → 我的角色」里改。</p>
      <LookChooser value={draft} onChange={setDraft} />
      <div className="hint-actions">
        <button
          className="primary"
          onClick={() => {
            confirmedRef.current = true;
            setOpen(false);
            onAppearance(resolveAppearance(draft));
          }}
        >
          就这样，进空间
        </button>
      </div>
    </div>
  );
}
