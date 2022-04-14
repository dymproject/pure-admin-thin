import { storageSession } from "/@/utils/storage";
import { Directive } from "vue";
import type { DirectiveBinding } from "vue";

export const auth: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    if (value) {
      const security = value;
      const securities = storageSession.getItem("security");
      if (Array.isArray(securities)) {
        const hasAuth = securities.find(x => x.securityCode == security);
        if (!hasAuth) {
          el.parentNode.removeChild(el);
        }
      }
    } else {
      throw new Error("securitiy code is required");
    }
  }
};
