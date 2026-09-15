// src/geometry/weldSizeExtraSize.js
import state from "../core/state.js";
// export function weldSizeExtraSize(degree) {
//     const system = state.unitData?.system ?? "Al";
//     const weldSize = Number(state.weldSize ?? 0);
//     if (system === "Al") {
//         return 0;
//     }
//     const radian = degree * Math.PI / 180;
//     const sin = Math.sin(radian);
//     // جلوگیری از تقسیم بر صفر
//     if (Math.abs(sin) < 0.000001) {
//         return 0;
//     }
//     return weldSize / sin;
// }

export function weldSizeExtraSize(degree){
    return 0;
    let system = unitData['system'];
    if(system == "Al"){
        return 0;
    } else {
        let radian = degree * Math.PI/180;
        let sin = weldSize/Math.sin(radian);
        return sin;
    }
}