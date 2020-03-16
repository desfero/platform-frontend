/* formatNumber only formats numbers for display (!).
 * invalid input (null/undefined etc) should be handled before calling this fn, this one will only throw.
 * we don't check for strings in a wrong format here,
 * since 99% of input vals is from the store so it should be in the right format already,
 * and user input should handle this on its own before calling this fn
 * */
