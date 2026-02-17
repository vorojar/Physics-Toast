# Physics Toast

[中文文档](./README.zh-CN.md)

Dynamic Island style toast notifications with spring physics animation. Zero dependencies, single-script SDK.

Inspired by [Sileo](https://github.com/hiaaryan/sileo) (React) — this is a **vanilla JS rewrite** that runs anywhere without a framework.

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
