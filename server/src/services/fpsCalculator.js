/**
 * FPS Calculation Engine
 * Estimates average and 1% low FPS based on CPU, GPU, RAM, game base requirements,
 * graphics quality presets and screen resolutions.
 */

export function calculateFpsForGame(game, config, resolution = '1080p', preset = 'high') {
  const { cpu, gpu, ram } = config;

  // Defaults if components are not yet selected
  // Baseline: mid-range modern hardware
  const gpuScore = gpu?.benchmark_score || 18000;
  const cpuScore = cpu?.benchmark_score || 22000;
  const vramGb = gpu?.vram_gb || 8;
  const ramGb = ram?.capacity_gb || 16;

  // Base requirements of the game (calibrated to ~60 FPS at 1080p High)
  const reqGpu = game.base_gpu_requirement || 20000;
  const reqCpu = game.base_cpu_requirement || 22000;

  // Multipliers
  let presetMultipliers = { low: 1.8, med: 1.35, high: 1.0, ultra: 0.68 };
  if (typeof game.preset_multipliers === 'string') {
    try {
      presetMultipliers = JSON.parse(game.preset_multipliers);
    } catch (e) {}
  } else if (game.preset_multipliers) {
    presetMultipliers = game.preset_multipliers;
  }

  let resMultipliers = { '1080p': 1.0, '1440p': 0.72, '4k': 0.44 };
  if (typeof game.res_multipliers === 'string') {
    try {
      resMultipliers = JSON.parse(game.res_multipliers);
    } catch (e) {}
  } else if (game.res_multipliers) {
    resMultipliers = game.res_multipliers;
  }

  const pMul = presetMultipliers[preset.toLowerCase()] || 1.0;
  const rMul = resMultipliers[resolution.toLowerCase()] || 1.0;

  // GPU performance factor (GPU is dominant in higher resolutions and ultra presets)
  // Resolution weight on GPU: 1080p: 65% GPU / 35% CPU, 1440p: 75% GPU / 25% CPU, 4K: 85% GPU / 15% CPU
  let gpuWeight = 0.65;
  if (resolution === '1440p') gpuWeight = 0.75;
  if (resolution === '4k') gpuWeight = 0.85;
  const cpuWeight = 1.0 - gpuWeight;

  const gpuRatio = gpuScore / reqGpu;
  const cpuRatio = cpuScore / reqCpu;

  // Base raw FPS at 1080p High ~ 60 FPS
  let rawFps = 60 * ((gpuRatio * gpuWeight) + (cpuRatio * cpuWeight));

  // Apply preset and resolution modifiers
  let calculatedFps = rawFps * pMul * rMul;

  // VRAM penalty if below requirements at high resolutions
  if (resolution === '4k' && vramGb < (game.rec_vram_gb || 12)) {
    const penalty = Math.max(0.65, vramGb / (game.rec_vram_gb || 12));
    calculatedFps *= penalty;
  } else if (vramGb < (game.min_vram_gb || 6)) {
    calculatedFps *= 0.75;
  }

  // RAM penalty
  if (ramGb < (game.min_ram_gb || 16)) {
    calculatedFps *= 0.82;
  }

  // Realistic bounds
  const avgFps = Math.max(12, Math.round(calculatedFps));
  
  // 1% Low is typically 68% - 82% of average FPS depending on CPU strength & RAM
  const lowRatio = Math.min(0.85, 0.68 + (cpuRatio > 1.2 ? 0.1 : 0.04));
  const lowFps = Math.max(8, Math.round(avgFps * lowRatio));

  // Performance category rating
  let rating = 'playable'; // 'unplayable', 'playable', 'smooth', 'esports'
  if (avgFps < 30) rating = 'unplayable';
  else if (avgFps < 60) rating = 'playable';
  else if (avgFps < 120) rating = 'smooth';
  else rating = 'esports';

  return {
    gameId: game.id,
    gameTitle: game.title,
    slug: game.slug,
    resolution,
    preset,
    avgFps,
    lowFps,
    rating
  };
}

/**
 * Calculates bottleneck between CPU and GPU
 */
export function calculateBottleneck(cpu, gpu) {
  if (!cpu && !gpu) {
    return {
      bottleneckPercentage: 0,
      bottleneckComponent: 'none',
      status: 'balanced',
      messageRu: 'Компоненты не выбраны',
      messageEn: 'Components not selected'
    };
  }

  const cpuScore = cpu?.benchmark_score || 25000;
  const gpuScore = gpu?.benchmark_score || 25000;

  // Normalized balance ratio: a balanced system has cpuScore roughly ~ 1.1x - 1.4x of gpuScore
  const balanceFactor = 1.25;
  const idealCpuForGpu = gpuScore * balanceFactor;
  const delta = (idealCpuForGpu - cpuScore) / idealCpuForGpu;

  const percentage = Math.min(65, Math.round(Math.abs(delta) * 100));

  if (Math.abs(delta) < 0.15) {
    return {
      bottleneckPercentage: percentage,
      bottleneckComponent: 'none',
      status: 'optimal',
      messageRu: 'Идеальный баланс! Процессор и видеокарта раскрывают друг друга на 100%.',
      messageEn: 'Perfect balance! CPU and GPU complement each other with maximum efficiency.'
    };
  } else if (delta > 0) {
    // CPU is weaker than GPU requires
    return {
      bottleneckPercentage: percentage,
      bottleneckComponent: 'cpu',
      status: percentage > 30 ? 'high_bottleneck' : 'slight_bottleneck',
      messageRu: `Узкое место — процессор (~${percentage}%). Видеокарта ${gpu?.brand || ''} ${gpu?.model || ''} способна на большее с более мощным процессором.`,
      messageEn: `CPU bottleneck (~${percentage}%). The GPU ${gpu?.brand || ''} ${gpu?.model || ''} can produce higher FPS with a faster CPU.`
    };
  } else {
    // GPU is the limiting factor (common & normal in heavy gaming)
    return {
      bottleneckPercentage: percentage,
      bottleneckComponent: 'gpu',
      status: percentage > 35 ? 'gpu_bound' : 'optimal',
      messageRu: `Система с запасом по процессору (~${percentage}%). В играх упор будет в видеокарту, что является нормой для максимальной графики.`,
      messageEn: `System has strong CPU headroom (~${percentage}%). Performance is GPU-bound, which is ideal for maximum visual fidelity.`
    };
  }
}
