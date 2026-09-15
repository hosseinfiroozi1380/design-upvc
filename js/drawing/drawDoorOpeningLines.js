// src/drawing/drawDoorOpeningLines.js
import state from "../core/state.js";
export function drawDoorOpeningLines(
 handlePosition,
 itemGroup
) {
 let olPath = new state.paper.Path();
 if (handlePosition === "right") {
  // دستگیره راست → سه خط در سمت چپ
  olPath.moveTo(
   itemGroup.bounds.leftCenter.x,
   itemGroup.bounds.top + itemGroup.bounds.height * 0.13
  );
  olPath.lineTo(
   itemGroup.bounds.center.x + itemGroup.bounds.width * 0.455,
   itemGroup.bounds.top + itemGroup.bounds.height * 0.35
  );
  olPath.lineTo(
   itemGroup.bounds.center.x + itemGroup.bounds.width * 0.455,
   itemGroup.bounds.top + itemGroup.bounds.height * 0.65
  );
  olPath.lineTo(
   itemGroup.bounds.leftCenter.x,
   itemGroup.bounds.top + itemGroup.bounds.height * 0.87
  );
 } else {
  // دستگیره چپ → سه خط در سمت راست
  olPath.moveTo(
   itemGroup.bounds.rightCenter.x,
   itemGroup.bounds.top + itemGroup.bounds.height * 0.13
  );
  olPath.lineTo(
   itemGroup.bounds.center.x - itemGroup.bounds.width * 0.455,
   itemGroup.bounds.top + itemGroup.bounds.height * 0.35
  );
  olPath.lineTo(
   itemGroup.bounds.center.x - itemGroup.bounds.width * 0.455,
   itemGroup.bounds.top + itemGroup.bounds.height * 0.65
  );
  olPath.lineTo(
   itemGroup.bounds.rightCenter.x,
   itemGroup.bounds.top + itemGroup.bounds.height * 0.87
  );
 }
 olPath.strokeColor = state.olColor;
 olPath.strokeWidth = 2;
 olPath.name = "ol";
 itemGroup.addChild(olPath);
}