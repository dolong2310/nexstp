import { pusherClient } from "@/lib/pusher";
import { useCallback, useRef } from "react";

interface ChunkData {
  id: string;
  index: number;
  final: boolean;
  data: string;
}

interface ChunkBuffer {
  [chunkId: string]: {
    chunks: { [index: number]: string };
    expectedFinal: boolean;
  };
}

export function useChunkedPusher() {
  const chunkBufferRef = useRef<ChunkBuffer>({});

  const bindChunkedEvent = useCallback(
    (channel: string, event: string, callback: (data: any) => void) => {
      // Bind to regular event (for non-chunked data)
      pusherClient.bind(event, callback);

      // Bind to chunked event
      pusherClient.bind(`${event}:chunk`, (chunk: ChunkData) => {
        const { id, index, final, data } = chunk;

        // Initialize buffer for this chunk ID if not exists
        if (!chunkBufferRef.current[id]) {
          chunkBufferRef.current[id] = {
            chunks: {},
            expectedFinal: false,
          };
        }

        // Store chunk data
        chunkBufferRef.current[id].chunks[index] = data;

        if (final) {
          chunkBufferRef.current[id].expectedFinal = true;
        }

        // Check if we have all chunks
        const buffer = chunkBufferRef.current[id];
        const chunkIndices = Object.keys(buffer.chunks)
          .map(Number)
          .sort((a, b) => a - b);
        const hasAllChunks =
          buffer.expectedFinal &&
          chunkIndices.length > 0 &&
          chunkIndices[chunkIndices.length - 1] === chunkIndices.length - 1;

        if (hasAllChunks) {
          // Reassemble data
          const reassembledData = chunkIndices
            .map((index) => buffer.chunks[index])
            .join("");

          try {
            const parsedData = JSON.parse(reassembledData);
            callback(parsedData);
          } catch (error) {
            console.error("Failed to parse chunked data:", error);
          }

          // Clean up buffer
          delete chunkBufferRef.current[id];
        }
      });
    },
    []
  );

  const unbindChunkedEvent = useCallback((event: string) => {
    pusherClient.unbind(event);
    pusherClient.unbind(`${event}:chunk`);
  }, []);

  return { bindChunkedEvent, unbindChunkedEvent };
}
