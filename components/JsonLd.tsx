/** Renders Schema.org JSON-LD. Null entries are skipped. */
export function JsonLd({ data }: { data: (Record<string, unknown> | null)[] }) {
  return (
    <>
      {data.filter(Boolean).map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, '\\u003c') }} />
      ))}
    </>
  );
}
