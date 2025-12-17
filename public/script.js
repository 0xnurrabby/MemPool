import { sdk } from "https://esm.sh/@farcaster/miniapp-sdk";
import { startMempoolGalaxy } from "./mempool-galaxy-ui.js";

function $(id) { return document.getElementById(id); }

window.addEventListener("load", async () => {
  const statusEl = $("miniStatus");
  try {
    const isMini = await sdk.isInMiniApp();
    statusEl.textContent = isMini ? "SDK: Mini App detected" : "SDK: not in Mini App";
  } catch (e) {
    statusEl.textContent = "SDK: detection failed";
  }

  // Start UI (canvas network, interactions, overlay)
  startMempoolGalaxy({
    canvas: $("scene"),
    fpsEl: $("fps"),
    panelEl: $("panel"),
    closePanelEl: $("closePanel"),
    toastEl: $("toast"),
    placeholders: {
      address: $("phAddress"),
      handle: $("phHandle"),
      bio: $("phBio"),
      bandwidth: $("phBandwidth"),
      status: $("phStatus"),
    }
  });

  // REQUIRED: tell the host we're ready (dismiss splash)
  await sdk.actions.ready();
});