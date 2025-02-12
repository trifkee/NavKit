import {
  computed,
  isRef,
  ref,
  onMounted,
  onUnmounted,
  watch,
  unref,
} from "vue";

import { type Ref } from "vue";

export type NavigationConfigType = {
  disabled?: boolean | Ref<boolean>;
  focusableSelector?: string;
  autofocus?: boolean;
  focusClass?: string;
  cyclic?: boolean;
};

export type NavigationType = NavigationConfigType & {
  rows: number[] | Ref<number[]>;
  initialPosition?: PositionType;
  autoNextRow?: boolean;
  invertAxis?: boolean;
  holdColumnPerRow?: boolean;
  onEnter?: (position: PositionType) => void;
  onReturn?: (position: PositionType) => void;
  onColumnStart?: () => void;
  onColumnEnd?: () => void;
  onRowStart?: () => void;
  onRowEnd?: () => void;
};

export type PositionType = {
  row: number;
  col: number;
};

export type NavigationYType = NavigationConfigType & {
  rows: number | Ref<number>;
  initialPosition?: number;
  onEnter?: (position: number) => void;
  onReturn?: (position: number) => void;
  onRowStart?: () => void;
  onRowEnd?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
};

export type NavigationXType = NavigationConfigType & {
  columns: number | Ref<number>;
  initialPosition?: number;
  onEnter?: (position: number) => void;
  onColumnStart?: () => void;
  onColumnEnd?: () => void;
  onReturn?: (position: number) => void;
  onUp?: () => void;
  onDown?: () => void;
};

export enum KeyboardEnum {
  Left = "ArrowLeft",
  Right = "ArrowRight",
  Up = "ArrowUp",
  Down = "ArrowDown",
  Enter = "Enter",
  Back = "Escape",
}

// Logic
export function useNavigation({
  rows,
  onColumnStart,
  onColumnEnd,
  onRowStart,
  onRowEnd,
  onEnter,
  onReturn,
  initialPosition = { row: 0, col: 0 },
  disabled = ref(false),
  focusableSelector = "[data-focusable]",
  autofocus = true,
  focusClass = "focused",
  cyclic = false,
  invertAxis = false,
  autoNextRow = false,
  holdColumnPerRow = false,
}: NavigationType) {
  const computedRows = computed(() =>
    Array.isArray(rows) ? rows : unref(rows)
  );

  const currentPosition = ref<PositionType>(initialPosition);
  const lastFocusedElement = ref<HTMLElement | null>(null);
  const positions = ref(
    Array.from({ length: computedRows.value.length }).map((_) => 0)
  );

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
        focusElement(element);
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

  const findFocusableElements = () => {
    return Array.from(document.querySelectorAll(focusableSelector));
  };

  const isValidPosition = (pos: PositionType): boolean => {
    if (pos.row < 0 || pos.row >= computedRows.value.length) return false;
    return pos.col >= 0 && pos.col < computedRows.value[pos.row];
  };

  const getFocusableElement = (pos: PositionType): HTMLElement | null => {
    const elements = findFocusableElements();

    if (!elements.length) return null;

    let currentRow = 0;
    let currentCol = 0;

    for (const element of elements) {
      if (currentRow === pos.row && currentCol === pos.col) {
        return element as HTMLElement;
      }

      currentCol++;
      if (currentCol >= computedRows.value[currentRow]) {
        currentRow++;
        currentCol = 0;
      }
    }
    return null;
  };

  // Function to focus an element
  const focusElement = (element: HTMLElement | null) => {
    if (isProcessing || !element) return;

    isProcessing = true;
    try {
      // Remove focus from previous element
      if (lastFocusedElement.value) {
        lastFocusedElement.value.classList.remove(focusClass);
        lastFocusedElement.value.blur();
      }

      // Focus new element
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

  function setRowPosition(row: number, position: number) {
    return (positions.value[row] = position);
  }

  // Handler for keydown events
  const handleKeyDown = (event: KeyboardEvent) => {
    try {
      if (isDisabled.value || isProcessing) return;

      const newPosition = { ...currentPosition.value };

      switch (event.key) {
        case KeyboardEnum.Up:
          if (invertAxis) {
            newPosition.col--;

            positions.value[newPosition.row] = newPosition.col;

            if (newPosition.col < 0) {
              if (cyclic) {
                newPosition.col = computedRows.value[newPosition.row] - 1;
              } else {
                onRowStart?.();
                return;
              }
            }

            break;
          }

          newPosition.row--;

          if (newPosition.row < 0) {
            if (cyclic) {
              newPosition.row = computedRows.value.length - 1;
            } else {
              onRowStart?.();
              return;
            }
          }

          if (newPosition.col >= computedRows.value[newPosition.row]) {
            newPosition.col = computedRows.value[newPosition.row] - 1;
          } else {
            newPosition.col = holdColumnPerRow
              ? currentPosition.value.col
              : positions.value[newPosition.row];
          }

          break;

        case KeyboardEnum.Down:
          if (invertAxis) {
            newPosition.col++;

            positions.value[newPosition.row] = newPosition.col;

            if (newPosition.col >= computedRows.value[newPosition.row]) {
              if (cyclic) {
                newPosition.col = 0;
              } else {
                onRowEnd?.();
                return;
              }
            }

            break;
          }

          newPosition.row++;

          if (newPosition.row >= computedRows.value.length) {
            if (cyclic) {
              newPosition.row = 0;
            } else {
              onRowEnd?.();
              return;
            }
          }

          if (newPosition.col >= computedRows.value[newPosition.row]) {
            newPosition.col = computedRows.value[newPosition.row] - 1;
          } else {
            newPosition.col = holdColumnPerRow
              ? currentPosition.value.col
              : positions.value[newPosition.row];
          }

          break;

        case KeyboardEnum.Left:
          if (invertAxis) {
            newPosition.row--;

            newPosition.col = holdColumnPerRow
              ? currentPosition.value.col
              : positions.value[newPosition.row];

            break;
          }
          newPosition.col--;

          positions.value[newPosition.row] = newPosition.col;

          if (newPosition.col < 0) {
            if (cyclic) {
              if (autoNextRow) {
                newPosition.row =
                  newPosition.row > 0
                    ? newPosition.row - 1
                    : computedRows.value.length - 1;
              }
              newPosition.col = computedRows.value[newPosition.row] - 1;
            } else {
              onColumnStart?.();
              return;
            }
          }
          break;

        case KeyboardEnum.Right:
          if (invertAxis) {
            newPosition.row++;

            newPosition.col = holdColumnPerRow
              ? currentPosition.value.col
              : positions.value[newPosition.row];

            break;
          }
          newPosition.col++;

          positions.value[newPosition.row] = newPosition.col;

          if (
            newPosition.col >= computedRows.value[currentPosition.value.row]
          ) {
            if (cyclic) {
              if (autoNextRow) {
                newPosition.row =
                  newPosition.row < computedRows.value.length - 1
                    ? newPosition.row + 1
                    : 0;
              }
              newPosition.col = 0;
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
        console.error("Position Not Valid. returning to default:", newPosition);
        currentPosition.value = {
          col: 0,
          row: 0,
        };
      }
    } catch (error) {
      console.error("Error in handleKeyNavigation:", error);
    }
  };

  watch(currentPosition, (newPosition) => {
    if (!isDisabled.value && !isProcessing) {
      const element = getFocusableElement(newPosition);
      focusElement(element);
    }
  });

  // Check for disabled value, remove listeners if is disabled
  watch(isDisabled, (newValue) => {
    if (newValue) {
      removeEventListeners();
    } else {
      addEventListeners();
    }
  });

  const addEventListeners = () => {
    window.addEventListener("keydown", handleKeyDown);
  };

  const removeEventListeners = () => {
    window.removeEventListener("keydown", handleKeyDown);
  };

  // Lifecycle hooks
  onMounted(() => {
    if (!isDisabled.value) {
      addEventListeners();

      if (autofocus) {
        const element = getFocusableElement(currentPosition.value);
        focusElement(element);
      }
    }
  });

  onUnmounted(() => {
    removeEventListeners();
  });

  return {
    position: currentPosition,
    currentRow:
      positions.value[
        invertAxis ? currentPosition.value.col : currentPosition.value.row
      ],
    currentElement: lastFocusedElement.value,
    isDisabled,
    setRowPosition,
    toggleDisabled,
    isValidPosition,
    focusElement,
    getCurrentFocusedElement: () => lastFocusedElement.value,
    debug: {
      focusableElements: findFocusableElements(),
      isHookDisabled: isDisabled.value,
    },
  };
}
