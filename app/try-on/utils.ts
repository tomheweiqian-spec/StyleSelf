export function toFashnCategory(category: string): "tops" | "bottoms" | "one-pieces" {
  if (category === "bottoms") return "bottoms";
  if (category === "dresses") return "one-pieces";
  return "tops";
}
