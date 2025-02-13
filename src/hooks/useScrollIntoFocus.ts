import type { useScrollIntoFocusType } from "../types/focus";
import { ref, unref, watch, nextTick } from "vue";

export function useScrollIntoFocus({
  position,
  selectedElement,
  behavior = "smooth",
  debounceTimeout = 200,
  parentSelector = "[data-parent]",
  buffer = 180,
  bufferX,
  bufferY,
  suppressLogs = true,
}: useScrollIntoFocusType) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const currElement = ref<HTMLElement | null>(null);
  const parentContainer = ref<HTMLElement | null>(null);

  const setParentContainer = () => {
    parentContainer.value = document.querySelector(parentSelector);
    if (!parentContainer.value) {
      console.warn("Parent container not found!");
    }
  };

  const isElementFullyVisible = (element: HTMLElement, parent: HTMLElement) => {
    const elementRect = element.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    // Check horizontal visibility
    const isVisibleHorizontally =
      elementRect.left >= parentRect.left &&
      elementRect.right <= parentRect.right;

    // Check vertical visibility
    const isVisibleVertically =
      elementRect.top >= parentRect.top &&
      elementRect.bottom <= parentRect.bottom;

    return {
      isFullyVisible: isVisibleHorizontally && isVisibleVertically,
      horizontalOverflow: elementRect.right - parentRect.right,
      verticalOverflow: elementRect.bottom - parentRect.bottom,
    };
  };

  nextTick(setParentContainer);

  watch(selectedElement, (newVal) => {
    if (newVal) {
      currElement.value = newVal;
    }
  });

  watch(position, () => {
    if (!parentContainer.value) {
      nextTick(setParentContainer);
    }

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      const element = unref(currElement);
      const parent = unref(parentContainer);

      if (element && parent) {
        const { isFullyVisible, horizontalOverflow, verticalOverflow } =
          isElementFullyVisible(element, parent);

        if (!isFullyVisible) {
          // Handle vertical scrolling
          if (verticalOverflow > 0) {
            const newScrollTop =
              parent.scrollTop + verticalOverflow + (bufferY ?? buffer);
            parent.scrollTo({
              top: newScrollTop,
              behavior,
            });
          }

          // Handle horizontal scrolling
          if (horizontalOverflow > 0) {
            const newScrollLeft =
              parent.scrollLeft + horizontalOverflow + (bufferX ?? buffer);
            parent.scrollTo({
              left: newScrollLeft,
              behavior,
            });
          }

          // If element is above or to the left of visible area
          const elementRect = element.getBoundingClientRect();
          const parentRect = parent.getBoundingClientRect();

          if (elementRect.top < parentRect.top) {
            const topAdjustment = elementRect.top - parentRect.top - 180;
            parent.scrollBy({
              top: topAdjustment,
              behavior,
            });
          }

          if (elementRect.left < parentRect.left) {
            const leftAdjustment = elementRect.left - parentRect.left - 50;
            parent.scrollBy({
              left: leftAdjustment,
              behavior,
            });
          }
        }

        if (!suppressLogs) {
          // Log visibility status for debugging
          console.info("Visibility check:", {
            isFullyVisible,
            horizontalOverflow,
            verticalOverflow,
            element: {
              left: element.getBoundingClientRect().left,
              right: element.getBoundingClientRect().right,
            },
            parent: {
              left: parent.getBoundingClientRect().left,
              right: parent.getBoundingClientRect().right,
            },
          });
        }
      }
    }, debounceTimeout);
  });
}
