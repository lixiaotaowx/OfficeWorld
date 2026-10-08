import type { BuildPart } from './buildTypes';

type Command = Record<string, unknown>;
type Result = { previous?: BuildPart; changed?: BuildPart;previousMany?:BuildPart[];changedMany?:BuildPart[] };
export type HistoryMode = 'normal' | 'undo' | 'redo';

function inverse(command: Command, result: Result): Command | undefined {
  const {previous,changed}=result;
  if(command.action==='moveMany' && result.previousMany && result.changedMany)
    return {action:'moveMany',items:result.previousMany.map(part=>({action:'move',id:part.id,
      version:result.changedMany!.find(p=>p.id===part.id)!.version,part}))};
  if(['add','duplicate'].includes(String(command.action)) && changed) return {action:'remove',id:changed.id,version:changed.version};
  if(command.action==='remove' && previous) return {action:'add',part:previous};
  if(command.action==='move' && changed && previous)
    return {action:'move',id:changed.id,version:changed.version,part:previous};
}

/** Only advance history after server success. Never rebase across a colleague's edit. */
export class BuildHistory {
  private undoRows: Command[]=[];
  private redoRows: Command[]=[];
  get counts() { return {undoCount:this.undoRows.length,redoCount:this.redoRows.length}; }
  peek(mode: 'undo'|'redo') { return (mode==='undo'?this.undoRows:this.redoRows).at(-1); }
  accept(command: Command, result: Result, mode: HistoryMode='normal') {
    const reverse=inverse(command,result);
    if(!reverse) return;
    if(mode==='undo') this.undoRows.pop();
    if(mode==='redo') this.redoRows.pop();
    const before=result.previous || (command.action==='add' && mode!=='normal'?command.part as BuildPart:undefined);
    const after=result.changed;
    const pairs=result.previousMany?.map(p=>[p,result.changedMany?.find(n=>n.id===p.id)] as const) || [[before,after] as const];
    for(const [before,after] of pairs) if(before?.id && after) {
      const rows=[...this.undoRows,...this.redoRows];
      for(const row of [...rows,...rows.flatMap(row=>Array.isArray(row.items)?row.items as Command[]:[])]) {
        if(row.id===before.id && row.version===before.version) {
          row.id=after.id;row.version=after.version;
        }
        const p=row.part as BuildPart|undefined;
        if(p?.id===before.id) row.part={...p,id:after.id};
      }
    }
    if(mode==='undo') this.redoRows.push(reverse);
    else {
      this.undoRows.push(reverse);
      this.undoRows=this.undoRows.slice(-30);
      if(mode==='normal') this.redoRows=[];
    }
  }
}
