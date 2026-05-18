import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "9lbip0ho",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  },
  deployment: {
    appId: "s4d8tba44prk38kym6i07ndp",
    autoUpdates: true,
  },
});
