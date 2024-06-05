<script lang="ts">
  import { createEventDispatcher, onMount, afterUpdate } from "svelte";
  import "quill/dist/quill.snow.css";
  const dispatch = createEventDispatcher();
  let editor: any;
  export let content: string = "";

  let quill: any;

  onMount(async () => {
    if (typeof window !== "undefined") {
      const Quill = (await import("quill")).default;
      quill = new Quill(editor, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            [{ color: [] }, { background: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ align: [] }],
            [{ direction: "rtl" }],
            ["link", "image", "video"],
            ["blockquote", "code-block"],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ font: [] }],
            [{ script: "sub" }, { script: "super" }],
          ],
        },
      });

      quill.root.innerHTML = content;

      quill.on("text-change", () => {
        dispatch("contentChange", quill.root.innerHTML);
      });
    }
  });

  afterUpdate(() => {
    if (quill && quill.root.innerHTML !== content) {
      quill.root.innerHTML = content;
    }
  });
</script>

<div bind:this={editor} style="height: 600px;"></div>

<style>
</style>
