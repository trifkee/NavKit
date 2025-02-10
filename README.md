# NavKit

NavKit is a lightweight, flexible Vue.js navigation library designed for keyboard and TV remote control navigation. It provides an intuitive way to handle spatial navigation in your applications, perfect for smart TV apps, set-top boxes, and keyboard-focused web applications.

## Features

- 🎯 Precise spatial navigation with arrow keys
- 📺 Perfect for TV applications and remote controls
- ⌨️ Full keyboard support
- 🔄 Cyclic navigation option
- 🔀 Customizable navigation patterns
- 🎮 Game-like navigation control
- ↔️ Single-axis navigation support (horizontal or vertical only)
- ⚡ Lightweight and performant
- 🔌 Easy to integrate
- 🎨 Customizable focus styling

## Installation

```bash
npm install navkit
# or
yarn add navkit
```

## Basic Usage

The library provides three navigation hooks:

- `useNavigation`: Full 2D grid navigation
- `useNavigationX`: Horizontal-only navigation
- `useNavigationY`: Vertical-only navigation

### 2D Navigation

```typescript
import { useNavigation } from "navkit";
```

```vue
<template>
  <div class="grid">
    <button v-for="item in items" :key="item.id" data-keyboard>
      {{ item.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { useNavigation } from "navkit";

  const rows = ref([3, 3, 3]); // Grid with 3 rows, 3 items each

  const { currentElement, currentRow } = useNavigation({
    rows,
    focusableSelector: "[data-keyboard]",
    onEnter: () => {
      // Handle enter key press
      console.log("Enter pressed on:", currentElement.value);
    },
  });
</script>
```

### Single-Axis Navigation

For simpler navigation patterns, you can use the dedicated horizontal or vertical navigation hooks:

```typescript
// Horizontal-only navigation
import { useNavigationX } from "navkit";

const { currentElement } = useNavigationX({
  items: ref(5), // Number of items
  focusableSelector: "[data-keyboard]",
  cyclic: true,
});

// Vertical-only navigation
import { useNavigationY } from "navkit";

const { currentElement } = useNavigationY({
  items: ref(3), // Number of items
  focusableSelector: "[data-keyboard]",
  cyclic: true,
});
```

## API Reference

### useNavigation Options

| Option              | Type            | Default              | Description                                    |
| ------------------- | --------------- | -------------------- | ---------------------------------------------- |
| `rows`              | `Ref<number[]>` | Required             | Array defining the number of items in each row |
| `disabled`          | `Ref<boolean>`  | `false`              | Disables navigation when true                  |
| `focusableSelector` | `string`        | `'[data-focusable]'` | CSS selector for focusable elements            |
| `autofocus`         | `boolean`       | `true`               | Automatically focus first element on mount     |
| `focusClass`        | `string`        | `'focused'`          | CSS class applied to focused element           |
| `cyclic`            | `boolean`       | `false`              | Enable wrapping around edges                   |
| `invertAxis`        | `boolean`       | `false`              | Swap vertical/horizontal navigation            |
| `autoNextRow`       | `boolean`       | `false`              | Auto-advance to next row                       |
| `holdColumnPerRow`  | `boolean`       | `false`              | Maintain column position when changing rows    |
| `initialPosition`   | `PositionType`  | `{ row: 0, col: 0 }` | Starting position                              |

### useNavigationX/Y Options

| Option              | Type           | Default              | Description                                |
| ------------------- | -------------- | -------------------- | ------------------------------------------ |
| `items`             | `Ref<number>`  | Required             | Number of navigable items                  |
| `disabled`          | `Ref<boolean>` | `false`              | Disables navigation when true              |
| `focusableSelector` | `string`       | `'[data-focusable]'` | CSS selector for focusable elements        |
| `autofocus`         | `boolean`      | `true`               | Automatically focus first element on mount |
| `focusClass`        | `string`       | `'focused'`          | CSS class applied to focused element       |
| `cyclic`            | `boolean`      | `false`              | Enable wrapping around edges               |
| `initialPosition`   | `number`       | `0`                  | Starting position                          |

### Callback Events

| Event           | Parameters                         | Description                                 |
| --------------- | ---------------------------------- | ------------------------------------------- |
| `onColumnStart` | `() => void`                       | Called when navigation reaches first column |
| `onColumnEnd`   | `() => void`                       | Called when navigation reaches last column  |
| `onRowStart`    | `() => void`                       | Called when navigation reaches first row    |
| `onRowEnd`      | `() => void`                       | Called when navigation reaches last row     |
| `onEnter`       | `(position: PositionType) => void` | Called when Enter key is pressed            |
| `onReturn`      | `(position: PositionType) => void` | Called when Return/Back key is pressed      |

### Return Values

| Value             | Type                                      | Description                    |
| ----------------- | ----------------------------------------- | ------------------------------ |
| `position`        | `Ref<PositionType>`                       | Current focus position         |
| `currentRow`      | `number`                                  | Current row index              |
| `currentElement`  | `Ref<HTMLElement \| null>`                | Currently focused element      |
| `isDisabled`      | `Ref<boolean>`                            | Current disabled state         |
| `setRowPosition`  | `(row: number, position: number) => void` | Set position for specific row  |
| `toggleDisabled`  | `(value?: boolean) => void`               | Toggle or set disabled state   |
| `isValidPosition` | `(position: PositionType) => boolean`     | Check if position is valid     |
| `focusElement`    | `(element: HTMLElement \| null) => void`  | Programmatically focus element |

## Styling

NavKit uses a class-based approach for styling focused elements. By default, it applies the `focused` class to the currently focused element. You can customize this by:

```css
.focused {
  outline: 2px solid #007bff;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
}
```

## Advanced Usage

### Custom Grid Layout

```vue
<script setup lang="ts">
  const rows = ref([4, 3, 5]); // Irregular grid layout

  const { currentElement } = useNavigation({
    rows,
    cyclic: true, // Enable wrap-around navigation
    autoNextRow: true, // Auto-advance to next row
    focusableSelector: "[data-keyboard]",
    onEnter: (position) => {
      console.log("Selected position:", position);
    },
  });
</script>
```

### Single-Axis Navigation Example

```vue
<template>
  <div class="horizontal-menu">
    <button v-for="item in menuItems" :key="item.id" data-keyboard>
      {{ item.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { useNavigationX } from "navkit";

  const menuItems = ref([
    /* your menu items */
  ]);

  const { currentElement } = useNavigationX({
    items: ref(menuItems.value.length),
    cyclic: true,
    onEnter: () => {
      console.log("Selected:", currentElement.value?.textContent);
    },
  });
</script>
```

### TV Remote Navigation

```vue
<script setup lang="ts">
  const { currentElement, toggleDisabled } = useNavigation({
    rows: ref([3, 3, 3]),
    focusableSelector: "[data-keyboard]",
    focusClass: "tv-focused",
    onReturn: () => {
      // Handle back button
      router.back();
    },
  });
</script>
```

## Browser Support

NavKit supports all modern browsers and smart TV platforms that support Vue.js.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
