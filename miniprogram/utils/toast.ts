/**
 * Toast 提示工具
 * 提供统一的操作反馈提示
 */

/**
 * 显示成功提示
 * @param title 提示文本
 * @param duration 持续时间（毫秒），默认 2000
 */
export function showSuccess(title: string, duration: number = 2000): void {
  wx.showToast({
    title,
    icon: 'success',
    duration,
    mask: false,
  });
}

/**
 * 显示失败提示
 * @param title 提示文本
 * @param duration 持续时间（毫秒），默认 2000
 */
export function showError(title: string, duration: number = 2000): void {
  wx.showToast({
    title,
    icon: 'error',
    duration,
    mask: false,
  });
}

/**
 * 显示普通提示（无图标）
 * @param title 提示文本
 * @param duration 持续时间（毫秒），默认 2000
 */
export function showInfo(title: string, duration: number = 2000): void {
  wx.showToast({
    title,
    icon: 'none',
    duration,
    mask: false,
  });
}

/**
 * 显示加载提示
 * @param title 提示文本，默认 "加载中..."
 * @param mask 是否显示透明蒙层，默认 true
 */
export function showLoading(title: string = '加载中...', mask: boolean = true): void {
  wx.showLoading({
    title,
    mask,
  });
}

/**
 * 隐藏加载提示
 */
export function hideLoading(): void {
  wx.hideLoading();
}

/**
 * 显示模态对话框
 * @param options 对话框选项
 * @returns Promise<boolean> 用户是否点击确定
 */
export function showModal(options: {
  title: string;
  content: string;
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
}): Promise<boolean> {
  return new Promise((resolve) => {
    wx.showModal({
      title: options.title,
      content: options.content,
      showCancel: options.showCancel !== false,
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => {
        resolve(false);
      },
    });
  });
}
