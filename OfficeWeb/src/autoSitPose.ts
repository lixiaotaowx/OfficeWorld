import { SIT_POSE_LIST, type SitPoseId } from './sitPoses';

export class AutoSitPose {
  private remaining: number;
  constructor(private random: () => number = Math.random) {
    this.remaining = this.interval();
  }
  private interval() { return 45 + this.random() * 45; }
  update(dt: number, sitting: boolean, current: SitPoseId): SitPoseId | null {
    if (!sitting) return null;
    this.remaining -= dt;
    if (this.remaining > 0) return null;
    this.remaining = this.interval();
    const choices = SIT_POSE_LIST.filter(p => p.id !== current);
    return choices[Math.min(choices.length - 1, Math.floor(this.random() * choices.length))].id;
  }
}
