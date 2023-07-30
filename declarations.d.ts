/**
 * This prevents TS warnings/errors for CSS imports.
 * From https://stackoverflow.com/a/41946697
 */
declare module '*.css'
declare module 'convex-hull' {
  function getConvexHull(
    points: Array<[number, number]>
  ): Array<[number, number]>

  export default getConvexHull
}
