import adapter from "@sveltejs/adapter-auto";
import preprocess from "svelte-preprocess";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess({
    postcss: true,
  }),

  kit: {
    adapter: adapter(),
    env: {
      dir:"./",
      publicPrefix: "VITE_",
    },
    // additional configuration if needed
  },
};

export default config;
