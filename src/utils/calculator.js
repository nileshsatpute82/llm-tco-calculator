// LLM TCO and GPU Sizing Calculator Logic

export const calculateMemoryRequirement = (model, useCase, quantization) => {
  if (!model) return 0;
  
  const memoryKey = `${useCase}_${quantization}`;
  return model.memory_requirements[memoryKey] || model.memory_requirements[`${useCase}_fp16`] || 0;
};

export const findOptimalGPUs = (requiredMemory, gpus) => {
  // Filter GPUs that can handle the memory requirement
  const suitableGpus = gpus.filter(gpu => gpu.vram >= requiredMemory);
  
  if (suitableGpus.length > 0) {
    // Sort by price efficiency (price per GB of VRAM)
    const sortedGpus = suitableGpus.sort((a, b) => {
      const efficiencyA = a.price_usd / a.vram;
      const efficiencyB = b.price_usd / b.vram;
      return efficiencyA - efficiencyB;
    });
    
    return {
      recommended: sortedGpus[0],
      alternatives: sortedGpus.slice(1, 4),
      multiGpu: false,
      gpuCount: 1
    };
  } else {
    // Need multiple GPUs - find the most cost-effective option
    const sortedByVram = gpus.sort((a, b) => b.vram - a.vram);
    const bestGpu = sortedByVram[0];
    const gpuCount = Math.ceil(requiredMemory / bestGpu.vram);
    
    return {
      recommended: bestGpu,
      alternatives: sortedByVram.slice(1, 4),
      multiGpu: true,
      gpuCount
    };
  }
};

export const calculateTCO = (gpuConfig, timeHorizonMonths, electricityCost, deploymentType) => {
  const { recommended: gpu, gpuCount } = gpuConfig;
  
  // Hardware costs (CapEx)
  const gpuCost = gpu.price_usd * gpuCount;
  const serverCost = calculateServerCost(gpuCount);
  const networkingCost = calculateNetworkingCost(gpuCount);
  const totalCapEx = gpuCost + serverCost + networkingCost;
  
  // Operating costs (OpEx)
  const powerCostMonthly = calculatePowerCost(gpu, gpuCount, electricityCost);
  const maintenanceCostMonthly = totalCapEx * 0.02 / 12; // 2% annual maintenance
  const totalOpExMonthly = powerCostMonthly + maintenanceCostMonthly;
  const totalOpEx = totalOpExMonthly * timeHorizonMonths;
  
  // Total TCO
  const totalTCO = totalCapEx + totalOpEx;
  
  return {
    capex: {
      gpu: gpuCost,
      server: serverCost,
      networking: networkingCost,
      total: totalCapEx
    },
    opex: {
      power_monthly: powerCostMonthly,
      maintenance_monthly: maintenanceCostMonthly,
      total_monthly: totalOpExMonthly,
      total: totalOpEx
    },
    tco: {
      total: totalTCO,
      monthly_average: totalTCO / timeHorizonMonths
    }
  };
};

export const calculateCloudTCO = (requiredMemory, cloudProvider, timeHorizonMonths) => {
  // Find suitable cloud instances
  const instances = Object.entries(cloudProvider.instances);
  const suitableInstances = instances.filter(([_, instance]) => {
    // Estimate VRAM based on GPU type and count
    const vramPerGpu = getGpuVram(instance.gpu);
    return (vramPerGpu * instance.gpu_count) >= requiredMemory;
  });
  
  if (suitableInstances.length === 0) return null;
  
  // Sort by cost efficiency
  const sortedInstances = suitableInstances.sort((a, b) => a[1].hourly_rate - b[1].hourly_rate);
  const [instanceName, instance] = sortedInstances[0];
  
  const hoursPerMonth = 24 * 30; // Assuming 24/7 operation
  const monthlyCost = instance.hourly_rate * hoursPerMonth;
  const totalCost = monthlyCost * timeHorizonMonths;
  
  return {
    provider: cloudProvider.name,
    instance_type: instanceName,
    gpu_type: instance.gpu,
    gpu_count: instance.gpu_count,
    hourly_rate: instance.hourly_rate,
    monthly_cost: monthlyCost,
    total_cost: totalCost
  };
};

export const compareDeploymentOptions = (onPremTCO, cloudTCO) => {
  if (!cloudTCO) return { recommendation: 'on-premises', reason: 'No suitable cloud instances found' };
  
  const onPremTotal = onPremTCO.tco.total;
  const cloudTotal = cloudTCO.total_cost;
  const savings = Math.abs(onPremTotal - cloudTotal);
  const savingsPercentage = (savings / Math.max(onPremTotal, cloudTotal)) * 100;
  
  if (onPremTotal < cloudTotal) {
    return {
      recommendation: 'on-premises',
      reason: `On-premises is ${savingsPercentage.toFixed(1)}% cheaper`,
      savings: savings,
      breakeven_months: null
    };
  } else {
    // Calculate break-even point
    const breakevenMonths = onPremTCO.capex.total / (cloudTCO.monthly_cost - onPremTCO.opex.total_monthly);
    
    return {
      recommendation: 'cloud',
      reason: `Cloud is ${savingsPercentage.toFixed(1)}% cheaper over ${Math.round(breakevenMonths)} months`,
      savings: savings,
      breakeven_months: Math.round(breakevenMonths)
    };
  }
};

// Helper functions
const calculateServerCost = (gpuCount) => {
  // Base server cost scales with GPU count
  const baseServerCost = 2000; // Base server
  const additionalCostPerGpu = 500; // Additional cost per GPU slot
  return baseServerCost + (additionalCostPerGpu * (gpuCount - 1));
};

const calculateNetworkingCost = (gpuCount) => {
  // Networking cost for multi-GPU setups
  if (gpuCount <= 1) return 0;
  if (gpuCount <= 4) return 1000; // InfiniBand for small clusters
  return 2000 + (gpuCount * 200); // More complex networking for large clusters
};

const calculatePowerCost = (gpu, gpuCount, electricityCostPerKwh) => {
  const gpuPowerW = gpu.power_consumption * gpuCount;
  const systemOverheadW = 200 + (gpuCount * 100); // CPU, memory, cooling overhead
  const totalPowerW = gpuPowerW + systemOverheadW;
  const totalPowerKw = totalPowerW / 1000;
  
  const hoursPerMonth = 24 * 30;
  const monthlyKwh = totalPowerKw * hoursPerMonth;
  const monthlyCost = monthlyKwh * electricityCostPerKwh;
  
  return monthlyCost;
};

const getGpuVram = (gpuType) => {
  const vramMap = {
    'V100': 32,
    'A100': 80, // Assuming 80GB variant
    'H100': 80,
    'RTX 4090': 24,
    'RTX 4080': 16
  };
  return vramMap[gpuType] || 32; // Default fallback
};

export const generateSystemRecommendations = (gpuConfig, model) => {
  const { recommended: gpu, gpuCount } = gpuConfig;
  
  // CPU recommendations
  const cpuCores = Math.max(8, gpuCount * 8); // At least 8 cores per GPU
  const cpuRecommendation = cpuCores <= 16 ? 'Intel Xeon Silver or AMD EPYC 7003' : 'Intel Xeon Gold or AMD EPYC 7004';
  
  // Memory recommendations
  const systemMemoryGB = Math.max(64, gpuCount * 32); // At least 32GB per GPU
  
  // Storage recommendations
  const storageGB = Math.max(1000, model.parameters * 10); // 10GB per billion parameters minimum
  
  // Networking recommendations
  const networking = gpuCount > 1 ? 'InfiniBand or high-speed Ethernet for multi-GPU communication' : 'Standard Gigabit Ethernet';
  
  return {
    cpu: {
      cores: cpuCores,
      recommendation: cpuRecommendation
    },
    memory: {
      total_gb: systemMemoryGB,
      type: 'DDR4-3200 or DDR5-4800 ECC'
    },
    storage: {
      capacity_gb: storageGB,
      type: 'NVMe SSD for model storage and fast I/O'
    },
    networking: networking,
    cooling: gpuCount > 2 ? 'Enhanced cooling solution required' : 'Standard server cooling sufficient'
  };
};
