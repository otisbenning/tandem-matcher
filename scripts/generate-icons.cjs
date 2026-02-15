/**
 * Simple icon generator for Chrome Extension
 * Creates basic colored square icons as placeholders
 */

const fs = require('fs');
const path = require('path');

// Simple PNG encoder for solid color icons
function createSolidColorPNG(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT chunk (image data)
  const rowSize = 1 + width * 3; // filter byte + RGB for each pixel
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    rawData[rowStart] = 0; // no filter

    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * 3;
      // Create a simple gradient/logo effect
      const centerX = width / 2;
      const centerY = height / 2;
      const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      const maxDist = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
      const factor = 1 - (dist / maxDist) * 0.3;

      // T letter pattern for "Tandem"
      const isT = (x >= width * 0.2 && x <= width * 0.8 && y >= height * 0.15 && y <= height * 0.3) ||
                  (x >= width * 0.4 && x <= width * 0.6 && y >= height * 0.15 && y <= height * 0.85);

      if (isT) {
        rawData[pixelStart] = 255;     // white
        rawData[pixelStart + 1] = 255;
        rawData[pixelStart + 2] = 255;
      } else {
        rawData[pixelStart] = Math.round(r * factor);
        rawData[pixelStart + 1] = Math.round(g * factor);
        rawData[pixelStart + 2] = Math.round(b * factor);
      }
    }
  }

  // Compress with zlib
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);
  const idat = createChunk('IDAT', compressed);

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

// CRC32 implementation
function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = makeCRCTable();

  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
  }

  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeCRCTable() {
  const table = new Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
}

// Generate icons
const iconsDir = path.join(__dirname, '..', 'extension', 'assets', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

const sizes = [16, 48, 128];
// SwaF teal color: #009892
const r = 0, g = 152, b = 146;

sizes.forEach(size => {
  const png = createSolidColorPNG(size, size, r, g, b);
  const filename = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filename, png);
  console.log(`Created ${filename}`);
});

console.log('Done!');
