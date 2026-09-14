from pathlib import Path
p=Path('OfficeWeb/src/App.tsx');s=p.read_text(encoding='utf8')
s=s.replace('import NameDialog from "./NameDialog";', 'import type { Account } from "./AccountGate";')
s=s.replace('export default function App() {\n  const office = useOffice();','export default function App({ account, onLogout }: { account: Account; onLogout: () => void }) {\n  const office = useOffice(account);\n  const [focusSeat, setFocusSeat] = useState<{ seat: number; nonce: number } | null>(null);')
s=s.replace('  const [renameOpen, setRenameOpen] = useState(false);\n','')
s=s.replace('const needsName = office.name.trim() === "";', 'const needsName = false;')
s=s.replace('typeof localStorage !== "undefined"\n        ? localStorage.getItem("office-character")\n        : null,','account.character,')
s=s.replace('onClick={() => setRenameOpen(true)}','onClick={onLogout}').replace('                  改名','                  退出登录')
a=s.index('      {needsName && (');b=s.index('      {adminOpen && (',a);s=s[:a]+s[b:]
s=s.replace('              view={view}','              view={view}\n              focusSeat={focusSeat}')
s=s.replace('            onSelect={setSelected}\n            onOpenDesks={() => setView("desks")}', '            onSelect={(seat) => { setSelected(seat); setFocusSeat({ seat, nonce: Date.now() }); }}\n            onOpenDesks={() => {}}')
s=s.replace('本地协作已连接','协作已连接').replace('白模交互阶段 · 材质稍后接入','专属工位 · 安心协作').replace('（首次会提示证书不安全，点「继续访问」即可）。','。')
p.write_text(s,encoding='utf8')
p=Path('OfficeWeb/src/useOffice.ts');s=p.read_text(encoding='utf8')
a=s.index('/** Stable per-browser');b=s.index('export function useOffice()',a)
s=s[:a]+'import type { Account } from "./AccountGate";\n\n'+s[b:]
s=s.replace('export function useOffice()','export function useOffice(account: Account)')
a=s.index('  const [name, setName]');b=s.index('  const socket',a);s=s[:a]+'  const name = account.name;\n'+s[b:]
s=s.replace('        id: stableId(),\n        name: localStorage.getItem("office-name") || "",','        name: account.name,')
s=s.replace('character: resolveCharacterId(localStorage.getItem("office-character")),','character: resolveCharacterId(account.character),')
a=s.index('  /** Set (or change)');b=s.index('  /** Ask the server',a);s=s[:a]+s[b:]
s=s.replace('    rename,\n','')
s=s.replace('    s.on("disconnect", () => {','    s.on("connect_error", () => setNotice("连接失败或登录失效，请退出后重新登录"));\n    s.on("disconnect", (reason) => {')
s=s.replace('      setNotice("连接已断开，正在重连…");','      setNotice(reason === "io server disconnect" ? "此账号已在其他窗口登录或会话已失效，请重新登录" : "连接已断开，正在重连…");')
p.write_text(s,encoding='utf8')
for f in ['OfficeWeb/test/helpers.mjs','OfficeWeb/test/seats.test.mjs']:
 p=Path(f);s=p.read_text(encoding='utf8').replace('createOfficeServer({ statePath:', 'createOfficeServer({ authentication: false, statePath:');p.write_text(s,encoding='utf8')
p=Path('OfficeWeb/test/livekit.test.mjs');s=p.read_text(encoding='utf8').replace('createOfficeServer()', 'createOfficeServer({ authentication: false })');p.write_text(s,encoding='utf8')
