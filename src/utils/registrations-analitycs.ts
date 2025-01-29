import { OrderAnalitycs, RejectionAnalitycs } from "@/types/client";

export const getRegistrationsStats = (
  filteredData: OrderAnalitycs[],
  rejectionData: RejectionAnalitycs[],
  slaFilter: string,
) => {
  const mostRepeatedBusinesses = getMostRepetedBusinesses(filteredData);
  const sla = getRegistationsSLA(filteredData, slaFilter);
  const rejections = getRejectionsStats(rejectionData, filteredData.length);

  const stats = {
    total: filteredData.length,
    business: filteredData.filter((c) => c.is_business).length,
    personal: filteredData.filter((c) => !c.is_business).length,
    registered: filteredData.filter((c) => c.registered).length,
    waiting: filteredData.filter((c) => !c.registered).length,
    base: filteredData.filter((c) => c.channel === "base" && c.registered)
      .length,
    falabella: filteredData.filter(
      (c) => c.channel === "falabella" && c.registered,
    ).length,
    walmart: filteredData.filter((c) => c.channel === "walmart" && c.registered)
      .length,
    topClients: mostRepeatedBusinesses,
    sla,
    rejections,
  };

  return stats;
};

const getMostRepetedBusinesses = (filteredData: OrderAnalitycs[]) => {
  const companyCount = filteredData.reduce(
    (acc, client) => {
      if (client.is_business) {
        acc[client.rut] = (acc[client.rut] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );
  const mostRepeatedBusinesses = Object.entries(companyCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([rut, count]) => {
      return {
        rut,
        count,
      };
    });
  return mostRepeatedBusinesses;
};

const getRegistationsSLA = (
  filteredData: OrderAnalitycs[],
  slaFilter: string,
) => {
  const slaData = {};
  const validRecords = filteredData.filter(
    (c) => c.registered && c.registered_at,
  );

  if (slaFilter === "services") {
    validRecords.forEach(({ is_business, registered_at, created_at }) => {
      const registeredDate = new Date(registered_at as string).getTime();
      const createdDate = new Date(created_at).getTime();

      const slaHours = (registeredDate - createdDate) / 3600000;
      const key = is_business ? "Empresas" : "Personas";
      if (!slaData[key]) slaData[key] = { total: 0, count: 0 };
      slaData[key].total += slaHours;
      slaData[key].count++;
    });
  } else {
    validRecords.forEach(({ channel, registered_at, created_at }) => {
      const registeredDate = new Date(registered_at as string).getTime();
      const createdDate = new Date(created_at).getTime();

      const slaHours = (registeredDate - createdDate) / 3600000;
      const key = channel === "base" ? "Registro de IMEI" : channel;
      if (!slaData[key]) slaData[key] = { total: 0, count: 0 };
      slaData[key].total += slaHours;
      slaData[key].count++;
    });
  }

  const sla = Object.keys(slaData).map((key) => ({
    label: key,
    avgSLA: slaData[key].total / slaData[key].count,
  }));

  return sla;
};

const getRejectionsStats = (
  rejections: RejectionAnalitycs[],
  totalOrders: number,
) => {
  const reasons = rejections.reduce((acc, rejection) => {
    acc[rejection.reason] = (acc[rejection.reason] || 0) + 1;
    return acc;
  }, {});
  console.log(rejections);
  const totalRejections = rejections.length;
  const rejectionRate = (totalRejections / totalOrders) * 100;

  return {
    rejectionRate,
    reasons,
  };
};
