/**
 * Represents position of a symbol in a string.
 */
export interface SourceLocation {
  /**
   * Vertical symbol position, starting from 1.
   */
  line: number;

  /**
   * Horizontal symbol position, staring from 1.
   */
  column: number;

  /**
   * Absolute symbol position, stating from 0.
   */
  absolute: number;
}
