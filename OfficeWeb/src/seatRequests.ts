import { workstationAt } from './seats';
// 工位相关的两个服务端请求：认领/放弃工位、管理员释放被永久占用的工位。
//
// 从 `useOffice.ts` 里搬出来的（那个文件已经贴着 500 行上限）。两者都只是"发一条消息、
// 等一个回执、把回执翻成人话"，和其它业务没有关系，放在这里更好读也更好测。
import type { Socket } from 'socket.io-client';

export function createSeatRequests(socket: { current?: Socket | undefined },
  notify: (message: string) => void) {
  return {
    /** Claim a workstation (or pass null to give it up). Resolves to success. */
    async claimSeat(seat: number | null) {
      const reply = await new Promise<{
        ok: boolean;
        seat?: number | null;
        error?: string;
      }>((resolve) => {
        const active = socket.current;
        if (!active) return resolve({ ok: false, error: "尚未连接" });
        active.timeout(6000).emit("seat", seat, (error: unknown, answer: never) => {
          if (error) resolve({ ok: false, error: "工位请求超时" });
          else resolve(answer ?? { ok: false, error: "工位请求失败" });
        });
      });
      notify(
        reply.ok
          ? seat === null
            ? "已离开工位"
            : `已占用 ${workstationAt(seat)?.label || `${seat+1} 号工位`}`
          : reply.error || "无法占用该工位",
      );
      return reply.ok;
    },
    /** Ask the server to free a permanently held desk (admin only). */
    async adminKick(seat: number, password: string) {
      return new Promise<{ ok: boolean; seat?: number; name?: string; error?: string }>((resolve) => {
        const active = socket.current;
        if (!active) return resolve({ ok: false, error: "尚未连接" });
        active.timeout(6000).emit("admin", { password, seat }, (error: unknown, answer: never) => {
          if (error) resolve({ ok: false, error: "管理请求超时" });
          else resolve(answer ?? { ok: false, error: "管理请求失败" });
        });
      });
    },
  };
}
