import { ParamsProps } from "../types";

export const checkParams = (content: string): ParamsProps => {
  const rxToCheck: { [key: string]: RegExp | string } = {
    card_w: /card-(.*?)(\d+)/,
    board_w: /board-(.*?)(\d+)/,
    data_type: /(query-tasks|query|tasks)/i,
  };

  const styles: ParamsProps = { card_w: "", board_w: "", data_type: "" };
  for (const rx of Object.keys(rxToCheck)) {
    const newVal = (rxToCheck[rx] as RegExp).exec(content);
    if (newVal && newVal[2]) {
      styles[rx] = newVal[2];
    } else if (newVal && newVal[0]) {
      styles[rx] = newVal[0];
    } else {
      delete styles[rx];
    }
  }

  return styles;
};
