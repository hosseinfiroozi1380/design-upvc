// js/utils/createTempLayerCard.js
import state from "../core/state.js";
import { updateLayerPreview } from "./updateLayerPreview.js";
import { createDimensionBar } from "../drawing/createDimensionBar.js";
import { changeTempLayerById } from "./changeTempLayerById.js";
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
        state.unitData?.itemName ||
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
     * section مربوط به طراحی فعلی
     *
     * هر طراحی اصلی داخل mainSection قرار دارد.
     */
    const currentSection =
        state.mainSection || null;
    const currentSectionId =
        currentSection?.id || null;
    console.log(
        "CURRENT MAIN SECTION:",
        currentSection
    );
    console.log(
        "CURRENT MAIN SECTION ID:",
        currentSectionId
    );
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
     * اگر طراحی قبلاً وجود دارد
     * فقط همان طراحی را آپدیت کن
     */
    if (currentDesign) {
        console.log(
            "UPDATE EXISTING TEMP DESIGN:",
            state.currentDesignID
        );
        /*
         * Snapshot جدید
         */
        currentDesign.paperJSON =
            state.paper.project.exportJSON({
                asString: true
            });
        currentDesign.svg =
            state.paper.project.activeLayer.exportSVG({
                bounds: "content",
                asString: true
            });
        currentDesign.unitData =
            JSON.parse(
                JSON.stringify(
                    state.unitData || {}
                )
            );
        currentDesign.name =
            name;
        currentDesign.width =
            width;
        currentDesign.height =
            height;
        currentDesign.system =
            system;
        /*
         * section مربوط به همین طراحی
         *
         * اگر section جدیدی ساخته شده باشد
         * شناسه آن را ذخیره کن.
         */
        if (currentSectionId) {
            currentDesign.sectionId =
                currentSectionId;
        }
        /*
         * کارت قبلی
         */
        const $card =
            $("#layer_" + state.currentDesignID);
        /*
         * اطلاعات کارت را آپدیت کن
         */
        if ($card.length) {
            $card
                .find(".wd-item-title")
                .text(
                    `${currentDesign.unitData?.itemNumber || ""} - ${currentDesign.unitData?.itemName || name}`
                );
            $card
                .find(".wd-item-size")
                .contents()
                .first()
                .replaceWith(`${width} × ${height}`);
            $card
                .find(".wd-item-quantity")
                .text(
                    ` | تعداد: ${currentDesign.unitData?.quantity || 1}`
                );
            $card
                .find(".wd-item-brand")
                .text(system);
            /*
             * همان کارت فعال بماند
             */
            $(".wd-item-card")
                .removeClass("is-active");
            $card
                .addClass("is-active");
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
     * طراحی جدید
     */
    const designID =
        Date.now();
    state.currentDesignID =
        designID;
    console.log(
        "CREATE NEW TEMP DESIGN:",
        designID
    );
    /*
     * اطمینان از وجود آرایه
     */
    if (
        !Array.isArray(
            state.tempDesigns
        )
    ) {
        state.tempDesigns = [];
    }
    /*
     * ذخیره Snapshot
     */
    const paperJSON =
        state.paper.project.exportJSON({
            asString: true
        });
    const svg =
        state.paper.project.activeLayer.exportSVG({
            bounds: "content",
            asString: true
        });
    /*
     * ذخیره اطلاعات طراحی
     *
     * sectionId برای حذف واقعی
     * همین طراحی از Canvas استفاده می‌شود.
     */
    state.tempDesigns.push({
        id:
            designID,
        sectionId:
            currentSectionId,
        paperJSON:
            paperJSON,
        svg:
            svg,
        unitData:
            JSON.parse(
                JSON.stringify(
                    state.unitData || {}
                )
            ),
        name:
            name,
        width:
            width,
        height:
            height,
        system:
            system
    });
    console.log(
        "TEMP DESIGN SAVED:",
        designID
    );
    console.log(
        "SAVED SECTION ID:",
        currentSectionId
    );
    // ساخت کارت
    const itemNumber = state.unitData?.itemNumber || "";
    const itemName = state.unitData?.itemName || name;
    const quantity = state.unitData?.quantity || 1;
    const card = `
    <div class="wd-item-card is-active" id="layer_${designID}">
        <div class="wd-item-symbol svgThumb"></div>
        <div class="wd-item-details">
            <span class="wd-item-title">
                ${itemNumber} - ${itemName}
            </span>
            <span class="wd-item-size itemDimetions">
                ${width} × ${height}
                <span class="wd-item-quantity"> | تعداد: ${quantity}</span>
            </span>
            <div class="wd-item-bottom">
                <button
                    type="button"
                    class="wd-item-select-btn"
                    data-id="${designID}"
                >
                    ${system}
                </button>
                <button
                    type="button"
                    class="wd-item-edit"
                    title="ویرایش"
                >
                    <i class="ti ti-pencil"></i>
                </button>
                <button
                    type="button"
                    class="wd-item-delete layerDelete"
                    title="حذف"
                >
                    <i class="ti ti-trash"></i>
                </button>
            </div>
        </div>
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
    $layerList
        .prepend(card);
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
$(document)
    .off(
        "click.tempLayerDelete",
        ".layerDelete"
    );
/*
 * حذف موقت کارت
 */
$(document)
    .off(
        "click.tempLayerDelete",
        ".layerDelete"
    )
    .on(
        "click.tempLayerDelete",
        ".layerDelete",
        function (e) {
            e.preventDefault();
            e.stopPropagation();
            const $card = $(this).closest(".wd-item-card");
            if (!$card.length) {
                return;
            }
            /*
             * پیدا کردن ID طراحی
             */
            const designID = $card
                .attr("id")
                .replace("layer_", "");
            /*
             * اگر مودال قبلی وجود دارد حذف شود
             */
            const oldModal = document.querySelector(
                ".wd-delete-item-modal"
            );
            if (oldModal) {
                oldModal.remove();
            }
            /*
             * اطلاعات طراحی برای نمایش در مودال
             */
            let designToDelete = null;
            if (Array.isArray(state.tempDesigns)) {
                designToDelete = state.tempDesigns.find(
                    item =>
                        String(item.id) ===
                        String(designID)
                );
            }
            const itemNumber =
                designToDelete?.unitData?.itemNumber || "";
            const itemName =
                designToDelete?.unitData?.itemName ||
                designToDelete?.name ||
                "";
            /*
             * ساخت مودال حذف
             */
            const modal = document.createElement("div");
            modal.className = "wd-delete-item-modal";
            modal.innerHTML = `
                <div class="wd-delete-item-overlay"></div>
                <div class="wd-delete-item-container">
                    <!-- Header -->
                    <header class="wd-right-brand">
                        <div class="wd-right-brand-inner">
                            <div class="wd-right-site-info-addedit">
                                <strong class="wd-right-site-title">
                                    حذف آیتم
                                </strong>
                                <button
                                    type="button"
                                    class="wd-selection-close wd-delete-item-close"
                                    aria-label="Close"
                                >
                                    <i class="ti ti-x"></i>
                                </button>
                            </div>
                        </div>
                    </header>
                    <!-- Body -->
                    <div class="wd-delete-item-body">
                        <div class="wd-delete-item-message">
                            <div class="wd-delete-item-content">
                                <strong class="wd-delete-item-title">
                                آیا از حذف این آیتم اطمینان دارید؟
                                </strong>
                                ${itemNumber || itemName
                    ? `
                                            <div class="wd-delete-item-info">
                                                ${itemNumber
                        ? `<span>${itemNumber}</span>`
                        : ""
                    }
                                                ${itemName
                        ? `<span>${itemName}</span>`
                        : ""
                    }
                                            </div>
                                        `
                    : ""
                }
                                <p class="wd-delete-item-warning">
                                    این عملیات قابل بازگشت نیست.
                                </p>
                            </div>
                        </div>
                        <!-- عملیات -->
                        <div class="wd-delete-item-actions">
                            <button
                                type="button"
                                class="wd-right-confirm wd-delete-item-confirm"
                            >
                                حذف
                            </button>
                            <button
                                type="button"
                                class="wd-right-cancel wd-delete-item-cancel"
                            >
                                لغو
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            /*
             * نمایش انیمیشنی مودال
             */
            setTimeout(() => {
                modal.classList.add("show");
            }, 10);
            /*
             * بستن مودال
             */
            function closeDeleteModal() {
                modal.classList.remove("show");
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.remove();
                    }
                }, 200);
            }
            /*
             * لغو
             */
            modal
                .querySelector(".wd-delete-item-cancel")
                .addEventListener(
                    "click",
                    function () {
                        closeDeleteModal();
                    }
                );
            /*
             * ضربدر
             */
            modal
                .querySelector(".wd-delete-item-close")
                .addEventListener(
                    "click",
                    function () {
                        closeDeleteModal();
                    }
                );
            /*
             * کلیک روی پس زمینه
             */
            modal
                .querySelector(".wd-delete-item-overlay")
                .addEventListener(
                    "click",
                    function () {
                        closeDeleteModal();
                    }
                );
            /*
             * تأیید حذف
             */
            modal
                .querySelector(".wd-delete-item-confirm")
                .addEventListener(
                    "click",
                    function () {
                        console.log(
                            "DELETE TEMP LAYER:",
                            designID
                        );
                        /*
                         * پیدا کردن Snapshot مربوط به کارت
                         */
                        let designToDelete = null;
                        if (
                            Array.isArray(
                                state.tempDesigns
                            )
                        ) {
                            designToDelete =
                                state.tempDesigns.find(
                                    item =>
                                        String(item.id) ===
                                        String(designID)
                                );
                        }
                        console.log(
                            "DESIGN TO DELETE:",
                            designToDelete
                        );
                        /*
                         * شناسه section مربوط به این طراحی
                         */
                        const sectionId =
                            designToDelete?.sectionId;
                        console.log(
                            "SECTION ID TO DELETE:",
                            sectionId
                        );
                        /*
                         * حذف section مربوط به طراحی از Canvas
                         */
                        if (
                            sectionId &&
                            state.paper?.project?.activeLayer
                        ) {
                            const activeLayer =
                                state.paper.project.activeLayer;
                            const sections =
                                activeLayer.getItems({
                                    name: "section"
                                });
                            console.log(
                                "ALL SECTIONS:",
                                sections
                            );
                            const targetSection =
                                sections.find(
                                    section =>
                                        String(section.id) ===
                                        String(sectionId)
                                );
                            if (targetSection) {
                                console.log(
                                    "REMOVE TARGET SECTION:",
                                    targetSection
                                );
                                /*
                                 * حذف کامل طراحی
                                 */
                                targetSection.remove();
                            } else {
                                console.warn(
                                    "TARGET SECTION NOT FOUND:",
                                    sectionId
                                );
                            }
                        }
                        /*
                         * Snapshot را حذف کن
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
                            /*
                             * اگر دیگر طراحی موقتی باقی نمانده،
                             * تغییر ذخیره‌نشده هم وجود ندارد.
                             */
                            if (
                                state.tempDesigns.length === 0
                            ) {
                                state.somethingChanged =
                                    false;
                            }
                        }
                        /*
                         * پیدا کردن اولین طراحی باقی‌مانده
                         */
                        const remainingDesign =
                            Array.isArray(
                                state.tempDesigns
                            )
                                ? state.tempDesigns[0]
                                : null;
                        /*
                         * اگر طراحی دیگری باقی مانده،
                         * همان طراحی دوباره روی Canvas نمایش داده شود.
                         */
                        if (remainingDesign) {
                            console.log(
                                "LOAD REMAINING DESIGN:",
                                remainingDesign.id
                            );
                            changeTempLayerById(
                                remainingDesign.id
                            );
                        } else {
                            /*
                             * اگر هیچ طراحی دیگری باقی نمانده،
                             * Canvas خالی شود.
                             */
                            state.currentDesignID = 0;
                            state.mainSection = null;
                            if (state.paper?.project) {
                                state.paper.project.clear();
                                state.paper.project.view.update();
                            }
                        }
                        /*
                         * اگر section اصلی حذف شده،
                         * mainSection نباید به طراحی حذف‌شده
                         * اشاره کند.
                         */
                        if (
                            state.mainSection &&
                            sectionId &&
                            String(
                                state.mainSection.id
                            ) ===
                            String(sectionId)
                        ) {
                            state.mainSection = null;
                        }
                        /*
                         * بازسازی کامل Dimension Bar
                         */
                        if (
                            state.paper?.project?.activeLayer
                        ) {
                            console.log(
                                "REBUILD DIMENSION BARS"
                            );
                            createDimensionBar();
                            console.log(
                                "DIMENSION BARS REBUILT"
                            );
                        }
                        /*
                         * پیش‌نمایش لیست را دوباره آپدیت کن
                         */
                        updateLayerPreview();
                        /*
                         * حذف کارت
                         */
                        $card.remove();
                        console.log(
                            "TEMP DESIGN DELETED:",
                            designID
                        );
                        /*
                         * بستن مودال
                         */
                        closeDeleteModal();
                    }
                );
            /*
             * ESC برای لغو
             */
            function handleDeleteModalKeydown(e) {
                if (e.key === "Escape") {
                    closeDeleteModal();
                    document.removeEventListener(
                        "keydown",
                        handleDeleteModalKeydown
                    );
                }
            }
            document.addEventListener(
                "keydown",
                handleDeleteModalKeydown
            );
        }
    );