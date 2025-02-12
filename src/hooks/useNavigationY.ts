import {
  computed,
  isRef,
  onMounted,
  onUnmounted,
  ref,
  unref,
  watch,
} from "vue";

import { KeyboardEnum } from "../enums/keyboard.enum";

import type { NavigationYType } from "../types/navigation";

export function useNavigationY({
  rows,
  initialPosition = 0,
  disabled = ref(false),
  focusableSelector = "[data-focusable]",
  autofocus = true,
  focusClass = "focused",
  cyclic = false,
  onRowStart,
  onRowEnd,
  onEnter,
  onReturn,
  onRight,
  onLeft,
}: NavigationYType) {
  const computedRows = ref(unref(rows));

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

  const isValidPosition = (row: number): boolean => {
    return row >= 0 && row < computedRows.value;
  };

  const getFocusableElement = (pos: number) => {
    const elements = findFocusableElements();
    let currentRow = 0;

    for (const element of elements) {
      if (currentRow === pos) {
        return element as HTMLElement;
      }

      currentRow++;
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
    if (isDisabled.value || isProcessing) return;

    let newPosition = currentPosition.value;

    switch (event.key) {
      case KeyboardEnum.Up:
        newPosition--;

        if (newPosition < 0) {
          if (cyclic) {
            newPosition = computedRows.value - 1;
          } else {
            onRowStart?.();
            return;
          }
        }

        break;

      case KeyboardEnum.Down:
        newPosition++;

        if (newPosition >= computedRows.value) {
          if (cyclic) {
            newPosition = 0;
          } else {
            onRowEnd?.();
            return;
          }
        }

        break;

      case KeyboardEnum.Left:
        onLeft?.();
        break;

      case KeyboardEnum.Right:
        onRight?.();
        break;

      case KeyboardEnum.Enter:
        onEnter?.(currentPosition.value);
        break;

      case KeyboardEnum.Back:
        onReturn?.(currentPosition.value);
        break;

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
    if (!isDisabled.value && !isProcessing) {
      const element = getFocusableElement(newPosition);
      focusElement(element as HTMLElement);
    }
  });

  // Lifecycle hooks
  onMounted(() => {
    if (isDisabled.value) {
      window.removeEventListener("keydown", handleKeyDown);
    } else {
      window.addEventListener("keydown", handleKeyDown);
    }

    if (autofocus && !isDisabled.value) {
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
