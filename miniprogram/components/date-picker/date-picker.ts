/**
 * 日期选择器组件
 * 提供日期选择功能，支持最小日期和最大日期限制
 */

import { formatDate } from '../../utils/format';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 当前日期值 (YYYY-MM-DD)
    value: {
      type: String,
      value: '',
    },
    // 最小日期 (YYYY-MM-DD)
    minDate: {
      type: String,
      value: '',
    },
    // 最大日期 (YYYY-MM-DD)
    maxDate: {
      type: String,
      value: '',
    },
    // 标签文本
    label: {
      type: String,
      value: '',
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    displayValue: '', // 显示的日期文本
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 处理日期变化事件
     */
    handleDateChange(e: WechatMiniprogram.PickerChange) {
      const newDate = e.detail.value as string;
      
      // 触发 change 事件，传递新日期
      this.triggerEvent('change', { value: newDate });
      
      // 更新显示值
      this.updateDisplayValue(newDate);
    },

    /**
     * 处理选择器点击事件
     */
    handlePickerTap() {
      if (this.properties.disabled) {
        wx.showToast({
          title: '日期选择已禁用',
          icon: 'none',
          duration: 2000,
        });
      }
    },

    /**
     * 更新显示值
     */
    updateDisplayValue(dateStr: string) {
      if (!dateStr) {
        this.setData({
          displayValue: '请选择日期',
        });
        return;
      }

      try {
        // 解析日期
        const date = new Date(dateStr);
        
        // 格式化为友好的显示格式
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekDay = weekDays[date.getDay()];

        const displayValue = `${month}月${day}日 ${weekDay}`;

        this.setData({
          displayValue,
        });
      } catch (error) {
        this.setData({
          displayValue: dateStr,
        });
      }
    },
  },

  /**
   * 组件生命周期函数 - 在组件实例进入页面节点树时执行
   */
  attached() {
    this.updateDisplayValue(this.properties.value);
  },

  /**
   * 组件的属性观察器
   */
  observers: {
    value: function (newValue: string) {
      this.updateDisplayValue(newValue);
    },
  },
});
