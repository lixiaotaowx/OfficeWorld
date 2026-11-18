import type { BuildColorTarget } from './buildColorTarget';\
import { BuildCinemaScreens } from './BuildCinemaScreens';\
export class BuildInteraction {\
  private cinema:BuildCinemaScreens;\
    this.chestPeople=new BuildChestPeople(world);\
    this.cinema=new BuildCinemaScreens(camera);\
    this.chestPeople=new BuildChestPeople(world);\
    this.chestUnread.sync(parts,this.objects);\
    this.cinema.sync(parts,this.objects);\
        : hovered?.kind === 'chest' ? '点击打开宝箱'\
        : hovered?.kind === 'cinema-screen' ? '点击设置影院屏幕' : hovered?.kind === 'chest' ? '点击打开宝箱'\
      if (mode === 'explore' && part?.kind === 'chest') { this.options.open(part.id); return true; }\
      if (mode === 'explore' && part && ['chest','cinema-screen'].includes(part.kind)) { this.options.open(part.id); return true; }\
  dispose() {\
    this.cinema.dispose();\
