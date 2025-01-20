import { Filter } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UsersFilters() {
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
      <div className="flex items-center gap-2 2xl:gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-md font-medium text-muted-foreground">Filtros</h2>
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
          defaultValue={searchParams.get("role") || "all"}
          onValueChange={(value) => handleParamChange("role", value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="operator">Operadores</SelectItem>
            <SelectItem value="admin">Administradores</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
