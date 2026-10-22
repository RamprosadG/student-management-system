export function HomeHeader() {
  return (
    <header className="border-b border-slate-200 pb-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Administration
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl max-sm:text-lg">
            Registry Management System
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 max-sm:hidden">
            Access registry workflows, manage student records, and review
            academic information from one central location.
          </p>
        </div>
      </div>
    </header>
  );
}
