export async function onRequestGet() {
  const upstream = await fetch("https://app.nexnotas.com.br/api/v1/referencias/municipios-atendidos?limite=6000", {
    headers: { Accept: "application/json" },
    cf: { cacheTtl: 3600, cacheEverything: true },
  });

  if (!upstream.ok) {
    return Response.json({ error: "Cobertura indisponível" }, { status: 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
