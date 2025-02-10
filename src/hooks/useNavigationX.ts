import {
  computed,
  isRef,
  onMounted,
  onUnmounted,
  ref,
  unref,
  watch,
} from "vue";

import type { NavigationXType } from "../types/navigation";

import { KeyboardEnum } from "../enums/keyboard.enum";

export function useNavigationX({
  columns,
  initialPosition = 0,
  disabled = false,
  focusableSelector = "[data-focusable]",
  autofocus = true,
  focusClass = "focused",
  cyclic = false,
  onEnter,
  onReturn,
  onColumnEnd,
  onColumnStart,
}: NavigationXType) {
  const computedCols = computed(() => unref(columns));

  const currentPosition = ref(initialPosition);
  const lastFocusedElement = ref<HTMLElement | null>(null);

  let isProcessing = false;

  // Disabling the hook
  const isDisabled = computed(() => unref(disabled));

  watch(isDisabled, (newValue) => {
    if (newValue) {
      lastFocusedElement.value?.blur();
      lastFocusedElement.value?.classList.remove(focusClass);

      window.removeEventListener("keydown", handleKeyDown);
    } else {
      if (autofocus && !isDisabled.value) {
        const element = getFocusableElement(currentPosition.value);
        focusElement(element as HTMLElement);
      }

      window.removeEventListener("keydown", handleKeyDown);
      window.addEventListener("keydown", handleKeyDown);
    }
  });

  const toggleDisabled = (value?: boolean) => {
    if (value !== undefined) {
      if (isRef(disabled)) {
        disabled.value = value;
      } else {
        disabled = value;
      }
    } else {
      if (isRef(disabled)) {
        disabled.value = !disabled.value;
      } else {
        disabled = !disabled;
      }
    }
  };

  function setPosition(pos: number) {
    return (currentPosition.value = pos);
  }

  const findFocusableElements = () => {
    return Array.from(document.querySelectorAll(focusableSelector));
  };

  const isValidPosition = (col: number): boolean => {
    return col >= 0 && col < computedCols.value;
  };

  const getFocusableElement = (pos: number) => {
    const elements = findFocusableElements();
    let currentCol = 0;

    for (const element of elements) {
      if (currentCol === pos) {
        return element as HTMLElement;
      }

      currentCol++;
    }
    return null;
  };

  const focusElement = (element: HTMLElement | null) => {
    if (isProcessing || !element) return;

    isProcessing = true;

    try {
      if (lastFocusedElement.value) {
        lastFocusedElement.value.classList.remove(focusClass);
        lastFocusedElement.value.blur();
      }

      element.classList.add(focusClass);

      if (autofocus) {
        element.focus();
      }

      lastFocusedElement.value = element;
    } catch (error) {
      console.error("Focus error:", error);
    } finally {
      isProcessing = false;
    }
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    if (disabled || isProcessing) return;

    let newPosition = currentPosition.value;

    switch (event.key) {
      case KeyboardEnum.Left:
        newPosition--;

        if (newPosition < 0) {
          if (cyclic) {
            newPosition = computedCols.value - 1;
          } else {
            onColumnStart?.();
            return;
          }
        }
        break;

      case KeyboardEnum.Right:
        newPosition++;

        if (newPosition >= computedCols.value) {
          if (cyclic) {
            newPosition = 0;
          } else {
            onColumnEnd?.();
            return;
          }
        }
        break;

      case KeyboardEnum.Enter:
        onEnter?.(currentPosition.value);
        return;

      case KeyboardEnum.Back:
        onReturn?.(currentPosition.value);
        return;

      default:
        console.warn("Unhandled Key:", event.code);
        return;
    }

    if (isValidPosition(newPosition)) {
      currentPosition.value = newPosition;
    } else {
      console.error("Position Not Valid:", newPosition);
    }
  };

  watch(currentPosition, (newPosition) => {
    if (!disabled && !isProcessing) {
      const element = getFocusableElement(newPosition);
      focusElement(element as HTMLElement);
    }
  });

  // Check for disabled value, remove listeners if is disabled
  watch(isDisabled, (newValue) => {
    if (newValue) {
      window.removeEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
      window.addEventListener("keydown", handleKeyDown);
    }
  });

  // Lifecycle hooks
  onMounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
    window.addEventListener("keydown", handleKeyDown);

    if (autofocus && !disabled) {
      const element = getFocusableElement(currentPosition.value);
      focusElement(element as HTMLElement);
    }
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);

    if (lastFocusedElement.value) {
      lastFocusedElement.value.classList.remove(focusClass);
    }
  });

  return {
    position: currentPosition,
    currentElement: lastFocusedElement.value,
    setPosition,
    toggleDisabled,
    isValidPosition,
    focusElement,
    getCurrentFocusedElement: () => lastFocusedElement.value,
  };
}
