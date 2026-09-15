// src/utils/set3D.js
import state from "../core/state.js";
export async function set3D(item = null, designID = null) {
    try {
        if (!state.paper?.project) {
            console.warn("Paper.js project پیدا نشد");
            return false;
        }
        // اگر آیتم مشخص نشده، کل طراحی فعلی را بگیر
        if (!item) {
            item = state.paper.project.activeLayer.getItem({
                name: "section"
            });
        }
        if (!item) {
            console.warn("آیتمی برای نمایش سه بعدی پیدا نشد");
            return false;
        }
        console.log("3D TARGET:", item.name || item.className);
        const bounds = item.bounds;
        if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
            console.warn("ابعاد آیتم برای 3D معتبر نیست");
            return false;
        }
        // ----------------------------------------------------
        // گرفتن SVG فقط از همین آیتم
        // ----------------------------------------------------
        const svgElement = item.exportSVG({
            asString: false,
            bounds: "content"
        });
        if (!svgElement) {
            console.warn("SVG آیتم ساخته نشد");
            return false;
        }
        let svgRoot = svgElement;
        if (
            !svgElement.tagName ||
            svgElement.tagName.toLowerCase() !== "svg"
        ) {
            const wrapper =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "svg"
                );
            wrapper.appendChild(
                svgElement.cloneNode(true)
            );
            svgRoot = wrapper;
        }
        svgRoot.setAttribute(
            "xmlns",
            "http://www.w3.org/2000/svg"
        );
        svgRoot.setAttribute(
            "viewBox",
            `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`
        );
        svgRoot.setAttribute(
            "width",
            bounds.width
        );
        svgRoot.setAttribute(
            "height",
            bounds.height
        );
        // ----------------------------------------------------
        // حذف attributeهای Paper.js
        // ----------------------------------------------------
        svgRoot
            .querySelectorAll(
                "[xmlns\\:paper], [paper-id]"
            )
            .forEach((element) => {
                element.removeAttribute("xmlns:paper");
                element.removeAttribute("paper-id");
            });
        // ----------------------------------------------------
        // SVG → String
        // ----------------------------------------------------
        const serializer =
            new XMLSerializer();
        const svgString =
            serializer.serializeToString(svgRoot);
        if (!svgString) {
            console.warn("SVG String خالی است");
            return false;
        }
        // ----------------------------------------------------
        // Three.js باید قبلاً توسط js/lib/3d.js لود شده باشد
        // ----------------------------------------------------
        if (!window.update3DModel) {
            console.error(
                "update3DModel پیدا نشد. js/lib/3d.js را بررسی کن."
            );
            return false;
        }
        if (
            !window.init3D &&
            document.getElementById("3d")
        ) {
            console.error(
                "init3D پیدا نشد."
            );
            return false;
        }
        // ----------------------------------------------------
        // ساخت مدل
        // ----------------------------------------------------
        if (window.init3D) {
            window.init3D("3d");
        }
        const result =
            await window.update3DModel(
                svgString,
                designID ||
                state.currentDesignID ||
                Date.now()
            );
        if (window.resize3D) {
            requestAnimationFrame(() => {
                window.resize3D();
            });
        }
        return result;
    } catch (error) {
        console.error(
            "خطا در set3D:",
            error
        );
        return false;
    }
}