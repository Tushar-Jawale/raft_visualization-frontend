/**
 * Raft visualization constants — node colors and coordinate calculations.
 */

export const NODE_COLORS = {
  leader: { svgFill: 'url(#leaderGradient)', shadow: 'rgba(249, 115, 22, 0.5)' },
  candidate: { svgFill: 'url(#candidateGradient)', shadow: 'rgba(168, 85, 247, 0.7)' },
  follower: { svgFill: 'url(#followerGradient)', shadow: 'rgba(59, 130, 246, 0.5)' },
  dead: { svgFill: 'url(#deadGradient)', shadow: 'transparent' },
};

/**
 * Calculate node positions in a circular layout for the topology SVG.
 */
export const calculateNodeCoords = (nodeIds) => {
  const coords = {};
  const n = nodeIds.length;
  if (n === 0) return coords;
  
  const centerX = 200;
  const centerY = 160;
  const radius = 100;
  const startAngle = -Math.PI / 2;
  
  nodeIds.forEach((id, index) => {
    const angle = startAngle + (index * 2 * Math.PI) / n;
    coords[id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
  return coords;
};
