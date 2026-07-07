import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import DeleteConfirmDialog from "./DeleteConfirmDialog.vue";

const DialogStub = {
  template: `<div class="dialog-stub"><slot /><slot name="footer" /></div>`,
  props: {
    visible: Boolean,
    header: String,
    modal: Boolean,
    dismissableMask: Boolean,
    draggable: Boolean,
  },
};

const ButtonStub = {
  template: `<button :class="variant === 'outlined' ? 'outlined' : 'primary'" @click="$emit('click')">{{ label }}</button>`,
  props: ["label", "variant"],
  emits: ["click"],
};

type DeleteConfirmDialogProps = {
  isVisible?: boolean;
  header?: string;
  confirmButtonLabel?: string;
};

const mountDialog = (props: DeleteConfirmDialogProps = {}, slots: Record<string, string> = {}) => {
  return shallowMount(DeleteConfirmDialog, {
    props: {
      isVisible: true,
      header: "Delete Item",
      confirmButtonLabel: "Confirm",
      ...props,
    },
    slots,
    global: {
      stubs: {
        Dialog: DialogStub,
        Button: ButtonStub,
      },
    },
  });
};

describe("DeleteConfirmDialog", () => {
  it("passes header prop to Dialog", () => {
    const wrapper = mountDialog({ header: "Delete User" });
    const dialog = wrapper.findComponent(DialogStub);
    expect(dialog.props("header")).toBe("Delete User");
  });

  it("passes isVisible prop to Dialog", () => {
    const wrapper = mountDialog({ isVisible: false });
    const dialog = wrapper.findComponent(DialogStub);
    expect(dialog.props("visible")).toBe(false);
  });

  it("passes modal and dismissableMask to Dialog", () => {
    const wrapper = mountDialog();
    const dialog = wrapper.findComponent(DialogStub);
    expect(dialog.props("modal")).toBe(true);
    expect(dialog.props("dismissableMask")).toBe(true);
  });

  it("renders confirmButtonLabel on the confirm button", () => {
    const wrapper = mountDialog({ confirmButtonLabel: "Remove" });
    const buttons = wrapper.findAllComponents(ButtonStub);
    const confirmButton = buttons.find((btn) => btn.props("label") === "Remove");
    expect(confirmButton).toBeTruthy();
  });

  it("renders cancel button with outlined variant", () => {
    const wrapper = mountDialog();
    const buttons = wrapper.findAllComponents(ButtonStub);
    const cancelButton = buttons.find((btn) => btn.props("label") === "Cancel");
    expect(cancelButton!.props("variant")).toBe("outlined");
  });

  it("renders slot content in the dialog body", () => {
    const wrapper = mountDialog({}, { default: "<p>Are you sure?</p>" });
    expect(wrapper.html()).toContain("Are you sure?");
  });

  it("emits handleDelete when confirm button is clicked", async () => {
    const wrapper = mountDialog();
    const buttons = wrapper.findAllComponents(ButtonStub);
    const confirmButton = buttons.find((btn) => btn.props("label") === "Confirm");
    await confirmButton!.trigger("click");
    expect(wrapper.emitted("handleDelete")).toHaveLength(1);
  });

  it("emits handleClose when cancel button is clicked", async () => {
    const wrapper = mountDialog();
    const buttons = wrapper.findAllComponents(ButtonStub);
    const cancelButton = buttons.find((btn) => btn.props("label") === "Cancel");
    await cancelButton!.trigger("click");
    expect(wrapper.emitted("handleClose")).toHaveLength(1);
  });

  it("emits handleClose when dialog mask is clicked", async () => {
    const wrapper = mountDialog();
    const dialog = wrapper.findComponent(DialogStub);
    await dialog.vm.$emit("update:visible", false);
    expect(wrapper.emitted("handleClose")).toHaveLength(1);
  });
});
