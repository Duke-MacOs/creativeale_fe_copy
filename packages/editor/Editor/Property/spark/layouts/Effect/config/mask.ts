export default [
  'CircularMask',
  'ClockMask',
  'DownToUpMask',
  'UpToDownMask',
  'LeftToRightMask',
  'RightToLeftMask',
  'SkewMask',
  'TriangleMask',
  'SquareMask',
  'DiamondMask',
  'PentagonMask',
  'OctagonMask',
  'PentagramMask',
  'StarMask',
  'OctagramMask',
  'HeartMask',
  'BlindsMask',
  'DiagonalMask',
  'MultiPotMask',
  'WiperMask',
  'SpreadMask',
  'WindmillMask',
].reduce((mask: any, key) => {
  mask[key] = {
    specialConfig: {
      hasFadeEffect: {
        hidden: true,
      },
    },
  };
  return mask;
}, {});
