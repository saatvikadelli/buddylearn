import { SvgXml } from "react-native-svg";

import { colors } from "@/theme";

import { icons, type IconName } from "./icons";

type Props = {
  name: IconName;
  size?: number;
  /** Outline colour. */
  color?: string;
  /** Optional fill colour, e.g. a gold star with a dark outline. */
  fill?: string;
};

export function Icon({ name, size = 24, color = colors.ink, fill }: Props) {
  const data = icons[name];
  const width = data?.width ?? 24;
  const height = data.height ?? 24;
  const left = data.left ?? 0;
  const top = data.top ?? 0;
  let body = data.body.replace(/currentColor/g, color);
  if (fill) body = body.replace('fill="none"', `fill="${fill}"`);
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${left} ${top} ${width} ${height}">${body}</svg>`;

  return <SvgXml xml={xml} width={size} height={size} />;
}