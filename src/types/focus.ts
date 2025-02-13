import { type ComputedRef, type Ref } from "vue";

export type useScrollIntoFocusType = {
  position: Ref<{
    row: number;
    col: number;
  }>;
  selectedElement: ComputedRef<HTMLElement | null> | Ref<HTMLElement | null>;
  behavior?: "smooth" | "instant";
  delay?: number;
  focusableSelector?: string;
  parentSelector?: string;
  buffer?: number;
  bufferX?: number;
  bufferY?: number;
  suppressLogs?: boolean;
  scrollType: "throttle" | "debounce";
  //   rowClip?: "end" | "start" | "center" | "nearest";
  //   colClip?: "end" | "start" | "center" | "nearest";
};
