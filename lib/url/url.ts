export function getReferenceFromUrl(solanaPayUrl: string | undefined | null) {
  if (!solanaPayUrl) return null;
  try {
    const url = new URL(solanaPayUrl);
    return url.searchParams.get("reference");
  } catch {
    return null;
  }
}
