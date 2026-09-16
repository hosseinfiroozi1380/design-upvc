// src/events/initContextMenu.js
import state from "../core/state.js";
import { itemDetailsBar } from "../utils/itemDetailsBar.js";
export function initContextMenu() {
 const canvas = state.paper.view.element;
 canvas.addEventListener(
  "contextmenu",
  function (event) {
   event.preventDefault();
   event.stopPropagation();
   const rect =
    canvas.getBoundingClientRect();
   const point =
    state.paper.view.viewToProject({
     x: event.clientX - rect.left,
     y: event.clientY - rect.top
    });
   const hit =
    state.paper.project.hitTest(point, {
     fill: true,
     stroke: true,
     segments: true,
     tolerance: 5
    });
   if (!hit || !hit.item) {
    $(".wd-unit-details").hide();
    return;
   }
   let selectedItem = hit.item;
   // پیدا کردن آیتم اصلی
   while (
    selectedItem.parent &&
    selectedItem.parent !==
    state.paper.project.activeLayer &&
    ![
     "mainFrame",
     "flat",
     "windowFrame",
     "doorFrame",
     "vMullian",
     "hMullian",
     "vPanel",
     "hPanel",
     "vCoupling",
     "hCoupling"
    ].includes(selectedItem.name)
   ) {
    selectedItem =
     selectedItem.parent;
   }
   state.selectedItem = selectedItem;
   console.log(
    "RIGHT CLICK:",
    selectedItem.name
   );
   // ساخت فرم مربوط به همان آیتم
   itemDetailsBar(selectedItem);
   const myDiv =
    $(".wd-unit-details");
   let left = event.clientX;
   let top = event.clientY;
   const divWidth =
    myDiv.outerWidth();
   const divHeight =
    myDiv.outerHeight();
   const windowWidth =
    $(window).width();
   const windowHeight =
    $(window).height();
   if (
    left + divWidth >
    windowWidth
   ) {
    left =
     windowWidth -
     divWidth -
     10;
   }
   if (
    top + divHeight >
    windowHeight
   ) {
    top =
     windowHeight -
     divHeight -
     10;
   }
   myDiv.css({
    display: "block",
    position: "fixed",
    left: left + "px",
    top: top + "px",
    "z-index": 9999
   });
  },
  true
 );
 // جلوگیری از رسیدن کلیک فرم به Canvas
 $(document).on(
  "mousedown.contextDetails",
  ".wd-unit-details",
  function (event) {
   event.stopPropagation();
  }
 );
 // کلیک روی Select فرم
 $(document).on(
  "click.contextDetails",
  ".wd-unit-details select",
  function (event) {
   event.stopPropagation();
  }
 );
 // تغییر مقدار Select
 $(document).on(
  "change.contextDetails",
  ".wd-unit-details select",
  function (event) {
   event.stopPropagation();
   console.log(
    "DETAIL CHANGE:",
    $(this).attr("class"),
    $(this).val()
   );
   /*
    * آیتمی که با راست‌کلیک انتخاب شده
    * همچنان در state باقی می‌ماند.
    */
   const selectedItem =
    state.selectedItem;
   if (!selectedItem) {
    return;
   }
   console.log(
    "SELECTED ITEM:",
    selectedItem.name
   );
   console.log(
    "NEW VALUE:",
    $(this).val()
   );
  }
 );
 // کلیک داخل فرم نباید فرم را ببندد
 $(document).on(
  "pointerdown.contextDetails",
  ".wd-unit-details",
  function (event) {
   event.stopPropagation();
  }
 );
}