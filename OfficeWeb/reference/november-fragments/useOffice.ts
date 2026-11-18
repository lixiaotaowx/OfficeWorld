import type { CatState } from './hall/officeCat';\
import { createBilliardsClient } from './billiardsClient';\
  const socket = useRef<Socket>();\
  const billiards = useMemo(() => createBilliardsClient(socket), []);\
    s.on("office-cat", (state: CatState) => setCat(state));\
    s.on('billiards-state', billiards.receive);\
    cat, catSpeech,\
    billiards,\
