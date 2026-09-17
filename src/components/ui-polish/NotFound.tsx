export function NotFound() {
  return (
    <main id="main-content" className="grid min-h-[70vh] place-items-center px-6 py-20 text-center">
      <section aria-labelledby="not-found-title" className="max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Deli 404</p>
        <h1 id="not-found-title" className="mt-4 text-6xl font-bold tracking-tight">This stop doesn't exist.</h1>
        <p className="mx-auto mt-5 max-w-md text-muted-foreground">The route you're looking for may have moved. Let's get your delivery desk back on the right road.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a className="ui-polish-button rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground" href="/">Back home</a>
          <a className="ui-polish-button rounded-md border px-5 py-3 font-medium" href="/contact">Contact Deli</a>
        </div>
      </section>
    </main>
  )
}
