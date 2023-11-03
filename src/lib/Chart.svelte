<script lang="ts">
  import type { ApexOptions } from "apexcharts";
  import { onMount } from "svelte";

  export let options: ApexOptions;
  let ApexCharts: any;
  let loaded = false;

  const chart = (node: any, options: ApexOptions) => {
    if (!loaded) return;
    const myChart = new ApexCharts(node, options);
    myChart.render();
    return {
      update(options: ApexOptions) {
        myChart.updateOptions(options);
      },
      destroy() {
        myChart.destroy();
      },
    };
  };

  onMount(async () => {
    const module = await import("apexcharts");
    ApexCharts = module.default;
    loaded = true;
  });
</script>

{#if loaded}
  <div class="m-auto w-fit" use:chart={options} />
{/if}
