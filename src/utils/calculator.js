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

export const calculateTCO = (gpuConfig, timeHorizonMonths, electricityCost, deploymentType, onPremCosts = null) => {
  const { recommended: gpu, gpuCount } = gpuConfig;
  
  // Determine deployment scale
  let scale = 'medium'
  if (gpuCount <= 4) scale = 'small'
  else if (gpuCount >= 17) scale = 'large'
  
  // Basic hardware costs (CapEx)
  const gpuCost = gpu.price_usd * gpuCount;
  const serverCost = calculateServerCost(gpuCount);
  const networkingCost = calculateNetworkingCost(gpuCount);
  
  // Enhanced on-premises costs
  let datacenterCapEx = 0
  let staffingOpEx = 0
  let operationalOpEx = 0
  let hiddenCosts = 0
  
  if (deploymentType === 'on-premises' && onPremCosts) {
    const dc = onPremCosts.datacenterCosts
    const staff = onPremCosts.staffingCosts
    const ops = onPremCosts.operationalCosts
    const hidden = onPremCosts.hiddenCosts
    const scaling = onPremCosts.scalingFactors[scale + 'Deployment']
    
    // Datacenter Infrastructure CapEx
    const powerRequired = (gpu.power_consumption * gpuCount + 200) / 1000 // kW
    const racksNeeded = Math.ceil(gpuCount / 8) // Assume 8 GPUs per rack
    
    datacenterCapEx = (
      dc.rackSpace.costPerMonth * 12 * (timeHorizonMonths / 12) * racksNeeded + // Rack space over time horizon
      dc.powerInfrastructure.costPerKW * powerRequired * 1.5 + // Power infrastructure
      dc.coolingInfrastructure.costPerKW * powerRequired * 1.3 + // Cooling infrastructure  
      dc.networkInfrastructure.baseCost + dc.networkInfrastructure.costPerPort * gpuCount // Network
    ) * (scaling?.infrastructureMultiplier || 1.0)
    
    // Staffing OpEx (for time horizon)
    const annualStaffing = (
      (staff.gpuInfrastructureEngineer.annualSalary * (1 + staff.gpuInfrastructureEngineer.benefits)) +
      (staff.systemAdministrator.annualSalary * (1 + staff.systemAdministrator.benefits)) +
      staff.networkEngineer.annualAllocation +
      (staff.onCallSupport.monthlyCost * 12)
    ) * (scaling?.staffingMultiplier || 1.0)
    
    staffingOpEx = annualStaffing * (timeHorizonMonths / 12)
    
    // Operational OpEx
    const powerCostMonthly = calculatePowerCost(gpu, gpuCount, electricityCost)
    const facilityOverhead = powerCostMonthly * ops.facilityCosts.percentageOfPower
    
    const annualOperational = (
      (powerCostMonthly + facilityOverhead) * 12 + // Power + facility
      (gpuCost + serverCost) * ops.backupAndDR.percentageOfHardware + // Backup/DR
      ops.monitoringTools.annualCost + // Monitoring tools
      (gpuCost + serverCost + datacenterCapEx) * ops.complianceAndSecurity.percentageOfTotal // Compliance
    )
    
    operationalOpEx = annualOperational * (timeHorizonMonths / 12)
    
    // Hidden Costs
    const annualHidden = (
      (gpuCost + serverCost) * hidden.hardwareRefresh.percentageOfHardware + // Hardware refresh
      (gpuCost + serverCost) * hidden.downtimeCosts.percentageOfHardware + // Redundancy
      hidden.trainingAndCertification.annualCostPerPerson * 2 + // Training for 2 staff
      (gpuCost + serverCost) * hidden.vendorSupport.percentageOfHardware // Vendor support
    )
    
    hiddenCosts = annualHidden * (timeHorizonMonths / 12)
  }
  
  // Basic OpEx for simple calculation
  const basicPowerCostMonthly = calculatePowerCost(gpu, gpuCount, electricityCost);
  const basicMaintenanceCostMonthly = (gpuCost + serverCost + networkingCost) * 0.02 / 12; // 2% annual maintenance
  const basicOpExMonthly = basicPowerCostMonthly + basicMaintenanceCostMonthly;
  const basicOpEx = basicOpExMonthly * timeHorizonMonths;
  
  // Total calculations
  const totalCapEx = gpuCost + serverCost + networkingCost + datacenterCapEx
  const totalOpEx = onPremCosts ? (staffingOpEx + operationalOpEx + hiddenCosts) : basicOpEx
  const totalTCO = totalCapEx + totalOpEx
  
  return {
    capex: {
      gpu: gpuCost,
      server: serverCost,
      networking: networkingCost,
      datacenter: datacenterCapEx,
      total: totalCapEx
    },
    opex: {
      staffing: onPremCosts ? staffingOpEx : 0,
      operational: onPremCosts ? operationalOpEx : 0,
      hidden: onPremCosts ? hiddenCosts : 0,
      power_monthly: basicPowerCostMonthly,
      maintenance_monthly: basicMaintenanceCostMonthly,
      total_monthly: onPremCosts ? (totalOpEx / timeHorizonMonths) : basicOpExMonthly,
      total: totalOpEx
    },
    tco: {
      total: totalTCO,
      monthly_average: totalTCO / timeHorizonMonths
    },
    breakdown: {
      hardware: gpuCost + serverCost + networkingCost,
      datacenter: datacenterCapEx,
      staffing: onPremCosts ? staffingOpEx : 0,
      operations: onPremCosts ? operationalOpEx : 0,
      hidden: onPremCosts ? hiddenCosts : 0
    },
    scale: scale,
    enhanced: !!onPremCosts
  };
};

export const calculateCloudTCO = (requiredMemory, cloudProvider, timeHorizonMonths, cloudOpCosts = null) => {
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
  
  // Determine deployment scale based on GPU count
  const gpuCount = instance.gpu_count;
  let scale = 'medium';
  if (gpuCount <= 4) scale = 'small';
  else if (gpuCount >= 17) scale = 'large';
  
  const hoursPerMonth = 24 * 30; // Assuming 24/7 operation
  const baseComputeCost = instance.hourly_rate * hoursPerMonth;
  
  // Enhanced cloud operational costs
  let staffingOpEx = 0;
  let operationalOpEx = 0;
  let complianceOpEx = 0;
  let hiddenCosts = 0;
  
  if (cloudOpCosts) {
    const costs = cloudOpCosts.cloudOperationalCosts;
    const staff = costs.staffingCosts;
    const ops = costs.operationalCosts;
    const compliance = costs.complianceAndAudit;
    const hidden = costs.hiddenCosts;
    const scaling = costs.scalingFactors[scale + 'Deployment'];
    
    // Monthly staffing costs
    const monthlyStaffing = (
      (staff.cloudInfrastructureEngineer.annualSalary * (1 + staff.cloudInfrastructureEngineer.benefits) * staff.cloudInfrastructureEngineer.allocation) +
      (staff.cloudSecuritySpecialist.annualSalary * (1 + staff.cloudSecuritySpecialist.benefits) * staff.cloudSecuritySpecialist.allocation) +
      (staff.cloudArchitect.annualSalary * (1 + staff.cloudArchitect.benefits) * staff.cloudArchitect.allocation)
    ) / 12 * (scaling?.staffingMultiplier || 1.0);
    
    staffingOpEx = monthlyStaffing * timeHorizonMonths;
    
    // Monthly operational costs
    const monthlyOperational = (
      (ops.cloudMonitoring.monthlyCost * (ops.cloudMonitoring.scalingFactor === 'per_gpu' ? gpuCount : 1)) +
      (ops.cloudSecurity.monthlyCost * (ops.cloudSecurity.scalingFactor === 'per_gpu' ? gpuCount : 1)) +
      (ops.backupAndDR.monthlyCost * (ops.backupAndDR.scalingFactor === 'per_gpu' ? gpuCount : 1)) +
      (ops.networkingAndCDN.monthlyCost * (ops.networkingAndCDN.scalingFactor === 'per_gpu' ? gpuCount : 1))
    ) * (scaling?.operationalMultiplier || 1.0);
    
    operationalOpEx = monthlyOperational * timeHorizonMonths;
    
    // Annual compliance costs
    const annualCompliance = (
      compliance.securityAudit.annualCost +
      compliance.legalAndCompliance.annualCost +
      (compliance.cloudCostOptimization.monthlyCost * 12)
    ) * (scaling?.complianceMultiplier || 1.0);
    
    complianceOpEx = annualCompliance * (timeHorizonMonths / 12);
    
    // Hidden costs as percentages
    const monthlyHidden = baseComputeCost * (
      (hidden.dataTransferCosts.monthlyPercentage || 0) +
      (hidden.scalingInefficiency.monthlyPercentage || 0)
    );
    const annualHidden = (baseComputeCost * 12) * (hidden.cloudVendorLockIn.annualPercentage || 0);
    
    hiddenCosts = (monthlyHidden * timeHorizonMonths) + (annualHidden * (timeHorizonMonths / 12));
  }
  
  const totalOperationalCosts = staffingOpEx + operationalOpEx + complianceOpEx + hiddenCosts;
  const monthlyCost = baseComputeCost + (totalOperationalCosts / timeHorizonMonths);
  const totalCost = (baseComputeCost * timeHorizonMonths) + totalOperationalCosts;
  
  return {
    provider: cloudProvider.name,
    instance_type: instanceName,
    gpu_type: instance.gpu,
    gpu_count: instance.gpu_count,
    hourly_rate: instance.hourly_rate,
    base_compute_monthly: baseComputeCost,
    operational_costs: {
      staffing: staffingOpEx,
      operational: operationalOpEx,
      compliance: complianceOpEx,
      hidden: hiddenCosts,
      total: totalOperationalCosts,
      monthly_average: totalOperationalCosts / timeHorizonMonths
    },
    monthly_cost: monthlyCost,
    total_cost: totalCost,
    scale: scale,
    enhanced: !!cloudOpCosts
  };
};

export const compareDeploymentOptions = (onPremTCO, cloudTCO, timeHorizonMonths) => {
  if (!cloudTCO) return { recommendation: 'on-premises', reason: 'No suitable cloud instances found' };
  
  const onPremTotal = onPremTCO.tco.total;
  const cloudTotal = cloudTCO.total_cost;
  const savings = Math.abs(onPremTotal - cloudTotal);
  const savingsPercentage = (savings / Math.max(onPremTotal, cloudTotal)) * 100;
  
  if (onPremTotal < cloudTotal) {
    return {
      recommendation: 'on-premises',
      reason: `On-premises is ${savingsPercentage.toFixed(1)}% cheaper over ${timeHorizonMonths} months`,
      savings: savings,
      breakeven_months: null,
      onprem_total: onPremTotal,
      cloud_total: cloudTotal
    };
  } else {
    // Calculate break-even point - when on-prem CapEx + OpEx equals cloud costs
    const monthlyCloudCost = cloudTCO.monthly_cost;
    const monthlyOnPremOpEx = onPremTCO.opex.total_monthly;
    const onPremCapEx = onPremTCO.capex.total;
    
    // Break-even: CapEx + (OpEx * months) = Cloud * months
    // Solving for months: CapEx = (Cloud - OpEx) * months
    const breakevenMonths = monthlyCloudCost > monthlyOnPremOpEx ? 
      onPremCapEx / (monthlyCloudCost - monthlyOnPremOpEx) : null;
    
    return {
      recommendation: 'cloud',
      reason: `Cloud is ${savingsPercentage.toFixed(1)}% cheaper over ${timeHorizonMonths} months`,
      savings: savings,
      breakeven_months: breakevenMonths ? Math.round(breakevenMonths) : null,
      onprem_total: onPremTotal,
      cloud_total: cloudTotal
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
