import { Calendar, Filter } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientsFiltersProps {
  channel: string;
}

const months = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

export function ClientsFilters({ channel }: ClientsFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleParamChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setSearchParams(params);
  };

  return (
    <section className="pb-4 flex justify-between">
      <Tabs
        defaultValue={searchParams.get("status") || "all"}
        onValueChange={(value) => handleParamChange("status", value)}
      >
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="registered">Registrados</TabsTrigger>
          <TabsTrigger value="waiting">En Espera</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2 2xl:gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-md font-medium text-muted-foreground">Filtros</h2>
        <div className="flex items-center gap-1 2xl:gap-2 pl-3 pr-0 border rounded-lg bg-white">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Select
            defaultValue={searchParams.get("month") || "all"}
            onValueChange={(value) => handleParamChange("month", value)}
          >
            <SelectTrigger className="w-[160px] border-0 shadow-none focus:ring-0">
              <SelectValue placeholder="Seleccionar mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los meses</SelectItem>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {channel === "base" && (
          <>
            <Select
              defaultValue={searchParams.get("channel") || "all"}
              onValueChange={(value) => handleParamChange("channel", value)}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Seleccionar canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los canales</SelectItem>
                <SelectItem value="base">Base</SelectItem>
                <SelectItem value="falabella">Falabella</SelectItem>
                <SelectItem value="walmart">Walmart</SelectItem>
              </SelectContent>
            </Select>

            <Select
              defaultValue={searchParams.get("type") || "all"}
              onValueChange={(value) => handleParamChange("type", value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="business">Empresas</SelectItem>
                <SelectItem value="personal">Personas</SelectItem>
              </SelectContent>
            </Select>

            <Select
              defaultValue={searchParams.get("payment") || "all"}
              onValueChange={(value) => handleParamChange("payment", value)}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Estado de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="approved">Pagados</SelectItem>
                <SelectItem value="pending">Pendientes de Pago</SelectItem>
                <SelectItem value="rejected">Rechazados</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>
    </section>
  );
}
