import "solid-js";

/**
 * Opt into `bool:inert`. Solid ships the `bool:` namespace but leaves the
 * attribute list to the application; declaring it here keeps the usage typed.
 */
declare module "solid-js" {
  namespace JSX {
    interface ExplicitBoolAttributes {
      inert: boolean;
    }
  }
}
