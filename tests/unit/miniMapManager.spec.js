import MiniMapManager from '@/components/miniMapManager.js';

describe('Mini Map Manager', () => {
  const scaleX = 1;
  const scaleY = 1;
  const positionData = [
    [
      71,
      101,
      scaleX,
      scaleY,
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
      scaleX,
      scaleY,
      1138,
      871,
      {
        x: 350.139375,
        y: 388,
      },
      {
        newX: 218.86062500000003,
        newY: 47.5,
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
