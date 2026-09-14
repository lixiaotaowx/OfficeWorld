export interface MeetingMember {
  id: string; name: string; online: boolean;
  status: 'invited' | 'joined' | 'declined' | 'left' | 'removed';
}
export interface MeetingInfo {
  id: string; code: string; title: string; host: string; room: string;
  createdAt: number; members: MeetingMember[];
}
export interface MeetingState { active: MeetingInfo | null; invitations: MeetingInfo[] }
export interface MeetingAction {
  action: 'create' | 'accept' | 'decline' | 'invite' | 'leave' | 'end' | 'remove';
  id?: string; title?: string; invitees?: string[]; target?: string; microphone?: boolean;
}
