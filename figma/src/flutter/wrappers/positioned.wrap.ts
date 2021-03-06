import { ReflectSceneNode } from "@bridged.xyz/design-sdk/lib/nodes/types";
import { Align, Alignment, Positioned, Widget } from "@bridged.xyz/flutter-builder/lib";
import { coordinates } from "../../figma-utils/coordinates";
import { commonPosition } from "../../figma-utils/common-position";
import { roundNumber } from "@reflect.bridged.xyz/uiutils/lib/pixels";
import { makeSaflyAsSingle } from "../utils/make-as-safe-single";
export function wrapWithPositioned(node: ReflectSceneNode,
  child: Widget,
  parentId: string = ""): Widget {
  console.log(`wrap:positioned :: wrapping node ${node.toString()} with Positioned with child ${child?.name}`)

  // avoid adding Positioned() when parent is not a Stack(), which can happen at the beggining
  if (!node.parent || parentId === node.parent.id || !child) {
    return child;
  }

  // check if view is in a stack. Group and Frames must have more than 1 element
  if (node.parent.isRelative === true) {
    const pos = retrieveAbsolutePosOrMakeWidget(node, child);
    if (pos instanceof Widget) {
      return pos;
    } else {
      // this is necessary because Group have absolute position, while Frame is relative.
      // output is always going to be relative to the parent.
      const [parentX, parentY] = coordinates(node.parent);

      const diffX = (node.x - parentX);
      const diffY = (node.y - parentY);
      return new Positioned(
        {
          left: roundNumber(diffX),
          top: roundNumber(diffY),
          child: makeSaflyAsSingle(child)
        }
      )
    }
  }

  return child;
}


type Absolute = "Absolute"
function retrieveAbsolutePosOrMakeWidget(node: ReflectSceneNode, child: Widget): Widget | Absolute {
  const positionedAlign = (align: string): Positioned => {
    return Positioned.fill({
      child: new Align({
        alignment: Alignment[align],
        child: child
      })
    }).addComment(`wrap:positioned of ${node.toString()}`)
  }

  switch (commonPosition(node)) {
    case "":
      return child;
    case "Absolute":
      return "Absolute";
    case "TopStart":
      return positionedAlign("topLeft");
    case "TopCenter":
      return positionedAlign("topCenter");
    case "TopEnd":
      return positionedAlign("topRight");
    case "CenterStart":
      return positionedAlign("centerLeft");
    case "Center":
      return positionedAlign("center");
    case "CenterEnd":
      return positionedAlign("centerRight");
    case "BottomStart":
      return positionedAlign("bottomLeft");
    case "BottomCenter":
      return positionedAlign("bottomCenter");
    case "BottomEnd":
      return positionedAlign("bottomRight");
  }
}
