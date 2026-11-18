    const running = new Map<string, { stream: MediaStream; stop: () => void }>();\
    const wanted = new Set<string>();\
      if (id.startsWith('-')) { stop(id.slice(1)); return; }\
      if (id.startsWith('-')) { wanted.delete(id.slice(1)); stop(id.slice(1)); return; }\
      wanted.add(id);\
    // Remove encoders as soon as a stream ends or is replaced. Never stop the source tracks.\
    // Keep subscriptions across IPC/render races and replacement tracks. Never stop source tracks.\
        !value.stream.getVideoTracks().some(track => track.readyState === 'live')) stop(id);\
      for (const id of wanted) if (!running.has(id)) start(id);\
