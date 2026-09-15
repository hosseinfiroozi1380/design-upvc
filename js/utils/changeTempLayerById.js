//
import state from "../core/state.js";
import { createGLs } from "../drawing/createGLs.js";
import { createDimensionBar } from "../drawing/createDimensionBar.js";
import { updateLayerDetailsMenuOptions } from "./updateLayerDetailsMenuOptions.js";
import { filterAutomateCreationBtns } from "./filterAutomateCreationBtns.js";
import { set3D } from "./set3D.js";
export function changeTempLayerById(designID) {
 const design = state.tempDesigns?.find(
  item => String(item.id) === String(designID)
 );
 if (!design) {
  console.warn(
   "TEMP DESIGN NOT FOUND:",
   designID
  );
  return;
 }
 // این طراحی، طراحی فعال فعلی است
 state.currentDesignID = designID;
 console.log(
  "CHANGE TEMP DESIGN:",
  designID
 );
 // اطلاعات طراحی
 state.unitData = JSON.parse(
  JSON.stringify(design.unitData)
 );
 // برگرداندن پروژه
 state.paper.project.clear();
 state.paper.project.importJSON(
  design.paperJSON
 );
 state.paper.project.view.update();
 // پیدا کردن فریم اصلی
 state.mainSection =
  state.paper.project.activeLayer.getItem({
   name: "section"
  });
 state.mainFrame =
  state.paper.project.activeLayer.getItem({
   name: "mainFrame"
  });
 state.mainFlat =
  state.paper.project.activeLayer.getItem({
   name: "mainFlat"
  });
 if (!state.mainFrame || !state.mainFlat) {
  console.warn(
   "MAIN FRAME OR MAIN FLAT NOT FOUND"
  );
  return;
 }
 // تنظیمات فریم
 state.extra_frame_lenght =
  parseFloat(
   $('.frameInput option[value="' +
    state.mainFrame.data.profile +
    '"]')
    .data('extra_frame_lenght') || 0
  );
 updateLayerDetailsMenuOptions();
 createGLs();
 createDimensionBar();
 // رنگ شیشه
 const glassColor =
  $('.glassInput option[value="' +
   state.unitData.glass_id +
   '"]')
   .data('color');
 if (glassColor) {
  state.flatColor =
   new state.paper.Color(glassColor);
 }
 // فرم
 $('.layerName')
  .val(state.unitData.name);
 $('.location')
  .val(state.unitData.location);
 $('.layerQuantity')
  .val(state.unitData.quantity);
 $('#pattern_id')
  .val(state.unitData.pattern_id);
 // تنظیمات سیستم
 state.defaultOverlap =
  state.unitData.system === "Al"
   ? 6
   : 8;
 state.mullianExtend =
  state.unitData.system === "Al"
   ? 0
   : 3;
 filterAutomateCreationBtns();
 set3D();
 // کارت فعال
 $('.wd-item-card')
  .removeClass('is-active');
 $('#layer_' + designID)
  .addClass('is-active');
}