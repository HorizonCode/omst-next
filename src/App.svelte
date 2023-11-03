<script lang="ts">
  import type { ApexOptions } from "apexcharts";
  import Chart from "./lib/Chart.svelte";
  import { Server } from "./lib/Server";
  import { writable } from "svelte/store";
  import { calculateAverageWithMinMax } from "./lib/mathUtil";
  import { Button } from "flowbite-svelte";

  import "@fontsource/urbanist/600.css";
  import "@fontsource/urbanist/500.css";
  import "@fontsource/urbanist/400.css";
  import "@fontsource/urbanist/300.css";

  const checkAmount = writable(25);

  let testing = false;

  const previousResults: {
    fastest: number[];
    average: number[];
    slowest: number[];
    left: number[];
    failed: number[];
  } = {
    fastest: [],
    average: [],
    slowest: [],
    left: [],
    failed: [],
  };

  const serverList = [
    new Server({
      name: "osu.direct",
      searchUrl: "https://api.osu.direct/v2/search?limit=50",
    }),
    new Server({
      name: "catboy.best",
      searchUrl: "https://catboy.best/api/search?amount=50",
    }),
    new Server({
      name: "chimu.moe",
      searchUrl: "https://api.chimu.moe/cheesegull/search?amount=50",
    }),
    new Server({
      name: "nerinyan.moe",
      searchUrl: "https://api.nerinyan.moe/search?ps=50",
    }),
  ];

  let servers = [...serverList];

  const indexTypes: Record<number, string> = {
    0: "Fastest request",
    1: "Average request",
    2: "Slowest request",
    3: "Requests left",
    4: "Failed requests",
  };

  let options: ApexOptions = {
    chart: {
      foreColor: "#fff",
      background: "#00",
      fontFamily: "Urbanist, system-ui, Avenir, Helvetica, Arial, sans-serif",
      type: "bar",
      width: window.innerWidth / 1.5,
      height: window.innerHeight / 1.5,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    theme: {
      mode: "dark",
      monochrome: {
        enabled: true,
        color: "#cccccc",
        shadeTo: "dark",
        shadeIntensity: 0.65,
      },
    },
    plotOptions: {
      bar: {
        barHeight: "95%",
        distributed: false,
        horizontal: true,
        dataLabels: {
          position: "bottom",
        },
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: "start",
      style: {
        colors: ["#fff"],
      },
      formatter: function (val, opt) {
        if (opt.seriesIndex <= 2)
          return indexTypes[opt.seriesIndex] + ":  " + val + "ms";
        else return indexTypes[opt.seriesIndex] + ":  " + val;
      },
      offsetX: 0,
      dropShadow: {
        enabled: true,
      },
    },
    series: [],
    tooltip: {
      theme: "dark",
      y: {
        title: {
          formatter: function (e) {
            const seriesId = parseInt(e.split("-")[1]);
            if (seriesId <= 3) return "time in ms";
            return "";
          },
        },
      },
    },
    legend: {
      show: false,
    },
    stroke: {
      curve: "smooth",
    },
    xaxis: {
      categories: servers.map((server) => server.name),
      floating: true,
    },
  };

  window.addEventListener("resize", () => {
    if (options.chart) {
      options.chart.width = window.innerWidth / 1.5;
      options.chart.height = window.innerHeight / 1.5;
    }
  });

  const doTest = async () => {
    servers = [...serverList];
    previousResults.average = [];
    previousResults.failed = [];
    previousResults.fastest = [];
    previousResults.left = [];
    previousResults.slowest = [];
    testing = true;
    console.log("yes", servers);
    while (servers.length > 0) {
      const nextServer = servers.shift();
      let checksLeft = $checkAmount;
      if (nextServer) {
        const results: number[] = [];
        let failed = 0;
        for (let i = checksLeft; i >= 0; i--) {
          let avgMinMax;
          try {
            const result = Math.trunc(await nextServer.doRequest());
            results.push(result);
            avgMinMax = calculateAverageWithMinMax(results);
          } catch {
            failed++;
          }
          options.series = [
            {
              data: [...previousResults.fastest, avgMinMax?.fastest ?? 0],
            },
            {
              data: [
                ...previousResults.average,
                Math.trunc(avgMinMax?.average ?? 0),
              ],
            },
            {
              data: [...previousResults.slowest, avgMinMax?.slowest ?? 0],
            },
            {
              data: [...previousResults.left, i],
            },
            {
              data: [...previousResults.failed, failed],
            },
          ];
          await new Promise((res) => setTimeout(res, 250));
          if (i <= 0) {
            previousResults.average.push(Math.trunc(avgMinMax?.average ?? 0));
            previousResults.slowest.push(Math.trunc(avgMinMax?.slowest ?? 0));
            previousResults.fastest.push(Math.trunc(avgMinMax?.fastest ?? 0));
            previousResults.left.push(0);
            previousResults.failed.push(Math.trunc(failed ?? 0));
          }
        }
      }
    }
    testing = false;
  };
</script>

<main>
  <div class="flex flex-col justify-center items-center">
    <h1 class="text-3xl">osu! Mirror Speed-Test</h1>
    <Chart {options} />
    <Button color="dark" on:click={doTest} disabled={testing}>
      {testing ? "Testing..." : "Test"}
    </Button>
  </div>
</main>
