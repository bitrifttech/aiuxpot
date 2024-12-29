export function MainWorkspace() {
  return (
    <div className="flex-1 p-6">
      <div className="grid gap-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 rounded-lg border bg-card text-card-foreground hover:border-primary/50 transition-colors cursor-pointer">
              <h3 className="font-medium mb-2">New Project</h3>
              <p className="text-sm text-muted-foreground">Create a new UX design project</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}