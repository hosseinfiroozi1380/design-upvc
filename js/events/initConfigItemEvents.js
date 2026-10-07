// src/events/initConfigItemEvents.js
import state from "../core/state.js";
import { setDefaultData } from "../utils/setDefaultData.js";
import { updateLayerDetailsMenuOptions } from "../utils/updateLayerDetailsMenuOptions.js";
import { enableSave } from "../services/enableSave.js";
import { showMessage } from "../utils/showMessage.js";
import { createTempLayerCard } from "../utils/createTempLayerCard.js";
// به‌روزرسانی رنگ پیش‌نمایش پروفیل
function updateConfigProfileColorPreview() {
  const selectedOption = $("#config_profile_color option:selected");
  const color = selectedOption.data("hex") || "#ffffff";
  $("#config_profile_color_preview").css(
    "background-color",
    color
  );
}
// به‌روزرسانی رنگ پیش‌نمایش شیشه
function updateConfigGlassColorPreview() {
  const selectedOption = $("#config_glass_id option:selected");
  const color = selectedOption.data("color") || "#8acde8";
  $("#config_glass_color_preview").css(
    "background-color",
    color
  );
}
export function initConfigItemEvents() {
  // تغییر رنگ پروفیل
  $(document)
    .off("change.configProfileColor", "#config_profile_color")
    .on("change.configProfileColor", "#config_profile_color", function () {
      updateConfigProfileColorPreview();
    });
  // افزایش تعداد
  $(document)
    .off("click.configQuantityPlus", "#config_quantity_plus")
    .on("click.configQuantityPlus", "#config_quantity_plus", function () {
      const input = $("#config_quantity");
      let quantity = parseInt(input.val(), 10) || 1;
      quantity++;
      input.val(quantity).trigger("change");
    });
  // کاهش تعداد
  $(document)
    .off("click.configQuantityMinus", "#config_quantity_minus")
    .on("click.configQuantityMinus", "#config_quantity_minus", function () {
      const input = $("#config_quantity");
      let quantity = parseInt(input.val(), 10) || 1;
      if (quantity > 1) {
        quantity--;
      }
      input.val(quantity).trigger("change");
    });
  // تغییر رنگ شیشه
  $(document)
    .off("change.configGlassColor", "#config_glass_id")
    .on("change.configGlassColor", "#config_glass_id", function () {
      updateConfigGlassColorPreview();
    });
  // باز کردن فرم تنظیمات
  $(document)
    .off("click.configItem", ".layerConfig")
    .on("click.configItem", ".layerConfig", function () {
      if (!state.unitData || !state.unitData.shape) {
        showMessage(
          "ابتدا یک طراحی انتخاب کنید.",
          "warning"
        );
        return;
      }
      // سیستم
      $("#config_system").val(
        state.unitData.system || "UPVC"
      );
      // پروفیل
      $("#config_profile_id").val(
        state.unitData.profile_id || ""
      );
      // رنگ
      $("#config_profile_color").val(
        state.unitData.profile_color || ""
      );
      // یراق
      $("#config_accessory_id").val(
        state.unitData.accessory_id || ""
      );
      // شیشه
      $("#config_glass_id").val(
        state.unitData.glass_id || ""
      );
      // سیستم و اجزای آیتم
      $(".frameInput").val(state.unitData.frame_id || "");
      $(".doorSashInput").val(state.unitData.door_sash_id || "");
      $(".windowSashInput").val(state.unitData.window_sash_id || "");
      $(".panelInput").val(state.unitData.panel_id || "");
      $(".mullianInput").val(state.unitData.mullian_id || "");

      $(".accessoryInput").val(
        state.unitData.accessory_id || ""
      );

      $(".accessoryTypeInput").val(
        state.unitData.accessory_type_id || ""
      );

      $(".glassInput").val(
        state.unitData.glass_id || ""
      );

      $(".laceInput").val(
        state.unitData.lace_id || 0
      );

      $(".glazingInput").val(
        state.unitData.glazing_id || ""
      );

      $(".couplingInput").val(
        state.unitData.coupling_id || ""
      );

      $(".enterlockInput").val(
        state.unitData.enterlock_id || ""
      );

      $(".lockTypeInput").val(
        state.unitData.lock_type || "Normal"
      );
      // به‌روزرسانی پیش‌نمایش رنگ‌ها
      updateConfigProfileColorPreview();
      updateConfigGlassColorPreview();
      // تعداد
      $("#config_quantity").val(
        state.unitData.quantity || 1
      );
      $("#wdConfigItemModal").addClass("show");
    });
  // بستن فرم
  $(document)
    .off("click.configItemClose", ".wd-config-item-close")
    .on("click.configItemClose", ".wd-config-item-close", function () {
      $("#wdConfigItemModal").removeClass("show");
    });
  // تغییر تنظیمات
  $(document)
    .off("click.configItemSave", "#configItemSave")
    .on("click.configItemSave", "#configItemSave", function () {
      const newSystem =
        String($("#config_system").val() || "").trim();
      const newProfileId =
        String($("#config_profile_id").val() || "").trim();
      const newProfileColor =
        String($("#config_profile_color").val() || "").trim();
      const newAccessoryId =
        String($("#config_accessory_id").val() || "").trim();
      const newGlassId =
        String($("#config_glass_id").val() || "").trim();
      const newFrameId =
        String($(".frameInput").val() || "").trim();

      const newDoorSashId =
        String($(".doorSashInput").val() || "").trim();

      const newWindowSashId =
        String($(".windowSashInput").val() || "").trim();

      const newPanelId =
        String($(".panelInput").val() || "").trim();

      const newMullianId =
        String($(".mullianInput").val() || "").trim();

      const newAccessoryTypeId =
        String($(".accessoryTypeInput").val() || "").trim();

      const newLaceId =
        String($(".laceInput").val() || "0").trim();

      const newGlazingId =
        String($(".glazingInput").val() || "").trim();

      const newCouplingId =
        String($(".couplingInput").val() || "").trim();

      const newEnterlockId =
        String($(".enterlockInput").val() || "").trim();

      const newLockType =
        String($(".lockTypeInput").val() || "Normal").trim();
      const newQuantity =
        parseInt(
          $("#config_quantity").val(),
          10
        );
      // اعتبارسنجی
      if (
        !newSystem ||
        !newProfileId ||
        !newProfileColor ||
        !newAccessoryId ||
        !newGlassId ||
        isNaN(newQuantity) ||
        newQuantity < 1
      ) {
        showMessage(
          "لطفاً همه فیلدها را کامل کنید.",
          "error"
        );
        return;
      }
      // مقادیر قبلی
      const oldProfileId =
        String(state.unitData.profile_id || "");
      const oldProfileColor =
        String(state.unitData.profile_color || "");
      const oldAccessoryId =
        String(state.unitData.accessory_id || "");
      const oldGlassId =
        String(state.unitData.glass_id || "");
      // سیستم
      state.unitData.system =
        newSystem;
      // تعداد
      state.unitData.quantity =
        newQuantity;
      $(".layerQuantity").text(
        newQuantity
      );
      // اطلاعات پروفیل
      state.unitData.profile_id =
        newProfileId;
      state.unitData.type =
        $(
          '#config_profile_id option[value="' +
          newProfileId +
          '"]'
        ).data("type") || state.unitData.type;
      // رنگ پروفیل
      state.unitData.profile_color =
        newProfileColor;
      state.unitData.profile_color_hex =
        $(
          '#config_profile_color option[value="' +
          newProfileColor +
          '"]'
        ).data("hex") || state.unitData.profile_color_hex;
      // یراق
      state.unitData.accessory_id =
        newAccessoryId;
      // شیشه
      state.unitData.glass_id =
        newGlassId;
      // سایر اجزای آیتم
      state.unitData.frame_id =
        newFrameId;

      state.unitData.door_sash_id =
        newDoorSashId;

      state.unitData.window_sash_id =
        newWindowSashId;

      state.unitData.panel_id =
        newPanelId;

      state.unitData.mullian_id =
        newMullianId;

      state.unitData.accessory_type_id =
        newAccessoryTypeId;

      state.unitData.lace_id =
        newLaceId;

      state.unitData.glazing_id =
        newGlazingId;

      state.unitData.coupling_id =
        newCouplingId;

      state.unitData.enterlock_id =
        newEnterlockId;

      state.unitData.lock_type =
        newLockType;
      if (
        oldProfileColor !== newProfileColor
      ) {
        state.frameColor =
          state.unitData.profile_color_hex;
        setDefaultData(
          null,
          "resetAllProfilesColors"
        );
      }
      if (
        oldProfileId !== newProfileId
      ) {
        setDefaultData(
          null,
          "resetAllProfiles"
        );
      }
      if (
        oldAccessoryId !== newAccessoryId
      ) {
        setDefaultData(
          null,
          "resetAllAccessories"
        );
      }
      if (
        oldGlassId !== newGlassId
      ) {
        setDefaultData(
          null,
          "resetAllGlasses"
        );
      }
      updateLayerDetailsMenuOptions();
      createTempLayerCard();
      enableSave();
      $("#wdConfigItemModal")
        .removeClass("show");
      showMessage(
        "تغییرات با موفقیت اعمال شد.",
        "success"
      );
    });
  $(document)
    .off("click.configItemOverlay", "#wdConfigItemModal")
    .on("click.configItemOverlay", "#wdConfigItemModal", function (e) {
      if (e.target === this) {
        $(this).removeClass("show");
      }
    });
}