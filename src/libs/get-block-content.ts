export const getBlockContent = async (uuid: string): Promise<string> => {
  const blk = await logseq.Editor.getBlock(uuid);
  if (!blk) return "";
  return blk.content;
};
