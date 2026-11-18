type Undo = GroupUndo | { type: 'add' | 'remove'; id: string; fields: PartFields } | { type: 'move'; id: string; before: PartFields; after: PartFields };\
type CopyUndo = { type: 'copyMany'; id: string; items: { id: string; fields: PartFields; cinemaContent?: unknown }[] };\
type Undo = GroupUndo | CopyUndo | { type: 'add' | 'remove'; id: string; fields: PartFields } | { type: 'move'; id: string; before: PartFields; after: PartFields };\
  duplicate() {\
    if (this.savingGroup) return;\
    if (this.selection.multiple) {\
      const items = [...this.selection.ids].map(id => ({ id, version: this.version(id) }));\
      this.savingGroup = true; this.onChange();\
      void this.run(async () => {\
        const answer = await this.client.send({ action: 'duplicateMany', items });\
        if (!answer.created?.length) throw Error('整组复制失败');\
        const copies = answer.created.map(({ part, cinemaContent }) => ({ id: part.id, fields: fieldsOf(part), cinemaContent }));\
        this.undo.push({ type: 'copyMany', id: copies[0].id, items: copies }); this.redo.length = 0;\
        this.deselect(); for (const copy of copies) this.select(copy.id, true);\
        this.beginModal('grab');\
      }).finally(() => { this.savingGroup = false; this.onChange(); });\
      return;\
    }\
    if (this.onlySingle()) return;\
  private replay(u: Undo, back: boolean) {\
    if (u.type === 'copyMany') {\
      this.cancelModal(); this.savingGroup = true; this.onChange();\
      return this.run(async () => {\
        if (back) {\
          await this.client.send({ action: 'removeMany', items: u.items.map(i => ({ id: i.id, version: this.version(i.id) })) });\
        } else {\
          const answer = await this.client.send({ action: 'addMany', items: u.items.map(i => ({ part: i.fields, cinemaContent: i.cinemaContent })) });\
          if (answer.created?.length !== u.items.length) throw Error('整组恢复失败');\
          answer.created.forEach(({ part }, n) => { this.remap(u.items[n].id, part.id); u.items[n].id = part.id; });\
          u.id = u.items[0].id;\
          this.deselect(); for (const item of u.items) this.select(item.id, true);\
        }\
        (back ? this.redo : this.undo).push(u);\
      }, () => { (back ? this.undo : this.redo).push(u); }).finally(() => { this.savingGroup = false; this.onChange(); });\
    }\
