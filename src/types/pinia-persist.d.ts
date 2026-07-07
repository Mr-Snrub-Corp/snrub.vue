import "pinia";

declare module "pinia" {
  interface DefineStoreOptionsBase<S, Store> {
    persist?:
      | boolean
      | {
          key?: string;
          storage?: Pick<Storage, "getItem" | "setItem">;
          paths?: string[];
          debug?: boolean;
        };
  }
}
