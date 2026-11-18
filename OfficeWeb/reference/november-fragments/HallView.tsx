import { HallScene, type TimeName } from './hall/HallScene';\
import { HallScene, type HallSnapshot, type TimeName } from './hall/HallScene';\
import { observeRenderVisibility } from './hall/renderIdle';\
type Office = ReturnType<typeof useOffice>;\
const HALL_HIBERNATE_MS = 5000;\
  const host = useRef<HTMLDivElement>(null);\
  const [hall, setHall] = useState<HallScene | null>(null);\
  const [awake, setAwake] = useState(true);\
  const sceneRef = useRef<HallScene | null>(null);\
  const sleepSnapshot = useRef<HallSnapshot | null>(null);\
  const restoring = useRef<{ scene: HallScene; snapshot: HallSnapshot; world: boolean; actor: boolean } | null>(null);\
  const isVisitor = me?.role === 'visitor';\
\
  // Only desktop clients reporting native visibility may discard the scene.\
  // Communication and the dock live in App and remain mounted.\
  useEffect(() => {\
    if (!window.officeDesktop?.mainWindowVisible || !window.officeDesktop?.onMainWindowVisibility) return;\
    let timer: ReturnType<typeof setTimeout> | undefined, visible = true;\
    const unsubscribe = observeRenderVisibility(document, window, next => {\
      visible = next; clearTimeout(timer);\
      if (next) { setAwake(true); return; }\
      timer = setTimeout(() => {\
        if (visible) return;\
        const snapshot = sceneRef.current?.snapshotForSleep();\
        if (!snapshot) return;\
        sleepSnapshot.current = snapshot; setAwake(false);\
      }, HALL_HIBERNATE_MS);\
    });\
    return () => { clearTimeout(timer); unsubscribe(); };\
  }, []);\
\
  function restoreSeat(entry: typeof restoring.current) {\
    if (!entry || !entry.world || !entry.actor || sceneRef.current !== entry.scene) return;\
    const spot = entry.snapshot.actor?.sittingSpot;\
    const current = latest.current.office.people.find(person => person.id === latest.current.office.myId);\
    if (spot && current?.sittingSpot === spot) entry.scene.sitMeAt(spot);\
  }\
  // the scene, once\
  // The communication session stays alive when only the 3D scene is discarded.\
  useEffect(() => {\
    if (!awake) { setHall(null); return; }\
    const scene = new HallScene(host.current!);\
    sceneRef.current = scene;\
    const snapshot = sleepSnapshot.current; sleepSnapshot.current = null;\
    if (snapshot) scene.restoreSleepSnapshot(snapshot);\
    const restore = snapshot ? { scene, snapshot, world: false, actor: !snapshot.actor } : null;\
    restoring.current = restore;\
    const client = new BuildClient(world => { scene.shellRemoval.sync(world.removedShell || []); scene.setParts(world.parts, world.models, world.revision); });\
    let stopped = false;\
    void client.load().then(() => { if (stopped) return; client.follow(); scene.attachBuild(client, () => latest.current.accountId); });\
    void client.load().then(() => { if (stopped) return; client.follow(); scene.attachBuild(client, () => latest.current.accountId);\
      if (restore) { restore.world = true; restoreSeat(restore); } });\
      const debugWindow=window as unknown as { __hall?: HallScene };\
      clearHallReference(debugWindow,scene);\
      if (sceneRef.current === scene) sceneRef.current = null;\
      if (restoring.current?.scene === scene) restoring.current = null;\
      scene.dispose();\
    };\
  }, []);\
  }, [awake]);\
    void hall.setMe(office.myId, appearance).then(() => {\
    const restore = restoring.current?.scene === hall ? restoring.current : null;\
    const saved = restore && !restore.actor ? restore.snapshot.actor : null;\
    void hall.setMe(office.myId, appearance, saved || undefined).then(actor => {\
      if (restore && saved && sceneRef.current === hall && !restore.actor) {\
        actor.holder.rotation.y = saved.rotation; restore.actor = true; restoreSeat(restore);\
      }\
  const sent = useRef(new Map<string, unknown>());\
  useEffect(() => { sent.current.clear(); }, [hall]);\
