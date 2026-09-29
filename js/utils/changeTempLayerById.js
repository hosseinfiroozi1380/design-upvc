// js/utils/changeTempLayerById.js
import state from "../core/state.js";
import { createGLs } from "../drawing/createGLs.js";
import { createDimensionBar } from "../drawing/createDimensionBar.js";
import { updateLayerDetailsMenuOptions } from "./updateLayerDetailsMenuOptions.js";
import { filterAutomateCreationBtns } from "./filterAutomateCreationBtns.js";
import { set3D } from "./set3D.js";
import { setZoom } from "../events/setZoom.js";
export function changeTempLayerById(designID) {
  const design =
    state.tempDesigns?.find(
      item =>
        String(item.id) ===
        String(designID)
    );
  if (!design) {
    console.warn(
      "TEMP DESIGN NOT FOUND:",
      designID
    );
    return;
  }
  state.currentDesignID =
    designID;
  console.log(
    "CHANGE TEMP DESIGN:",
    designID
  );
  state.unitData =
    JSON.parse(
      JSON.stringify(
        design.unitData
      )
    );
  state.paper.project.clear();
  state.paper.project.importJSON(
    design.paperJSON
  );
  const activeLayer =
    state.paper.project.activeLayer;
  const sections =
    activeLayer.getItems({
      name: "section"
    });
  state.mainSection =
    sections.find(
      section => {
        const sectionDesignID =
          section?.data?.designID;
        return (
          String(sectionDesignID) ===
          String(designID)
        );
      }
    ) || sections[0] || null;
  if (state.mainSection) {
    state.mainFrame =
      state.mainSection.getItem({
        name: "mainFrame"
      });
    state.mainFlat =
      state.mainSection.getItem({
        name: "mainFlat"
      });
  } else {
    state.mainFrame =
      activeLayer.getItem({
        name: "mainFrame"
      });
    state.mainFlat =
      activeLayer.getItem({
        name: "mainFlat"
      });
  }
  console.log(
    "ACTIVE SECTION:",
    state.mainSection
  );
  console.log(
    "ACTIVE SECTION ID:",
    state.mainSection?.id
  );
  console.log(
    "CURRENT DESIGN ID:",
    state.currentDesignID
  );
  if (
    !state.mainFrame ||
    !state.mainFlat
  ) {
    console.warn(
      "MAIN FRAME OR MAIN FLAT NOT FOUND"
    );
    return;
  }
  state.extra_frame_lenght =
    parseFloat(
      $('.frameInput option[value="' +
        state.mainFrame.data.profile +
        '"]')
        .data(
          'extra_frame_lenght'
        ) || 0
    );
  updateLayerDetailsMenuOptions();
  createGLs();
  createDimensionBar();
  const glassColor =
    $('.glassInput option[value="' +
      state.unitData.glass_id +
      '"]')
      .data('color');
  if (glassColor) {
    state.flatColor =
      new state.paper.Color(
        glassColor
      );
  }
  $('.layerName')
    .val(
      state.unitData.name
    );
  $('.location')
    .val(
      state.unitData.location
    );
  $('.layerQuantity')
    .val(
      state.unitData.quantity
    );
  $('#pattern_id')
    .val(
      state.unitData.pattern_id
    );
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
  $('.wd-item-card')
    .removeClass(
      'is-active'
    );
  $('#layer_' + designID)
    .addClass(
      'is-active'
    );
  requestAnimationFrame(() => {
    setZoom();
  });
}