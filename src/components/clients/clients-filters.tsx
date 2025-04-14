import { Filter, RotateCcw } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";

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

  const dateRangePickerOnUpdate = (values: {
    range: DateRange;
    rangeCompare?: DateRange;
  }) => {
    const params = new URLSearchParams(searchParams);
    if (values.range.from) {
      const dateFrom = values.range.from
        .toLocaleString("sv", { timeZone: "America/Santiago" })
        .split(" ")[0];
      params.set("dateFrom", dateFrom);
    }
    if (values.range.to) {
      const dateTo = values.range.to
        .toLocaleString("sv", { timeZone: "America/Santiago" })
        .split(" ")[0];
      params.set("dateTo", dateTo);
    }
    setSearchParams(params);
  };

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
        <div className="flex items-center gap-2">
          <DateRangePicker
            onUpdate={dateRangePickerOnUpdate}
            initialDateFrom={searchParams.get("dateFrom") || "2024-11-01"}
            initialDateTo={
              searchParams.get("dateTo") ||
              new Date().toISOString().split("T")[0]
            }
            align="start"
            locale="es-CL"
            showCompare={false}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.delete("dateFrom");
              params.delete("dateTo");
              setSearchParams(params);
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
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
