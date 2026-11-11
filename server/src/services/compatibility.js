/**
 * PC Builder Compatibility Verification Engine
 * Analyzes selected components and checks:
 * 1. CPU <-> Motherboard socket
 * 2. RAM <-> Motherboard memory type (DDR4 vs DDR5)
 * 3. Motherboard form factor <-> Case form factor
 * 4. GPU length <-> Case max GPU clearance
 * 5. Cooler height <-> Case max CPU cooler clearance
 * 6. Power supply wattage <-> System total TDP
 */

export function checkCompatibility(parts = {}) {
  const issues = [];
  const warnings = [];
  const notices = [];

  const { cpu, motherboard, ram, gpu, case: pcCase, cooler, psu, storage } = parts;

  // 1. CPU vs Motherboard Socket
  if (cpu && motherboard) {
    if (cpu.socket && motherboard.socket && cpu.socket !== motherboard.socket) {
      issues.push({
        type: 'socket_mismatch',
        severity: 'critical',
        titleRu: 'Несовместимость сокета процессора и материнской платы',
        titleEn: 'CPU & Motherboard Socket Mismatch',
        descRu: `Процессор ${cpu.name_ru} использует сокет ${cpu.socket}, а материнская плата ${motherboard.name_ru} — ${motherboard.socket}. Они физически несовместимы.`,
        descEn: `CPU ${cpu.name_en} requires socket ${cpu.socket}, but motherboard ${motherboard.name_en} has socket ${motherboard.socket}. They cannot be mounted together.`
      });
    }
  }

  // 2. RAM vs Motherboard Memory Type
  if (ram && motherboard) {
    if (ram.memory_type && motherboard.memory_type && ram.memory_type !== motherboard.memory_type) {
      issues.push({
        type: 'ram_type_mismatch',
        severity: 'critical',
        titleRu: 'Несовместимость типа оперативной памяти',
        titleEn: 'RAM & Motherboard Memory Type Mismatch',
        descRu: `Выбрана память стандарта ${ram.memory_type}, однако материнская плата поддерживает только ${motherboard.memory_type}.`,
        descEn: `Selected RAM is ${ram.memory_type}, but motherboard only supports ${motherboard.memory_type}.`
      });
    }
  }

  // 3. Motherboard vs Case Form Factor
  if (motherboard && pcCase) {
    const caseSpecs = typeof pcCase.specs_json === 'string' ? JSON.parse(pcCase.specs_json || '{}') : (pcCase.specs_json || {});
    const supportedForms = caseSpecs.form_factors || [pcCase.form_factor || 'ATX'];
    
    // ATX case typically fits ATX, Micro-ATX, Mini-ITX
    // Micro-ATX fits Micro-ATX, Mini-ITX
    // Mini-ITX only fits Mini-ITX
    let fits = false;
    if (supportedForms.includes(motherboard.form_factor)) {
      fits = true;
    } else if (pcCase.form_factor === 'ATX' && ['Micro-ATX', 'Mini-ITX'].includes(motherboard.form_factor)) {
      fits = true;
    } else if (pcCase.form_factor === 'Micro-ATX' && motherboard.form_factor === 'Mini-ITX') {
      fits = true;
    }

    if (!fits) {
      issues.push({
        type: 'form_factor_mismatch',
        severity: 'critical',
        titleRu: 'Несовместимость форм-фактора платы и корпуса',
        titleEn: 'Motherboard & Case Form Factor Mismatch',
        descRu: `Материнская плата ${motherboard.form_factor} слишком велика для корпуса стандарта ${pcCase.form_factor}.`,
        descEn: `Motherboard ${motherboard.form_factor} is too large for ${pcCase.form_factor} case.`
      });
    }
  }

  // 4. GPU Length vs Case Max GPU Length
  if (gpu && pcCase) {
    const gpuLen = gpu.length_mm || 300;
    const maxCaseLen = pcCase.length_mm || 360;

    if (gpuLen > maxCaseLen) {
      issues.push({
        type: 'gpu_length_exceeded',
        severity: 'critical',
        titleRu: 'Видеокарта не помещается в корпус по длине',
        titleEn: 'GPU Length Exceeds Case Limit',
        descRu: `Длина видеокарты (${gpuLen} мм) превышает максимально допустимую для корпуса (${maxCaseLen} мм).`,
        descEn: `GPU length (${gpuLen}mm) exceeds maximum case allowance (${maxCaseLen}mm).`
      });
    } else if (maxCaseLen - gpuLen < 15) {
      warnings.push({
        type: 'gpu_tight_fit',
        severity: 'warning',
        titleRu: 'Очень плотная посадка видеокарты',
        titleEn: 'Tight GPU Clearance',
        descRu: `Зазор между видеокартой (${gpuLen} мм) и передней стенкой корпуса (${maxCaseLen} мм) менее 15 мм.`,
        descEn: `Clearance between GPU (${gpuLen}mm) and case frame (${maxCaseLen}mm) is under 15mm.`
      });
    }
  }

  // 5. Cooler Height vs Case Clearance
  if (cooler && pcCase) {
    const coolerH = cooler.height_mm || 155;
    const maxCoolerH = pcCase.height_mm || 165;

    // Only for air towers (liquid AIO has pump height ~50mm)
    const isLiquid = cooler.name_en?.toLowerCase().includes('liquid') || cooler.name_en?.toLowerCase().includes('aio');
    if (!isLiquid && coolerH > maxCoolerH) {
      issues.push({
        type: 'cooler_height_exceeded',
        severity: 'critical',
        titleRu: 'Высота кулера превышает ширину корпуса',
        titleEn: 'CPU Cooler Too Tall for Case',
        descRu: `Высота кулера (${coolerH} мм) больше предельной высоты в корпусе (${maxCoolerH} мм). Боковое стекло не закроется.`,
        descEn: `Air cooler height (${coolerH}mm) exceeds case clearance (${maxCoolerH}mm). Side glass will not close.`
      });
    }
  }

  // 6. Power Calculation & PSU Check
  const cpuTdp = cpu?.tdp || 65;
  const gpuTdp = gpu?.tdp || 150;
  const baseSystemWattage = 75; // motherboard, RAM, fans, storage
  const totalEstimatedWattage = (cpu ? cpuTdp : 0) + (gpu ? gpuTdp : 0) + baseSystemWattage;
  const recommendedPsuWattage = Math.round(totalEstimatedWattage * 1.3 / 50) * 50; // 30% overhead rounded to 50W

  if (psu) {
    const psuW = psu.wattage || 650;
    if (psuW < totalEstimatedWattage) {
      issues.push({
        type: 'psu_wattage_insufficient',
        severity: 'critical',
        titleRu: 'Критически недостаточная мощность блока питания',
        titleEn: 'Insufficient PSU Wattage',
        descRu: `Пиковое энергопотребление системы (${totalEstimatedWattage} Вт) превышает номинал блока питания (${psuW} Вт). Возможны выключения под нагрузкой.`,
        descEn: `Peak system power (${totalEstimatedWattage}W) exceeds PSU rated capacity (${psuW}W). System may shut down under load.`
      });
    } else if (psuW < recommendedPsuWattage) {
      warnings.push({
        type: 'psu_low_headroom',
        severity: 'warning',
        titleRu: 'Рекомендуется более мощный блок питания',
        titleEn: 'PSU Headroom Warning',
        descRu: `Блок питания на ${psuW} Вт справится, но для надежности рекомендуется запас мощности минимум ${recommendedPsuWattage} Вт.`,
        descEn: `Selected PSU (${psuW}W) will work, but recommended wattage for optimal longevity and efficiency is at least ${recommendedPsuWattage}W.`
      });
    }
  }

  const isCompatible = issues.length === 0;

  return {
    isCompatible,
    totalWattage: totalEstimatedWattage,
    recommendedPsuWattage,
    issues,
    warnings,
    notices
  };
}
