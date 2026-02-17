# Physics Toast

[English](./README.md)

灵动岛风格的 Toast 通知，基于弹簧物理引擎驱动动画。零依赖，单脚本 SDK。

灵感来自 [Sileo](https://github.com/hiaaryan/sileo)（React 库）— 本项目为**纯原生 JS 重写**，无需任何框架即可运行。

## 特性

- **灵动岛变形** — SVG Gooey 滤镜将 pill 与 body 融合成有机形态
- **弹簧物理** — 真实弹簧模拟（`F = -kx - cv`）驱动 SVG 动画，非 CSS 关键帧
- **6 种类型** — success、error、warning、info、promise（异步）、action（按钮）
- **中断替换** — 同位置新 toast 会 crossfade 到已有 toast 上，而非堆叠
- **自动展开/收起** — 描述面板定时展开后收起，hover 时暂停
- **滑动关闭** — 指针拖拽即可 dismiss
- **6 个位置** — 上/下 × 左/中/右
- **~20 KB** 压缩后（CSS 7 KB + JS 13 KB），零依赖

## 快速开始

```html
<link rel="stylesheet" href="physics-toast.min.css">
<script src="physics-toast.min.js"></script>
```

SDK 加载后自动注入 viewport 容器和共享 SVG 滤镜，无需额外 HTML。

## API

所有方法返回数字类型的 toast `id`。

### 基础类型

```js
toast.success('已保存', '你的修改已成功保存。')
toast.error('错误', '网络请求失败。')
toast.warning('警告', '存储空间即将用尽。')
toast.info('更新', '2.0 版本已发布。')
```

### Promise（异步）

显示 loading 动画，Promise 完成后自动切换为成功或失败。

```js
toast.promise(
  '上传中...',
  () => fetch('/api/upload', { method: 'POST', body: formData }),
  {
    success: { title: '完成', description: '文件已上传。' },
    error:   { title: '失败', description: '请重试。' },
  }
)
```

### Action（按钮）

描述区域内包含一个可点击按钮。

```js
toast.action(
  '新消息',
  'Alice: "明天下午 3 点开会。"',
  '查看',
  () => openMessage()
)
```

### 关闭

```js
const id = toast.success('你好')
toast.dismiss(id)   // 关闭指定
toast.clear()       // 关闭全部
```

### 选项

在任意方法最后一个参数传入配置对象：

```js
toast.success('已保存', '完成。', {
  duration: 8000,          // 自动关闭毫秒数（0 = 手动关闭）
  position: 'bottom-right' // top-left | top-center | top-right
                           // bottom-left | bottom-center | bottom-right
})
```

#### 默认值

```js
toast.defaults.duration = 4000
toast.defaults.position = 'top-center'
```

## 主题定制

覆盖 `:root` 上的 CSS 自定义属性：

```css
:root {
  --sileo-width: 400px;
  --sileo-height: 44px;
  --sileo-duration: 600ms;

  --sileo-state-success: oklch(0.72 0.22 142);
  --sileo-state-error:   oklch(0.64 0.24 25);
  --sileo-state-warning: oklch(0.80 0.18 86);
  --sileo-state-info:    oklch(0.69 0.17 237);
  --sileo-state-action:  oklch(0.62 0.21 260);
  --sileo-state-loading: oklch(0.56 0 0);
}
```

## 浏览器支持

需要以下现代特性：
- `oklch()` 与 `color-mix()`
- `linear()` 缓动函数
- `content-visibility`
- `ResizeObserver`

Chrome 111+、Edge 111+、Safari 16.4+、Firefox 113+。

## 许可证

MIT
