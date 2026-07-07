import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import { createMemoryHistory, createRouter, type RouteRecordRaw } from "vue-router";
import { vi } from "vitest";
import type { Component } from "vue";

interface RenderOptions {
  props?: Record<string, unknown>;
  slots?: Record<string, unknown>;
  attrs?: Record<string, unknown>;
  /** Initial Pinia state keyed by store id, e.g. { auth: { user } }. */
  initialState?: Record<string, unknown>;
  /** Auto-stub Pinia actions (default true, per @pinia/testing). */
  stubActions?: boolean;
  /** Routes for the memory router (defaults to a catch-all). */
  routes?: RouteRecordRaw[];
  /** Location to start at (default "/"). */
  initialRoute?: string;
  /** Extra component stubs, e.g. heavy overlay/chart children. */
  stubs?: Record<string, Component | boolean>;
}

const blank: Component = { template: "<div />" };

/**
 * Mount a component with the app's real plugins: PrimeVue (theme "none"),
 * ToastService, a memory router, and a testing Pinia. Returns the wrapper
 * plus the router and pinia for assertions.
 */
export async function renderWithPlugins(component: Component, options: RenderOptions = {}) {
  const {
    props,
    slots,
    attrs,
    initialState = {},
    stubActions = true,
    routes = [{ path: "/:pathMatch(.*)*", component: blank }],
    initialRoute = "/",
    stubs = {},
  } = options;

  const pinia = createTestingPinia({ initialState, stubActions, createSpy: vi.fn });

  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push(initialRoute);
  await router.isReady();

  const wrapper = mount(component, {
    props,
    slots,
    attrs,
    global: {
      plugins: [pinia, router, [PrimeVue, { theme: "none" }], ToastService],
      stubs,
    },
  });

  return { wrapper, router, pinia };
}
