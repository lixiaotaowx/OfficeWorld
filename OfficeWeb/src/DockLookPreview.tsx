import { EXPRESSION_IDS, type Appearance, type AvatarExpression } from './look';
import { useDockPortrait } from './useDockPortrait';
import { EXPRESSION_LABELS } from './expressionPortrait';
import './dock-look-preview.css';

/** Read-only examples of the same outfit and shared poses used in the dock. */
export default function DockLookPreview({ value }: { value: Appearance }) {
  return <section className="dock-look-preview" aria-label="状态栏头像预览">
    <h3>状态栏头像</h3>
    <p>与场景共用配饰，表情自动同步给所有人。频繁操作时忙碌，离开满 5 分钟困倦，在线超过 10 分钟且在座时开心；通话或共享时专注。</p>
    <div className="dock-look-samples">
      {EXPRESSION_IDS.map(expression => <Sample key={expression} value={value} expression={expression} />)}
    </div>
  </section>;
}

function Sample({ value, expression }: { value: Appearance; expression: AvatarExpression }) {
  const image = useDockPortrait(value, value.color, { autoExpression: expression });
  return <figure><img src={image} alt={EXPRESSION_LABELS[expression]} draggable={false} />
    <figcaption>{EXPRESSION_LABELS[expression]}</figcaption></figure>;
}
