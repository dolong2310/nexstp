import { pusherServer } from "@/lib/pusher";

const MAX_PAYLOAD_SIZE = 8192; // 8KB để đảm bảo an toàn (nhỏ hơn giới hạn 10KB)

interface ChunkData {
  id: string;
  index: number;
  final: boolean;
  data: string;
}

// Chia dữ liệu thành các chunks nhỏ
export function chunkData(data: any): ChunkData[] {
  const stringified = JSON.stringify(data);
  const chunks: ChunkData[] = [];
  const chunkId = Math.random().toString(36).substring(2, 15);

  for (let i = 0; i < stringified.length; i += MAX_PAYLOAD_SIZE) {
    const chunk = stringified.slice(i, i + MAX_PAYLOAD_SIZE);
    chunks.push({
      id: chunkId,
      index: chunks.length,
      final: i + MAX_PAYLOAD_SIZE >= stringified.length,
      data: chunk,
    });
  }

  return chunks;
}

// Gửi dữ liệu qua Pusher với chunking
export async function triggerChunked(
  channel: string,
  event: string,
  data: any
): Promise<void> {
  const dataSize = JSON.stringify(data).length;

  console.log(`[Pusher] Event: ${event}, Data size: ${dataSize} bytes`);

  // Nếu dữ liệu nhỏ hơn giới hạn, gửi trực tiếp
  if (dataSize <= MAX_PAYLOAD_SIZE) {
    await pusherServer.trigger(channel, event, data);
    return;
  }

  // Chia thành chunks và gửi từng chunk
  const chunks = chunkData(data);
  console.log(`[Pusher] Chunking into ${chunks.length} pieces`);

  for (const chunk of chunks) {
    await pusherServer.trigger(channel, `${event}:chunk`, chunk);
  }
}
