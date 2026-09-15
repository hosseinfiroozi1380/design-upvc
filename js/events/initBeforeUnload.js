// src/events/initBeforeUnload.js
import state from "../core/state.js";
export function initBeforeUnload() {
 window.addEventListener('beforeunload', (event) => {
  if (state.somethingChanged) {
   event.preventDefault();
   event.returnValue = 'تغییراتی دارید که ذخیره نشده‌اند. آیا مطمئن هستید که می‌خواهید صفحه را ترک کنید؟';
  }
 });
}