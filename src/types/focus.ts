import { type ComputedRef, type Ref } from "vue";

export type UseScrollIntoFocusType<T> = {
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
  carouselStartScroll?: "start" | "center" | "end";
  items?: T[];
  sliceBuffer?: number;
  //   rowClip?: "end" | "start" | "center" | "nearest";
  //   colClip?: "end" | "start" | "center" | "nearest";
};
