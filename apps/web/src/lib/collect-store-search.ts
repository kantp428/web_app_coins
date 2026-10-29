import type { StoreSearchReply } from "./store-search-contract";

export async function collectMatchingStoreIds(
  readPage: (page: number) => Promise<StoreSearchReply>,
  signal: AbortSignal,
): Promise<string[]> {
  const ids: string[] = [];
  const seen = new Set<string>();
  let total: number | undefined;
  for (let page = 1; ; page += 1) {
    signal.throwIfAborted();
    const result = await readPage(page);
    signal.throwIfAborted();
    if (
      result.meta.page !== page ||
      (total !== undefined && total !== result.meta.total)
    )
      throw new Error("ขอบเขตร้านเปลี่ยนระหว่างค้นหา กรุณาลองใหม่");
    total = result.meta.total;
    for (const id of result.shopIds) {
      if (seen.has(id))
        throw new Error("ข้อมูลร้านซ้ำระหว่างค้นหา กรุณาลองใหม่");
      seen.add(id);
      ids.push(id);
    }
    if (!result.meta.hasNextPage) return ids;
  }
}
