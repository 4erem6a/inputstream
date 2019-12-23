import { SourcePosition } from "./SourcePosition";

export class InputStream {
  public position: number = 0;

  public constructor(public readonly source: string) {}

  public get length(): number {
    return this.source.length;
  }

  public peek(offset: number): string {
    return this.checkBounds(offset) ? this.source[this.position + offset] : "";
  }

  public peekMany(length: number, offset: number = 0): string {
    return this.source.substr(this.position + offset, length);
  }

  public peekTo(end?: number, offset: number = 0): string {
    return this.source.substring(this.position + offset, end);
  }

  public slice(start?: number, end?: number) {
    return this.source.slice(start, end);
  }

  public get current(): string {
    return this.peek(0);
  }

  public get next(): string {
    return this.peek(1);
  }

  public get rest(): string {
    return this.peekTo();
  }

  public move(offset: number): number {
    return (this.position += offset);
  }

  public reset() {
    this.position = 0;
  }

  public checkEof(offset: number) {
    return this.position + offset >= this.length;
  }

  public get isEof() {
    return this.checkEof(0);
  }

  public checkBounds(offset: number): boolean {
    const position = this.position + offset;

    return position >= 0 && position < this.length;
  }

  public get isValid(): boolean {
    return this.checkBounds(0);
  }

  public lookFor(
    lexeme: string | string[],
    offset: number = 0,
    end?: number
  ): boolean {
    if (Array.isArray(lexeme)) {
      return lexeme.some(t => this.lookFor(t, offset));
    } else {
      return this.peekTo(end, offset).startsWith(
        lexeme,
        this.position + offset
      );
    }
  }

  public match(
    lexeme: string | string[],
    offset: number = 0,
    end?: number
  ): boolean {
    if (Array.isArray(lexeme)) {
      return lexeme.some(t => this.match(t, offset));
    } else {
      const matches = this.lookFor(lexeme, offset, end);

      if (matches) {
        this.move(lexeme.length + offset);
      }

      return matches;
    }
  }

  public findExisting(
    lexemes: string[],
    offset: number = 0,
    end?: number
  ): string | undefined {
    return lexemes.find(l => this.lookFor(l, offset, end));
  }

  public findMatching(
    lexemes: string[],
    offset: number = 0,
    end?: number
  ): string | undefined {
    return lexemes.find(l => this.match(l, offset, end));
  }

  public testFor(
    regexp: RegExp | RegExp[],
    offset: number = 0,
    end?: number
  ): boolean {
    if (Array.isArray(regexp)) {
      return regexp.some(re => this.testFor(re, offset, end));
    } else {
      return regexp.test(this.peekTo(end, offset));
    }
  }

  public matchRegExp(
    regexp: RegExp,
    offset: number = 0,
    end?: number
  ): RegExpMatchArray | null {
    return this.peekTo(offset, end).match(regexp);
  }

  public get sourcePosition(): SourcePosition {
    const slice = this.slice(0, this.position);

    const line = slice.split("").filter(c => c == "\n").length + 1;

    const column = slice.includes("\n")
      ? slice.slice(slice.lastIndexOf("\n")).length + 1
      : this.position;

    return {
      line,
      column,
      absolute: this.position
    };
  }

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
