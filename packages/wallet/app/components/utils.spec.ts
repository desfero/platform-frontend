import { st } from "./utils";

describe("utils", () => {
  describe("style utils (st)", () => {
    it("should merge styles", () => {
      expect(
        st(
          // allow plain object
          { backgroundColor: "red" },
          // allow an array of plain objects
          [{ flex: 1 }],
          // allow a tuple with the first item being truthy primitive
          [true, [{ flexDirection: "row" }, { alignItems: "center" }]],
          // filter out a tuple with the first item being false primitive
          [false, { color: "blue" }],
        ),
      ).toEqual([
        { backgroundColor: "red" },
        { flex: 1 },
        { flexDirection: "row" },
        { alignItems: "center" },
      ]);
    });
  });
});
