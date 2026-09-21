// src/utils/updateLayerPreview.js
import state from "../core/state.js";
export function updateLayerPreview() {
 console.log("UPDATE LAYER PREVIEW START");
 if (!state.paper || !state.paper.project) {
  console.warn("Paper project پیدا نشد");
  return;
 }
 const $card = $('.wd-item-card.is-active');
 console.log("ACTIVE CARD:", $card.length);
 if (!$card.length) {
  console.warn("کارت فعال پیدا نشد");
  return;
 }
 const $thumb = $card.find('.svgThumb');
 console.log("SVG THUMB:", $thumb.length);
 if (!$thumb.length) {
  console.warn("عنصر .svgThumb داخل کارت پیدا نشد");
  return;
 }
 console.log(
  "PAPER CHILDREN:",
  state.paper.project.activeLayer.children.length
 );
 // اندازه‌گذاری‌های Canvas
 const dimensionGroup =
  state.paper.project.activeLayer.getItem({
   name: "dbG"
  });
 // خطوط بازشو
 const openingLines =
  state.paper.project.activeLayer.getItems({
   name: "ol"
  });
 // مخفی کردن موقت اندازه‌گذاری‌ها
 if (dimensionGroup) {
  dimensionGroup.visible = false;
  console.log("DIMENSION BAR HIDDEN FOR PREVIEW");
 }
 // مخفی کردن موقت خطوط بازشو
 openingLines.forEach(item => {
  item.visible = false;
 });
 console.log(
  "OPENING LINES HIDDEN:",
  openingLines.length
 );
 let svg = null;
 try {
  svg = state.paper.project.exportSVG({
   asString: true,
   bounds: "content"
  });
 } finally {
  // برگرداندن اندازه‌گذاری‌های Canvas
  if (dimensionGroup) {
   dimensionGroup.visible = true;
   console.log("DIMENSION BAR RESTORED");
  }
  // برگرداندن خطوط بازشو در Canvas
  openingLines.forEach(item => {
   item.visible = true;
  });
  console.log("OPENING LINES RESTORED");
 }
 console.log("EXPORTED SVG:", svg);
 if (!svg) {
  console.warn("SVG خالی تولید شد");
  return;
 }
 // قرار دادن SVG داخل پیش‌نمایش کارت
 $thumb.html(svg);
 const $svg = $thumb.find('svg');
 console.log("SVG INSERTED:", $svg.length);
 if ($svg.length) {
  $svg.attr({
   width: "100%",
   height: "100%",
   preserveAspectRatio: "xMidYMid meet"
  });
 }
 console.log(
  "FINAL THUMB HTML:",
  $thumb.html()
 );
}


// import state from "../core/state.js";
// export function updateLayerPreview() {
//  console.log("UPDATE LAYER PREVIEW START");
//  if (!state.paper || !state.paper.project) {
//   console.warn("Paper project پیدا نشد");
//   return;
//  }
//  const $card = $('.wd-item-card.is-active');
//  console.log("ACTIVE CARD:", $card.length);
//  if (!$card.length) {
//   console.warn("کارت فعال پیدا نشد");
//   return;
//  }
//  const $thumb = $card.find('.svgThumb');
//  console.log("SVG THUMB:", $thumb.length);
//  if (!$thumb.length) {
//   console.warn("عنصر .svgThumb داخل کارت پیدا نشد");
//   return;
//  }
//  console.log(
//   "PAPER CHILDREN:",
//   state.paper.project.activeLayer.children.length
//  );
//  // اندازه‌گذاری‌های Canvas را پیدا می‌کنیم
//  const dimensionGroup =
//   state.paper.project.activeLayer.getItem({
//    name: "dbG"
//   });
//  // فقط برای گرفتن SVG پیش‌نمایش مخفی می‌کنیم
//  if (dimensionGroup) {
//   dimensionGroup.visible = false;
//   console.log("DIMENSION BAR HIDDEN FOR PREVIEW");
//  }
//  let svg = null;
//  try {
//   svg = state.paper.project.exportSVG({
//    asString: true,
//    bounds: "content"
//   });
//  } finally {
//   // بعد از گرفتن SVG دوباره اندازه‌گذاری‌های Canvas را نمایش می‌دهیم
//   if (dimensionGroup) {
//    dimensionGroup.visible = true;
//    console.log("DIMENSION BAR RESTORED");
//   }
//  }
//  console.log("EXPORTED SVG:", svg);
//  if (!svg) {
//   console.warn("SVG خالی تولید شد");
//   return;
//  }
//  // قرار دادن SVG داخل پیش‌نمایش کارت
//  $thumb.html(svg);
//  const $svg = $thumb.find('svg');
//  console.log("SVG INSERTED:", $svg.length);
//  if ($svg.length) {
//   $svg.attr({
//    width: "100%",
//    height: "100%",
//    preserveAspectRatio: "xMidYMid meet"
//   });
//  }
//  console.log(
//   "FINAL THUMB HTML:",
//   $thumb.html()
//  );
// }