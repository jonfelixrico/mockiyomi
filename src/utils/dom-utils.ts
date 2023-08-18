function isPointerEventWithinElement(
  event: PointerEvent,
  element: HTMLElement
) {
  return (
    event.target &&
    (event.target === element || element.contains(event.target as HTMLElement))
  )
}
