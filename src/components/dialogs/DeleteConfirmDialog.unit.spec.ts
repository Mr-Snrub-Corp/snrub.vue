import { describe, it, expect } from "vitest";
import Button from "primevue/button";
import DeleteConfirmDialog from "./DeleteConfirmDialog.vue";
import { renderWithPlugins } from "@/test/renderWithPlugins";

// Dialog is a teleporting overlay (a "heavy child") — stub it, but render its
// slots so the real footer buttons still mount.
const DialogStub = {
  props: {
    visible: Boolean,
    header: String,
    modal: Boolean,
    dismissableMask: Boolean,
    draggable: Boolean,
  },
  emits: ["update:visible"],
  template: `<div class="dialog-stub"><slot /><slot name="footer" /></div>`,
};

type Props = { isVisible?: boolean; header?: string; confirmButtonLabel?: string };

function mountDialog(props: Props = {}, slots: Record<string, string> = {}) {
  return renderWithPlugins(DeleteConfirmDialog, {
    props: { isVisible: true, header: "Delete Item", confirmButtonLabel: "Confirm", ...props },
    slots,
    stubs: { Dialog: DialogStub },
  });
}

describe("DeleteConfirmDialog", () => {
  it("passes header and visibility through to the Dialog", async () => {
    const { wrapper } = await mountDialog({ header: "Delete User", isVisible: false });
    const dialog = wrapper.findComponent(DialogStub);
    expect(dialog.props("header")).toBe("Delete User");
    expect(dialog.props("visible")).toBe(false);
  });

  it("configures the Dialog as a dismissable modal", async () => {
    const { wrapper } = await mountDialog();
    const dialog = wrapper.findComponent(DialogStub);
    expect(dialog.props("modal")).toBe(true);
    expect(dialog.props("dismissableMask")).toBe(true);
  });

  it("renders the confirm label and an outlined cancel button", async () => {
    const { wrapper } = await mountDialog({ confirmButtonLabel: "Remove" });
    const labels = wrapper.findAllComponents(Button).map((b) => b.props("label"));
    expect(labels).toEqual(["Cancel", "Remove"]);
  });

  it("renders default slot content in the body", async () => {
    const { wrapper } = await mountDialog({}, { default: "<p>Are you sure?</p>" });
    expect(wrapper.html()).toContain("Are you sure?");
  });

  it("emits handleDelete when the confirm button is clicked", async () => {
    const { wrapper } = await mountDialog({ confirmButtonLabel: "Confirm" });
    const confirm = wrapper.findAllComponents(Button).find((b) => b.props("label") === "Confirm");
    await confirm!.trigger("click");
    expect(wrapper.emitted("handleDelete")).toHaveLength(1);
  });

  it("emits handleClose when the cancel button is clicked", async () => {
    const { wrapper } = await mountDialog();
    const cancel = wrapper.findAllComponents(Button).find((b) => b.props("label") === "Cancel");
    await cancel!.trigger("click");
    expect(wrapper.emitted("handleClose")).toHaveLength(1);
  });

  it("emits handleClose when the Dialog requests close", async () => {
    const { wrapper } = await mountDialog();
    await wrapper.findComponent(DialogStub).vm.$emit("update:visible", false);
    expect(wrapper.emitted("handleClose")).toHaveLength(1);
  });
});
