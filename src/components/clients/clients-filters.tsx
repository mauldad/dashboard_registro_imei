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
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo } from "react";

interface ClientsFiltersProps {
  channel: string;
}

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

  const years = useMemo(
    () =>
      Array.from({ length: new Date().getFullYear() - 2024 + 1 }, (_, i) => ({
        value: (2024 + i).toString(),
        label: (2024 + i).toString(),
      })),
    [],
  );
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString().padStart(2, "0"),
        label: format(new Date(2024, i, 1), "MMMM", { locale: es }),
      })),
    [],
  );

  return (
    <section className="pb-4 flex justify-between overflow-x-auto">
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
        <div className="flex items-center gap-1 2xl:gap-2 pl-3 pr-0 border rounded-lg bg-white">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Select
            defaultValue={searchParams.get("year") || "all"}
            onValueChange={(value) => handleParamChange("year", value)}
          >
            <SelectTrigger className="w-[160px] border-0 shadow-none focus:ring-0">
              <SelectValue placeholder="Seleccionar mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los años</SelectItem>
              {years.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
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
                <SelectItem value="internal">Formulario Interno</SelectItem>
              </SelectContent>
            </Select>

            {searchParams.get("channel") === "internal" && (
              <Select
                defaultValue={searchParams.get("internal_channel") || "all"}
                onValueChange={(value) =>
                  handleParamChange("internal_channel", value)
                }
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Seleccionar canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los canales</SelectItem>
                  <SelectItem value="email">Correo</SelectItem>
                  <SelectItem value="phone">Telefono</SelectItem>
                  <SelectItem value="in_person">Presencial</SelectItem>
                  <SelectItem value="whatsapp">Whatsapp</SelectItem>
                  <SelectItem value="social_media">Redes Sociales</SelectItem>
                </SelectContent>
              </Select>
            )}

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
          </>
        )}
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
      </div>
    </section>
  );
}
