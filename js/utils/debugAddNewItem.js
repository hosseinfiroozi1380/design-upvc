//
import state from "../core/state.js";
export function debugAddNewItemStart(
 type,
 flat,
 point
) {
 console.clear();
 console.log("==============================");
 console.log(" ADD NEW ITEM DEBUG START ");
 console.log("==============================");
 console.log("1 - INPUT DATA");
 console.table({
  argumentType: type,
  stateType: state.addNewItemType,
  waiting: state.waitingToAddItemFlag,
  selected: state.selectedItem?.name,
  flatName: flat?.name,
  flatWidth: flat?.bounds?.width,
  flatHeight: flat?.bounds?.height
 });
 console.log("2 - CHECK TYPE");
 switch (type) {
  case "vMullian":
   console.log("OK : SINGLE V MULLIAN");
   break;
  case "hMullian":
   console.log("OK : SINGLE H MULLIAN");
   break;
  case "2vMullian":
   console.log("OK : DOUBLE V MULLIAN");
   break;
  case "3vMullian":
   console.log("OK : TRIPLE V MULLIAN");
   break;
  case "2hMullian":
   console.log("OK : DOUBLE H MULLIAN");
   break;
  case "3hMullian":
   console.log("OK : TRIPLE H MULLIAN");
   break;
  case "fullvMullian":
   console.log("OK : FULL V MULLIAN");
   break;
  case "fullhMullian":
   console.log("OK : FULL H MULLIAN");
   break;
  default:
   console.log("UNKNOWN TYPE !!!");
 }
 console.log("3 - POINT");
 if (point) {
  console.table({
   x: point.x,
   y: point.y
  });
 } else {
  console.log("NO POINT !!!");
 }
 console.log("4 - FLAT CHECK");
 if (!flat) {
  console.log("ERROR : FLAT IS NULL");
  return false;
 }
 if (flat.name !== "flat") {
  console.log(
   "ERROR : SELECTED ITEM IS NOT FLAT",
   flat.name
  );
  return false;
 }
 console.log("OK : FLAT READY");
 console.log("==============================");
 console.log(" DEBUG END ");
 console.log("==============================");
 return true;
}