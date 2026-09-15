import state from "../core/state.js";
import { updateLayerPreview } from "./updateLayerPreview.js";

export function createTempLayerCard() {

    console.log("========== CREATE / UPDATE TEMP LAYER ==========");

    console.log(
        "CURRENT DESIGN ID:",
        state.currentDesignID
    );

    console.log(
        "UNIT DATA:",
        state.unitData
    );

    console.log(
        "PAPER CHILDREN:",
        state.paper?.project?.activeLayer?.children?.length
    );

    /*
     * اطلاعات فعلی طراحی
     */
    const name =
        state.unitData?.name ||
        `طراحی ${Date.now()}`;

    const width =
        state.unitData?.width ||
        state.unitData?.itemWidth ||
        state.unitData?.abcd?.[0] ||
        0;

    const height =
        state.unitData?.height ||
        state.unitData?.itemHeight ||
        state.unitData?.abcd?.[1] ||
        0;

    const system =
        state.unitData?.system ||
        "UPVC";


    /*
     * پیدا کردن طراحی فعلی
     *
     * اگر currentDesignID داشته باشیم
     * یعنی داریم همان طراحی را تغییر می‌دهیم.
     */
    let currentDesign = null;

    if (
        state.currentDesignID &&
        Array.isArray(state.tempDesigns)
    ) {
        currentDesign =
            state.tempDesigns.find(
                item =>
                    String(item.id) ===
                    String(state.currentDesignID)
            );
    }


    /*
     * ==================================================
     * اگر طراحی قبلاً وجود دارد
     * فقط همان طراحی را آپدیت کن
     * ==================================================
     */
    if (currentDesign) {

        console.log(
            "UPDATE EXISTING TEMP DESIGN:",
            state.currentDesignID
        );

        currentDesign.paperJSON =
            state.paper.project.exportJSON({
                asString: true
            });

        currentDesign.unitData =
            JSON.parse(
                JSON.stringify(
                    state.unitData || {}
                )
            );

        currentDesign.name = name;
        currentDesign.width = width;
        currentDesign.height = height;
        currentDesign.system = system;


        /*
         * کارت قبلی
         */
        const $card =
            $("#layer_" + state.currentDesignID);


        /*
         * اطلاعات کارت را آپدیت کن
         */
        if ($card.length) {

            $card.find(".wd-item-title")
                .text(name);

            $card.find(".wd-item-size")
                .text(
                    `${width}x${height}`
                );

            $card.find(".wd-item-brand")
                .text(system);

            /*
             * همان کارت فعال بماند
             */
            $(".wd-item-card")
                .removeClass("is-active");

            $card.addClass("is-active");
        }


        /*
         * پیش‌نمایش همان کارت آپدیت شود
         */
        updateLayerPreview();

        console.log(
            "TEMP DESIGN UPDATED:",
            state.currentDesignID
        );

        return;
    }


    /*
     * ==================================================
     * طراحی جدید
     * ==================================================
     */

    const designID = Date.now();

    state.currentDesignID = designID;

    console.log(
        "CREATE NEW TEMP DESIGN:",
        designID
    );


    /*
     * اطمینان از وجود آرایه
     */
    if (!Array.isArray(state.tempDesigns)) {
        state.tempDesigns = [];
    }


    /*
     * ذخیره Snapshot
     */
    const paperJSON =
        state.paper.project.exportJSON({
            asString: true
        });


    state.tempDesigns.push({

        id: designID,

        paperJSON: paperJSON,

        unitData:
            JSON.parse(
                JSON.stringify(
                    state.unitData || {}
                )
            ),

        name: name,

        width: width,

        height: height,

        system: system
    });


    console.log(
        "TEMP DESIGN SAVED:",
        designID
    );


    /*
     * ساخت کارت
     */
    const card = `
        <div
            class="wd-item-card is-active"
            id="layer_${designID}"
        >

            <div class="wd-item-select">

                <input
                    class="designCheckbox"
                    type="checkbox"
                    value="${designID}"
                    checked
                />

            </div>

            <div class="wd-item-symbol svgThumb"></div>

            <div class="wd-item-details">

                <span
                    class="wd-item-title"
                    data-id="${designID}"
                >
                    ${name}
                </span>

                <span class="wd-item-size itemDimetions">
                    ${width}x${height}
                </span>

            </div>

            <span class="wd-item-brand">
                ${system}
            </span>

            <button
                class="wd-item-delete layerDelete"
                type="button"
                title="حذف"
            >
                <i class="ti ti-trash"></i>
            </button>

        </div>
    `;


    /*
     * Layer list
     */
    const $layerList =
        $("#layerlist");


    console.log(
        "LAYERLIST:",
        $layerList.length
    );


    if (!$layerList.length) {

        console.error(
            "عنصر #layerlist پیدا نشد."
        );

        return;
    }


    /*
     * کارت‌های قبلی غیرفعال شوند
     */
    $layerList
        .find(".wd-item-card")
        .removeClass("is-active");


    /*
     * کارت جدید فقط همین یک بار ساخته شود
     */
    $layerList.prepend(card);


    console.log(
        "CARD CREATED:",
        designID
    );


    /*
     * پیش‌نمایش
     */
    updateLayerPreview();


    console.log(
        "LAYER PREVIEW UPDATED"
    );
}


/*
 * ==================================================
 * حذف موقت کارت
 * ==================================================
 */

$(document)
    .off(
        "click.tempLayerDelete",
        ".layerDelete"
    );

$(document)
    .on(
        "click.tempLayerDelete",
        ".layerDelete",
        function (e) {

            e.preventDefault();
            e.stopPropagation();


            const $card =
                $(this).closest(
                    ".wd-item-card"
                );


            if (!$card.length) {
                return;
            }


            const designID =
                $card
                    .attr("id")
                    .replace(
                        "layer_",
                        ""
                    );


            console.log(
                "DELETE TEMP LAYER:",
                designID
            );


            /*
             * حذف Snapshot
             */
            if (
                Array.isArray(
                    state.tempDesigns
                )
            ) {

                state.tempDesigns =
                    state.tempDesigns.filter(
                        item =>
                            String(item.id) !==
                            String(designID)
                    );
            }


            /*
             * اگر همین طراحی فعال بود،
             * currentDesignID صفر شود
             */
            if (
                String(
                    state.currentDesignID
                ) ===
                String(designID)
            ) {

                state.currentDesignID = 0;
            }


            /*
             * حذف کارت
             */
            $card.remove();
        }
    );