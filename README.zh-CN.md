# Physics Toast

[English](./README.md) | [在线演示](https://vorojar.github.io/Physics-Toast/)

灵动岛风格的 Toast 通知，基于真实弹簧物理引擎驱动动画。零依赖，单脚本 SDK。

灵感来自 [Sileo](https://github.com/hiaaryan/sileo)（React 库）— 从零开始**纯原生 JS 重写**，无需任何框架、打包工具或构建步骤即可运行。

## 为什么选 Physics Toast 而不是 Sileo？

| | **Physics Toast** | **Sileo** |
|---|---|---|
| **依赖** | 0 — 放两个文件就能用 | React 18+、framer-motion、tailwindcss |
| **体积** | ~20 KB（CSS 7 KB + JS 13 KB） | ~200 KB+（光 React 运行时就 40 KB+） |
| **动画引擎** | 真实弹簧物理（`F = -kx - cv`），≤4 ms 子步进积分 | CSS 关键帧 / framer-motion 预设 |
| **SVG Gooey 融合** | pill + body 通过 `feGaussianBlur` + `feColorMatrix` 融合 — 真正的灵动岛质感 | 静态圆角矩形 |
| **中断行为** | 同位置 toast 原地 crossfade，物理状态连续 — 无闪烁、无堆叠 | toast 堆叠或排队 |
| **位置支持** | 6 个位置（上/下 × 左/中/右） | 位置有限 |
| **接入方式** | 两个 `<script>`/`<link>` 标签，任意 HTML 页面可用 | JSX 组件，需要 React 项目 |
| **SVG 滤镜共享** | 全局单个 `<filter>` 复用 | 每个 toast 独立滤镜开销 |

### 一句话总结

- **不需要 React，不需要构建工具，不需要 node_modules** — 引入文件，调用 `toast.success()` 就完事了。
- **物理级精确的弹簧动画** — 每一次变形、展开、收起都由真实阻尼弹簧模拟驱动，而非预设缓动曲线。动画流畅、有机，中断时自然衔接。
- **灵动岛 Gooey 效果做对了** — pill 和 body 是两个独立 SVG 形状，通过共享高斯模糊 + 颜色矩阵滤镜融合，形成标志性的液态合并效果。Sileo 仅靠 border-radius 近似。
- **中断 = 物理连续** — 新 toast 在动画中途到来时，弹簧从当前速度继续。没有重置，没有跳变，没有堆叠。只有无缝 crossfade。
- **20 KB vs 200 KB+** — 整个 SDK 比 React 的运行时还小。

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
