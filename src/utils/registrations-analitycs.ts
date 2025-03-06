import {
  OrderAnalitycs,
  RejectionAnalitycs,
  RejectionRate,
} from "@/types/client";

export const getRegistrationsStats = (
  filteredData: OrderAnalitycs[],
  rejectionData: RejectionAnalitycs[],
  slaFilter: string,
) => {
  const mostRepeatedBusinesses = getMostRepetedBusinesses(filteredData);
  const sla = getRegistationsSLA(filteredData, slaFilter);
  const operatorsSla = getOperatorsSLA(filteredData);
  const rejections = getRejectionsStats(rejectionData, filteredData.length);
  const internal_form = getInternalFormStats(filteredData);

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
    operatorsSla,
    rejections,
    internal_form,
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
  const SLA_LIMIT = 4; // 4 horas

  const validRecords = filteredData.filter(
    (c) => c.registered && c.registered_at,
  );

  validRecords.forEach(
    ({ is_business, registered_at, created_at, channel }) => {
      const registeredDate = new Date(registered_at as string).getTime();
      const createdDate = new Date(created_at).getTime();
      const slaHours = (registeredDate - createdDate) / 3600000;

      const key =
        slaFilter === "services"
          ? is_business
            ? "Empresas"
            : "Personas"
          : channel === "base"
            ? "Registro de IMEI"
            : channel;

      if (!slaData[key]) {
        slaData[key] = { total: 0, count: 0, metSLA: 0 };
      }

      slaData[key].total += slaHours;
      slaData[key].count++;
      if (slaHours <= SLA_LIMIT) slaData[key].metSLA++;
    },
  );

  const sla = Object.keys(slaData).map((key) => ({
    label: key,
    avgSLA: slaData[key].total / slaData[key].count,
    complianceRate: (slaData[key].metSLA / slaData[key].count) * 100,
  }));

  return sla;
};

const getOperatorsSLA = (filteredData: OrderAnalitycs[]) => {
  const slaData = {};
  const SLA_LIMIT = 4; // 4 horas

  const validRecords = filteredData.filter(
    (c) => c.registered && c.registered_at,
  );

  validRecords.forEach(({ registered_by, registered_at, created_at }) => {
    const registeredDate = new Date(registered_at as string).getTime();
    const createdDate = new Date(created_at).getTime();
    const slaHours = (registeredDate - createdDate) / 3600000;

    const key = registered_by;

    if (!slaData[key]) {
      slaData[key] = { total: 0, count: 0, metSLA: 0 };
    }

    slaData[key].total += slaHours;
    slaData[key].count++;
    if (slaHours <= SLA_LIMIT) slaData[key].metSLA++;
  });

  const sla = Object.keys(slaData).map((key) => ({
    label: key,
    avgSLA: slaData[key].total / slaData[key].count,
    complianceRate: (slaData[key].metSLA / slaData[key].count) * 100,
  }));

  return sla;
};

const fieldsMap = {
  idCardUrl: "No subió correctamente los documentos",
  excelImeisUrl: "No subió correctamente los documentos",
  purchaseReceiptUrl: "No subió correctamente los documentos",
  importReceiptUrl: "No subió correctamente los documentos",
  rut: "Información personal inválida",
  passportNumber: "Información personal inválida",
  firstName: "Información personal inválida",
  lastName: "Información personal inválida",
  nationality: "Información personal inválida",
  imeis: "Información de dispositivo inválida",
  email: "Información de contacto inválida",
  phoneNumber: "Información de contacto inválida",
  businessName: "Información de empresa inválida",
  registrantName: "Información de contacto inválida",
};

const getRejectionsStats = (
  rejections: RejectionAnalitycs[],
  totalOrders: number,
): RejectionRate => {
  const fields = rejections.map((r) => r.fields).flat();
  const reasons = fields.reduce((acc, field) => {
    const reason = fieldsMap[field as keyof typeof fieldsMap];
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {});
  const totalRejections = rejections.length;
  const rejectionRate = (totalRejections / totalOrders) * 100;

  return {
    rejectionRate,
    reasons,
  };
};

const getInternalFormStats = (data: OrderAnalitycs[]) => {
  const internalOrders = data.filter((o) => o.internal_form);
  const result = {
    email: 0,
    phone: 0,
    in_person: 0,
    whatsapp: 0,
    social_media: 0,
  };

  internalOrders.forEach((order) => {
    result[order.internal_form]++;
  });

  return { ...result, total: internalOrders.length };
};
