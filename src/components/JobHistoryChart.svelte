<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    TimeScale,
    Tooltip,
    Filler,
    CategoryScale,
  } from 'chart.js';

  Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    TimeScale,
    Tooltip,
    Filler,
    CategoryScale
  );

  export let title: string;
  export let rawData: Record<string, number>;
  export let onClose: () => void;

  const MAX_POINTS = 180;

  let canvasRef: HTMLCanvasElement;
  let chart: Chart | null = null;

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }

  onMount(() => {
    const sorted = Object.entries(rawData).sort(([a], [b]) => a.localeCompare(b));
    const sliced = sorted.slice(-MAX_POINTS);
    const labels = sliced.map(([date]) => date);
    const values = sliced.map(([, count]) => count);

    const isDark =
      document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const tickColor = isDark ? '#9ca3af' : '#6b7280';
    const lineColor = '#3b82f6';
    const fillColor = isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.10)';

    chart = new Chart(canvasRef, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Jobs',
            data: values,
            borderColor: lineColor,
            backgroundColor: fillColor,
            fill: true,
            borderWidth: 2,
            pointRadius: labels.length > 60 ? 0 : 3,
            pointHoverRadius: 5,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => items[0].label,
              label: (item) => ` ${item.parsed.y} jobs`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: tickColor,
              maxTicksLimit: 8,
              maxRotation: 0,
            },
            grid: { color: gridColor },
          },
          y: {
            beginAtZero: false,
            ticks: { color: tickColor, precision: 0 },
            grid: { color: gridColor },
          },
        },
      },
    });

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  onDestroy(() => {
    chart?.destroy();
  });
</script>

<div
  class="chart-modal-overlay"
  on:click={onClose}
  on:keydown={(e) => e.key === 'Escape' && onClose()}
  role="button"
  tabindex="0"
  aria-label="Close chart modal"
>
  <div
    class="chart-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="chart-modal-title"
    tabindex="0"
    on:click|stopPropagation
    on:keydown={(e) => e.key === 'Escape' && onClose()}
  >
    <button class="chart-close" on:click={onClose} aria-label="Close">&times;</button>
    <h2 id="chart-modal-title" class="chart-title">{title}</h2>
    <div class="chart-canvas-wrapper">
      <canvas bind:this={canvasRef}></canvas>
    </div>
  </div>
</div>

<style>
  .chart-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    cursor: pointer;
  }

  .chart-modal {
    background: var(--card-bg);
    color: var(--text-color);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    padding: 1.75rem 1.75rem 1.5rem;
    position: relative;
    width: min(720px, 92vw);
    cursor: default;
    animation: slideIn 0.2s ease;
    border: 1px solid var(--border-color);
  }

  @keyframes slideIn {
    from {
      transform: scale(0.96);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .chart-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--secondary-text);
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.15s ease;
    line-height: 1;
  }

  .chart-close:hover {
    background: var(--hover-bg);
    color: var(--text-color);
  }

  .chart-title {
    margin: 0 2.5rem 1.25rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-color);
  }

  .chart-canvas-wrapper {
    position: relative;
    height: 300px;
    width: 100%;
  }

  @media (max-width: 600px) {
    .chart-canvas-wrapper {
      height: 220px;
    }
  }
</style>
