import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { loadCharacter, releaseCharacter, setCharacterAppearance, type LoadedCharacter } from './characterModel';
import { appearanceKey, type Appearance } from './look';
import { accessoryCamera } from './portraitRenderer';
import { portraitLighting } from './portraitLighting';

/** One on-demand render surface; accessories use real geometry and depth testing. */
export default function LiveLookPreview({ value, face = false }: { value: Appearance; face?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(value);
  const redraw = useRef<() => void>(() => {});
  const [status, setStatus] = useState('正在加载角色…');
  const [attempt, setAttempt] = useState(0);
  latest.current = value;
  const faceRef = useRef(face);
  faceRef.current = face;
  useEffect(() => {
    const element = host.current!;
    let closed = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const fail = (error: unknown) => {
      if (closed) return;
      console.warn('Character preview failed', error);
      if (attempt < 2) {
        setStatus('正在重新加载角色…');
        retry = setTimeout(() => setAttempt(n => n + 1), 500 * (attempt + 1));
      } else setStatus('角色预览暂时不可用');
    };
    let character: LoadedCharacter | undefined;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (error) {
      fail(error);
      return () => { closed = true; clearTimeout(retry); };
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const disposeLighting = portraitLighting(renderer, scene);
    const camera = new THREE.OrthographicCamera(-.85, .85, 1.06, -1.06, .1, 20);
    camera.position.set(0, .86, 3);
    camera.lookAt(0, .86, 0);
    const render = () => {
      if (closed || !character) return;
      setCharacterAppearance(character, latest.current);
      renderer.setSize(element.clientWidth, element.clientHeight, false);
      camera.left = -1.06 * element.clientWidth / Math.max(1, element.clientHeight);
      camera.right = -camera.left;
      camera.updateProjectionMatrix();
      const view = faceRef.current ? accessoryCamera(character) : camera;
      if (faceRef.current) {
        view.left = -view.top * element.clientWidth / Math.max(1, element.clientHeight);
        view.right = -view.left;
        view.updateProjectionMatrix();
      }
      renderer.render(scene, view);
      element.parentElement!.dataset.look = appearanceKey(latest.current);
    };
    redraw.current = render;
    const observer = new ResizeObserver(render);
    observer.observe(element);
    setStatus('正在加载角色…');
    void loadCharacter(latest.current).then(loaded => {
      if (closed) { releaseCharacter(loaded); return; }
      character = loaded;
      loaded.idle.play();
      loaded.mixer.update(.1);
      scene.add(loaded.model);
      render();
      setStatus('');
    }).catch(fail);
    return () => {
      closed = true;
      clearTimeout(retry);
      redraw.current = () => {};
      observer.disconnect();
      if (character) releaseCharacter(character);
      disposeLighting();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [attempt]);
  useEffect(() => redraw.current(), [value, face]);
  return <div className="live-look" role="img" aria-label="当前角色三维预览">
    <div className="live-look-canvas" ref={host} />
    {status && <div className="look-loading" role="status">{status}
      {status.includes('不可用') && <button onClick={() => setAttempt(0)}>重试</button>}
    </div>}
  </div>;
}

