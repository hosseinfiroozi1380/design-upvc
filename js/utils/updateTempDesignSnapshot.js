//
import state from "../core/state.js";
export function updateTempDesignSnapshot() {
 if (!state.currentDesignID) return;
 const design = state.tempDesigns?.find(
  item => String(item.id) === String(state.currentDesignID)
 );
 if (!design) return;
 design.paperJSON = state.paper.project.exportJSON({
  asString: true
 });
 design.unitData = JSON.parse(
  JSON.stringify(state.unitData)
 );
 console.log(
  "TEMP SNAPSHOT UPDATED:",
  state.currentDesignID
 );
}