import { showMessage } from "../utils/showMessage.js";

export function initNetworkStatus() {
 window.addEventListener("offline", () => {
  showMessage("اتصال اینترنت قطع شد", "error", 5000);
 });

 window.addEventListener("online", () => {
  showMessage("اتصال اینترنت برقرار شد", "success", 3000);
 });

 if (!navigator.onLine) {
  showMessage("اتصال اینترنت قطع است", "error", 5000);
 }
}