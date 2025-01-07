import { AnimationConfigs, AnimationType } from "@/types/types";
import { FC, ReactNode } from "react";
import BottomIn from "./BottomIn";
import CenterIn from "./CenterIn";
import LeftIn from "./LeftIn";
import RightIn from "./RightIn";
import TopIn from "./TopIn";

interface AnimationProps {
  animationType?: AnimationType;
  children: ReactNode;
}

export default function Animation({
  animationType = "center",
  children,
  ...configs
}: AnimationProps & AnimationConfigs) {
  const animationComponents: Record<AnimationType, FC<AnimationConfigs>> = {
    left: LeftIn,
    right: RightIn,
    top: TopIn,
    bottom: BottomIn,
    center: CenterIn,
  };

  const AnimationComponent = animationComponents[animationType] || CenterIn;
  return <AnimationComponent {...configs}>{children}</AnimationComponent>;
}
