const { InputStream } = require("..");

const istream = source => new InputStream(source);

describe("InputStream tests", () => {
  test("InputStream#peek", () => {
    const source = "sample text";

    const is = istream(source);

    expect(is.peek()).toBe(source[is.position]);

    for (let i = 0; i < source.length; i++) {
      expect(is.peek(i)).toBe(source[i]);
    }

    is.moveTo(-1);

    expect(is.peek()).toBe("");

    is.moveTo(source.length);

    expect(is.peek()).toBe("");
  });

  test("InputStream#peekMany", () => {
    const source = "sample text";

    const is = istream(source);

    for (let i = 0; i < source.length; i++) {
      expect(is.peekMany(i)).toBe(source.substr(is.position, i));
    }

    for (let i = 0; i < source.length; i++) {
      for (let j = 0; j < source.length - i; j++) {
        expect(is.peekMany(i, j)).toBe(source.substr(is.position + j, i));
      }
    }
  });

  test("InputStream#peekTo", () => {
    const source = "sample text";

    const is = istream(source);

    expect(is.peekTo()).toBe(source.substring(source.position));

    for (let i = 0; i < source.length; i++) {
      expect(is.peekTo(i)).toBe(source.substring(is.position, i));
    }

    for (let i = 0; i < source.length; i++) {
      for (let j = 0; j < source.length - i; j++) {
        expect(is.peekTo(i, j)).toBe(source.substring(is.position + j, i));
      }
    }
  });

  test("InputStream#current", () => {
    const source = "sample text";

    const is = istream(source);

    for (let i = -1; i < source.length + 1; i++) {
      expect(is.current).toBe(source[is.position] || "");
    }
  });

  test("InputStream#next", () => {
    const source = "sample text";

    const is = istream(source);

    for (let i = -1; i < source.length + 1; i++) {
      expect(is.next).toBe(source[is.position + 1] || "");
    }
  });

  test("InputStream#rest", () => {
    const source = "sample text";

    const is = istream(source);

    for (let i = 0; i < source.length; i++) {
      is.moveTo(i);

      expect(is.rest).toBe(source.substring(i));
    }
  });

  test("InputStream#reset", () => {
    const source = "sample text";

    const is = istream(source);

    is.moveTo(1);

    expect(is.position).toBe(1);

    is.reset();

    expect(is.position).toBe(0);
  });

  test("InputStream#isEof", () => {
    const source = "sample text";

    const is = istream(source);

    expect(is.isEof).toBeFalsy();

    is.moveTo(is.length);

    expect(is.isEof).toBeTruthy();
  });

  test("InputStream#checkEof", () => {
    const source = "sample text";

    const is = istream(source);

    expect(is.checkEof(0)).toBeFalsy();
    expect(is.checkEof(-1)).toBeFalsy();

    is.move(source.length);

    expect(is.checkEof(0)).toBeTruthy();
    expect(is.checkEof(-1)).toBeFalsy();
  });

  test("InputStream#checkBounds", () => {
    const source = "sample text";

    const is = istream(source);

    expect(is.checkBounds(0)).toBeTruthy();
    expect(is.checkBounds(-1)).toBeFalsy();

    is.move(source.length);

    expect(is.checkBounds(0)).toBeFalsy();
    expect(is.checkBounds(-1)).toBeTruthy();
  });

  test("InputStream#isValid", () => {
    const source = "sample text";

    const is = istream(source);

    expect(is.isValid).toBeTruthy();

    is.move(source.length);

    expect(is.isValid).toBeFalsy();

    is.reset();

    expect(is.isValid).toBeTruthy();

    is.move(-1);

    expect(is.isValid).toBeFalsy();
  });

  test("InputStream#lookFor", () => {
    const source = "sample text";

    const is = istream(source);

    expect(is.lookFor("sample")).toBeTruthy();

    expect(is.lookFor("text")).toBeFalsy();

    expect(is.lookFor("text", "sample ".length)).toBeTruthy();

    expect(is.lookFor(["text", "sample"])).toBeTruthy();
  });

  test("InputStream#match", () => {
    const source = "sample text";

    const is = istream(source);

    expect(is.match("sample")).toBeTruthy();
    expect(is.match("sample")).toBeFalsy();

    is.reset();

    expect(is.match("text")).toBeFalsy();
    expect(is.match("text", "sample ".length)).toBeTruthy();

    is.reset();

    expect(is.match(["text", "sample"])).toBeTruthy();
    expect(is.match(" text")).toBeTruthy();
  });

  test("InputStream#findPresenting", () => {
    const source = "sample text";

    const is = istream(source);

    expect(is.findPresenting(["sample", "text"])).toBe("sample");
    expect(is.findPresenting(["sample", "text"], "sample ".length)).toBe(
      "text"
    );

    expect(is.findPresenting(["text"])).toBeUndefined();
  });

  test("InputStream#findMatching", () => {
    const source = "sample text";

    const is = istream(source);

    expect(is.findMatching(["sample", "text"])).toBe("sample");

    is.reset();

    expect(is.findMatching(["sample", "text"], "sample ".length)).toBe("text");

    is.reset();

    expect(is.findPresenting(["text"])).toBeUndefined();
  });

  test("InputStream#testFor", () => {
    const source = "sample text";

    const is = istream(source);

    expect(is.testFor(/^sample/)).toBeTruthy();
    expect(is.testFor(/^text/)).toBeFalsy();
    expect(is.testFor(/^text/, "sample ".length)).toBeTruthy();

    expect(is.testFor([/^test/, /^sample/])).toBeTruthy();
  });

  test("InputStream#matchRegExp", () => {
    const source = "sample text sample text";

    const is = istream(source);

    const pattern1 = /sample/;
    const pattern2 = /sample/g;
    const pattern3 = /(sample).*?text/g;

    expect(is.matchRegExp(pattern1)).toEqual(source.match(pattern1));
    expect(is.matchRegExp(pattern2)).toEqual(source.match(pattern2));
    expect(is.matchRegExp(pattern3)).toEqual(source.match(pattern3));
  });

  test("InputStream#location", () => {
    const loc = (line, column, absolute) => ({ line, column, absolute });

    const source = "fist line\nsecond line\nthird line";

    const is = istream(source);

    expect(is.location).toEqual(loc(1, 1, is.position));

    is.move(3);

    expect(is.location).toEqual(loc(1, 4, is.position));

    is.reset();
    is.move(source.indexOf("\n"));

    expect(is.location).toEqual(loc(1, 10, is.position));

    is.move(1);

    expect(is.location).toEqual(loc(2, 1, is.position));

    is.reset();
    is.moveTo(source.lastIndexOf("\n") + 1);

    expect(is.location).toEqual(loc(3, 1, is.position));
  });

  test("InputStream#currentLine", () => {
    const source = "first line\nsecond line\nthird line";

    const is = istream(source);

    expect(is.currentLine).toBe("first line");

    is.moveTo(source.indexOf("\n"));

    expect(is.currentLine).toBe("first line");

    is.move(1);

    expect(is.currentLine).toBe("second line");

    is.moveTo(source.length - 1);

    expect(is.currentLine).toBe("third line");
  });
});
