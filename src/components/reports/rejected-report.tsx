import useClientStore from "@/store/clients";
import { RejectionRate } from "@/types/client";
import { Ban } from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface RejectionReportProps {
  stats: RejectionRate;
}

const RejectedReport: React.FC<RejectionReportProps> = ({ stats }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-start">
        <p className="text-sm">Tasa de Rechazos</p>
        <Ban className="w-5 h-5 text-blue-500" />
      </div>
      <RejectionFilter />
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tasa de Rechazo (%)</span>
          <span className="font-medium">{stats.rejectionRate.toFixed(2)}%</span>
        </div>

        {/* Motivos de rechazo */}
        <div>
          <p className="text-sm text-gray-600">Motivos de Rechazo</p>
          <ul className="mt-2 space-y-1">
            {Object.entries(stats.reasons).map(([reason, count]) => (
              <li key={reason} className="flex justify-between text-sm">
                <span className="text-gray-600">{reason}</span>
                <span className="font-medium">{count as number}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const RejectionFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { loading } = useClientStore((state) => state);

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
    <>
      {loading ? (
        <div className="gap-4 mb-6">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="gap-4 my-4">
          <select
            value={searchParams.get("rejection_channel") || "all"}
            onChange={(e) =>
              handleParamChange("rejection_channel", e.target.value)
            }
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">Todos los canales</option>
            <option value="base">Registro de IMEI</option>
            <option value="falabella">Falabella</option>
            <option value="walmart">Walmart</option>
          </select>
        </div>
      )}
    </>
  );
};

export default RejectedReport;
