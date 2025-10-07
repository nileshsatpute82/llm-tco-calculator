// Form validation utilities

export const validateCalculatorInputs = (inputs) => {
  const errors = {}
  
  // Model selection validation
  if (!inputs.selectedModel) {
    errors.selectedModel = 'Please select an LLM model'
  }
  
  // Use case validation
  if (!inputs.useCase) {
    errors.useCase = 'Please select a use case'
  }
  
  // Time horizon validation
  const timeHorizon = parseInt(inputs.timeHorizon)
  if (!timeHorizon || timeHorizon < 1) {
    errors.timeHorizon = 'Time horizon must be at least 1 month'
  } else if (timeHorizon > 120) {
    errors.timeHorizon = 'Time horizon cannot exceed 120 months (10 years)'
  }
  
  // Electricity cost validation
  const electricityCost = parseFloat(inputs.electricityCost)
  if (isNaN(electricityCost) || electricityCost < 0) {
    errors.electricityCost = 'Electricity cost must be a positive number'
  } else if (electricityCost > 1) {
    errors.electricityCost = 'Electricity cost seems unusually high (>$1/kWh)'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateNumericInput = (value, min = 0, max = Infinity, fieldName = 'Field') => {
  const numValue = parseFloat(value)
  
  if (isNaN(numValue)) {
    return `${fieldName} must be a valid number`
  }
  
  if (numValue < min) {
    return `${fieldName} must be at least ${min}`
  }
  
  if (numValue > max) {
    return `${fieldName} cannot exceed ${max}`
  }
  
  return null
}

export const formatValidationMessage = (field, message) => {
  return {
    field,
    message,
    type: 'error'
  }
}

export const getRecommendationWarnings = (results) => {
  const warnings = []
  
  if (!results) return warnings
  
  // Multi-GPU warning
  if (results.gpuConfig.multiGpu) {
    warnings.push({
      type: 'warning',
      message: `This configuration requires ${results.gpuConfig.gpuCount} GPUs. Consider using quantization to reduce memory requirements.`
    })
  }
  
  // High power consumption warning
  const totalPower = results.gpuConfig.recommended.power_consumption * results.gpuConfig.gpuCount
  if (totalPower > 1000) {
    warnings.push({
      type: 'warning',
      message: `High power consumption (${totalPower}W). Ensure adequate power supply and cooling.`
    })
  }
  
  // High cost warning
  const totalCost = results.gpuConfig.recommended.price_usd * results.gpuConfig.gpuCount
  if (totalCost > 50000) {
    warnings.push({
      type: 'info',
      message: `High hardware cost (${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalCost)}). Consider cloud deployment for shorter projects.`
    })
  }
  
  // Memory efficiency warning
  const memoryUtilization = results.requiredMemory / (results.gpuConfig.recommended.vram * results.gpuConfig.gpuCount)
  if (memoryUtilization < 0.5) {
    warnings.push({
      type: 'info',
      message: `Low memory utilization (${(memoryUtilization * 100).toFixed(1)}%). Consider a smaller GPU or running multiple models.`
    })
  }
  
  return warnings
}

export const validateModelCompatibility = (model, useCase, quantization) => {
  const warnings = []
  
  if (!model) return warnings
  
  // Check if quantization is available for the model
  const memoryKey = `${useCase}_${quantization}`
  if (!model.memory_requirements[memoryKey]) {
    warnings.push({
      type: 'warning',
      message: `${quantization.toUpperCase()} quantization may not be optimized for ${model.name}. Using FP16 as fallback.`
    })
  }
  
  // Training warnings for large models
  if (useCase === 'training' && model.parameters > 30) {
    warnings.push({
      type: 'info',
      message: `Training large models (${model.parameters}B parameters) requires significant compute resources and time. Consider fine-tuning instead.`
    })
  }
  
  // Inference warnings for very large models
  if (useCase === 'inference' && model.parameters > 100) {
    warnings.push({
      type: 'info',
      message: `Very large models (${model.parameters}B parameters) may have high latency. Consider using smaller models for real-time applications.`
    })
  }
  
  return warnings
}

export const getOptimizationSuggestions = (results) => {
  const suggestions = []
  
  if (!results) return suggestions
  
  const { model, gpuConfig, requiredMemory } = results
  
  // Quantization suggestions
  if (requiredMemory > 24 && !results.quantization?.includes('int')) {
    suggestions.push({
      type: 'optimization',
      title: 'Consider Quantization',
      message: 'Using INT8 or INT4 quantization could reduce memory requirements by 50-75% with minimal quality loss.',
      action: 'Try INT8 quantization'
    })
  }
  
  // Multi-GPU optimization
  if (gpuConfig.multiGpu && gpuConfig.gpuCount > 4) {
    suggestions.push({
      type: 'optimization',
      title: 'Consider Model Sharding',
      message: 'For very large deployments, consider model sharding techniques to optimize memory usage across GPUs.',
      action: 'Explore sharding options'
    })
  }
  
  // Cloud vs on-premises suggestion
  if (results.comparison && results.comparison.recommendation === 'cloud') {
    suggestions.push({
      type: 'cost',
      title: 'Cloud Deployment Recommended',
      message: results.comparison.reason,
      action: 'Compare cloud providers'
    })
  }
  
  // Alternative model suggestions
  if (model.parameters > 20) {
    suggestions.push({
      type: 'alternative',
      title: 'Consider Smaller Models',
      message: 'Smaller models like 7B or 13B variants often provide 80% of the performance with significantly lower resource requirements.',
      action: 'Compare model sizes'
    })
  }
  
  return suggestions
}
