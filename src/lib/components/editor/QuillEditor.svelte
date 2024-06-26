<script lang="ts">
  import { createEventDispatcher, onMount, afterUpdate } from "svelte";
  import "quill/dist/quill.snow.css";
  import "katex/dist/katex.min.css";

  const dispatch = createEventDispatcher();
  let editor: HTMLDivElement | null = null;
  export let content: string = "";

  let quill: any;

  onMount(async () => {
    if (typeof window !== "undefined") {
      const Quill = (await import("quill")).default;
      if (editor) {
        quill = new Quill(editor, {
          theme: "snow",
          modules: {
            toolbar: [
              ["bold", "italic", "underline", "strike", "link"],
              [{ color: [] }, { background: [] }],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ align: [] }],
              [{ direction: "rtl" }],
              [{ size: ["small", false, "large", "huge"] }],
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              [{ color: [] }, { background: [] }],
              ["image", "video"],
              ["blockquote", "code-block"],
              [{ indent: "-1" }, { indent: "+1" }],
              [{ font: [] }],
              [{ script: "sub" }, { script: "super" }],
              ["clean"],
            ],
          },
        });

        quill.root.innerHTML = content;

        quill.on("text-change", () => {
          dispatch("contentChange", quill.root.innerHTML);
        });
      }
    }
  });

  afterUpdate(() => {
    if (quill && quill.root.innerHTML !== content) {
      quill.root.innerHTML = content;
    }
  });
</script>

<div bind:this={editor} style="height: 600px;"></div>
