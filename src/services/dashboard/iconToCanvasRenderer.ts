/**
 * Icon to Canvas Renderer
 * Convertit les icônes Lucide React en formes dessinables sur canvas
 * Utilisé pour les cartes de partage
 */

export interface IconRenderConfig {
  size: number;
  color: string;
  strokeWidth?: number;
}

/**
 * Rend une icône simple sur canvas (version simplifiée pour performance)
 * Les icônes sont dessinées comme des formes géométriques simples
 */
export function renderIconToCanvas(
  ctx: CanvasRenderingContext2D,
  iconName: string,
  x: number,
  y: number,
  config: IconRenderConfig
) {
  const { size, color, strokeWidth = 3 } = config;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const halfSize = size / 2;
  const centerX = x + halfSize;
  const centerY = y + halfSize;

  switch (iconName) {
    case 'TrendingUp': // Progression
      ctx.beginPath();
      ctx.moveTo(x, y + size - 5);
      ctx.lineTo(x + size / 3, y + size / 2);
      ctx.lineTo(x + (size * 2) / 3, y + size / 1.5);
      ctx.lineTo(x + size, y + 5);
      ctx.stroke();
      // Arrow
      ctx.beginPath();
      ctx.moveTo(x + size, y + 5);
      ctx.lineTo(x + size - 8, y + 5);
      ctx.moveTo(x + size, y + 5);
      ctx.lineTo(x + size, y + 13);
      ctx.stroke();
      break;

    case 'Fire': // Calories / Intensité
      ctx.beginPath();
      ctx.moveTo(centerX, y + 5);
      ctx.bezierCurveTo(
        x + size - 5, y + size / 3,
        x + size - 5, y + (size * 2) / 3,
        centerX, y + size - 5
      );
      ctx.bezierCurveTo(
        x + 5, y + (size * 2) / 3,
        x + 5, y + size / 3,
        centerX, y + 5
      );
      ctx.fill();
      break;

    case 'Trophy': // Classement
      // Cup
      ctx.beginPath();
      ctx.moveTo(x + size / 4, y + size / 4);
      ctx.lineTo(x + size / 4, y + (size * 2) / 3);
      ctx.quadraticCurveTo(centerX, y + size - 8, x + (size * 3) / 4, y + (size * 2) / 3);
      ctx.lineTo(x + (size * 3) / 4, y + size / 4);
      ctx.stroke();
      // Base
      ctx.beginPath();
      ctx.moveTo(centerX - 8, y + (size * 2) / 3);
      ctx.lineTo(centerX - 8, y + size - 10);
      ctx.lineTo(centerX + 8, y + size - 10);
      ctx.lineTo(centerX + 8, y + (size * 2) / 3);
      ctx.stroke();
      // Platform
      ctx.beginPath();
      ctx.moveTo(centerX - 12, y + size - 10);
      ctx.lineTo(centerX - 12, y + size - 5);
      ctx.lineTo(centerX + 12, y + size - 5);
      ctx.lineTo(centerX + 12, y + size - 10);
      ctx.stroke();
      break;

    case 'Flame': // Streak / Consistance
      ctx.beginPath();
      ctx.moveTo(centerX, y + 8);
      ctx.quadraticCurveTo(x + size - 8, y + size / 2.5, centerX + 2, y + size - 8);
      ctx.quadraticCurveTo(centerX - 4, y + size / 1.8, centerX - 6, y + size / 2.2);
      ctx.quadraticCurveTo(x + 8, y + size / 2.5, centerX, y + 8);
      ctx.fill();
      break;

    case 'Dumbbell': // Force
      // Barre centrale
      ctx.beginPath();
      ctx.moveTo(x + size / 4, centerY);
      ctx.lineTo(x + (size * 3) / 4, centerY);
      ctx.stroke();
      // Poids gauche
      ctx.fillRect(x + 5, centerY - 12, 8, 24);
      ctx.fillRect(x + 15, centerY - 8, 4, 16);
      // Poids droite
      ctx.fillRect(x + size - 13, centerY - 12, 8, 24);
      ctx.fillRect(x + size - 19, centerY - 8, 4, 16);
      break;

    case 'Activity': // Endurance
      // Ligne de battement cardiaque
      ctx.beginPath();
      ctx.moveTo(x + 2, centerY);
      ctx.lineTo(x + size / 5, centerY);
      ctx.lineTo(x + size / 3, y + 8);
      ctx.lineTo(x + size / 2, y + size - 8);
      ctx.lineTo(x + (size * 2) / 3, centerY);
      ctx.lineTo(x + size - 2, centerY);
      ctx.stroke();
      break;

    default:
      // Icône par défaut (cercle)
      ctx.beginPath();
      ctx.arc(centerX, centerY, halfSize - 5, 0, Math.PI * 2);
      ctx.stroke();
  }

  ctx.restore();
}

/**
 * Mapper les catégories d'exercices aux icônes
 */
export function getIconForCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    force: 'Dumbbell',
    endurance: 'Activity',
    progression: 'TrendingUp',
    calories: 'Fire',
    classement: 'Trophy',
    position: 'Trophy',
    consistency: 'Flame',
    streak: 'Flame'
  };

  return categoryMap[category.toLowerCase()] || 'TrendingUp';
}
