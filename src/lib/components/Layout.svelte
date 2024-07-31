<script lang="ts">

</script>

<div class="layout">
   <div class="main" style="background-color: var(--mainBackgroundColor);">
    <slot />
  </div>
</div>

<style>
  .layout {
    display: grid;
    grid-template-areas:
      "navbar navbar"
      "sidebar main";
    grid-template-rows: auto 1fr;
    grid-template-columns: auto 1fr;
    height: 100vh;
  }

  .navbar {
    grid-area: navbar;
  }

  .sidebar {
    grid-area: sidebar;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .main {
    grid-area: main;
    overflow-x: auto;
    padding: 16px;
  }

  @media (min-width: 768px) {
    .sidebar {
      transform: translateX(0);
    }
  }
</style>
