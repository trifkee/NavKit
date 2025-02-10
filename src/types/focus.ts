import { ComputedRef, Ref } from "vue";

export type useScrollIntoFocusType = {
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
