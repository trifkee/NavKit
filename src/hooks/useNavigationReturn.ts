import { onMounted, onUnmounted, ref, unref, watch, type Ref } from "vue";

import { KeyboardEnum } from "../enums/keyboard.enum";

export function useNavigationReturn({
  onReturn,
  disabled,
}: {
  onReturn: () => void;
  disabled?: Ref<boolean>;
}) {
  // Disabling the hook
  const isDisabled = ref(unref(disabled));

  const toggleDisabled = (value?: boolean) => {
    if (value !== undefined) {
      isDisabled.value = value;
    } else {
      isDisabled.value = !isDisabled.value;
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === KeyboardEnum.Back) {
      onReturn();
    }
  };

  // Check for disabled value, remove listeners if is disabled
  watch(isDisabled, (newValue) => {
    if (newValue) {
      window.removeEventListener("keydown", handleKeyDown);
    } else {
      window.addEventListener("keydown", handleKeyDown);
    }
  });

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });

  return { toggleDisabled };
}
