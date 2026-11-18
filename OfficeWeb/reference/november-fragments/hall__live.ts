type Screen = { root: THREE.Object3D; plane: THREE.Mesh; canvas: HTMLCanvasElement; texture: THREE.Texture; version: number; content: CinemaContent | null; video?: HTMLVideoElement };\
type Screen = { root: THREE.Object3D; plane: THREE.Mesh; canvas: HTMLCanvasElement; texture: THREE.Texture; version: number; content: CinemaContent | null; video?: HTMLVideoElement };\
  private screens = new Map<string, Screen>();\
  private placeholder: { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture } | null = null;\
          const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 360;\
          const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;\
          const { canvas, texture } = this.emptyScreen();\
          root.add(plane); s = { root, plane, canvas, texture, version: -1, content: null }; this.screens.set(id, s); this.paint(s);\
          root.add(plane); s = { root, plane, canvas, texture, version: -1, content: null }; this.screens.set(id, s);\
    }\
    if (!this.screens.size) this.releasePlaceholder();\
  }\
  private stopVideo(s: Screen) {\
  }\
  private emptyScreen() {\
    if (this.placeholder) return this.placeholder;\
    const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 360;\
    const x = canvas.getContext('2d')!;\
    x.fillStyle = '#15191b'; x.fillRect(0, 0, canvas.width, canvas.height);\
    x.globalAlpha = 0.7; x.fillStyle = '#efe6d6'; x.beginPath(); x.moveTo(canvas.width / 2 - 22, canvas.height / 2 - 26); x.lineTo(canvas.width / 2 + 28, canvas.height / 2); x.lineTo(canvas.width / 2 - 22, canvas.height / 2 + 26); x.closePath(); x.fill();\
    x.globalAlpha = 0.6; x.font = '500 22px "Microsoft YaHei",sans-serif'; x.textAlign = 'center'; x.fillText('点一下放点什么', canvas.width / 2, canvas.height / 2 + 64); x.textAlign = 'start'; x.globalAlpha = 1;\
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;\
    return this.placeholder = { canvas, texture };\
  }\
  private releaseScreenPicture(s: Screen) {\
    if (s.texture === this.placeholder?.texture) return;\
    s.texture.dispose(); s.canvas.width = s.canvas.height = 0;\
  }\
  private releasePlaceholder() {\
    if (!this.placeholder) return;\
    this.placeholder.texture.dispose(); this.placeholder.canvas.width = this.placeholder.canvas.height = 0; this.placeholder = null;\
  }\
  /** what a screen shows: its picture, a quiet looping video, or a play sign (a YouTube or Vimeo link plays in a player when you watch) */\
  private paint(s: Screen) {\
    if (!s.content) {\
      this.releaseScreenPicture(s);\
      const empty = this.emptyScreen(); s.canvas = empty.canvas; s.texture = empty.texture;\
      (s.plane.material as THREE.MeshBasicMaterial).map = s.texture; (s.plane.material as THREE.MeshBasicMaterial).needsUpdate = true;\
      return;\
    }\
    if (s.texture === this.placeholder?.texture) {\
      const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 360;\
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;\
      s.canvas = canvas; s.texture = texture;\
      (s.plane.material as THREE.MeshBasicMaterial).map = texture; (s.plane.material as THREE.MeshBasicMaterial).needsUpdate = true;\
    }\
    const { canvas: c, texture } = s, x = c.getContext('2d')!, content = s.content;\
    if (!content) { play('点一下放点什么'); texture.needsUpdate = true; return; }\
    if (content.type === 'image') {\
  private disposeScreen(s: Screen) { this.stopVideo(s); s.content = null; s.root.remove(s.plane); s.plane.geometry.dispose(); (s.plane.material as THREE.Material).dispose(); s.texture.dispose(); s.canvas.width = s.canvas.height = 0; }\
  dispose() { for (const b of this.boards.values()) this.disposeBoard(b); this.boards.clear(); for (const s of this.screens.values()) this.disposeScreen(s); this.screens.clear(); }\
  private disposeScreen(s: Screen) { this.stopVideo(s); s.content = null; s.root.remove(s.plane); s.plane.geometry.dispose(); (s.plane.material as THREE.Material).dispose(); this.releaseScreenPicture(s); }\
  dispose() { for (const b of this.boards.values()) this.disposeBoard(b); this.boards.clear(); for (const s of this.screens.values()) this.disposeScreen(s); this.screens.clear(); this.releasePlaceholder(); }\
}\
