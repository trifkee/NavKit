import type { useScrollIntoFocusType } from "../types/focus";
import { ref, unref, watch, nextTick } from "vue";
export function useScrollIntoFocus({
  position,
  selectedElement,
  behavior = "smooth",
  delay = 1000,
  parentSelector = "[data-parent]",
  buffer = 180,
  bufferX,
  bufferY,
  suppressLogs = true,
  scrollType = "throttle",
}: useScrollIntoFocusType) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastCall = 0;

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

    return {
      isFullyVisible:
        elementRect.left >= parentRect.left &&
        elementRect.right <= parentRect.right &&
        elementRect.top >= parentRect.top &&
        elementRect.bottom <= parentRect.bottom,
      horizontalOverflow: elementRect.right - parentRect.right,
      verticalOverflow: elementRect.bottom - parentRect.bottom,
      topOverflow: parentRect.top - elementRect.top,
      leftOverflow: parentRect.left - elementRect.left,
    };
  };

  const scrollWindow = () => {
    const element = unref(currElement);
    const parent = unref(parentContainer);

    if (element && parent) {
      const {
        isFullyVisible,
        horizontalOverflow,
        verticalOverflow,
        topOverflow,
        leftOverflow,
      } = isElementFullyVisible(element, parent);

      if (!isFullyVisible) {
        // Scroll Down
        if (verticalOverflow > 0) {
          parent.scrollTo({
            top: parent.scrollTop + verticalOverflow + (bufferY ?? buffer),
            behavior,
          });
        }
        // Scroll Up (Element is above the viewport)
        if (topOverflow > 0) {
          parent.scrollTo({
            top: parent.scrollTop - topOverflow - (bufferY ?? buffer),
            behavior,
          });
        }

        // Scroll Right
        if (horizontalOverflow > 0) {
          parent.scrollTo({
            left: parent.scrollLeft + horizontalOverflow + (bufferX ?? buffer),
            behavior,
          });
        }
        // Scroll Left (Element is off-screen to the left)
        if (leftOverflow > 0) {
          parent.scrollTo({
            left: parent.scrollLeft - leftOverflow - (bufferX ?? buffer),
            behavior,
          });
        }
      }
    }
  };

  nextTick(setParentContainer);

  watch(selectedElement, (newVal) => {
    if (newVal) {
      nextTick(() => {
        currElement.value = newVal;
      });
    }
  });

  watch(position, async () => {
    if (!parentContainer.value) {
      await nextTick(setParentContainer);
    }
    await nextTick();
    currElement.value = unref(selectedElement);

    if (scrollType === "throttle") {
      const now = new Date().getTime();
      if (now - lastCall >= delay) {
        lastCall = now;
        scrollWindow();
      }
    } else if (scrollType === "debounce") {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(scrollWindow, delay);
    }
  });
}
