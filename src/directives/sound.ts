// src/directives/sound.ts
import type { Directive, DirectiveBinding } from "vue";
import { SoundManager } from "@/utils/SoundManager";

interface SoundEl extends HTMLElement {
  __soundHandler__?: (e: Event) => void;
}

export const soundDirective: Directive<
  SoundEl,
  string | { key: string; event?: string }
> = {
  mounted(el, binding: DirectiveBinding) {
    // binding.value can be either a string (the key) or an object
    const { key, event = "click" } =
      typeof binding.value === "string"
        ? { key: binding.value, event: "click" }
        : binding.value;

    const handler = () => {
      SoundManager.instance.play(key as any);
    };

    el.__soundHandler__ = handler;
    el.addEventListener(event, handler);
  },
  unmounted(el) {
    if (el.__soundHandler__) {
      el.removeEventListener("click", el.__soundHandler__);
      delete el.__soundHandler__;
    }
  },
};
