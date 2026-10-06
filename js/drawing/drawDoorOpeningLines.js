// src/drawing/drawDoorOpeningLines.js
import state from "../core/state.js";
export function drawDoorOpeningLines(
 handlePosition,
 itemGroup,
 isDual = false
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
 // فقط برای درب دوحالته:
 // همان نوک رو به بالا و خط چین پنجره دوحالته
 if (isDual) {
  const handleOffset = 25;
  const topTip = new state.paper.Point(
   itemGroup.bounds.topCenter.x,
   itemGroup.bounds.topCenter.y + handleOffset
  );
  olPath = new state.paper.Path();
  const bottomOffset = 125;
  const bottomLeft = new state.paper.Point(
   itemGroup.bounds.bottomLeft.x + bottomOffset,
   itemGroup.bounds.bottomLeft.y
  );
  const bottomRight = new state.paper.Point(
   itemGroup.bounds.bottomRight.x - bottomOffset,
   itemGroup.bounds.bottomRight.y
  );
  olPath.moveTo(bottomLeft);
  olPath.lineTo(topTip);
  olPath.lineTo(bottomRight);
  olPath.strokeColor = state.olColor;
  olPath.strokeWidth = 2;
  // دقیقاً مثل پنجره دوحالته
  olPath.style.dashArray = [60, 25];
  olPath.name = "ol";
  itemGroup.addChild(olPath);
 }
}