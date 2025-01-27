import { IOrder } from "../types/client";

export const generateRejectedTokenPersonal = async (
  order: IOrder,
  rejectedFields: string[],
  rejectionId: number,
) => {
  const personalOrder = {
    idCardUrl: order.Account?.Personal?.id_card_url,
    rut: order.Account?.rut,
    firstName: order.Account?.Personal?.first_name,
    lastName: order.Account?.Personal?.last_name,
    nationality: order.Account?.Personal?.nationality,
    imeis: order.Imei?.map((imei) => imei.imei_number),
    purchaseReceiptUrl: order.purchase_receipt_url,
    email: order.email,
    phoneNumber: order.phone_number,
  };

  const rejectedTokenFields = rejectedFields.reduce((acc, field) => {
    acc[field] = personalOrder[field];
    return acc;
  }, {});
  const rejectedToken = {
    id: order.id,
    rejectionId,
    isBusiness: false,
    paid: order.paid,
    orderNumber: order.order_number,
    fields: rejectedTokenFields,
    timestamp: Date.now(),
  };

  const token = fetch("/.netlify/functions/generate_jwt", {
    method: "POST",
    body: JSON.stringify({ payload: rejectedToken }),
  })
    .then((res) => res.json())
    .then((data) => data.token)
    .catch((error) => {
      throw new Error("Generate token failed");
    });
  return token;
};

export const generateRejectedTokenBusiness = async (
  order: IOrder,
  rejectedFields: string[],
  rejectionId: number,
) => {
  const businessOrder = {
    rut: order.Account?.rut,
    businessName: order.Account?.Business?.business_name,
    registrantName: order.registrant_name,
    email: order.email,
    excelImeisUrl: order.imei_excel_url,
    importReceiptUrl: order.import_receipt_url,
  };

  const rejectedTokenFields = rejectedFields.reduce((acc, field) => {
    acc[field] = businessOrder[field];
    return acc;
  }, {});
  const rejectedToken = {
    id: order.id,
    isBusiness: true,
    rejectionId,
    paid: order.paid,
    orderNumber: order.order_number,
    fields: rejectedTokenFields,
    timestamp: Date.now(),
  };

  const token = fetch("/.netlify/functions/generate_jwt", {
    method: "POST",
    body: JSON.stringify({ payload: rejectedToken }),
  })
    .then((res) => res.json())
    .then((data) => data.token)
    .catch((error) => {
      throw new Error("Generate token failed");
    });
  return token;
};
