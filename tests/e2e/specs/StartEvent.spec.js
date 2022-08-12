import { uploadXml } from "../support/utils";

describe("Start Event", () => {
  it("should render with web entry icon when web_entry config is enabled", () => {
    uploadXml("startEventWithWebEntry.xml");
    cy.get(
      '.main-paper [data-type="processmaker.components.nodes.startEvent.Shape"] [joint-selector="image"]',
    ).should(
      "have.attr",
      "xlink:href",
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGFyaWEtaGlkZGVuPSJ0cnVlIiBmb2N1c2FibGU9ImZhbHNlIiBkYXRhLXByZWZpeD0iZmFzIiBkYXRhLWljb249InRhc2tzIiBjbGFzcz0ic3ZnLWlubGluZS0tZmEgZmEtdGFza3MgZmEtdy0xNiIgcm9sZT0iaW1nIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PHBhdGggZmlsbD0iIzAwYmY5YyIgZD0iTTEzOS42MSAzNS41YTEyIDEyIDAgMCAwLTE3IDBMNTguOTMgOTguODFsLTIyLjctMjIuMTJhMTIgMTIgMCAwIDAtMTcgMEwzLjUzIDkyLjQxYTEyIDEyIDAgMCAwIDAgMTdsNDcuNTkgNDcuNGExMi43OCAxMi43OCAwIDAgMCAxNy42MSAwbDE1LjU5LTE1LjYyTDE1Ni41MiA2OWExMi4wOSAxMi4wOSAwIDAgMCAuMDktMTd6bTAgMTU5LjE5YTEyIDEyIDAgMCAwLTE3IDBsLTYzLjY4IDYzLjcyLTIyLjctMjIuMWExMiAxMiAwIDAgMC0xNyAwTDMuNTMgMjUyYTEyIDEyIDAgMCAwIDAgMTdMNTEgMzE2LjVhMTIuNzcgMTIuNzcgMCAwIDAgMTcuNiAwbDE1LjctMTUuNjkgNzIuMi03Mi4yMmExMiAxMiAwIDAgMCAuMDktMTYuOXpNNjQgMzY4Yy0yNi40OSAwLTQ4LjU5IDIxLjUtNDguNTkgNDhTMzcuNTMgNDY0IDY0IDQ2NGE0OCA0OCAwIDAgMCAwLTk2em00MzIgMTZIMjA4YTE2IDE2IDAgMCAwLTE2IDE2djMyYTE2IDE2IDAgMCAwIDE2IDE2aDI4OGExNiAxNiAwIDAgMCAxNi0xNnYtMzJhMTYgMTYgMCAwIDAtMTYtMTZ6bTAtMzIwSDIwOGExNiAxNiAwIDAgMC0xNiAxNnYzMmExNiAxNiAwIDAgMCAxNiAxNmgyODhhMTYgMTYgMCAwIDAgMTYtMTZWODBhMTYgMTYgMCAwIDAtMTYtMTZ6bTAgMTYwSDIwOGExNiAxNiAwIDAgMC0xNiAxNnYzMmExNiAxNiAwIDAgMCAxNiAxNmgyODhhMTYgMTYgMCAwIDAgMTYtMTZ2LTMyYTE2IDE2IDAgMCAwLTE2LTE2eiIvPjwvc3ZnPg==",
    );
  });
});
