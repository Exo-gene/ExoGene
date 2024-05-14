<script>
  export let message;
  export let type;
</script>

<div
  class={`bg-${type === "success" ? "green-500" : "red-500"} text-white text-center py-2 fixed bottom-0 left-0 right-0`}
>
  {message}
</div>
