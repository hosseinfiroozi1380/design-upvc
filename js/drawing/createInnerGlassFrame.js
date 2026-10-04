// js/drawing/createInnerGlassFrame.js

import state from "../core/state.js";
import PaperOffset from "../utils/PaperOffset.js";
import { setDefaultData } from "../utils/setDefaultData.js";

export function createInnerGlassFrame(flat) {

 if (!flat || flat.removed) {
  return;
 }

 // اگر قبلاً فریم داخلی وجود دارد حذف شود
 const oldFrame = flat.getItem({
  name: "innerGlassFrame"
 });

 if (oldFrame) {
  oldFrame.remove();
 }

 /*
  * فاصله فریم داخلی از مرز مشکی شیشه
  */
 const frameOffset = 15;

 /*
  * ضخامت فریم داخلی
  */
 const frameWidth = 10;

 // ==========================================
 // محدوده بیرونی فریم
 // ==========================================

 const outerFrame = PaperOffset.offset(
  flat,
  -frameOffset
 );

 if (!outerFrame) {
  return;
 }

 // ==========================================
 // محدوده داخلی فریم
 // ==========================================

 const innerFlat = PaperOffset.offset(
  outerFrame,
  -frameWidth
 );

 if (!innerFlat) {
  outerFrame.remove();
  return;
 }

 // ==========================================
 // ساخت فریم واقعی
 // ==========================================

 const innerFrame = outerFrame.subtract(
  innerFlat
 );

 outerFrame.remove();
 innerFlat.remove();

 if (!innerFrame) {
  return;
 }

 innerFrame.name = "innerGlassFrame";

 innerFrame.fillColor = "#ffffff";

 innerFrame.strokeColor = "#000000";

 innerFrame.strokeWidth = state.strokeColor
  ? 2
  : 2;

 setDefaultData(
  innerFrame,
  "mainFrame"
 );

 innerFrame.data.isInnerGlassFrame = true;

 /*
  * فریم داخل خود flat قرار بگیرد
  */
 flat.addChild(innerFrame);

 return innerFrame;
}