export function isEventTargetWithinElement(
  containingElement: Element,
  eventTarget: EventTarget | null
) {
  return (
    containingElement === eventTarget ||
    (eventTarget instanceof Element && containingElement.contains(eventTarget))
  )
}
