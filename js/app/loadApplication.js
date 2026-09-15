// src/app/loadApplication.js
import state from "../core/state.js";
import { importToProject } from "../services/importToProject.js";
import { loadLayerList } from "../services/loadLayerList.js";
export function loadApplication(savedImport) {
 if (savedImport !== null) {
  state.currentDesignID = savedImport.id;
  state.unitData = JSON.parse(savedImport.data);
  importToProject(savedImport.design);
  $('.layerName').val(state.unitData.name);
  $('.location').val(state.unitData.location);
  $('.layerQuantity').val(state.unitData.quantity);
  loadLayerList();
  $('.preloadPage').addClass('d-none');
 } else {
  // $('#ofcAddNew').offcanvas('show');
  $('.preloadPage').addClass('d-none');
 }
}