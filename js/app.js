// js/app.js

import { initApplication } from "./core/init.js";
import { initClickEvents } from "./events/initClickEvents.js";
import { initFormEvents } from "./events/initFormEvents.js";
import { initLayerEvents } from "./events/initLayerEvents.js";
import { initPaperToolEvents } from "./events/initPaperToolEvents.js";
import { initBeforeUnload } from "./events/initBeforeUnload.js";
import { initHistory } from "./events/initHistory.js";
import { initContextMenu } from "./events/initContextMenu.js";
import { initPinchZoom } from "./events/initPinchZoom.js";
import { initConfigItemEvents } from "./events/initConfigItemEvents.js";
import { initNetworkStatus } from "./utils/initNetworkStatus.js";

$(function () {
  try {
    // تنظیمات اولیه آیتم‌ها
    initConfigItemEvents();

    // راه‌اندازی اصلی برنامه و Paper.js
    initApplication();

    // زوم لمسی
    initPinchZoom();

    // رویدادهای کلیک
    initClickEvents();

    // رویدادهای فرم
    initFormEvents();

    // رویدادهای لایه‌ها
    initLayerEvents();

    // ابزارهای Paper.js
    initPaperToolEvents();

    // جلوگیری از خروج ناخواسته
    initBeforeUnload();

    // مدیریت تاریخچه Undo / Redo
    initHistory();

    // منوی راست‌کلیک
    initContextMenu();

    initNetworkStatus();

  } catch (e) {
    console.error("START ERROR:", e);
  }
});