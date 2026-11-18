/** Single-slot reference-counted resource pool: the November renderer keeps
 *  one GLB template (geometry + skeleton + immutable materials) alive while
 *  any avatar needs it, and disposes it the moment the last lease releases.
 *  Extracted verbatim from the production chunk (class Mv). */
export interface PooledResource<T> {
  value: T;
  release: () => void;
}

interface Slot<T> {
  refs: number;
  promise: Promise<T>;
  value?: T;
}

export class SharedResourcePool<T> {
  private current: Slot<T> | undefined;

  constructor(
    private create: () => Promise<T>,
    private destroy: (resource: T) => void,
  ) {}

  async acquire(): Promise<PooledResource<T>> {
    let slot = this.current;
    if (!slot) {
      slot = { refs: 0, promise: Promise.resolve().then(() => this.create()) };
      const pinned = slot;
      slot.promise = slot.promise.then(resource => (pinned.value = resource, resource));
      this.current = slot;
    }
    slot.refs++;
    const lease = slot;
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      if (--lease.refs === 0) {
        if (this.current === lease) this.current = undefined;
        if (lease.value !== undefined) this.destroy(lease.value);
      }
    };
    try {
      return { value: await slot.promise, release };
    } catch (error) {
      release();
      throw error;
    }
  }
}
