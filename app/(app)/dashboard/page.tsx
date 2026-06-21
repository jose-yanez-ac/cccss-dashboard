import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumen del proyecto Túnel Lo Ruiz.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>En construcción</CardTitle>
          <CardDescription>
            Las tarjetas KPI y los gráficos se incorporarán en la Épica 7.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder provisional del dashboard.
        </CardContent>
      </Card>
    </div>
  );
}
