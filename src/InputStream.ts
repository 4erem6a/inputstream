import { SourcePosition } from "./SourcePosition";

/**
 * Class for traversing and analyzing strings.
 */
export class InputStream {
  /**
   * Current position in the source string.
   */
  public position: number = 0;

  /**
   * @param source The source string.
   */
  public constructor(public readonly source: string) {}

  /**
   * The length of the source string.
   */
  public get length(): number {
    return this.source.length;
  }

  /**
   * Returns the current character from the source string.
   * @param offset The offset relative to the current position.
   */
  public peek(offset: number = 0): string {
    return this.checkBounds(offset) ? this.source[this.position + offset] : "";
  }

  /**
   * Returns the source substring of the specified length staring from current position.
   * @param length The number of characters to peek.
   * @param offset The offset relative to the current position.
   */
  public peekMany(length: number, offset: number = 0): string {
    return this.source.substr(this.position + offset, length);
  }

  /**
   * Returns the source substring from the current position to the specified one.
   * The substring includes the characters up to, but not including, the character indicated by end.
   * @param end The zero-based index number to peek to.
   * If this value is not specified, the substring continues to the end of the source string.
   * @param offset The offset relative to the current position
   */
  public peekTo(end?: number, offset: number = 0): string {
    return this.source.substring(this.position + offset, end);
  }

  /**
   * Returns a section of the source string.
   * @param start The index to the beginning of the specified portion of the source string.
   * @param end The index to the end of the specified portion of the source string.
   * The substring includes the characters up to, but not including, the character indicated by end.
   * If this value is not specified, the substring continues to the end of the source string.
   */
  public slice(start?: number, end?: number) {
    return this.source.slice(start, end);
  }

  /**
   * The current character.
   */
  public get current(): string {
    return this.peek(0);
  }

  /**
   * The next character.
   */
  public get next(): string {
    return this.peek(1);
  }

  /**
   * The substring from the current position to the end of the source string.
   */
  public get rest(): string {
    return this.peekTo();
  }

  /**
   * Adjusts the current position by the specified value.
   * @param offset The offset to move by.
   * @returns New position.
   */
  public move(offset: number): number {
    return (this.position += offset);
  }

  /**
   * Sets the current position to 0.
   */
  public reset() {
    this.position = 0;
  }

  /**
   * Checks whether the current position is reached the end of the source string.
   * @param offset The offset relative the current position.
   */
  public checkEof(offset: number) {
    return this.position + offset >= this.length;
  }

  /**
   * Whether the current position is reached the end of the source string.
   */
  public get isEof() {
    return this.checkEof(0);
  }

  /**
   * Checks whether the current position is within the string bounds.
   */
  public checkBounds(offset: number): boolean {
    const position = this.position + offset;

    return position >= 0 && position < this.length;
  }

  /**
   * Whether the current position is within the string bounds.
   */
  public get isValid(): boolean {
    return this.checkBounds(0);
  }

  /**
   * Checks whether a lexeme is present at the current position of the source string.
   * @param lexeme One or more lexemes to look for.
   * @param offset The offset relative to the current position.
   */
  public lookFor(lexeme: string | string[], offset: number = 0): boolean {
    if (Array.isArray(lexeme)) {
      return lexeme.some(t => this.lookFor(t, offset));
    } else {
      return this.source.startsWith(lexeme, this.position + offset);
    }
  }

  /**
   * Matches a lexeme at the current position of the source string.
   * I.e if a lexeme is present, moves the stream by the length of the lexeme.
   * @param lexeme One or more lexemes to match.
   * @param offset The offset relative to the current position.
   * @returns Whether a lexeme was matched.
   */
  public match(lexeme: string | string[], offset: number = 0): boolean {
    if (Array.isArray(lexeme)) {
      return lexeme.some(t => this.match(t, offset));
    } else {
      const matches = this.lookFor(lexeme, offset);

      if (matches) {
        this.move(lexeme.length + offset);
      }

      return matches;
    }
  }

  /**
   * Returns the first presenting lexeme, and undefined otherwise.
   * @param lexemes Lexemes to check for.
   * @param offset The offset relative to the current position.
   */
  public findPresenting(
    lexemes: string[],
    offset: number = 0
  ): string | undefined {
    return lexemes.find(l => this.lookFor(l, offset));
  }

  /**
   * Returns the first matched lexeme, and undefined otherwise.
   * @param lexemes Lexemes to match with.
   * @param offset The offset relative to the current position.
   */
  public findMatching(
    lexemes: string[],
    offset: number = 0
  ): string | undefined {
    return lexemes.find(l => this.match(l, offset));
  }

  /**
   * Checks whether a regex pattern exists in the rest of the source string.
   * @param regexp One or more regular expressions to test for.
   * @param offset The offset relative to the current position.
   */
  public testFor(regexp: RegExp | RegExp[], offset: number = 0): boolean {
    if (Array.isArray(regexp)) {
      return regexp.some(re => this.testFor(re, offset));
    } else {
      return regexp.test(this.peekTo(undefined, offset));
    }
  }

  /**
   * Matches a regex pattern with the rest of the source string.
   * @param regexp A regular expression to match with.
   * @param offset The offset relative to the current value.
   */
  public matchRegExp(
    regexp: RegExp,
    offset: number = 0
  ): RegExpMatchArray | null {
    return this.peekTo(undefined, offset).match(regexp);
  }

  /**
   * The {@link SourcePosition source position} of the current character.
   */
  public get sourcePosition(): SourcePosition {
    const slice = this.slice(0, this.position);

    const line = slice.split("").filter(c => c == "\n").length + 1;

    const column = slice.includes("\n")
      ? slice.slice(slice.lastIndexOf("\n")).length
      : this.position + 1;

    return {
      line,
      column,
      absolute: this.position
    };
  }

  /**
   * The line containing the current character.
   */
  public get currentLine() {
    const leadingLinebreak = this.slice(0, this.position).lastIndexOf("\n");
    const trailingLinebreak = this.slice(this.position).indexOf("\n");

    const line = this.slice(
      leadingLinebreak == -1 ? 0 : leadingLinebreak + 1,
      trailingLinebreak == -1 ? undefined : this.position + trailingLinebreak
    );

    return line;
  }
}
