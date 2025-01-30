import { useEffect } from "react";
import useClientStore from "@/store/clients";
import useAuthStore, { UserPermissionsToken } from "@/store/auth";
import { FileSpreadsheet } from "lucide-react";
import RegistrationsReport from "@/components/reports/registrations";
import IncomesReport from "@/components/reports/incomes";
import ExportData from "@/components/reports/export-data";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports = () => {
  const { fetchAnalitycsClients, setLoading } = useClientStore(
    (state) => state,
  );
  const token = useAuthStore((state) => state.token) as UserPermissionsToken;
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const getClients = async () => {
      setLoading(true);
      await fetchAnalitycsClients(token?.channel as string, {
        month: searchParams.get("month") || undefined,
        year: searchParams.get("year") || undefined,
      });
      setLoading(false);
    };
    getClients();
  }, [searchParams]);

  const handleChangeReportType = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("type", value);
    setSearchParams(params);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Reportes y Análisis
          </h1>
        </div>
      </div>
      <Tabs
        defaultValue={searchParams.get("type") || "incomes"}
        className="space-y-4"
        onValueChange={(value) => handleChangeReportType(value)}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="incomes">Ingresos</TabsTrigger>
          <TabsTrigger value="registrations">Registros</TabsTrigger>
        </TabsList>

        <TabsContent value="incomes" className="space-y-2">
          <IncomesReport />
          <ExportData />
        </TabsContent>
        <TabsContent value="registrations" className="space-y-2">
          <RegistrationsReport />
          <ExportData />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
