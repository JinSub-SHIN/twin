const FILES = [
  { id: "living", label: "거실", file: "photo-1586023492125-27b2c045efd7" },
  { id: "room", label: "침실", file: "photo-1505693416388-ac5ce068fe85" },
  { id: "kitchen", label: "주방", file: "photo-1556911220-bff31c812dba" },
  { id: "bath", label: "화장실", file: "photo-1552321554-5fefe8c9ef14" },
  { id: "mood", label: "집 분위기", file: "photo-1493809842364-78817add7ffb" },
] as const;

function hash(value: string) {
  let n = 0;
  for (const ch of value) n = (n * 31 + ch.charCodeAt(0)) >>> 0;
  return n;
}

function photoUrl(file: string) {
  return `https://images.unsplash.com/${file}?auto=format&fit=crop&w=900&q=70`;
}

export function houseGallery(seed: string) {
  const start = hash(seed) % FILES.length;
  const ordered = [...FILES.slice(start), ...FILES.slice(0, start)];
  return ordered.map((item, index) => ({
    id: item.id,
    label: item.label,
    url: photoUrl(item.file),
    cover: index === 0,
  }));
}
