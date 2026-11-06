import { SvgXml } from "react-native-svg";

import { colors } from "@/theme";
import { View } from "react-native";

const { ink, butter, peach, blush, lavender, gold, surface } = colors;

const xml = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 250">
  <circle cx="165" cy="130" r="108" fill="${blush}"/>
  <path d="M30 60l6 14 15 2-11 10 3 15-13-8-13 8 3-15L9 76l15-2z" fill="${butter}" transform="translate(10 -6)"/>
  <path d="M30 60l6 14 15 2-11 10 3 15-13-8-13 8 3-15L9 76l15-2z" fill="${butter}" transform="translate(255 40) scale(.8)"/>
  <rect x="38" y="150" width="86" height="80" rx="38" fill="${peach}" stroke="${ink}" stroke-width="3"/>
  <circle cx="82" cy="118" r="44" fill="#F5B98A" stroke="${ink}" stroke-width="3"/>
  <circle cx="68" cy="112" r="4" fill="${ink}"/><circle cx="96" cy="112" r="4" fill="${ink}"/>
  <path d="M68 130c8 8 20 8 28 0" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>
  <rect x="206" y="150" width="86" height="80" rx="38" fill="${lavender}" stroke="${ink}" stroke-width="3"/>
  <circle cx="248" cy="118" r="44" fill="#B8AEF0" stroke="${ink}" stroke-width="3"/>
  <circle cx="234" cy="112" r="4" fill="${ink}"/><circle cx="262" cy="112" r="4" fill="${ink}"/>
  <path d="M234 130c8 8 20 8 28 0" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="165" cy="92" r="40" fill="${surface}" stroke="${ink}" stroke-width="3"/>
  <path d="M165 52 A40 40 0 0 1 165 132 Z" fill="${gold}" stroke="${ink}" stroke-width="3"/>
</svg>`;

/** Two friends holding a half-shaded circle. Decorative, so hidden from screen readers. */
/** Two friends holding a half-shaded circle. Decorative, so hidden from screen readers. */
export function FriendsHero() {
  return (
    <View
      className="w-full"
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <SvgXml xml={xml} width="100%" height={250} />
    </View>
  );
}
