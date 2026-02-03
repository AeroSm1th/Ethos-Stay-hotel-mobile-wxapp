/**
 * 性能优化工具函数
 */

/**
 * 防抖函数
 * 在事件被触发 n 秒后再执行回调，如果在这 n 秒内又被触发，则重新计时
 * @param func 要执行的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(context, args);
      timeout = null;
    }, wait);
  };
}

/**
 * 节流函数
 * 规定在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效
 * @param func 要执行的函数
 * @param wait 等待时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let previous = 0;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    const now = Date.now();

    if (!previous) {
      previous = now;
    }

    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(context, args);
      }, remaining);
    }
  };
}

/**
 * 请求去重
 * 防止同一个请求在短时间内被重复发起
 */
export class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<any>>;

  constructor() {
    this.pendingRequests = new Map();
  }

  /**
   * 执行请求，如果相同的请求正在进行中，则返回正在进行的请求
   * @param key 请求的唯一标识
   * @param requestFn 请求函数
   * @returns Promise
   */
  async execute<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // 如果相同的请求正在进行中，直接返回
    if (this.pendingRequests.has(key)) {
      console.log(`请求去重: ${key}`);
      return this.pendingRequests.get(key) as Promise<T>;
    }

    // 执行新请求
    const promise = requestFn()
      .then((result) => {
        // 请求完成后，从 pending 列表中移除
        this.pendingRequests.delete(key);
        return result;
      })
      .catch((error) => {
        // 请求失败后，也要从 pending 列表中移除
        this.pendingRequests.delete(key);
        throw error;
      });

    // 将请求添加到 pending 列表
    this.pendingRequests.set(key, promise);

    return promise;
  }

  /**
   * 清除所有待处理的请求
   */
  clear(): void {
    this.pendingRequests.clear();
  }

  /**
   * 取消指定的请求
   * @param key 请求的唯一标识
   */
  cancel(key: string): void {
    this.pendingRequests.delete(key);
  }
}

/**
 * 创建默认的请求去重器实例
 */
export const requestDeduplicator = new RequestDeduplicator();

/**
 * 延迟执行
 * @param ms 延迟时间（毫秒）
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 批量执行任务
 * 将大量任务分批执行，避免一次性执行导致的性能问题
 * @param tasks 任务数组
 * @param batchSize 每批任务数量
 * @param delayMs 每批任务之间的延迟时间（毫秒）
 * @returns Promise
 */
export async function batchExecute<T>(
  tasks: (() => Promise<T>)[],
  batchSize: number = 10,
  delayMs: number = 100
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((task) => task()));
    results.push(...batchResults);

    // 如果还有下一批任务，延迟一段时间
    if (i + batchSize < tasks.length) {
      await delay(delayMs);
    }
  }

  return results;
}
