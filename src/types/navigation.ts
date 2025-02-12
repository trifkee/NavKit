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
