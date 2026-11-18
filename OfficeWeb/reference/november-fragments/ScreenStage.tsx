import InkPicker from './InkPicker';\
import ScreenAnnotationTools from './ScreenAnnotationTools';\
  const zoom = useScreenZoom(host, enlarged && !annotating, stream);\
  const zoom = useScreenZoom(host, enlarged, stream);\
    {props.clearsOwnBoard && <div className="screen-stage-own-clear">\
    {props.clearsOwnBoard && !enlarged && <div className="screen-stage-own-clear">\
    {enlarged && <div className="screen-stage-bar">\
    {enlarged && <div className="screen-stage-bar screen-stage-pill">\
      {canAnnotate && <button type="button" aria-pressed={annotating} title="在共享的屏幕上标注"\
        onClick={() => { setAnnotating(!annotating); drawing.current = false; }}>标注</button>}\
      {canAnnotate && annotating && <>\
\
        <InkPicker value={ink} onPick={setInk} />\
        <button type="button" title="撤销我画的最后一笔" onClick={() => { dropEcho(); props.onUndo(scope); }}>撤销</button>\
        <button type="button" title="清掉所有人的标注" onClick={clearBoard}>清空</button>\
      </>}\
      <ScreenAnnotationTools enabled={canAnnotate} own={props.clearsOwnBoard} active={annotating} color={ink}\
        onToggle={() => { setAnnotating(!annotating); drawing.current = false; }} onColor={setInk}\
        onUndo={() => { dropEcho(); props.onUndo(scope); }} onClear={clearBoard} />\
