import MiniMapManager from '@/components/miniMapManager.js';

describe('Mini Map Manager', () => {
  const positionData = [
    [
      71,
      101,
      1,
      1,
      1138,
      871,
      {
        x: 254.109375,
        y: 312,
      },
      {
        newX: 314.890625,
        newY: 123.5,
      },
    ],
    [
      71,
      139,
      0.5,
      0.5,
      1138,
      871,
      {
        x: 350.139375,
        y: 388,
      },
      {
        newX: 393.9303125,
        newY: 241.5,
      },
    ],
  ];

  let miniMapPaper;
  let miniMapManager;

  beforeEach(() => {
    miniMapPaper = {};
    miniMapManager = new MiniMapManager(miniMapPaper);
  });

  it.each(positionData)('Can calculate a new position for the main paper',
    (offsetX, offsetY, scaleX, scaleY, clientWidth, clientHeight, localPoint, expected) => {
      miniMapPaper.paperToLocalPoint = () => localPoint;
      const actual = miniMapManager.calculateNewPaperPosition(
        offsetX,
        offsetY,
        scaleX,
        scaleY,
        clientWidth,
        clientHeight,
      );
      expect(actual).toEqual(expected);
    });
});
