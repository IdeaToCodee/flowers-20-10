function createSeededRandom(seed = 1) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Converts a 6-digit hex color string into an rgba(...) string
 */
function rgbaStr(hex, alpha = 1) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Artisanal luxury florist rose color palettes
 */
const ROSE_PALETTES = {
  sweetBlush: {
    deepCore: '#B8335A',
    innerShadow: '#DC5B80',
    midBelly: '#F49AB3',
    outerBlush: '#FCD5E0',
    lipHighlight: '#FFF6F8',
    creviceShadow: 'rgba(122, 28, 56, 0.28)'
  },
  pastelPink: {
    deepCore: '#C44569',
    innerShadow: '#E37393',
    midBelly: '#F8B1C5',
    outerBlush: '#FDE4EC',
    lipHighlight: '#FFF9FB',
    creviceShadow: 'rgba(135, 38, 66, 0.25)'
  },
  creamPeach: {
    deepCore: '#C85A52',
    innerShadow: '#E5857B',
    midBelly: '#F7BBA9',
    outerBlush: '#FDE9DF',
    lipHighlight: '#FFFDFB',
    creviceShadow: 'rgba(138, 52, 45, 0.24)'
  },
  pearlVintage: {
    deepCore: '#9E3B56',
    innerShadow: '#C7637D',
    midBelly: '#E8A3B5',
    outerBlush: '#F9DCE4',
    lipHighlight: '#FFF8FA',
    creviceShadow: 'rgba(105, 30, 52, 0.26)'
  },
  berryRomance: {
    deepCore: '#8E1E42',
    innerShadow: '#BA3860',
    midBelly: '#E27496',
    outerBlush: '#F8BDCE',
    lipHighlight: '#FFF0F5',
    creviceShadow: 'rgba(92, 16, 40, 0.32)'
  }
};

/**
 * Friendly, cheerful, non-cheesy 20/10 wishes displayed when roses bloom
 */
const WHISPER_NOTES = [
  'Chúc em một ngày 20/10 ngập tràn yêu thương và những bất ngờ nho nhỏ.',
  'Mong em luôn được lắng nghe, trân trọng và yêu thương theo cách mình xứng đáng.',
  'Chúc em đủ bình yên để nghỉ ngơi, đủ tự tin để theo đuổi điều mình thích.',
  'Một bông hoa dành cho nụ cười của em. Hôm nay nhớ vui thật nhiều nhé!',
  'Chúc những dự định của em sớm đơm hoa, từng chút một, theo nhịp của riêng mình.',
  'Mong mỗi ngày của em đều có một lý do thật nhỏ để mỉm cười.',
  'Chúc bem luôn khỏe mạnh, an yên và có thật nhiều thời gian cho chính mình.'
];

/**
 * Pre-renders a single high-DPI realistic rose into 5 independent botanical layers
 * (Base Calyx + 4 Concentric Petal Whorls) so each rose can dynamically unfurl,
 * rotate its inner whorls, and flare wide open in real-time ("Nở rộ mạnh").
 */
function createRealisticRoseSprite(config) {
  const {
    radius = 68,
    paletteKey = 'sweetBlush',
    variety = 'garden', // 'garden' | 'classic' | 'peony' | 'bud'
    tiltX = 0,
    tiltY = 0,
    seed = 101,
    hasDewdrop = false
  } = config;

  const dpr = Math.min(window.devicePixelRatio || 2, 2.2);
  const pad = radius * 0.62;
  const logicalSize = (radius + pad) * 2;

  function createLayerCanvas() {
    const c = document.createElement('canvas');
    c.width = Math.ceil(logicalSize * dpr);
    c.height = Math.ceil(logicalSize * dpr);
    const lCtx = c.getContext('2d');
    lCtx.scale(dpr, dpr);
    return { canvas: c, ctx: lCtx };
  }

  // Layer 0: Base shadow & green calyx sepals
  const baseLayer = createLayerCanvas();
  // 4 Concentric Whorl Layers: [0: Outer Guard, 1: Mid-Outer, 2: Inner Velvet, 3: Heart Spiral]
  const whorlLayers = [
    createLayerCanvas(),
    createLayerCanvas(),
    createLayerCanvas(),
    createLayerCanvas()
  ];

  const cx = logicalSize / 2;
  const cy = logicalSize / 2;
  const rand = createSeededRandom(seed);
  const pal = ROSE_PALETTES[paletteKey] || ROSE_PALETTES.sweetBlush;

  // 1. Soft Ambient Occlusion Base Shadow & Sepals on baseLayer
  const bCtx0 = baseLayer.ctx;
  bCtx0.save();
  const baseShadow = bCtx0.createRadialGradient(
    cx + tiltX * 4, cy + radius * 0.14 + tiltY * 4, radius * 0.18,
    cx, cy + radius * 0.1, radius * 1.32
  );
  baseShadow.addColorStop(0, 'rgba(62, 18, 32, 0.36)');
  baseShadow.addColorStop(0.65, 'rgba(62, 18, 32, 0.13)');
  baseShadow.addColorStop(1, 'rgba(62, 18, 32, 0)');
  bCtx0.fillStyle = baseShadow;
  bCtx0.beginPath();
  bCtx0.arc(cx, cy + radius * 0.1, radius * 1.32, 0, Math.PI * 2);
  bCtx0.fill();
  bCtx0.restore();

  // Green calyx sepals peeking out (visible especially when rose is in bud state or tilted)
  const sepalCount = variety === 'bud' ? 5 : 4;
  for (let s = 0; s < sepalCount; s++) {
    const sAngle = Math.atan2(tiltY, tiltX) + (s / sepalCount) * Math.PI * 2 + (rand() - 0.5) * 0.35;
    const sLen = radius * (variety === 'bud' ? 1.16 : 1.04);
    bCtx0.save();
    bCtx0.translate(cx, cy);
    bCtx0.rotate(sAngle);
    bCtx0.beginPath();
    bCtx0.moveTo(0, -radius * 0.14);
    bCtx0.quadraticCurveTo(sLen * 0.55, -radius * 0.26, sLen, -radius * 0.02);
    bCtx0.quadraticCurveTo(sLen * 0.55, radius * 0.22, 0, radius * 0.14);
    bCtx0.closePath();
    const sepGrad = bCtx0.createLinearGradient(0, 0, sLen, 0);
    sepGrad.addColorStop(0, '#36563E');
    sepGrad.addColorStop(0.7, '#52785A');
    sepGrad.addColorStop(1, '#789E7D');
    bCtx0.fillStyle = sepGrad;
    bCtx0.fill();
    bCtx0.restore();
  }

  /**
   * Helper: Draws one tangential cupped rose petal onto a target layer context
   */
  function drawCuppedPetal(ctx, opts) {
    const {
      pCenterX,
      pCenterY,
      angle,          // polar angle around rose core
      dist,           // radial distance of petal outer lip
      innerDist,      // radial distance of petal base attachment
      arcSpan,        // angular width in radians (roses have wide wrapping petals!)
      ruffleAmp,      // wave amplitude along outer edge
      reflexPoint,    // subtle pointed curl in center of lip
      layerNorm       // 1.0 = outermost guard petal, 0.0 = innermost tight scroll
    } = opts;

    const aStart = angle - arcSpan * 0.5;
    const aEnd = angle + arcSpan * 0.5;
    const aMid = angle;

    // Key control points in polar coordinates around (pCenterX, pCenterY)
    const baseLeftX = pCenterX + Math.cos(aStart + 0.18) * innerDist;
    const baseLeftY = pCenterY + Math.sin(aStart + 0.18) * innerDist;

    const baseRightX = pCenterX + Math.cos(aEnd - 0.18) * innerDist;
    const baseRightY = pCenterY + Math.sin(aEnd - 0.18) * innerDist;

    const shoulderLeftAngle = angle - arcSpan * 0.36;
    const shoulderRightAngle = angle + arcSpan * 0.36;
    const shoulderLeftR = dist * (0.92 + (rand() - 0.5) * ruffleAmp);
    const shoulderRightR = dist * (0.92 + (rand() - 0.5) * ruffleAmp);

    const sLeftX = pCenterX + Math.cos(shoulderLeftAngle) * shoulderLeftR;
    const sLeftY = pCenterY + Math.sin(shoulderLeftAngle) * shoulderLeftR;

    const sRightX = pCenterX + Math.cos(shoulderRightAngle) * shoulderRightR;
    const sRightY = pCenterY + Math.sin(shoulderRightAngle) * shoulderRightR;

    const tipR = dist * (1.0 + reflexPoint + (rand() - 0.5) * ruffleAmp * 0.7);
    const tipX = pCenterX + Math.cos(aMid) * tipR;
    const tipY = pCenterY + Math.sin(aMid) * tipR;

    // Intermediate ruffle lobes between shoulder and tip
    const lobeLeftAngle = angle - arcSpan * 0.17;
    const lobeRightAngle = angle + arcSpan * 0.17;
    const lobeLeftR = dist * (0.98 + (rand() - 0.4) * ruffleAmp);
    const lobeRightR = dist * (0.98 + (rand() - 0.4) * ruffleAmp);

    const lLeftX = pCenterX + Math.cos(lobeLeftAngle) * lobeLeftR;
    const lLeftY = pCenterY + Math.sin(lobeLeftAngle) * lobeLeftR;

    const lRightX = pCenterX + Math.cos(lobeRightAngle) * lobeRightR;
    const lRightY = pCenterY + Math.sin(lobeRightAngle) * lobeRightR;

    ctx.save();

    // Construct organic ruffled petal silhouette
    ctx.beginPath();
    ctx.moveTo(baseLeftX, baseLeftY);

    // Left side curve sweeping out to left shoulder
    const ctrlOutLeftAngle = aStart - 0.04;
    const ctrlOutLeftR = (innerDist + shoulderLeftR) * 0.56;
    ctx.quadraticCurveTo(
      pCenterX + Math.cos(ctrlOutLeftAngle) * ctrlOutLeftR,
      pCenterY + Math.sin(ctrlOutLeftAngle) * ctrlOutLeftR,
      sLeftX, sLeftY
    );

    // Ruffled outer lip from left shoulder -> left lobe -> center tip -> right lobe -> right shoulder
    ctx.bezierCurveTo(
      (sLeftX + lLeftX) * 0.5 + Math.cos(lobeLeftAngle) * 3,
      (sLeftY + lLeftY) * 0.5 + Math.sin(lobeLeftAngle) * 3,
      lLeftX, lLeftY,
      tipX, tipY
    );

    ctx.bezierCurveTo(
      lRightX, lRightY,
      (sRightX + lRightX) * 0.5 + Math.cos(lobeRightAngle) * 3,
      (sRightY + lRightY) * 0.5 + Math.sin(lobeRightAngle) * 3,
      sRightX, sRightY
    );

    // Right side curve sweeping back to right base
    const ctrlOutRightAngle = aEnd + 0.04;
    const ctrlOutRightR = (innerDist + shoulderRightR) * 0.56;
    ctx.quadraticCurveTo(
      pCenterX + Math.cos(ctrlOutRightAngle) * ctrlOutRightR,
      pCenterY + Math.sin(ctrlOutRightAngle) * ctrlOutRightR,
      baseRightX, baseRightY
    );

    // Inner base curve
    ctx.quadraticCurveTo(pCenterX, pCenterY, baseLeftX, baseLeftY);
    ctx.closePath();

    // Ambient occlusion drop shadow cast by this petal onto outer petals
    ctx.shadowColor = pal.creviceShadow;
    ctx.shadowBlur = Math.max(3, dist * 0.16);
    ctx.shadowOffsetX = Math.cos(aMid) * 1.5;
    ctx.shadowOffsetY = Math.sin(aMid) * 1.5 + 1.5;

    // Subsurface scattering radial gradient across the petal belly
    const grad = ctx.createRadialGradient(
      pCenterX, pCenterY, innerDist * 0.5,
      pCenterX + Math.cos(aMid) * (dist * 0.12),
      pCenterY + Math.sin(aMid) * (dist * 0.12),
      dist * 1.06
    );

    if (layerNorm > 0.68) {
      grad.addColorStop(0, pal.innerShadow);
      grad.addColorStop(0.42, pal.midBelly);
      grad.addColorStop(0.84, pal.outerBlush);
      grad.addColorStop(1, pal.lipHighlight);
    } else if (layerNorm > 0.34) {
      grad.addColorStop(0, pal.deepCore);
      grad.addColorStop(0.38, pal.innerShadow);
      grad.addColorStop(0.78, pal.midBelly);
      grad.addColorStop(0.95, pal.outerBlush);
      grad.addColorStop(1, pal.lipHighlight);
    } else {
      grad.addColorStop(0, pal.deepCore);
      grad.addColorStop(0.52, pal.innerShadow);
      grad.addColorStop(0.86, pal.midBelly);
      grad.addColorStop(1, pal.lipHighlight);
    }

    ctx.fillStyle = grad;
    ctx.fill();

    // Reset shadow before drawing rolled lip highlight
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Subtle silky petal edge highlight (simulating rolled petal thickness catching light)
    ctx.beginPath();
    ctx.moveTo(sLeftX, sLeftY);
    ctx.bezierCurveTo(
      (sLeftX + lLeftX) * 0.5,
      (sLeftY + lLeftY) * 0.5,
      lLeftX, lLeftY,
      tipX, tipY
    );
    ctx.bezierCurveTo(
      lRightX, lRightY,
      (sRightX + lRightX) * 0.5,
      (sRightY + lRightY) * 0.5,
      sRightX, sRightY
    );
    ctx.strokeStyle = rgbaStr(pal.lipHighlight, layerNorm < 0.4 ? 0.82 : 0.65);
    ctx.lineWidth = layerNorm < 0.35 ? 1.4 : 1.1;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();
  }

  // 2. Sculpt concentric & spiral whorls distributed across whorlLayers[0..2]
  const totalWhorls = variety === 'bud' ? 7 : (variety === 'peony' ? 10 : 9);
  const heartShiftX = tiltX * radius * 0.26;
  const heartShiftY = tiltY * radius * 0.26;

  for (let w = 0; w < totalWhorls; w++) {
    const layerNorm = 1 - w / (totalWhorls - 1); // 1.0 (outer) -> 0.0 (innermost)
    const easeR = Math.pow(layerNorm, 0.82);

    // Route this whorl to one of the 3 outer/mid/inner layer canvases
    let targetWhorlIdx = 0;
    if (layerNorm <= 0.36) targetWhorlIdx = 2;
    else if (layerNorm <= 0.68) targetWhorlIdx = 1;
    const wCtx = whorlLayers[targetWhorlIdx].ctx;

    // Perspective shift increases toward the center of the rose
    const whorlCx = cx + heartShiftX * (1 - layerNorm);
    const whorlCy = cy + heartShiftY * (1 - layerNorm);

    let petalCount = 6;
    if (layerNorm > 0.75) petalCount = 6;
    else if (layerNorm > 0.4) petalCount = variety === 'peony' ? 7 : 6;
    else petalCount = 5;

    const whorlBaseAngle = w * 0.68 + rand() * 0.25;

    // Warm inner-cup glow on the mid-inner transition
    if (w === 3) {
      const cupGlow = wCtx.createRadialGradient(
        whorlCx, whorlCy, radius * 0.05,
        whorlCx, whorlCy, radius * 0.72
      );
      cupGlow.addColorStop(0, rgbaStr(pal.deepCore, 0.58));
      cupGlow.addColorStop(0.55, rgbaStr(pal.innerShadow, 0.26));
      cupGlow.addColorStop(1, rgbaStr(pal.midBelly, 0));
      wCtx.fillStyle = cupGlow;
      wCtx.beginPath();
      wCtx.arc(whorlCx, whorlCy, radius * 0.72, 0, Math.PI * 2);
      wCtx.fill();
    }

    for (let p = 0; p < petalCount; p++) {
      const pAngle = whorlBaseAngle + (p / petalCount) * Math.PI * 2 + (rand() - 0.5) * 0.18;
      const pDist = radius * (0.16 + 0.84 * easeR) * (0.94 + rand() * 0.1);
      const pInnerDist = Math.max(2, pDist * (layerNorm > 0.5 ? 0.32 : 0.22));

      const arcSpan = layerNorm > 0.7
        ? (1.32 + rand() * 0.22)
        : (layerNorm > 0.35 ? (1.48 + rand() * 0.25) : (1.65 + rand() * 0.3));

      const ruffleAmp = variety === 'peony' ? 0.11 : 0.075;
      const reflexPoint = (variety === 'classic' && layerNorm > 0.45) ? 0.065 : 0.025;

      drawCuppedPetal(wCtx, {
        pCenterX: whorlCx,
        pCenterY: whorlCy,
        angle: pAngle,
        dist: pDist,
        innerDist: pInnerDist,
        arcSpan,
        ruffleAmp,
        reflexPoint,
        layerNorm
      });
    }
  }

  // 3. Sculpt the tightly furled Center Spiral Bullion onto whorlLayers[3]
  const coreCtx = whorlLayers[3].ctx;
  const coreCx = cx + heartShiftX;
  const coreCy = cy + heartShiftY;

  const scrollCount = variety === 'bud' ? 5 : 7;
  for (let c = 0; c < scrollCount; c++) {
    const cAngle = c * 2.39996 + rand() * 0.2;
    const cRadius = radius * (0.22 * (1 - c / (scrollCount + 1.5)));
    const span = 1.9 + (c / scrollCount) * 0.5;

    coreCtx.save();
    coreCtx.beginPath();
    const a1 = cAngle - span * 0.5;
    const a2 = cAngle + span * 0.5;
    coreCtx.arc(coreCx, coreCy, cRadius, a1, a2);
    coreCtx.quadraticCurveTo(
      coreCx + Math.cos(cAngle + 0.4) * cRadius * 0.3,
      coreCy + Math.sin(cAngle + 0.4) * cRadius * 0.3,
      coreCx + Math.cos(a1) * cRadius,
      coreCy + Math.sin(a1) * cRadius
    );
    coreCtx.closePath();

    const cGrad = coreCtx.createRadialGradient(
      coreCx, coreCy, 1,
      coreCx, coreCy, cRadius * 1.15
    );
    cGrad.addColorStop(0, pal.deepCore);
    cGrad.addColorStop(0.65, pal.innerShadow);
    cGrad.addColorStop(1, pal.lipHighlight);
    coreCtx.fillStyle = cGrad;
    coreCtx.fill();

    coreCtx.beginPath();
    coreCtx.arc(coreCx, coreCy, cRadius, a1 + 0.15, a2 - 0.15);
    coreCtx.strokeStyle = rgbaStr(pal.lipHighlight, 0.85);
    coreCtx.lineWidth = 1.25;
    coreCtx.stroke();
    coreCtx.restore();
  }

  // 4. Optional Crystal Dewdrop (Giọt sương mai) on outer petal layer
  if (hasDewdrop) {
    const dewCtx = whorlLayers[0].ctx;
    const dewAngle = rand() * Math.PI * 2;
    const dewDist = radius * (0.52 + rand() * 0.25);
    const dx = cx + Math.cos(dewAngle) * dewDist;
    const dy = cy + Math.sin(dewAngle) * dewDist;
    const dr = 3.4 + rand() * 2.0;

    dewCtx.save();
    dewCtx.fillStyle = 'rgba(110, 25, 50, 0.28)';
    dewCtx.beginPath();
    dewCtx.ellipse(dx + 1, dy + 1.6, dr, dr * 0.82, 0.2, 0, Math.PI * 2);
    dewCtx.fill();

    const dewGrad = dewCtx.createRadialGradient(dx - dr * 0.3, dy - dr * 0.3, 0.5, dx, dy, dr);
    dewGrad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
    dewGrad.addColorStop(0.45, 'rgba(255, 235, 242, 0.55)');
    dewGrad.addColorStop(0.85, 'rgba(245, 180, 200, 0.35)');
    dewGrad.addColorStop(1, 'rgba(255, 255, 255, 0.78)');
    dewCtx.fillStyle = dewGrad;
    dewCtx.beginPath();
    dewCtx.ellipse(dx, dy, dr, dr * 0.85, -0.2, 0, Math.PI * 2);
    dewCtx.fill();

    dewCtx.fillStyle = '#FFFFFF';
    dewCtx.beginPath();
    dewCtx.arc(dx - dr * 0.35, dy - dr * 0.35, dr * 0.28, 0, Math.PI * 2);
    dewCtx.fill();
    dewCtx.restore();
  }

  return {
    baseCanvas: baseLayer.canvas,
    whorlCanvases: whorlLayers.map(l => l.canvas),
    logicalSize,
    radius,
    palette: pal
  };
}

/**
 * Draws a realistic serrated rose leaf or silvery eucalyptus sprig
 */
function drawBotanicalLeaf(ctx, x, y, angle, length, width, type = 'roseLeaf') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Soft shadow beneath leaf
  ctx.shadowColor = 'rgba(35, 45, 38, 0.22)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(length * 0.28, -width, length * 0.72, -width * 0.85, length, 0);
  ctx.bezierCurveTo(length * 0.72, width * 0.85, length * 0.28, width, 0, 0);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, -width * 0.6, length, width * 0.6);
  if (type === 'eucalyptus') {
    grad.addColorStop(0, '#4E6E5D');
    grad.addColorStop(0.5, '#6E8F7D');
    grad.addColorStop(1, '#94B3A2');
  } else {
    grad.addColorStop(0, '#2E4F38');
    grad.addColorStop(0.55, '#466D4F');
    grad.addColorStop(1, '#688F6E');
  }
  ctx.fillStyle = grad;
  ctx.fill();

  // Central and lateral veins
  ctx.shadowColor = 'transparent';
  ctx.beginPath();
  ctx.moveTo(2, 0);
  ctx.quadraticCurveTo(length * 0.5, -1, length * 0.92, 0);
  ctx.strokeStyle = type === 'eucalyptus' ? 'rgba(215, 235, 224, 0.45)' : 'rgba(185, 215, 175, 0.4)';
  ctx.lineWidth = 1.1;
  ctx.stroke();

  for (let v = 1; v <= 4; v++) {
    const vx = length * (v * 0.18);
    const vw = width * (1 - Math.abs(v * 0.18 - 0.45)) * 0.65;
    ctx.beginPath();
    ctx.moveTo(vx, 0);
    ctx.quadraticCurveTo(vx + 6, -vw * 0.5, vx + 12, -vw * 0.8);
    ctx.moveTo(vx, 0);
    ctx.quadraticCurveTo(vx + 6, vw * 0.5, vx + 12, vw * 0.8);
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Pre-renders a delicate cloud sprig of White Gypsophila (Hoa Baby) & Pink Waxflower
 */
function createBabyBreathClusterSprite(seed = 1) {
  const dpr = Math.min(window.devicePixelRatio || 2, 2.5);
  const size = 150;
  const canvas = document.createElement('canvas');
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const rand = createSeededRandom(seed);
  const cx = size * 0.5;
  const cy = size * 0.82;

  // Delicate airy branching stems
  const branches = 7;
  const blossomPoints = [];

  for (let b = 0; b < branches; b++) {
    const bAngle = -Math.PI * 0.5 + (b - (branches - 1) / 2) * 0.26 + (rand() - 0.5) * 0.12;
    const bLen = 48 + rand() * 46;
    const ex = cx + Math.cos(bAngle) * bLen;
    const ey = cy + Math.sin(bAngle) * bLen;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(
      (cx + ex) * 0.5 + (rand() - 0.5) * 14,
      (cy + ey) * 0.5,
      ex, ey
    );
    ctx.strokeStyle = 'rgba(115, 148, 122, 0.55)';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    blossomPoints.push({ x: ex, y: ey, r: 5.2 + rand() * 2.5, isPink: rand() > 0.72 });

    // Sub-twigs
    for (let t = 0; t < 2; t++) {
      const tAngle = bAngle + (t === 0 ? -0.35 : 0.35) + (rand() - 0.5) * 0.15;
      const tLen = 16 + rand() * 18;
      const tx = (cx + ex) * 0.55 + Math.cos(tAngle) * tLen;
      const ty = (cy + ey) * 0.55 + Math.sin(tAngle) * tLen;

      ctx.beginPath();
      ctx.moveTo((cx + ex) * 0.55, (cy + ey) * 0.55);
      ctx.lineTo(tx, ty);
      ctx.lineWidth = 0.75;
      ctx.stroke();

      blossomPoints.push({ x: tx, y: ty, r: 4.0 + rand() * 2.2, isPink: rand() > 0.78 });
    }
  }

  // Draw tiny multi-petal gypsophila / waxflower blossoms
  blossomPoints.forEach(pt => {
    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.shadowColor = 'rgba(95, 45, 65, 0.18)';
    ctx.shadowBlur = 4;

    const petals = 5;
    for (let p = 0; p < petals; p++) {
      const pa = (p / petals) * Math.PI * 2 + rand() * 0.3;
      const px = Math.cos(pa) * (pt.r * 0.58);
      const py = Math.sin(pa) * (pt.r * 0.58);
      ctx.beginPath();
      ctx.arc(px, py, pt.r * 0.52, 0, Math.PI * 2);
      ctx.fillStyle = pt.isPink ? '#FCE0E8' : '#FFFDFB';
      ctx.fill();
    }

    // Tiny warm center
    ctx.beginPath();
    ctx.arc(0, 0, pt.r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = pt.isPink ? '#D96B8A' : '#F3DCA2';
    ctx.fill();
    ctx.restore();
  });

  return { canvas, size };
}

/**
 * Draws the back layers of Korean matte wrapping paper & soft inner tissue
 */
function drawWrappingPaperBack(ctx, cx, cy, scale) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Soft ambient drop shadow behind the entire wrapped bouquet
  const bgShadow = ctx.createRadialGradient(0, 20, 40, 0, 45, 295);
  bgShadow.addColorStop(0, 'rgba(115, 50, 70, 0.22)');
  bgShadow.addColorStop(0.65, 'rgba(135, 65, 85, 0.08)');
  bgShadow.addColorStop(1, 'rgba(135, 65, 85, 0)');
  ctx.fillStyle = bgShadow;
  ctx.beginPath();
  ctx.arc(0, 40, 295, 0, Math.PI * 2);
  ctx.fill();

  // Helper for folded florist paper sheet with gold-rose trim
  function drawPaperSheet(points, gradColors, trimColor) {
    ctx.save();
    ctx.shadowColor = 'rgba(105, 48, 65, 0.14)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const pt = points[i];
      ctx.bezierCurveTo(pt.cp1x, pt.cp1y, pt.cp2x, pt.cp2y, pt.x, pt.y);
    }
    ctx.closePath();

    const g = ctx.createLinearGradient(0, -260, 0, 220);
    g.addColorStop(0, gradColors[0]);
    g.addColorStop(0.55, gradColors[1]);
    g.addColorStop(1, gradColors[2]);
    ctx.fillStyle = g;
    ctx.fill();

    if (trimColor) {
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = trimColor;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    ctx.restore();
  }

  // 1. Center-Back Tall Crown Sheet (Warm Alabaster Cream)
  drawPaperSheet(
    [
      { x: 0, y: 150 },
      { cp1x: -140, cp1y: 40, cp2x: -185, cp2y: -175, x: -115, y: -245 },
      { cp1x: -60, cp1y: -278, cp2x: -20, cp2y: -252, x: 0, y: -260 },
      { cp1x: 20, cp1y: -252, cp2x: 60, cp2y: -278, x: 115, y: -245 },
      { cp1x: 185, cp1y: -175, cp2x: 140, cp2y: 40, x: 0, y: 150 }
    ],
    ['#FFFDFB', '#FBF2EE', '#F2E0DC'],
    'rgba(218, 175, 165, 0.55)'
  );

  // 2. Left Wide Wing Sheet (Soft Korean Dusty Blush Matte Paper)
  drawPaperSheet(
    [
      { x: -10, y: 165 },
      { cp1x: -150, cp1y: 80, cp2x: -258, cp2y: -60, x: -232, y: -155 },
      { cp1x: -212, cp1y: -215, cp2x: -145, cp2y: -220, x: -85, y: -195 },
      { cp1x: -30, cp1y: -165, cp2x: -10, cp2y: 40, x: -10, y: 165 }
    ],
    ['#FDF0F3', '#F7DCE2', '#EBC4CE'],
    'rgba(225, 168, 182, 0.6)'
  );

  // 3. Right Wide Wing Sheet (Soft Korean Dusty Blush Matte Paper)
  drawPaperSheet(
    [
      { x: 10, y: 165 },
      { cp1x: 150, cp1y: 80, cp2x: 258, cp2y: -60, x: 232, y: -155 },
      { cp1x: 212, cp1y: -215, cp2x: 145, cp2y: -220, x: 85, y: -195 },
      { cp1x: 30, cp1y: -165, cp2x: 10, cp2y: 40, x: 10, y: 165 }
    ],
    ['#FDF0F3', '#F7DCE2', '#EBC4CE'],
    'rgba(225, 168, 182, 0.6)'
  );

  // 4. Inner Crinkled Frosted Silk Tissue Collar
  drawPaperSheet(
    [
      { x: 0, y: 130 },
      { cp1x: -180, cp1y: 30, cp2x: -225, cp2y: -120, x: -165, y: -182 },
      { cp1x: -115, cp1y: -225, cp2x: -55, cp2y: -205, x: 0, y: -218 },
      { cp1x: 55, cp1y: -205, cp2x: 115, cp2y: -225, x: 165, y: -182 },
      { cp1x: 225, cp1y: -120, cp2x: 180, cp2y: 30, x: 0, y: 130 }
    ],
    ['rgba(255, 255, 255, 0.92)', 'rgba(255, 248, 250, 0.85)', 'rgba(248, 232, 236, 0.8)'],
    'rgba(255, 255, 255, 0.9)'
  );

  // 5. Deep Botanical Shadow Bed inside the paper cone so roses sit deeply nestled
  const bedGrad = ctx.createRadialGradient(0, -35, 30, 0, -35, 195);
  bedGrad.addColorStop(0, '#2B3A30');
  bedGrad.addColorStop(0.65, '#3E2832');
  bedGrad.addColorStop(1, 'rgba(74, 44, 53, 0)');
  ctx.fillStyle = bedGrad;
  ctx.beginPath();
  ctx.ellipse(0, -35, 190, 170, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws the front wrapping paper cone, lower skirt folds, stems peeking out,
 * and the flowing double-loop silk satin ribbon bow + swinging gift tag.
 */
function drawWrappingPaperFrontAndRibbon(ctx, cx, cy, scale, time) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  const waistX = 0;
  const waistY = 148;

  // 1. Green Rose Stems peeking out at the very bottom beneath the paper skirt
  const stemOffsets = [-22, -11, -2, 8, 19, 27];
  stemOffsets.forEach((ox, idx) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ox * 0.4, waistY + 40);
    ctx.quadraticCurveTo(ox * 0.8, waistY + 95, ox * 1.35, waistY + 148 + (idx % 2) * 8);
    ctx.strokeStyle = idx % 2 === 0 ? '#3E5E46' : '#4E7256';
    ctx.lineWidth = 5.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  });

  // 2. Lower Back Skirt Flare of the Wrapping Paper
  ctx.save();
  ctx.shadowColor = 'rgba(95, 40, 58, 0.16)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 8;

  ctx.beginPath();
  ctx.moveTo(-48, waistY - 5);
  ctx.bezierCurveTo(-82, waistY + 45, -112, waistY + 95, -88, waistY + 132);
  ctx.bezierCurveTo(-40, waistY + 142, 40, waistY + 142, 88, waistY + 132);
  ctx.bezierCurveTo(112, waistY + 95, 82, waistY + 45, 48, waistY - 5);
  ctx.closePath();

  const skirtGrad = ctx.createLinearGradient(0, waistY, 0, waistY + 138);
  skirtGrad.addColorStop(0, '#E9C2CC');
  skirtGrad.addColorStop(0.45, '#F7DFE5');
  skirtGrad.addColorStop(1, '#FFF8FA');
  ctx.fillStyle = skirtGrad;
  ctx.fill();
  ctx.restore();

  // 3. Left Front Embracing Paper Fold (Sweeping from left side of roses down through waist)
  ctx.save();
  ctx.shadowColor = 'rgba(100, 42, 60, 0.15)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 4;

  ctx.beginPath();
  ctx.moveTo(-195, -18);
  ctx.bezierCurveTo(-215, 55, -135, 118, -42, waistY + 2);
  ctx.bezierCurveTo(-65, waistY + 52, -78, waistY + 98, -55, waistY + 125);
  ctx.bezierCurveTo(-15, waistY + 128, 12, waistY + 115, 22, waistY + 98);
  ctx.bezierCurveTo(15, waistY + 48, 8, waistY + 12, 18, waistY - 8);
  ctx.bezierCurveTo(-45, 92, -125, 62, -195, -18);
  ctx.closePath();

  const leftFoldGrad = ctx.createLinearGradient(-195, 0, 30, waistY + 110);
  leftFoldGrad.addColorStop(0, '#FFFDFB');
  leftFoldGrad.addColorStop(0.5, '#FCEBEF');
  leftFoldGrad.addColorStop(1, '#F2CED7');
  ctx.fillStyle = leftFoldGrad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(220, 165, 180, 0.65)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.restore();

  // 4. Right Front Embracing Paper Fold (Overlapping the left fold gracefully)
  ctx.save();
  ctx.shadowColor = 'rgba(95, 38, 56, 0.18)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = -3;
  ctx.shadowOffsetY = 5;

  ctx.beginPath();
  ctx.moveTo(195, -18);
  ctx.bezierCurveTo(215, 55, 135, 118, 42, waistY + 2);
  ctx.bezierCurveTo(68, waistY + 54, 84, waistY + 102, 58, waistY + 128);
  ctx.bezierCurveTo(10, waistY + 135, -24, waistY + 120, -34, waistY + 102);
  ctx.bezierCurveTo(-18, waistY + 50, -12, waistY + 12, -22, waistY - 12);
  ctx.bezierCurveTo(45, 88, 128, 60, 195, -18);
  ctx.closePath();

  const rightFoldGrad = ctx.createLinearGradient(195, 0, -40, waistY + 120);
  rightFoldGrad.addColorStop(0, '#FFF9FA');
  rightFoldGrad.addColorStop(0.45, '#F9E0E6');
  rightFoldGrad.addColorStop(1, '#EFC2CE');
  ctx.fillStyle = rightFoldGrad;
  ctx.fill();

  // Subtle rose-gold decorative stripe near edge of Korean wrapping paper
  ctx.strokeStyle = 'rgba(212, 155, 170, 0.72)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();

  // 5. LUXURY DOUBLE-LOOP SILK SATIN RIBBON & FLOWING TAILS
  const breeze = Math.sin(time * 1.8) * 6;
  const breeze2 = Math.cos(time * 1.4) * 5;

  ctx.save();
  ctx.translate(waistX, waistY + 4);

  // Ribbon waist band wrapping tightly around paper cone
  ctx.shadowColor = 'rgba(115, 25, 52, 0.28)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  const ribbonBandGrad = ctx.createLinearGradient(-46, 0, 46, 0);
  ribbonBandGrad.addColorStop(0, '#B5385A');
  ribbonBandGrad.addColorStop(0.3, '#E26D8D');
  ribbonBandGrad.addColorStop(0.5, '#F79BB4'); // satin sheen
  ribbonBandGrad.addColorStop(0.75, '#D95B7D');
  ribbonBandGrad.addColorStop(1, '#A82E50');

  ctx.fillStyle = ribbonBandGrad;
  ctx.beginPath();
  ctx.roundRect(-45, -11, 90, 22, 8);
  ctx.fill();

  // Left Flowing Satin Ribbon Tail
  ctx.beginPath();
  ctx.moveTo(-10, 8);
  ctx.bezierCurveTo(-38, 45, -68 + breeze, 92, -52 + breeze * 1.3, 142);
  ctx.lineTo(-34 + breeze * 1.3, 134);
  ctx.bezierCurveTo(-46 + breeze, 88, -20, 44, 4, 8);
  ctx.closePath();
  const tailGradL = ctx.createLinearGradient(-10, 8, -50, 140);
  tailGradL.addColorStop(0, '#BA3B5E');
  tailGradL.addColorStop(0.45, '#E87A98');
  tailGradL.addColorStop(1, '#C94A6D');
  ctx.fillStyle = tailGradL;
  ctx.fill();

  // Right Flowing Satin Ribbon Tail
  ctx.beginPath();
  ctx.moveTo(10, 8);
  ctx.bezierCurveTo(40, 48, 72 + breeze2, 95, 58 + breeze2 * 1.3, 146);
  ctx.lineTo(38 + breeze2 * 1.3, 138);
  ctx.bezierCurveTo(50 + breeze2, 92, 22, 46, -4, 8);
  ctx.closePath();
  const tailGradR = ctx.createLinearGradient(10, 8, 55, 145);
  tailGradR.addColorStop(0, '#B8395B');
  tailGradR.addColorStop(0.5, '#EC829F');
  tailGradR.addColorStop(1, '#C44568');
  ctx.fillStyle = tailGradR;
  ctx.fill();

  // Upper Left Bow Loop
  ctx.beginPath();
  ctx.moveTo(-6, -2);
  ctx.bezierCurveTo(-55, -36, -92, -12, -78, 14);
  ctx.bezierCurveTo(-65, 34, -28, 18, -4, 4);
  ctx.closePath();
  const loopGradL = ctx.createLinearGradient(-85, -15, -5, 10);
  loopGradL.addColorStop(0, '#C44568');
  loopGradL.addColorStop(0.45, '#F6A2B8'); // satin highlight
  loopGradL.addColorStop(1, '#A82E50');
  ctx.fillStyle = loopGradL;
  ctx.fill();

  // Upper Right Bow Loop
  ctx.beginPath();
  ctx.moveTo(6, -2);
  ctx.bezierCurveTo(55, -36, 92, -12, 78, 14);
  ctx.bezierCurveTo(65, 34, 28, 18, 4, 4);
  ctx.closePath();
  const loopGradR = ctx.createLinearGradient(85, -15, 5, 10);
  loopGradR.addColorStop(0, '#C44568');
  loopGradR.addColorStop(0.45, '#F6A2B8');
  loopGradR.addColorStop(1, '#A82E50');
  ctx.fillStyle = loopGradR;
  ctx.fill();

  // Secondary Lower Bow Loops for rich fullness
  ctx.beginPath();
  ctx.moveTo(-6, 2);
  ctx.bezierCurveTo(-48, 8, -72, 28, -54, 42);
  ctx.bezierCurveTo(-38, 52, -15, 25, -3, 6);
  ctx.closePath();
  ctx.fillStyle = '#D65A7C';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(6, 2);
  ctx.bezierCurveTo(48, 8, 72, 28, 54, 42);
  ctx.bezierCurveTo(38, 52, 15, 25, 3, 6);
  ctx.closePath();
  ctx.fillStyle = '#D65A7C';
  ctx.fill();

  // Center Satin Ribbon Knot
  const knotGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 16);
  knotGrad.addColorStop(0, '#FADCE4');
  knotGrad.addColorStop(0.45, '#E46C8C');
  knotGrad.addColorStop(1, '#9E2445');
  ctx.fillStyle = knotGrad;
  ctx.beginPath();
  ctx.roundRect(-13, -12, 26, 24, 9);
  ctx.fill();

  // 6. Cute Swinging Florist Keepsake Tag ("20 • 10")
  const tagAngle = Math.sin(time * 2.1) * 0.08 + 0.12;
  ctx.save();
  ctx.rotate(tagAngle);

  // Gold thread
  ctx.beginPath();
  ctx.moveTo(4, 10);
  ctx.lineTo(18, 34);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Tag card
  ctx.translate(18, 34);
  ctx.fillStyle = '#FFFDFB';
  ctx.strokeStyle = '#E2B8C4';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-22, 0, 44, 26, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#B83B5E';
  ctx.font = 'italic 600 10px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('20 • 10', 0, 16);
  ctx.restore();

  ctx.restore(); // end ribbon waist
  ctx.restore(); // end scale/translate
}

// Define the complete arrangement of 25 roses (back layer, mid dome, hero front blooms, and outer buds)
const BOUQUET_LAYOUT = [
  // TIER 1: Upper & Outer Halo Rosebuds & Arching Blooms (Back Depth)
  { x: -128, y: -165, r: 44, paletteKey: 'pastelPink', variety: 'bud', tiltX: -0.35, tiltY: -0.35, z: 1, seed: 11 },
  { x: -62,  y: -192, r: 48, paletteKey: 'creamPeach', variety: 'classic', tiltX: -0.18, tiltY: -0.4, z: 1, seed: 12 },
  { x: 8,    y: -202, r: 50, paletteKey: 'sweetBlush', variety: 'garden', tiltX: 0.02, tiltY: -0.42, z: 1, seed: 13 },
  { x: 76,   y: -188, r: 47, paletteKey: 'pastelPink', variety: 'classic', tiltX: 0.22, tiltY: -0.38, z: 1, seed: 14 },
  { x: 134,  y: -158, r: 44, paletteKey: 'pearlVintage', variety: 'bud', tiltX: 0.38, tiltY: -0.32, z: 1, seed: 15 },
  { x: -172, y: -98,  r: 45, paletteKey: 'sweetBlush', variety: 'bud', tiltX: -0.45, tiltY: -0.15, z: 1, seed: 16 },
  { x: 174,  y: -92,  r: 45, paletteKey: 'creamPeach', variety: 'bud', tiltX: 0.45, tiltY: -0.15, z: 1, seed: 17 },

  // TIER 2: Lush Mid-Dome Roses (Creating full volume and rich shadow pockets)
  { x: -115, y: -112, r: 56, paletteKey: 'pearlVintage', variety: 'garden', tiltX: -0.26, tiltY: -0.22, z: 2, seed: 21, hasDewdrop: true },
  { x: -38,  y: -138, r: 60, paletteKey: 'berryRomance', variety: 'peony', tiltX: -0.1, tiltY: -0.24, z: 2, seed: 22 },
  { x: 44,   y: -135, r: 58, paletteKey: 'creamPeach', variety: 'garden', tiltX: 0.12, tiltY: -0.24, z: 2, seed: 23, hasDewdrop: true },
  { x: 118,  y: -108, r: 56, paletteKey: 'sweetBlush', variety: 'classic', tiltX: 0.28, tiltY: -0.2, z: 2, seed: 24 },
  { x: -150, y: -32,  r: 55, paletteKey: 'pastelPink', variety: 'classic', tiltX: -0.35, tiltY: 0.02, z: 2, seed: 25 },
  { x: 152,  y: -28,  r: 55, paletteKey: 'pearlVintage', variety: 'garden', tiltX: 0.35, tiltY: 0.02, z: 2, seed: 26 },
  { x: -118, y: 38,   r: 54, paletteKey: 'creamPeach', variety: 'classic', tiltX: -0.28, tiltY: 0.24, z: 2, seed: 27 },
  { x: 120,  y: 42,   r: 54, paletteKey: 'berryRomance', variety: 'classic', tiltX: 0.28, tiltY: 0.24, z: 2, seed: 28 },

  // TIER 3: Grand Hero Centerpiece Roses (Fullest, largest David Austin & French blooms)
  { x: -78,  y: -58,  r: 65, paletteKey: 'sweetBlush', variety: 'peony', tiltX: -0.14, tiltY: -0.08, z: 3, seed: 31, hasDewdrop: true },
  { x: 78,   y: -55,  r: 64, paletteKey: 'pastelPink', variety: 'garden', tiltX: 0.15, tiltY: -0.08, z: 3, seed: 32 },
  { x: -58,  y: 25,   r: 63, paletteKey: 'pearlVintage', variety: 'garden', tiltX: -0.12, tiltY: 0.16, z: 3, seed: 33, hasDewdrop: true },
  { x: 60,   y: 28,   r: 62, paletteKey: 'sweetBlush', variety: 'classic', tiltX: 0.12, tiltY: 0.16, z: 3, seed: 34, hasDewdrop: true },
  { x: 0,    y: 48,   r: 60, paletteKey: 'creamPeach', variety: 'peony', tiltX: 0.0, tiltY: 0.22, z: 3, seed: 35 },

  // TIER 4: The Crown Jewel Center Rose
  { x: 0,    y: -78,  r: 66, paletteKey: 'creamPeach', variety: 'garden', tiltX: 0.0, tiltY: -0.12, z: 4, seed: 41, hasDewdrop: true },
  { x: -2,   y: -10,  r: 72, paletteKey: 'sweetBlush', variety: 'peony', tiltX: 0.0, tiltY: 0.02, z: 4, seed: 42, hasDewdrop: true }
];

// Foliage & Eucalyptus Sprigs around the dome
const FOLIAGE_LAYOUT = [
  // Back & Upper Eucalyptus / Rose Leaves
  { x: -145, y: -145, angle: -2.35, len: 88, w: 28, type: 'eucalyptus', layer: 'back' },
  { x: -85,  y: -185, angle: -1.85, len: 92, w: 26, type: 'roseLeaf',   layer: 'back' },
  { x: -10,  y: -200, angle: -1.55, len: 95, w: 28, type: 'eucalyptus', layer: 'back' },
  { x: 75,   y: -185, angle: -1.25, len: 90, w: 26, type: 'roseLeaf',   layer: 'back' },
  { x: 145,  y: -140, angle: -0.75, len: 88, w: 28, type: 'eucalyptus', layer: 'back' },
  { x: -175, y: -65,  angle: -2.75, len: 85, w: 27, type: 'roseLeaf',   layer: 'back' },
  { x: 175,  y: -60,  angle: -0.35, len: 85, w: 27, type: 'roseLeaf',   layer: 'back' },

  // Foreground Collar Leaves cascading over the wrapping paper edge
  { x: -140, y: 45,   angle: 2.55,  len: 76, w: 25, type: 'roseLeaf',   layer: 'front' },
  { x: -85,  y: 72,   angle: 2.15,  len: 82, w: 26, type: 'eucalyptus', layer: 'front' },
  { x: -28,  y: 82,   angle: 1.78,  len: 74, w: 24, type: 'roseLeaf',   layer: 'front' },
  { x: 32,   y: 82,   angle: 1.35,  len: 75, w: 24, type: 'roseLeaf',   layer: 'front' },
  { x: 88,   y: 70,   angle: 0.95,  len: 82, w: 26, type: 'eucalyptus', layer: 'front' },
  { x: 142,  y: 42,   angle: 0.55,  len: 76, w: 25, type: 'roseLeaf',   layer: 'front' }
];

// Gypsophila (Hoa Baby Trắng) Clusters tucked around and inside the bouquet
const BABY_BREATH_LAYOUT = [
  { x: -158, y: -142, angle: -0.65, scale: 0.92, layer: 'back', seed: 101 },
  { x: -35,  y: -208, angle: -0.12, scale: 0.96, layer: 'back', seed: 102 },
  { x: 48,   y: -204, angle: 0.18,  scale: 0.94, layer: 'back', seed: 103 },
  { x: 162,  y: -135, angle: 0.68,  scale: 0.92, layer: 'back', seed: 104 },
  { x: -188, y: -42,  angle: -1.05, scale: 0.88, layer: 'back', seed: 105 },
  { x: 190,  y: -38,  angle: 1.05,  scale: 0.88, layer: 'back', seed: 106 },

  // Foreground airy baby's breath tucked between hero roses
  { x: -102, y: -82,  angle: -0.45, scale: 0.72, layer: 'front', seed: 201 },
  { x: 104,  y: -78,  angle: 0.45,  scale: 0.72, layer: 'front', seed: 202 },
  { x: -125, y: 18,   angle: -0.85, scale: 0.78, layer: 'front', seed: 203 },
  { x: 128,  y: 22,   angle: 0.85,  scale: 0.78, layer: 'front', seed: 204 },
  { x: -45,  y: 68,   angle: -0.25, scale: 0.75, layer: 'front', seed: 205 },
  { x: 48,   y: 68,   angle: 0.25,  scale: 0.75, layer: 'front', seed: 206 }
];

const bouquetCanvas = document.getElementById('bouquetCanvas');
const bCtx = bouquetCanvas.getContext('2d');
const bouquetWrapper = document.getElementById('bouquetStageWrapper');
const ambientCanvas = document.getElementById('ambientPetalsCanvas');
const aCtx = ambientCanvas.getContext('2d');

const roseNodes = [];
const babySprites = [];
let pointerX = -9999;
let pointerY = -9999;
let parallaxTargetX = 0;
let parallaxTargetY = 0;
let parallaxX = 0;
let parallaxY = 0;
let nextAutoShowcaseTime = performance.now() + 11000;
let stageW = 640;
let stageH = 640;
let winW = window.innerWidth;
let winH = window.innerHeight;
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = motionPreference.matches;
let sceneAnimationFrame = null;
let keyboardRoseIndex = 0;
const bloomTimers = new Set();

function requestSceneRender() {
  if (sceneAnimationFrame === null && !document.hidden) {
    sceneAnimationFrame = requestAnimationFrame(renderBouquetScene);
  }
}

function clearBloomTimers() {
  bloomTimers.forEach(clearTimeout);
  bloomTimers.clear();
}

function scheduleBloom(callback, delay) {
  const timer = setTimeout(() => {
    bloomTimers.delete(timer);
    if (!reducedMotion && !document.hidden) callback();
  }, delay);
  bloomTimers.add(timer);
}

function settleBouquet() {
  clearBloomTimers();
  roseNodes.forEach(rose => {
    rose.bloom = rose.targetBloom = 1.04;
    rose.vBloom = rose.vScale = rose.flareGlow = 0;
    rose.scaleOffset = 1;
    rose.vx = rose.vy = rose.offsetX = rose.offsetY = 0;
  });
  fallingPetals.length = 0;
  burstSparkles.length = 0;
  pointerX = pointerY = -9999;
  parallaxX = parallaxY = parallaxTargetX = parallaxTargetY = 0;
}

function initBotanicalAssets() {
  BOUQUET_LAYOUT.forEach((item, index) => {
    const sprite = createRealisticRoseSprite({ ...item, radius: item.r });
    roseNodes.push({
      ...item,
      index,
      sprite,
      offsetX: 0,
      offsetY: 0,
      vx: 0,
      vy: 0,
      scaleOffset: 1,
      vScale: 0,
      // Multi-layer unfurling bloom state: 0.05 = tight furled bud, 1.0 = full rose, 1.32 = dramatic wide over-bloom
      bloom: 0.05,
      targetBloom: 1.04,
      vBloom: 0,
      flareGlow: 0,
      spinDir: index % 2 === 0 ? 1 : -1,
      whisper: WHISPER_NOTES[index % WHISPER_NOTES.length]
    });
  });

  // Sort by depth z so back roses render first and hero center roses render on top
  roseNodes.sort((a, b) => a.z - b.z);

  BABY_BREATH_LAYOUT.forEach(item => {
    babySprites.push({
      ...item,
      sprite: createBabyBreathClusterSprite(item.seed)
    });
  });
}

function triggerBouquetBloomWave(originX = 0, originY = -30, mode = 'grand') {
  clearBloomTimers();
  nextAutoShowcaseTime = performance.now() + 11000;
  if (reducedMotion) {
    settleBouquet();
    requestSceneRender();
    return;
  }
  roseNodes.forEach(rose => {
    const distance = Math.hypot(rose.x - originX, rose.y - originY);
    const delay = mode === 'grand' ? distance * 2.1 + (4 - rose.z) * 65 : distance * 1.4;
    if (mode === 'grand') {
      rose.bloom = rose.targetBloom = 0.04;
      rose.vBloom = 0;
      rose.scaleOffset = 0.78;
    } else {
      scheduleBloom(() => {
        rose.targetBloom = 0.48;
        rose.vBloom = -0.06;
      }, Math.max(0, delay - 110));
    }
    scheduleBloom(() => {
      rose.targetBloom = 1.32;
      rose.vBloom = mode === 'grand' ? 0.145 : 0.165;
      rose.vScale += 0.11;
      rose.flareGlow = 1;
      if (mode === 'grand' ? rose.z >= 3 : Math.random() > 0.78) {
        const rect = bouquetCanvas.getBoundingClientRect();
        spawnPetalBurst(rect.left + rose.screenX, rect.top + rose.screenY, mode === 'grand' ? 2 : 1);
      }
      scheduleBloom(() => {
        rose.targetBloom = 1.04 + (rose.z >= 3 ? 0.04 : 0);
      }, 520);
    }, delay + (mode === 'ripple' ? 90 : 0));
  });
  requestSceneRender();
}

function resizeCanvases() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  // Layout dimensions stay stable while the entrance animation scales the wrapper.
  stageW = bouquetWrapper.clientWidth || 560;
  stageH = bouquetWrapper.clientHeight || 560;
  bouquetCanvas.width = Math.round(stageW * dpr);
  bouquetCanvas.height = Math.round(stageH * dpr);
  bCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  winW = window.innerWidth;
  winH = window.innerHeight;
  ambientCanvas.width = Math.round(winW * dpr);
  ambientCanvas.height = Math.round(winH * dpr);
  aCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  requestSceneRender();
}
const fallingPetals = [];
const burstSparkles = [];

function createPetalParticle(customX, customY, isBurst = false) {
  const colors = [
    ['#FFF0F4', '#F7A8BE'],
    ['#FFE5EC', '#E87A99'],
    ['#FFF8F5', '#F9C5BD'],
    ['#FCE4EC', '#D95B7D']
  ];
  const pair = colors[Math.floor(Math.random() * colors.length)];
  return {
    x: customX !== undefined ? customX : Math.random() * winW,
    y: customY !== undefined ? customY : -30 - Math.random() * winH * 0.4,
    vx: isBurst ? (Math.random() - 0.5) * 4.2 : (Math.random() - 0.35) * 0.85,
    vy: isBurst ? -1.5 - Math.random() * 2.8 : 0.65 + Math.random() * 1.15,
    size: 8 + Math.random() * 9,
    rot: Math.random() * Math.PI * 2,
    vRot: (Math.random() - 0.5) * 0.03,
    flipPhase: Math.random() * Math.PI * 2,
    vFlip: 0.02 + Math.random() * 0.025,
    swayPhase: Math.random() * Math.PI * 2,
    colorInner: pair[0],
    colorOuter: pair[1],
    opacity: isBurst ? 1 : 0.45 + Math.random() * 0.45,
    isBurst
  };
}

function initAmbientPetals() {
  if (reducedMotion) return;
  const count = window.innerWidth < 768 ? 10 : 16;
  for (let i = 0; i < count; i++) {
    const p = createPetalParticle(Math.random() * winW, Math.random() * winH, false);
    fallingPetals.push(p);
  }
}

function spawnPetalBurst(screenX, screenY, count = 8) {
  if (reducedMotion || document.hidden) return;
  count = Math.min(count, Math.max(0, 68 - fallingPetals.length), Math.max(0, 96 - burstSparkles.length - 4));
  if (count <= 0) return;
  for (let i = 0; i < count; i++) {
    fallingPetals.push(createPetalParticle(screenX, screenY, true));
  }
  for (let i = 0; i < count + 4; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.8 + Math.random() * 2.6;
    burstSparkles.push({
      x: screenX,
      y: screenY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.6,
      r: 1.8 + Math.random() * 2.5,
      alpha: 1,
      color: i % 2 === 0 ? '#FFF6F8' : '#F48FB1'
    });
  }
}

function renderAmbientPetals(time) {
  aCtx.clearRect(0, 0, winW, winH);

  // Update & draw falling rose petals
  for (let i = fallingPetals.length - 1; i >= 0; i--) {
    const p = fallingPetals[i];
    p.swayPhase += 0.018;
    p.flipPhase += p.vFlip;
    p.rot += p.vRot;

    if (p.isBurst) {
      p.vy += 0.065; // gentle gravity after burst
      p.vx *= 0.99;
    }

    p.x += p.vx + Math.sin(p.swayPhase) * 0.55;
    p.y += p.vy;

    // Recycle normal ambient petals; remove finished burst petals
    if (p.y > winH + 40) {
      if (p.isBurst) {
        fallingPetals.splice(i, 1);
        continue;
      } else {
        p.y = -25;
        p.x = Math.random() * winW;
        p.vy = 0.65 + Math.random() * 1.15;
        p.isBurst = false;
      }
    }

    const flipScale = 0.35 + 0.65 * Math.abs(Math.cos(p.flipPhase));
    aCtx.save();
    aCtx.translate(p.x, p.y);
    aCtx.rotate(p.rot);
    aCtx.scale(1, flipScale);
    aCtx.globalAlpha = p.opacity;

    // Draw realistic cupped single falling rose petal
    aCtx.beginPath();
    aCtx.moveTo(0, -p.size);
    aCtx.bezierCurveTo(p.size * 1.1, -p.size * 0.9, p.size * 1.2, p.size * 0.6, 0, p.size);
    aCtx.bezierCurveTo(-p.size * 1.2, p.size * 0.6, -p.size * 1.1, -p.size * 0.9, 0, -p.size);
    aCtx.closePath();

    const g = aCtx.createLinearGradient(0, -p.size, 0, p.size);
    g.addColorStop(0, p.colorInner);
    g.addColorStop(1, p.colorOuter);
    aCtx.fillStyle = g;
    aCtx.fill();
    aCtx.restore();
  }

  // Update & draw warm light sparkles
  for (let i = burstSparkles.length - 1; i >= 0; i--) {
    const s = burstSparkles[i];
    s.x += s.vx;
    s.y += s.vy;
    s.alpha -= 0.022;
    if (s.alpha <= 0) {
      burstSparkles.splice(i, 1);
      continue;
    }
    aCtx.save();
    aCtx.globalAlpha = s.alpha;
    aCtx.fillStyle = s.color;
    aCtx.shadowColor = '#F48FB1';
    aCtx.shadowBlur = 8;
    aCtx.beginPath();
    aCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    aCtx.fill();
    aCtx.restore();
  }
}

function renderBouquetScene(timestamp) {
  sceneAnimationFrame = null;
  if (document.hidden) return;
  const time = reducedMotion ? 0 : timestamp * 0.001;
  bCtx.clearRect(0, 0, stageW, stageH);

  // Smoothly interpolate parallax
  parallaxX += (parallaxTargetX - parallaxX) * 0.06;
  parallaxY += (parallaxTargetY - parallaxY) * 0.06;

  // Responsive scale relative to a 580x580 canonical coordinate frame
  const baseScale = Math.min(stageW, stageH) / 650;
  const centerX = stageW * 0.5 + parallaxX * 8;
  const centerY = stageH * 0.51 + Math.sin(time * 1.25) * 4.5 + parallaxY * 6;
  const globalSwayRot = Math.sin(time * 0.95) * 0.018 + parallaxX * 0.015;

  bCtx.save();
  bCtx.translate(centerX, centerY);
  bCtx.rotate(globalSwayRot);

  // 1. Back Wrapping Paper & Soft Tissue Lining
  drawWrappingPaperBack(bCtx, 0, 0, baseScale);

  // 2. Back Eucalyptus & Serrated Rose Foliage
  FOLIAGE_LAYOUT.filter(f => f.layer === 'back').forEach((leaf, idx) => {
    const leafSway = Math.sin(time * 1.6 + idx) * 0.035;
    drawBotanicalLeaf(
      bCtx,
      leaf.x * baseScale,
      leaf.y * baseScale,
      leaf.angle + leafSway,
      leaf.len * baseScale,
      leaf.w * baseScale,
      leaf.type
    );
  });

  // 3. Back Gypsophila (Hoa Baby Trắng) Clouds
  babySprites.filter(b => b.layer === 'back').forEach((b, idx) => {
    const bSway = Math.cos(time * 1.5 + idx) * 0.04;
    bCtx.save();
    bCtx.translate(b.x * baseScale, b.y * baseScale);
    bCtx.rotate(b.angle + bSway);
    const drawSz = b.sprite.size * b.scale * baseScale;
    bCtx.drawImage(b.sprite.canvas, -drawSz * 0.5, -drawSz * 0.82, drawSz, drawSz);
    bCtx.restore();
  });

  // 4. Individual Interactive Roses (Sorted Back-to-Front)
  // A sparse idle bloom leaves room for the invitation and the reader.
  if (!reducedMotion && !document.body.classList.contains('card-open') && pointerX < -1000 && timestamp > nextAutoShowcaseTime && roseNodes.length > 0) {
    const candidateIndices = roseNodes
      .map((r, i) => ({ r, i }))
      .filter(item => item.r.z >= 2);
    const pick = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
    if (pick) {
      const targetRose = pick.r;

      // Trigger a mini radial bloom wave centered on the highlighted rose!
      roseNodes.forEach((r) => {
        const d = Math.hypot(r.x - targetRose.x, r.y - targetRose.y);
        if (d < 145) {
          const waveDelay = d * 1.5;
          scheduleBloom(() => {
            r.bloom = Math.min(r.bloom, 0.45); // quick contract into semi-bud
            r.targetBloom = 1.32;              // surge wide open
            r.vBloom = 0.155;
            r.vScale += 0.095 * (1 - d / 160);
            r.flareGlow = 0.95;
            scheduleBloom(() => {
              r.targetBloom = 1.04;
            }, 540);
          }, waveDelay);
        }
      });


    }
    nextAutoShowcaseTime = timestamp + 11000;
  }

  roseNodes.forEach(rose => {
    // Organic rhythmic breathing per rose
    const breath = reducedMotion ? 1 : 1 + Math.sin(time * 2.1 + rose.seed) * 0.022;

    // World position of this rose on canvas for pointer interaction
    const localX = (rose.x + rose.offsetX) * baseScale;
    const localY = (rose.y + rose.offsetY) * baseScale;
    const worldX = centerX + localX * Math.cos(globalSwayRot) - localY * Math.sin(globalSwayRot);
    const worldY = centerY + localX * Math.sin(globalSwayRot) + localY * Math.cos(globalSwayRot);
    rose.screenX = worldX;
    rose.screenY = worldY;
    rose.hitRadius = rose.r * baseScale * rose.scaleOffset * 1.08;

    const dx = pointerX - worldX;
    const dy = pointerY - worldY;
    const dist = Math.hypot(dx, dy);
    const hitRadius = rose.r * baseScale * 1.08;

    // Interactive spring physics when pointer approaches this rose
    let targetOx = (rose.z - 2) * parallaxX * 4.5;
    let targetOy = (rose.z - 2) * parallaxY * 4.5;
    let targetScale = 1.0;

    if (!reducedMotion && dist < hitRadius * 1.55) {
      const factor = 1 - dist / (hitRadius * 1.55);
      targetOx -= (dx / (dist || 1)) * factor * 8;
      targetOy -= (dy / (dist || 1)) * factor * 8;
      targetScale = 1 + factor * 0.14;
      // Hovering causes the rose to unfurl wider into dramatic over-bloom
      rose.targetBloom = Math.max(rose.targetBloom, 1.06 + factor * 0.26);
      rose.flareGlow = Math.max(rose.flareGlow, factor * 0.75);
    }

    // Spring integration for position & overall scale
    rose.vx = (rose.vx + (targetOx - rose.offsetX) * 0.12) * 0.78;
    rose.vy = (rose.vy + (targetOy - rose.offsetY) * 0.12) * 0.78;
    rose.offsetX += rose.vx;
    rose.offsetY += rose.vy;

    rose.vScale = (rose.vScale + (targetScale - rose.scaleOffset) * 0.14) * 0.76;
    rose.scaleOffset += rose.vScale;

    // Under-damped spring integration for multi-layer petal unfurling (bloom)
    rose.vBloom = (rose.vBloom + (rose.targetBloom - rose.bloom) * 0.095) * 0.79;
    rose.bloom += rose.vBloom;
    rose.flareGlow *= 0.94;

    const rx = (rose.x + rose.offsetX) * baseScale;
    const ry = (rose.y + rose.offsetY) * baseScale;
    const totalScale = baseScale * breath * rose.scaleOffset;
    const drawSize = rose.sprite.logicalSize * totalScale;
    const baseSwayRot = reducedMotion ? 0 : Math.sin(time * 1.3 + rose.seed) * 0.025;

    bCtx.save();
    bCtx.translate(rx, ry);
    bCtx.rotate(baseSwayRot);

    // 4A. Draw Base Shadow & Green Sepals
    bCtx.drawImage(
      rose.sprite.baseCanvas,
      -drawSize * 0.5,
      -drawSize * 0.5,
      drawSize,
      drawSize
    );

    // 4B. Draw each of the 4 Concentric Petal Whorls with staggered unfurling & spiral rotation!
    // whorlIdx 0 = Outer Guard Petals, 1 = Mid-Outer, 2 = Inner Velvet, 3 = Center Spiral Core
    const whorlDelays = [0.0, 0.12, 0.24, 0.34];
    const closedScales = [0.44, 0.36, 0.28, 0.38];
    const overBloomBoost = [0.32, 0.24, 0.16, 0.10];
    const twistAngles = [0.52, -0.78, 1.05, -1.35];

    for (let wIdx = 0; wIdx < 4; wIdx++) {
      const wCanvas = rose.sprite.whorlCanvases[wIdx];
      // Calculate staggered unfurling progress for this specific petal whorl
      const rawOpen = (rose.bloom - whorlDelays[wIdx]) / (1 - whorlDelays[wIdx]);
      const clampedOpen = Math.max(0, Math.min(1, rawOpen));
      const overOpen = Math.max(0, rose.bloom - 1.0);

      // Smooth cubic ease-out for bud-to-rose opening + extra expansion when over-blooming
      const easeOpen = 1 - Math.pow(1 - clampedOpen, 3);
      const whorlScale = closedScales[wIdx]
        + (1.0 - closedScales[wIdx]) * easeOpen
        + overOpen * overBloomBoost[wIdx];

      // Spiral unfurling rotation: tightly twisted when closed, unrolls as it blooms, and flares on surge
      const unrollRot = (1 - easeOpen) * twistAngles[wIdx] * rose.spinDir
        + overOpen * (wIdx % 2 === 0 ? 0.22 : -0.20) * rose.spinDir;

      // Subtle perspective shift outward when blooming strongly
      const shiftFactor = (easeOpen - 0.5) * 2 * overOpen * 4.5 * baseScale;

      bCtx.save();
      bCtx.translate(rose.tiltX * shiftFactor, rose.tiltY * shiftFactor);
      bCtx.rotate(unrollRot);
      bCtx.scale(whorlScale, whorlScale);
      bCtx.drawImage(
        wCanvas,
        -drawSize * 0.5,
        -drawSize * 0.5,
        drawSize,
        drawSize
      );
      bCtx.restore();
    }

    // 4C. Warm Subsurface Sunlit Bloom Glow when the rose surges open ("Nở rộ rực rỡ")
    const activeGlow = Math.max(rose.flareGlow, Math.max(0, (rose.bloom - 1.05) * 2.2));
    if (activeGlow > 0.03) {
      const glowR = rose.r * totalScale * 1.15;
      const sunGlow = bCtx.createRadialGradient(0, 0, glowR * 0.05, 0, 0, glowR);
      sunGlow.addColorStop(0, `rgba(255, 245, 238, ${Math.min(0.55, activeGlow * 0.52)})`);
      sunGlow.addColorStop(0.45, `rgba(255, 182, 203, ${Math.min(0.35, activeGlow * 0.34)})`);
      sunGlow.addColorStop(1, 'rgba(255, 182, 203, 0)');
      bCtx.save();
      bCtx.globalCompositeOperation = 'screen';
      bCtx.fillStyle = sunGlow;
      bCtx.beginPath();
      bCtx.arc(0, 0, glowR, 0, Math.PI * 2);
      bCtx.fill();
      bCtx.restore();
    }

    bCtx.restore();
  });

  // 5. Foreground Cascading Leaves & Airy Gypsophila Tucked Between Roses
  FOLIAGE_LAYOUT.filter(f => f.layer === 'front').forEach((leaf, idx) => {
    const leafSway = Math.sin(time * 1.8 + idx * 2) * 0.03;
    drawBotanicalLeaf(
      bCtx,
      leaf.x * baseScale,
      leaf.y * baseScale,
      leaf.angle + leafSway,
      leaf.len * baseScale,
      leaf.w * baseScale,
      leaf.type
    );
  });

  babySprites.filter(b => b.layer === 'front').forEach((b, idx) => {
    const bSway = Math.sin(time * 1.6 + idx) * 0.035;
    bCtx.save();
    bCtx.translate(b.x * baseScale, b.y * baseScale);
    bCtx.rotate(b.angle + bSway);
    const drawSz = b.sprite.size * b.scale * baseScale;
    bCtx.drawImage(b.sprite.canvas, -drawSz * 0.5, -drawSz * 0.82, drawSz, drawSz);
    bCtx.restore();
  });

  // 6. Front Wrapping Paper Cone, Satin Ribbon Bow & Swinging Gift Tag
  drawWrappingPaperFrontAndRibbon(bCtx, 0, 0, baseScale, time);

  bCtx.restore();

  // Soft falling petals, with stronger wind-borne bursts on touch and bloom.
  renderAmbientPetals(time);
  if (!reducedMotion) requestSceneRender();
}

function announceRose(rose) {
  document.dispatchEvent(new CustomEvent('bouquet:rose', { detail: { message: rose.whisper } }));
}

function setupInteractions() {
  bouquetWrapper.addEventListener('pointermove', event => {
    if (reducedMotion || event.pointerType === 'touch') return;
    const rect = bouquetCanvas.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) * stageW / rect.width;
    pointerY = (event.clientY - rect.top) * stageH / rect.height;
    parallaxTargetX = (pointerX / stageW - 0.5) * 2;
    parallaxTargetY = (pointerY / stageH - 0.5) * 2;
  });
  bouquetWrapper.addEventListener('pointerleave', () => {
    pointerX = pointerY = -9999;
    parallaxTargetX = parallaxTargetY = 0;
    roseNodes.forEach(rose => { rose.targetBloom = 1.04; });
  });
  bouquetWrapper.addEventListener('click', event => {
    const rect = bouquetCanvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * stageW / rect.width;
    const y = (event.clientY - rect.top) * stageH / rect.height;
    const baseScale = Math.min(stageW, stageH) / 650;
    // The frontmost visible flower owns the tap where petals overlap.
    const rose = [...roseNodes].reverse().find(node => Math.hypot(x - node.screenX, y - node.screenY) < node.hitRadius);
    if (rose) announceRose(rose);
    triggerBouquetBloomWave((x - stageW * 0.5) / baseScale, (y - stageH * 0.51) / baseScale, 'ripple');
    spawnPetalBurst(event.clientX, event.clientY, 8);
  });
  bouquetWrapper.addEventListener('keydown', event => {
    const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0;
    if (!direction && event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    keyboardRoseIndex = (keyboardRoseIndex + direction + roseNodes.length) % roseNodes.length;
    const rose = roseNodes[keyboardRoseIndex];
    announceRose(rose);
    triggerBouquetBloomWave(rose.x, rose.y, 'ripple');
  });
  document.addEventListener('bouquet:replay', () => triggerBouquetBloomWave(0, -30, 'grand'));
  document.addEventListener('bouquet:celebrate', () => {
    const rect = bouquetCanvas.getBoundingClientRect();
    spawnPetalBurst(rect.left + stageW * 0.5, rect.top + stageH * 0.5, 10);
  });
}

window.addEventListener('load', () => {
  initBotanicalAssets();
  resizeCanvases();
  initAmbientPetals();
  setupInteractions();
  triggerBouquetBloomWave(0, -30, 'grand');
  // Show the invitation only after the initial flower wave has settled.
  setTimeout(() => document.dispatchEvent(new Event('bouquet:ready')), reducedMotion ? 0 : 1900);
  new ResizeObserver(resizeCanvases).observe(bouquetWrapper);
  window.addEventListener('resize', resizeCanvases);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(sceneAnimationFrame);
      sceneAnimationFrame = null;
      settleBouquet();
    } else {
      nextAutoShowcaseTime = performance.now() + 11000;
      if (!fallingPetals.length) initAmbientPetals();
      requestSceneRender();
    }
  });
  motionPreference.addEventListener('change', event => {
    reducedMotion = event.matches;
    settleBouquet();
    initAmbientPetals();
    requestSceneRender();
  });
  requestSceneRender();
});
