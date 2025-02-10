import { computed, unref, watch, type ComputedRef, type Ref } from "vue";

type useScrollIntoFocusType = {
  position: Ref<{
    row: number;
    col: number;
  }>;
  selectedElement: ComputedRef<HTMLElement | null>;
  behavior?: "smooth" | "instant";
  debounceTimeout?: number;
  focusableSelector?: string;
  //   rowClip?: "end" | "start" | "center" | "nearest";
  //   colClip?: "end" | "start" | "center" | "nearest";
};

export function useScrollIntoFocus({
  position,
  selectedElement,
  behavior = "smooth",
  debounceTimeout = 200,
  focusableSelector = "[data-scrollable]",
}: useScrollIntoFocusType) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const currElement = computed(() => unref(selectedElement));
  const parentContainer = computed<HTMLElement | null>(
    () => document.querySelector(focusableSelector) || null
  );

  watch(position, () => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      currElement?.value &&
        parentContainer.value?.scrollTo({
          top:
            currElement?.value?.offsetTop -
            parentContainer.value?.offsetTop -
            180,
          behavior,
        });
    }, debounceTimeout);
  });
}
