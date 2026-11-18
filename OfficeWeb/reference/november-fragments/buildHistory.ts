import type { BuildPart } from './buildTypes';\
import type {CinemaContent} from './cinemaTypes';\
type Result = { previous?: BuildPart; changed?: BuildPart;previousMany?:BuildPart[];changedMany?:BuildPart[] };\
type Result = { previous?: BuildPart; changed?: BuildPart;previousMany?:BuildPart[];changedMany?:BuildPart[];previousCinema?:CinemaContent };\
  if(command.action==='remove' && previous) return {action:'add',part:previous};\
  if(command.action==='remove' && previous) return {action:'add',part:previous,cinemaContent:result.previousCinema};\
