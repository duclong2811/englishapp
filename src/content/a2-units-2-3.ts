/**
 * Điểm vào cũ của A2 Unit 2 và Unit 3.
 *
 * Nội dung đã được tách thành `a2-unit-2.ts` và `a2-unit-3.ts` cho dễ bảo trì.
 * Tệp này giữ nguyên đường dẫn import cũ để route và test hiện có không bị đổi.
 */
export { a2Unit2 } from "./a2-unit-2";
export { a2Unit3 } from "./a2-unit-3";

import { a2Unit2 } from "./a2-unit-2";
import { a2Unit3 } from "./a2-unit-3";

export const a2Units23 = [a2Unit2, a2Unit3];
