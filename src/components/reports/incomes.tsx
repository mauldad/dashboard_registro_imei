import { AtSign, Calendar, Users } from "lucide-react";
import useClientStore from "@/store/clients";
import useAuthStore, { UserPermissionsToken } from "@/store/auth";
import ReportFilters from "./report-filters";

const IncomesReport = () => {
  const token = useAuthStore((state) => state.token) as UserPermissionsToken;
  const clients = useClientStore((state) => state.analitycsClients);

  const approvedClients = clients.filter(
    (client) => client.paid === "approved",
  );

  const getTotalAmount = () =>
    approvedClients.reduce((sum, client) => sum + client.total_paid, 0);

  const getIncomeByChannel = (channel: "base" | "falabella" | "walmart") =>
    approvedClients
      .filter((client) => client.channel === channel)
      .reduce((sum, client) => sum + client.total_paid, 0);

  const getIncomeByType = (type: "business" | "personal") =>
    approvedClients
      .filter((client) =>
        type === "business" ? client.is_business : !client.is_business,
      )
      .reduce((sum, client) => sum + client.total_paid, 0);

  const getTopClients = () => {
    const groupedClients = clients.reduce(
      (acc, client) => {
        if (acc[client.rut]) {
          acc[client.rut].total_paid += client.total_paid; // Sumar los pagos
        } else {
          acc[client.rut] = {
            rut: client.rut,
            total_paid: client.total_paid,
          };
        }
        return acc;
      },
      {} as Record<string, { rut: string; name: string; total_paid: number }>,
    );

    const sortedClients = Object.values(groupedClients)
      .sort((a, b) => b.total_paid - a.total_paid)
      .slice(0, 5);

    return sortedClients;
  };

  const totalAmount = getTotalAmount();
  const businessIncome = getIncomeByType("business");
  const personalIncome = getIncomeByType("personal");
  const baseIncome = getIncomeByChannel("base");
  const falabellaIncome = getIncomeByChannel("falabella");
  const walmartIncome = getIncomeByChannel("walmart");
  const topClients = getTopClients();

  return (
    <>
      <ReportFilters />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {token.channel === "base" && token.is_admin && (
          <>
            {/* Total Recaudado */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm">Total Recaudado</p>
                  <p className="text-2xl font-semibold mt-1">
                    {totalAmount.toLocaleString("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    })}
                  </p>
                </div>
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Empresas</span>
                  <span className="font-medium">
                    {businessIncome.toLocaleString("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Personas</span>
                  <span className="font-medium">
                    {personalIncome.toLocaleString("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Ingresos por canal */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm">Ingresos por Canal</p>
                </div>
                <AtSign className="w-5 h-5 text-green-500" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Registro de IMEI</span>
                  <span className="font-medium">
                    {baseIncome.toLocaleString("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Falabella</span>
                  <span className="font-medium">
                    {falabellaIncome.toLocaleString("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Walmart</span>
                  <span className="font-medium">
                    {walmartIncome.toLocaleString("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-sm">Top 5 Clientes por Facturación</p>
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <ul className="mt-4 space-y-2">
                {topClients.map((client, index) => (
                  <li className="flex justify-between text-sm" key={index}>
                    <span className="text-gray-600">
                      {index + 1}. {client.rut}
                    </span>
                    <span className="font-medium">
                      {client.total_paid.toLocaleString("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default IncomesReport;
