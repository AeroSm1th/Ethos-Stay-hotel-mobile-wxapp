/**
 * 图片处理工具函数
 */

/**
 * 处理图片加载错误
 * @param e 错误事件
 * @param defaultImage 默认图片路径
 */
export function handleImageError(e: any, defaultImage = '/assets/placeholder.png'): void {
  const target = e.target || e.currentTarget;
  if (target) {
    target.src = defaultImage;
  }
}

/**
 * 获取优化后的图片 URL
 * 根据屏幕宽度和图片用途返回合适尺寸的图片
 * @param url 原始图片 URL
 * @param type 图片类型：'thumbnail' | 'medium' | 'large'
 * @returns 优化后的图片 URL
 */
export function getOptimizedImageUrl(url: string, type: 'thumbnail' | 'medium' | 'large' = 'medium'): string {
  if (!url) {
    return '/assets/placeholder.png';
  }

  // 如果是本地图片，直接返回
  if (url.startsWith('/') || url.startsWith('data:')) {
    return url;
  }

  // 获取系统信息
  const systemInfo = wx.getSystemInfoSync();
  const screenWidth = systemInfo.screenWidth;
  const pixelRatio = systemInfo.pixelRatio || 2;

  // 计算实际需要的图片宽度
  let targetWidth: number;
  switch (type) {
    case 'thumbnail':
      // 缩略图：屏幕宽度的 1/3
      targetWidth = Math.ceil((screenWidth / 3) * pixelRatio);
      break;
    case 'medium':
      // 中等尺寸：屏幕宽度的 2/3
      targetWidth = Math.ceil((screenWidth * 2 / 3) * pixelRatio);
      break;
    case 'large':
      // 大图：屏幕宽度
      targetWidth = Math.ceil(screenWidth * pixelRatio);
      break;
    default:
      targetWidth = Math.ceil(screenWidth * pixelRatio);
  }

  // 如果图片 URL 支持参数化调整大小（如七牛云、阿里云 OSS 等）
  // 可以在这里添加相应的参数
  // 例如：return `${url}?imageView2/2/w/${targetWidth}/format/webp`;
  
  // 目前直接返回原始 URL
  return url;
}

/**
 * 预加载图片
 * @param urls 图片 URL 数组
 * @returns Promise
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  const promises = urls.map(url => {
    return new Promise<void>((resolve, reject) => {
      wx.getImageInfo({
        src: url,
        success: () => resolve(),
        fail: () => reject(new Error(`Failed to load image: ${url}`)),
      });
    });
  });

  return Promise.all(promises);
}

/**
 * 压缩图片
 * @param src 图片路径
 * @param quality 压缩质量 (0-100)
 * @returns Promise<string> 压缩后的临时文件路径
 */
export function compressImage(src: string, quality = 80): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src,
      quality,
      success: (res) => resolve(res.tempFilePath),
      fail: (err) => reject(err),
    });
  });
}
