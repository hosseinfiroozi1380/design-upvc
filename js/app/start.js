// src/app/start.js
console.log("START FILE:", import.meta.url);
import { initApplication } from "../core/init.js";
import { initClickEvents } from "../events/initClickEvents.js";
import { initFormEvents } from "../events/initFormEvents.js";
import { initLayerEvents } from "../events/initLayerEvents.js";
import { initPaperToolEvents } from "../events/initPaperToolEvents.js";
import { loadApplication } from "./loadApplication.js";
import { initBeforeUnload } from "../events/initBeforeUnload.js";
import { initHistory } from "../events/initHistory.js";
import { initContextMenu } from "../events/initContextMenu.js";
import { initPinchZoom } from "../events/initPinchZoom.js";
$(function () {
  console.log("DOM READY");
  try {
    console.log("before initApplication");
    initApplication();
    console.log("after initApplication");
    // زوم لمسی بعد از آماده شدن Paper.js
    initPinchZoom();
    console.log("before initClickEvents");
    initClickEvents();
    console.log("after initClickEvents");
    console.log("before initFormEvents");
    initFormEvents();
    console.log("after initFormEvents");
    console.log("before initLayerEvents");
    initLayerEvents();
    console.log("after initLayerEvents");
    console.log("before initPaperToolEvents");
    initPaperToolEvents();
    console.log("after initPaperToolEvents");
    initBeforeUnload();
    initHistory();
    initContextMenu();
  } catch (e) {
    console.error("START ERROR:", e);
  }
});