export type RecordingKind = "temporary" | "saved";
export type StoredRecording = { id: string; blob: Blob; activityId: string; mimeType: string; duration: number; kind: RecordingKind; createdAt: string; updatedAt: string; expiresAt?: string };
export type RecordingStoreErrorCode = "unavailable" | "blocked" | "quota" | "corrupted" | "unknown";

export class RecordingStoreError extends Error {
  constructor(public code: RecordingStoreErrorCode, message: string) {
    super(message);
    this.name = "RecordingStoreError";
  }
}

const DB_NAME = "damdam-voice-recordings";
const DB_VERSION = 1;
const STORE = "recordings";

/** Thông báo lỗi hiển thị cho người học luôn bằng tiếng Việt. */
const messages = {
  unavailable: "Trình duyệt này không hỗ trợ lưu bản ghi (IndexedDB).",
  blocked: "Một tab khác đang dùng bộ nhớ bản ghi. Hãy đóng tab đó rồi thử lại.",
  quota: "Bộ nhớ lưu bản ghi đã đầy.",
  corruptedItem: "Dữ liệu bản ghi không hợp lệ.",
  corruptedRemoved: "Bản ghi bị hỏng đã được xóa.",
  unknown: "Không thể lưu bản ghi ở trình duyệt này.",
} as const;

export function mappedError(error: unknown) {
  if (error instanceof RecordingStoreError) return error;
  if (error instanceof DOMException && error.name === "QuotaExceededError") return new RecordingStoreError("quota", messages.quota);
  return new RecordingStoreError("unknown", error instanceof Error ? error.message : messages.unknown);
}

export class IndexedRecordingStore {
  private dbPromise?: Promise<IDBDatabase>;

  constructor(private factory: IDBFactory | undefined = typeof indexedDB !== "undefined" ? indexedDB : undefined) {}

  private open() {
    if (!this.factory) return Promise.reject(new RecordingStoreError("unavailable", messages.unavailable));
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = this.factory!.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: "id" });
          store.createIndex("kind", "kind");
          store.createIndex("expiresAt", "expiresAt");
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };
      request.onerror = () => reject(mappedError(request.error));
      request.onblocked = () => reject(new RecordingStoreError("blocked", messages.blocked));
    });
    return this.dbPromise;
  }

  private async request<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) {
    try {
      const db = await this.open();
      return await new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = run(tx.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(mappedError(request.error));
        tx.onabort = () => reject(mappedError(tx.error));
      });
    } catch (error) {
      throw mappedError(error);
    }
  }

  async put(record: StoredRecording) {
    if (!record.blob || typeof record.blob.size !== "number" || !record.id) throw new RecordingStoreError("corrupted", messages.corruptedItem);
    await this.request("readwrite", (store) => store.put(record));
    return record;
  }

  async get(id: string) {
    const value = await this.request<StoredRecording | undefined>("readonly", (store) => store.get(id));
    if (value && (!value.blob || typeof value.blob.size !== "number" || value.id !== id)) {
      await this.delete(id);
      throw new RecordingStoreError("corrupted", messages.corruptedRemoved);
    }
    return value;
  }

  async list() {
    return this.request<StoredRecording[]>("readonly", (store) => store.getAll());
  }

  async delete(id: string) {
    await this.request("readwrite", (store) => store.delete(id));
  }

  async markSaved(id: string, saved = true) {
    const record = await this.get(id);
    if (!record) return false;
    await this.put({ ...record, kind: saved ? "saved" : "temporary", expiresAt: saved ? undefined : record.expiresAt, updatedAt: new Date().toISOString() });
    return true;
  }

  async clearAll() {
    await this.request("readwrite", (store) => store.clear());
  }

  async cleanup({ referencedIds, now = new Date() }: { referencedIds?: Set<string>; now?: Date } = {}) {
    const records = await this.list();
    const removed: string[] = [];
    for (const record of records) {
      const expired = record.kind === "temporary" && Boolean(record.expiresAt) && new Date(record.expiresAt!).getTime() <= now.getTime();
      const orphan = Boolean(referencedIds) && !referencedIds!.has(record.id) && record.kind === "temporary";
      if (expired || orphan) {
        await this.delete(record.id);
        removed.push(record.id);
      }
    }
    return removed;
  }
}

export async function recordingStorageSummary(store = new IndexedRecordingStore()) {
  const recordings = await store.list();
  const bytes = recordings.reduce((sum, item) => sum + item.blob.size, 0);
  let estimate: { usage?: number; quota?: number } = {};
  try {
    estimate = (await navigator.storage?.estimate?.()) ?? {};
  } catch {
    estimate = {};
  }
  return {
    count: recordings.length,
    saved: recordings.filter((item) => item.kind === "saved").length,
    temporary: recordings.filter((item) => item.kind === "temporary").length,
    recordingBytes: bytes,
    originUsage: estimate.usage ?? null,
    originQuota: estimate.quota ?? null,
  };
}

export function createRecordingId() {
  return globalThis.crypto?.randomUUID?.() ?? `recording-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
