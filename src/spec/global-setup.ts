import { setup } from "@ark/attest";

export default () =>
  setup({
    benchErrorOnThresholdExceeded: true,
  });
