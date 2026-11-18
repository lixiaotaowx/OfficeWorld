  private worker: Worker | null = null;\
  private timer: ReturnType<typeof setTimeout> | undefined;\
  get pending() { return this.worker !== null; }\
