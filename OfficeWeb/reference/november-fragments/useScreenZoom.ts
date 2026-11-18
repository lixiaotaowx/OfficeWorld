export function useScreenZoom(host: RefObject<HTMLDivElement>, enabled: boolean, stream: MediaStream) {\
export function useVideoZoom(host: RefObject<HTMLDivElement>, enabled: boolean, source: MediaStream | string) {\
  const [zoom, setZoom] = useState(1);\
  useEffect(() => { setZoom(1); }, [enabled, stream]);\
  useEffect(() => { setZoom(1); }, [enabled, source]);\
      if ((event.target as HTMLElement).closest('button, .screen-stage-bar')) return;\
      if (event.buttons || (event.target as HTMLElement).closest('button, .screen-stage-bar')) return;\
  }, [host, enabled, stream]);\
  return zoom;\
  }, [host, enabled, source]);\
  return [zoom, setZoom] as const;\
}\
\
export function useScreenZoom(host: RefObject<HTMLDivElement>, enabled: boolean, stream: MediaStream) {\
  return useVideoZoom(host, enabled, stream)[0];\
}\
