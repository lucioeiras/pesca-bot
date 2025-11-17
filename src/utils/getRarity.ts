import type { Fish } from '../types/fishes';

export const getRarity = ({
  vulnerability,
  maxLength,
  commonLength,
  maxWeight,
  abundance,
}: Fish): { score: number, category: string } => {
  const vScore = vulnerability !== null && vulnerability !== undefined ? vulnerability / 100 : 0;
  const lengthScore = maxLength ? Math.min(maxLength / 300, 1) : 0;
  const commonLengthScore = commonLength ? Math.min(commonLength / 300, 1) : 0;
  const weightScore = maxWeight ? Math.min(maxWeight / 100000, 1) : 0;

  let abundanceScore = 0.5;
  if (abundance) {
    const a = abundance.toLowerCase();
    if (a.includes('abundant')) abundanceScore = 0;
    else if (a.includes('common')) abundanceScore = 0.2;
    else if (a.includes('uncommon')) abundanceScore = 0.4;
    else if (a.includes('rare')) abundanceScore = 0.7;
    else if (a.includes('very rare') || a.includes('scarce')) abundanceScore = 1;
    else abundanceScore = 0.5;
  }

  const weightVulnerability = 0.4;
  const weightSize = 0.3;
  const weightAbundance = 0.3;
  const sizeScore = (lengthScore + commonLengthScore + weightScore) / 3;

  const raridade =
    (vScore * weightVulnerability) +
    (sizeScore * weightSize) +
    (abundanceScore * weightAbundance);
  const score = Math.min(Math.max(raridade, 0), 1);

  let category: string;
  if (score < 0.16) category = "Comum";
  else if (score < 0.32) category = "Incomum";
  else if (score < 0.5) category = "Raro";
  else if (score < 0.7) category = "Muito Raro";
  else if (score < 0.85) category = "Épico";
  else category = "Lendário";

  return { score, category };
}
