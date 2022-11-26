import { mapEntries } from './core.helpers';

export default class<K, V> {
  protected stack: Array<Map<K, V>> = [];

  public constructor() {
    this.push();
  }

  public push() {
    this.stack.push(new Map());
  }

  public pop(): Map<V, V> {
    return this.stack.pop() ?? new Map();
  }

  public has(key: K): ReturnType<Map<K, V>['has']> {
    for (let i = this.stack.length - 1; i >= 0; i -= 1) {
      if (this.stack[i].has(key)) {
        return true;
      }
    }

    return false;
  }

  public get(key: K): ReturnType<Map<K, V>['get']> {
    for (let i = this.stack.length - 1; i >= 0; i -= 1) {
      if (this.stack[i].has(key)) {
        return this.stack[i].get(key);
      }
    }

    return undefined;
  }

  public set(key: K, value: V): this {
    for (let i = this.stack.length - 1; i >= 0; i -= 1) {
      this.stack[i].set(key, value);
    }

    return this;
  }

  public merge(resolutions: Map<K, V>): this {
    for (const [key, value] of mapEntries(resolutions)) {
      this.set(key, value);
    }

    return this;
  }
}
