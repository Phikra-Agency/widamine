// ponytail: pure deterministic math — no backend, no DB. Chatbot mirrors this in api (3-line formula).

export interface BmiCategory {
  key: 'under' | 'normal' | 'over' | 'obese'
  label: string
  advice: string
  color: string
}

export function calcBmi(heightCm: number, weightKg: number): number | null {
  if (!heightCm || !weightKg || heightCm < 50 || heightCm > 300 || weightKg < 10 || weightKg > 500) return null
  const m = heightCm / 100
  return Math.round((weightKg / (m * m)) * 10) / 10
}

export function bmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5)
    return { key: 'under', label: 'Poids insuffisant', advice: 'Un bilan nutritionnel peut vous aider à retrouver un poids sain.', color: '#62bca1' }
  if (bmi < 25)
    return { key: 'normal', label: 'Poids normal', advice: 'Excellent, continuez à entretenir votre équilibre.', color: '#009FD6' }
  if (bmi < 30)
    return { key: 'over', label: 'Surpoids', advice: 'Nos protocoles bodycontouring peuvent vous accompagner.', color: '#F7A269' }
  return { key: 'obese', label: 'Obésité', advice: 'Prenez rendez-vous pour un bilan personnalisé avec nos experts.', color: '#6D0024' }
}
