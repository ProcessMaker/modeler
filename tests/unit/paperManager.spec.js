import PaperManager from '@/components/paperManager';

describe('Paper Manager', () => {
  const positionData = [
    [{ sx: 1, sy: 1 }, { x: 319, y: 77 }, 711, 320, { x: 390, y: 240 }],
    [{ sx: 1, sy: 1 }, { x: 319, y: 77 }, 953, 486, { x: 630, y: 410 }],
    [{ sx: 1, sy: 1 }, { x: 421, y: 289 }, 597, 258, { x: 180, y: -30 }],
    [{ sx: 0.5, sy: 0.5 }, { x: 421, y: 289 }, 828, 166, { x: 810, y: -250 }],
    [{ sx: 0.7, sy: 0.7 }, { x: 421, y: 289 }, 893, 246, { x: 670, y: -60 }],
    [{ sx: 1.5, sy: 1.5 }, { x: 421, y: 289 }, 469, 385, { x: 30, y: 60 }],
  ];

  let paperManager;
  let paper;

  beforeEach(() => {
    paper = {};
    paperManager = new PaperManager(paper);
  });

  it.each(positionData)(
    'Can convert client position to grid position',
    (scale, paperOrigin, clientX, clientY, expectedPoint) => {
      paper.scale = () => scale;
      paper.localToPagePoint = () => paperOrigin;

      const actualPoint = paperManager.clientToGridPoint(clientX, clientY);
      expect(actualPoint).toEqual(expectedPoint);
    });
});

