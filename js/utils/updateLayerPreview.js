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
 const svg = state.paper.project.exportSVG({
  asString: true,
  bounds: 'content'
 });
 console.log("EXPORTED SVG:", svg);
 if (!svg) {
  console.warn("SVG خالی تولید شد");
  return;
 }
 $thumb.html(svg);
 const $svg = $thumb.find('svg');
 console.log("SVG INSERTED:", $svg.length);
 if ($svg.length) {
  $svg.attr({
   width: '100%',
   height: '100%',
   preserveAspectRatio: 'xMidYMid meet'
  });
 }
 console.log(
  "FINAL THUMB HTML:",
  $thumb.html()
 );
}