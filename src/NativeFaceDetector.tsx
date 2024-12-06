import { createElement, ReactElement } from "react";
import { TextStyle, ViewStyle } from "react-native";
import { FaceDetection } from "./components/FaceDetection";
import { Style } from "@mendix/pluggable-widgets-tools";

import { NativeFaceDetectorProps } from "../typings/NativeFaceDetectorProps";

export interface CustomStyle extends Style {
    container: ViewStyle;
    label: TextStyle;
}

export function NativeFaceDetector({ }: NativeFaceDetectorProps<CustomStyle>): ReactElement {
    return <FaceDetection />;
}
