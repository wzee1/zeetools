/**
 * 100% Client-Side In-Memory ZIP Packager.
 * Complies with the standard PKZIP specification with zero external dependencies.
 */

// CRC-32 Table
const crcTable: Uint32Array = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

export function computeCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipEntry {
  name: string;
  data: Uint8Array | Blob;
}

/**
 * Creates a standard uncompressed or raw-deflated .zip archive in memory.
 */
export async function createZipArchive(
  entries: ZipEntry[],
  onProgress?: (processed: number, total: number) => void
): Promise<Blob> {
  const parts: Uint8Array[] = [];
  const centralDirParts: Uint8Array[] = [];

  let currentOffset = 0;
  const encoder = new TextEncoder();

  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    const fileNameBytes = encoder.encode(entry.name);

    let rawData: Uint8Array;
    if (entry.data instanceof Blob) {
      rawData = new Uint8Array(await entry.data.arrayBuffer());
    } else {
      rawData = entry.data;
    }

    const uncompressedSize = rawData.byteLength;
    const crc = computeCrc32(rawData);

    // Storing (method 0) for images is optimal as images are already high-entropy compressed.
    const compressionMethod = 0;
    const compressedData = rawData;
    const compressedSize = uncompressedSize;

    // DOS Time & Date (current)
    const now = new Date();
    const dosTime =
      ((now.getHours() & 0x1f) << 11) |
      ((now.getMinutes() & 0x3f) << 5) |
      ((now.getSeconds() >> 1) & 0x1f);
    const dosDate =
      (((now.getFullYear() - 1980) & 0x7f) << 9) |
      (((now.getMonth() + 1) & 0x0f) << 5) |
      (now.getDate() & 0x1f);

    // Local File Header (30 bytes + name)
    const localHeader = new Uint8Array(30 + fileNameBytes.length);
    const lView = new DataView(localHeader.buffer);

    lView.setUint32(0, 0x04034b50, true); // Local header signature
    lView.setUint16(4, 20, true); // Version needed (2.0)
    lView.setUint16(6, 0x0800, true); // Bit flag: UTF-8 filename (bit 11)
    lView.setUint16(8, compressionMethod, true); // Compression method (0 = store)
    lView.setUint16(10, dosTime, true);
    lView.setUint16(12, dosDate, true);
    lView.setUint32(14, crc, true);
    lView.setUint32(18, compressedSize, true);
    lView.setUint32(22, uncompressedSize, true);
    lView.setUint16(26, fileNameBytes.length, true);
    lView.setUint16(28, 0, true); // Extra field length

    localHeader.set(fileNameBytes, 30);

    parts.push(localHeader);
    parts.push(compressedData);

    // Central Directory Entry (46 bytes + name)
    const cdHeader = new Uint8Array(46 + fileNameBytes.length);
    const cdView = new DataView(cdHeader.buffer);

    cdView.setUint32(0, 0x02014b50, true); // Central directory signature
    cdView.setUint16(4, 20, true); // Version made by
    cdView.setUint16(6, 20, true); // Version needed
    cdView.setUint16(8, 0x0800, true); // UTF-8
    cdView.setUint16(10, compressionMethod, true);
    cdView.setUint16(12, dosTime, true);
    cdView.setUint16(14, dosDate, true);
    cdView.setUint32(16, crc, true);
    cdView.setUint32(20, compressedSize, true);
    cdView.setUint32(24, uncompressedSize, true);
    cdView.setUint16(28, fileNameBytes.length, true);
    cdView.setUint16(30, 0, true); // Extra field length
    cdView.setUint16(32, 0, true); // Comment length
    cdView.setUint16(34, 0, true); // Disk number start
    cdView.setUint16(36, 0, true); // Internal attributes
    cdView.setUint32(38, 0, true); // External attributes
    cdView.setUint32(42, currentOffset, true); // Local header relative offset

    cdHeader.set(fileNameBytes, 46);
    centralDirParts.push(cdHeader);

    currentOffset += localHeader.length + compressedData.length;

    if (onProgress) {
      onProgress(index + 1, entries.length);
    }
  }

  const centralDirOffset = currentOffset;
  let centralDirSize = 0;
  for (const cd of centralDirParts) {
    centralDirSize += cd.length;
    parts.push(cd);
  }

  // End of Central Directory Record (22 bytes)
  const eocd = new Uint8Array(22);
  const eView = new DataView(eocd.buffer);

  eView.setUint32(0, 0x06054b50, true); // EOCD signature
  eView.setUint16(4, 0, true); // Disk number
  eView.setUint16(6, 0, true); // Disk with central directory
  eView.setUint16(8, entries.length, true); // Entries on disk
  eView.setUint16(10, entries.length, true); // Total entries
  eView.setUint32(12, centralDirSize, true); // Size of central directory
  eView.setUint32(16, centralDirOffset, true); // Offset of central directory
  eView.setUint16(20, 0, true); // Comment length

  parts.push(eocd);

  return new Blob(parts as BlobPart[], { type: 'application/zip' });
}
