# Physics Toast

[中文文档](./README.zh-CN.md) | [Live Demo](https://vorojar.github.io/Physics-Toast/)

Dynamic Island style toast notifications powered by a real spring physics engine. Zero dependencies, single-script SDK.

Inspired by [Sileo](https://github.com/hiaaryan/sileo) (React) — rebuilt from the ground up as **pure vanilla JS**, runs anywhere without a framework, bundler, or build step.

## Why Physics Toast over Sileo?

| | **Physics Toast** | **Sileo** |
|---|---|---|
| **Dependencies** | 0 — drop two files and go | React 18+, framer-motion, tailwindcss |
| **Bundle size** | ~20 KB total (CSS 7 KB + JS 13 KB) | ~200 KB+ (React runtime alone is 40 KB+) |
| **Animation engine** | Real spring physics (`F = -kx - cv`), sub-step integrated at ≤4 ms | CSS keyframes / framer-motion presets |
| **SVG Gooey morph** | Pill + body fuse through `feGaussianBlur` + `feColorMatrix` — true Dynamic Island feel | Static rounded rectangles |
| **Interrupt behavior** | Same-position toast crossfades in-place with physics continuity — no flash, no stack | Toasts stack or queue |
| **Position support** | 6 positions (top/bottom × left/center/right) | Limited positions |
| **Integration** | Two `<script>`/`<link>` tags, works in any HTML page | JSX components, requires React project |
| **Shared SVG filter** | Single global `<filter>` reused by all toasts | Per-toast filter overhead |

### In short

- **No React, no build tools, no node_modules** — just include the files and call `toast.success()`.
- **Physically accurate spring animation** — every morph, expand, and collapse is driven by a real damped spring simulation, not canned easing curves. The result is fluid, organic motion that responds naturally to interrupts.
- **Dynamic Island gooey effect done right** — the pill and body are separate SVG shapes fused through a shared gaussian blur + color matrix filter, creating the iconic liquid merge that Sileo approximates with border-radius alone.
- **Interrupt = physics continuity** — if a new toast arrives mid-animation, the spring picks up from the current velocity. No reset, no jump, no stacking. Just a seamless crossfade.
- **20 KB vs 200 KB+** — the entire SDK is smaller than React's runtime alone.

## Features

- **Dynamic Island morph** — SVG gooey filter fuses pill + body into an organic shape
- **Spring physics** — real spring simulation (`F = -kx - cv`) drives SVG animations, not CSS keyframes
- **6 toast types** — success, error, warning, info, promise (async), action (button)
- **Interrupt & replace** — new toast at the same position crossfades into the existing one
- **Auto expand / collapse** — description panel opens and closes on a timer, pausable on hover
- **Swipe to dismiss** — pointer drag dismissal
- **6 positions** — top/bottom × left/center/right
- **~20 KB** minified (7 KB CSS + 13 KB JS), zero dependencies

## Quick Start

```html
<link rel="stylesheet" href="physics-toast.min.css">
<script src="physics-toast.min.js"></script>
```

The SDK auto-injects viewport containers and a shared SVG filter on load. No extra HTML needed.

## API

All methods return a numeric toast `id`.

### Basic

```js
toast.success('Saved', 'Your changes have been saved.')
toast.error('Error', 'Network request failed.')
toast.warning('Warning', 'Storage is almost full.')
toast.info('Update', 'Version 2.0 is available.')
```

### Promise

Shows a loading spinner, then resolves to success or error.

```js
toast.promise(
  'Uploading...',
  () => fetch('/api/upload', { method: 'POST', body: formData }),
  {
    success: { title: 'Done', description: 'File uploaded.' },
    error:   { title: 'Failed', description: 'Please try again.' },
  }
)
```

### Action

Includes a clickable button in the description.

```js
toast.action(
  'New Message',
  'Alice: "Meeting at 3 PM tomorrow."',
  'View',
  () => openMessage()
)
```

### Dismiss

```js
const id = toast.success('Hi')
toast.dismiss(id)   // dismiss one
toast.clear()       // dismiss all
```

### Options

Pass an options object as the last argument to any method:

```js
toast.success('Saved', 'Done.', {
  duration: 8000,          // auto-dismiss ms (0 = manual only)
  position: 'bottom-right' // top-left | top-center | top-right
                           // bottom-left | bottom-center | bottom-right
})
```

#### Defaults

```js
toast.defaults.duration = 4000
toast.defaults.position = 'top-center'
```

## Theming

Override CSS custom properties on `:root`:

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

## Browser Support

Modern browsers with support for:
- `oklch()` and `color-mix()`
- `linear()` easing
- `content-visibility`
- `ResizeObserver`

Chrome 111+, Edge 111+, Safari 16.4+, Firefox 113+.

## License

MIT
