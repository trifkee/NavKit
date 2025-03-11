import { computed, nextTick, ref, watch } from "vue";
import { UseScrollIntoFocusType } from "../types";

export function useScrollIntoFocus<T>({
  position,
  scrollType = "throttle",
  selectedElement,
  behavior,
  buffer = 20,
  bufferX,
  bufferY,
  carouselStartScroll = "start",
  delay,
  items,
  parentSelector,
  sliceBuffer = 2,
  suppressLogs,
}: UseScrollIntoFocusType<T>) {
  // LOGIC HERE
  const currElement = ref<HTMLElement | null>(null);
  const parentContainer = ref<HTMLElement | null>(null);

  // SLICING
  const optimizedArray = computed(() => {
    if (typeof items === "undefined") {
      return [];
    }

    return handleSliceArray();
  });

  function handleSliceArray() {
    switch (carouselStartScroll) {
      case "start":
        if (typeof items === "undefined") {
          return [];
        }

        const row = position.value?.row ?? 0;

        console.log(row, "ROWS", selectedElement.value);
        return items.slice(row ?? 0, (row ?? 0) + sliceBuffer);

      default:
        console.warn(
          "Invalid carouselStartScroll value! \n Supported values are: start, center, end"
        );
        break;
    }
  }

  // GET FOCUSED ELEMENTS
  function setParentContainer() {
    if (!parentSelector) {
      if (!suppressLogs) {
        console.warn("Parent selector not provided!");
      }

      return;
    }

    parentContainer.value = document.querySelector(parentSelector);

    if (!parentContainer.value && !suppressLogs) {
      console.warn("Parent container not found!");
    }
  }
  // ++++++++++++++++++++++++++++++

  // WATCHERS
  nextTick(setParentContainer);

  watch(selectedElement, (newVal) => {
    if (newVal) {
      nextTick(() => {
        currElement.value = newVal;
      });
    }
  });

  // watch(position, async () => {
  //   if (!parentContainer.value) {
  //     await nextTick(setParentContainer);
  //   }

  //   await nextTick();

  // currElement.value = unref(selectedElement);

  // if (scrollType === "throttle") {
  //   const now = new Date().getTime();

  //   if (now - lastCall >= delay) {
  //     lastCall = now;
  //     scrollWindow();
  //   }
  // } else if (scrollType === "debounce") {
  //   if (timeout) {
  //     clearTimeout(timeout);
  //   }
  //   timeout = setTimeout(scrollWindow, delay);
  // }
  // });

  // RETURN
  return {
    optimizedArray,
    debug: {
      currElement,
      parentContainer,
    },
  };
}

// import type { useScrollIntoFocusType } from "../types/focus";
// import { ref, unref, watch, nextTick, computed } from "vue";
// export function useScrollIntoFocus<T>({
//   position,
//   selectedElement,
//   behavior = "smooth",
//   delay = 1000,
//   parentSelector = "[data-parent]",
//   buffer = 180,
//   bufferX,
//   bufferY,
//   suppressLogs = true,
//   scrollType = "throttle",
//   carouselStartScroll = "start",
//   items = [],
//   sliceBuffer = 3,
// }: useScrollIntoFocusType<T>) {
//   let timeout: ReturnType<typeof setTimeout> | null = null;
//   let lastCall = 0;

//   const currElement = ref<HTMLElement | null>(null);
//   const parentContainer = ref<HTMLElement | null>(null);

//   // -----
//   function getOptimizedArray() {
//     if (typeof items === "undefined") {
//       return [];
//     }

//     const row = position.value?.row ?? 0;

//     return items.filter((_, index) => Math.abs(index - row) <= sliceBuffer);
//   }

//   // -----

//   const setParentContainer = () => {
//     parentContainer.value = document.querySelector(parentSelector);
//     if (!parentContainer.value) {
//       console.warn("Parent container not found!");
//     }
//   };

//   const isElementFullyVisible = (element: HTMLElement, parent: HTMLElement) => {
//     const elementRect = element.getBoundingClientRect();
//     const parentRect = parent.getBoundingClientRect();

//     return {
//       isFullyVisible:
//         elementRect.left >= parentRect.left &&
//         elementRect.right <= parentRect.right &&
//         elementRect.top >= parentRect.top &&
//         elementRect.bottom <= parentRect.bottom,
//       horizontalOverflow: elementRect.right - parentRect.right,
//       verticalOverflow: elementRect.bottom - parentRect.bottom,
//       topOverflow: parentRect.top - elementRect.top,
//       leftOverflow: parentRect.left - elementRect.left,
//     };
//   };

//   const scrollWindow = () => {
//     const element = unref(currElement);
//     const parent = unref(parentContainer);

//     const carousels = parent?.querySelectorAll("[data-carousel]");
//     const carousel = computed(() => {
//       if (!carousels || carousels.length === 0) return null;

//       // Add safety check for position
//       const safeRow = Math.min(
//         Math.max(position.value.row, 0),
//         carousels.length - 1
//       );

//       return carousels[safeRow] as HTMLElement;
//     });

//     const inlinePadding = Number(
//       // -----STYLES
//       getComputedStyle(carousel.value as HTMLElement).paddingInline.replace(
//         "px",
//         ""
//       )
//     );

//     const gap =
//       Number(
//         getComputedStyle(carousel.value as HTMLElement).gap.replace("px", "")
//       ) / 2;
//     // -----

//     if (element && parent) {
//       const {
//         isFullyVisible,
//         horizontalOverflow,
//         verticalOverflow,
//         topOverflow,
//         leftOverflow,
//       } = isElementFullyVisible(element, parent);

//       if (!isFullyVisible) {
//         // Scroll Down
//         if (verticalOverflow > 0) {
//           parent.scrollTo({
//             top: parent.scrollTop + verticalOverflow + (bufferY ?? buffer),
//             behavior,
//           });
//         }

//         // Scroll Up (Element is above the viewport)
//         if (topOverflow > 0) {
//           parent.scrollTo({
//             top: parent.scrollTop - topOverflow - (bufferY ?? buffer),
//             behavior,
//           });
//         }

//         // // Scroll Right
//         // if (horizontalOverflow > 0) {
//         //   carousel.value?.scrollTo({
//         //     left:
//         //       carousel.value.scrollLeft +
//         //       horizontalOverflow +
//         //       (bufferX ?? buffer),
//         //     behavior,
//         //   });
//         // }

//         // // Scroll Left (Element is off-screen to the left)
//         // if (leftOverflow > 0) {
//         //   carousel.value?.scrollTo({
//         //     left:
//         //       carousel.value.scrollLeft - leftOverflow - (bufferX ?? buffer),
//         //     behavior,
//         //   });
//         // }
//       }

//       if (carouselStartScroll === "start") {
//         carousel.value?.scrollTo({
//           left:
//             carousel.value.scrollLeft -
//             leftOverflow -
//             (bufferX ?? buffer) +
//             inlinePadding +
//             gap,
//           behavior,
//         });
//       } else if (carouselStartScroll === "center") {
//         console.log(carousel.value?.childElementCount);
//         const totalItems =
//           currElement.value!.clientWidth * carousel.value!.childElementCount;
//         const carouselWidth = carousel.value?.clientWidth;

//         const centerOffset =
//           (carouselWidth! - currElement.value!.clientWidth) / 2;
//         const scrollPosition = (totalItems - carouselWidth!) / 2 + centerOffset;

//         carousel.value?.scrollTo({
//           left: scrollPosition,
//           behavior,
//         });
//       } else if (carouselStartScroll === "end") {
//         carousel.value?.scrollTo({
//           left: carousel.value.scrollWidth - parent.offsetWidth,
//           behavior,
//         });
//       }
//     }
//   };

//   nextTick(setParentContainer);

//   watch(selectedElement, (newVal) => {
//     if (newVal) {
//       nextTick(() => {
//         currElement.value = newVal;
//       });
//     }
//   });

//   watch(position, async () => {
//     if (!parentContainer.value) {
//       await nextTick(setParentContainer);
//     }

//     await nextTick();

//     currElement.value = unref(selectedElement);

//     if (scrollType === "throttle") {
//       const now = new Date().getTime();

//       if (now - lastCall >= delay) {
//         lastCall = now;
//         scrollWindow();
//       }
//     } else if (scrollType === "debounce") {
//       if (timeout) {
//         clearTimeout(timeout);
//       }
//       timeout = setTimeout(scrollWindow, delay);
//     }
//   });

//   return { optimizedArray: computed(getOptimizedArray) };
// }
