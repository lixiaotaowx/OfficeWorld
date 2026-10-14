// The reference lounge translated into the world's square-edged box vocabulary.
export type PropBox = (size: number[], position: number[], color?: string, glow?: boolean) => unknown;
export function propFurniture(kind: string, b: PropBox) {
  const cream = '#f3dfc5', wood = '#c69770', ink = '#424b5b';
  switch (kind) {
    case 'lounge-seat':
      b([1.2,0.18,1.2],[0,0.09,0]);
      b([1.1,0.26,1.05],[0,0.31,0.035]);
      b([1.05,0.36,0.3],[0,0.58,-0.39]);
      for (const x of [-0.49,0.49]) b([0.16,0.18,0.85],[x,0.49,0.07]);
      b([0.73,0.045,0.63],[0,0.462,0.12],cream);
      break;
    case 'chaise':
      b([1.15,0.28,1.9],[0,0.14,0]);
      b([1.08,0.14,1.75],[0,0.35,0.02]);
      b([1.08,0.34,0.35],[0,0.57,-0.7]);
      b([0.76,0.16,0.32],[0,0.51,-0.38],cream);
      break;
    case 'ottoman':
      b([0.84,0.1,0.84],[0,0.05,0],wood);
      b([0.9,0.32,0.9],[0,0.26,0]);
      b([0.86,0.025,0.86],[0,0.4325,0],cream);
      break;
    case 'floor-cushion':
      b([0.95,0.13,0.75],[0,0.065,0]);
      b([0.85,0.04,0.65],[0,0.15,0]);
      for (const x of [-0.22,0.22]) b([0.035,0.008,0.035],[x,0.174,0],cream);
      break;
    case 'pillow':
      b([0.48,0.09,0.48],[0,0.045,0]);
      b([0.4,0.045,0.4],[0,0.1125,0]);
      b([0.05,0.012,0.05],[0,0.141,0],cream);
      break;
    case 'bolster':
      b([0.8,0.18,0.26],[0,0.09,0]);
      b([0.72,0.06,0.2],[0,0.21,0]);
      for (const x of [-0.385,0.385]) b([0.035,0.14,0.2],[x,0.105,0],cream);
      break;
    case 'rug':
      b([3,0.015,2],[0,0.0075,0]);
      b([2.8,0.008,1.8],[0,0.019,0],cream);
      for (const z of [-0.84,0.84]) b([2.65,0.006,0.025],[0,0.026,z]);
      for (let i=0;i<12;i++) for (const x of [-1.51,1.51])
        b([0.08,0.01,0.035],[x,0.005,-0.85+i*0.15],cream);
      break;
    case 'coffee-table':
      b([0.72,0.36,0.72],[0,0.18,0],cream);
      b([1.25,0.12,1.05],[0,0.42,0]);
      b([1.13,0.015,0.93],[0,0.4875,0],cream);
      break;
    case 'side-table':
      b([0.4,0.43,0.4],[0,0.215,0]);
      b([0.6,0.06,0.6],[0,0.46,0],cream);
      break;
    case 'media-console':
      b([3.8,0.38,0.5],[0,0.27,0]);
      for (const x of [-1.6,1.6]) b([0.16,0.08,0.35],[x,0.04,0],wood);
      b([3.6,0.25,0.025],[0,0.27,0.263],ink);
      for (let i=0;i<24;i++) b([0.065,0.25,0.035],[-1.725+i*0.15,0.27,0.285],wood);
      break;
    case 'wall-shelf':
      b([1.1,0.06,0.4],[0,0.15,0]);
      for (const x of [-0.38,0.38]) b([0.055,0.15,0.28],[x,0.075,-0.04],wood);
      break;
    case 'display-shelf':
      b([0.8,1.8,0.08],[0,0.9,-0.21]);
      for (const y of [0.04,0.6,1.17,1.76]) b([0.9,0.08,0.5],[0,y,0],cream);
      for (const x of [-0.4,0.4]) b([0.08,1.8,0.42],[x,0.9,0]);
      break;
    case 'storage-cube':
      for (const x of [-0.315,0.315]) b([0.07,0.7,0.65],[x,0.35,0]);
      for (const y of [0.035,0.665]) b([0.56,0.07,0.65],[0,y,0]);
      b([0.56,0.56,0.04],[0,0.35,-0.305],wood);
      break;
    case 'cinema-screen':
      b([4,2.35,0.18],[0,1.175,0],ink);
      (b([3.78,2.13,0.025],[0,1.175,0.1025],'#b9c9df') as {name:string}).name='cinema-display';
      // A quiet abstract landscape; the object is a model, not a video player.
      (b([3.78,0.4,0.01],[0,0.3,0.12],'#cabddd') as {name:string}).name='cinema-placeholder';
      (b([0.52,0.52,0.015],[1.05,1.72,0.12],'#ffe3a1') as {name:string}).name='cinema-placeholder';
      for (let i=0;i<5;i++) (b([0.5,0.2+i*0.15,0.015],[-1.3+i*0.5,0.6+i*0.075,0.125]) as {name:string}).name='cinema-placeholder';
      break;
    case 'speaker-tower':
    case 'speaker-small': {
      const small = kind==='speaker-small', height = small ? 0.42 : 1.12, width = small ? 0.28 : 0.42;
      b([width,height,0.32],[0,height/2,0]);
      for (const y of small ? [0.13,0.31] : [0.3,0.73]) {
        const size=small ? 0.14 : 0.25;
        b([size,size,0.018],[0,y,0.169],ink);
        b([size*0.52,size*0.52,0.014],[0,y,0.185],'#596679');
      }
      break;
    }
    case 'soundbar':
      b([1.15,0.13,0.18],[0,0.065,0]);
      for (let i=0;i<10;i++) b([0.055,0.075,0.008],[-0.48+i*0.105,0.065,0.094],'#727b86');
      b([0.025,0.014,0.01],[0.48,0.027,0.099],'#b4c5a0',true);
      break;
    case 'projector':
      b([0.48,0.18,0.36],[0,0.12,0]);
      for (const x of [-0.16,0.16]) b([0.06,0.03,0.22],[x,0.015,0],ink);
      b([0.14,0.14,0.035],[0.1,0.12,0.195],ink);
      b([0.09,0.09,0.02],[0.1,0.12,0.222],'#b9c9df',true);
      for (let i=0;i<4;i++) b([0.11,0.012,0.01],[-0.12,0.07+i*0.035,0.185],ink);
      break;
    case 'slat-panel':
      b([1.2,2.4,0.07],[0,1.2,-0.06],wood);
      for (let i=0;i<6;i++) b([0.12,2.4,0.12],[-0.5+i*0.2,1.2,0.035]);
      break;
    case 'railing':
      for (const x of [-0.95,0.95]) b([0.08,1.05,0.08],[x,0.525,0]);
      for (const y of [0.08,1.04]) b([2,0.07,0.09],[0,y,0]);
      for (let i=0;i<7;i++) b([0.04,0.9,0.04],[-0.75+i*0.25,0.55,0],cream);
      break;
    default: return false;
  }
  return true;
}
