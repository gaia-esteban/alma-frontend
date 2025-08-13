import { ColumnDef } from "@tanstack/react-table";

export interface DatatableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  caption?: string;
  globalFilterColumn?: string;
}



export type PurchaseOrder = {
  "createdAt": string;
  "externalId[].value.orderNumber": string;
  "customer.fullName": string;
  "status.description": string;
  "comments": string;
  "priceAfterTax": number;
}


export async function getPurchaseOrder(): Promise<PurchaseOrder[]> {
  return [
      {
        "createdAt": "2025-03-26T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO01",
        "customer.fullName": "AGROSENSE SAS 901823183",
        "status.description": "Totalmente facturada",
        "comments": "Test",
        "priceAfterTax": 244662895.08,
      },
      {
        "createdAt": "2025-03-26T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO02",
        "customer.fullName": "ETIQUETAS DE COLOMBIA S.A.S 802002507",
        "status.description": "Totalmente facturada",
        "comments": "",
        "priceAfterTax": 85918000,
      },
      {
        "createdAt": "2025-03-28T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO03",
        "customer.fullName": "C.I. AGROSOSA S.A.S 900263172",
        "status.description": "Parcialmente recibida",
        "comments": "Test",
        "priceAfterTax": 473498.54,
      },
      {
        "createdAt": "2025-03-28T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO04",
        "customer.fullName":
          "CORPORACION DE PLASTICOS AGRICOLAS S.A.S. 811029497",
        "status.description": "Totalmente facturada",
        "comments": "Test",
        "priceAfterTax": 1739.06,
      },
      {
        "createdAt": "2025-03-30T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO05",
        "customer.fullName":
          "Ministero dell'Ambiente e della Sicurezza Energetica - Residuos Italia 1234567",
        "status.description": "Factura pendiente",
        "comments": "Test",
        "priceAfterTax": 1005.5,
      },
      {
        "createdAt": "2025-03-31T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO06",
        "customer.fullName":
          "Ministero dell'Ambiente e della Sicurezza Energetica - Residuos Italia 1234567",
        "status.description": "Recepción pendiente",
        "comments": "Test",
        "priceAfterTax": 1005.5,
      },
      {
        "createdAt": "2025-03-31T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO07",
        "customer.fullName":
          "Ministero dell'Ambiente e della Sicurezza Energetica - Residuos Italia 1234567",
        "status.description": "Factura pendiente",
        "comments": "Test WT1",
        "priceAfterTax": 1005.5,
      },
      {
        "createdAt": "2025-04-04T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO09",
        "customer.fullName":
          "Ministero dell'Ambiente e della Sicurezza Energetica - Residuos Italia 1234567",
        "status.description": "Recepción pendiente",
        "comments": "Test",
        "priceAfterTax": 0,
      },
      {
        "createdAt": "2025-04-24T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO10",
        "customer.fullName": "AGROSENSE SAS 901823183",
        "status.description": "Aprobación del supervisor pendiente",
        "comments": "",
        "priceAfterTax": 31402910,
      },
      {
        "createdAt": "2025-04-24T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO12",
        "customer.fullName": "AGROSENSE SAS 901823183",
        "status.description": "Aprobación del supervisor pendiente",
        "comments": "Prueba AE",
        "priceAfterTax": 49980000,
      },
      {
        "createdAt": "2025-05-01T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO11",
        "customer.fullName": "AGROSENSE SAS 901823183",
        "status.description": "Aprobación del supervisor pendiente",
        "comments": "Ae Prueba 1 PO",
        "priceAfterTax": 28679000,
      },
      {
        "createdAt": "2025-05-01T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO13",
        "customer.fullName": "AGROSENSE SAS 901823183",
        "status.description": "Aprobación del supervisor pendiente",
        "comments": "Mango Verde AF",
        "priceAfterTax": 133280000,
      },
      {
        "createdAt": "2025-05-02T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO14",
        "customer.fullName": "AGROSENSE SAS 901823183",
        "status.description": "Factura pendiente",
        "comments": "Test",
        "priceAfterTax": 31402910,
      },
      {
        "createdAt": "2025-05-02T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO15",
        "customer.fullName": "AGROSENSE SAS 901823183",
        "status.description": "Cerrada",
        "comments": "Ae Prueba 1 PO",
        "priceAfterTax": 15214150,
      },
      {
        "createdAt": "2025-05-02T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO16",
        "customer.fullName": "AGROSENSE SAS 901823183",
        "status.description": "Totalmente facturada",
        "comments": "Mango Azucar verde AF",
        "priceAfterTax": 112000000,
      },
      {
        "createdAt": "2025-05-05T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO17",
        "customer.fullName": "JADER USMA MULTISERVICIOS S.A.S 901467992",
        "status.description": "Factura pendiente",
        "comments": "test oc af",
        "priceAfterTax": 215247.2,
      },
      {
        "createdAt": "2025-05-05T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO18",
        "customer.fullName": "CARTON DE COLOMBIA S.A. 890300406",
        "status.description": "Cerrada",
        "comments": "EMPAQUE PARA MANGO",
        "priceAfterTax": 79849000,
      },
      {
        "createdAt": "2025-05-07T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO19",
        "customer.fullName": "FRUTAYRONA S.A.S. 891700929",
        "status.description": "Aprobación del supervisor pendiente",
        "comments": "",
        "priceAfterTax": 40000000,
      },
      {
        "createdAt": "2025-05-09T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO20",
        "customer.fullName": "AGROSENSE SAS 901823183",
        "status.description": "Factura pendiente",
        "comments": "Test",
        "priceAfterTax": 1647060,
      },
      {
        "createdAt": "2025-05-12T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO21",
        "customer.fullName": "AGROSENSE SAS 901823183",
        "status.description": "Parcialmente recibida",
        "comments": "TEST WT1",
        "priceAfterTax": 123750000,
      },
      {
        "createdAt": "2025-05-13T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO22",
        "customer.fullName": "AGROSENSE SAS 901823183",
        "status.description": "Aprobación del supervisor pendiente",
        "comments": "",
        "priceAfterTax": 14875000,
      },
      {
        "createdAt": "2025-05-15T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO23",
        "customer.fullName": "SERVICIOS LOGISTICOS TELLEVAMOS SAS 830096940",
        "status.description": "Totalmente facturada",
        "comments": "TRANSPORTE DE CARGA EXPORTACION-6 PALLETS",
        "priceAfterTax": 3200000,
      },
      {
        "createdAt": "2025-05-15T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO24",
        "customer.fullName": "AGROSENSE SAS 901823183",
        "status.description": "Facturación pendiente/parcialmente recibido",
        "comments": "MANGO DE AZUCAR SEMANA 20",
        "priceAfterTax": 234630000,
      },
      {
        "createdAt": "2025-05-16T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO25",
        "customer.fullName": "AGROSENSE SAS 901823183",
        "status.description": "Aprobación del supervisor pendiente",
        "comments": "",
        "priceAfterTax": 11880000,
      },
      {
        "createdAt": "2025-05-16T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO26",
        "customer.fullName": "CARTON DE COLOMBIA S.A. 890300406",
        "status.description": "Totalmente facturada",
        "comments": "Test Laura 1",
        "priceAfterTax": 2677.5,
      },
      {
        "createdAt": "2025-05-16T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO27",
        "customer.fullName": "CARIBEEAM LOGISTICS SAS 901155013",
        "status.description": "Factura pendiente",
        "comments": "test laura 2",
        "priceAfterTax": 181475,
      },
      {
        "createdAt": "2025-05-16T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO28",
        "customer.fullName": "AGROSENSE SAS 901823183",
        "status.description": "Recepción pendiente",
        "comments": "test andres",
        "priceAfterTax": 1077188,
      },
      {
        "createdAt": "2025-05-16T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO29",
        "customer.fullName": "FRUTAYRONA S.A.S. 891700929",
        "status.description": "Factura pendiente",
        "comments":
          "PRECIO FIJO, SIN VARIACIÓN POR VOLATIDAD DE MERCADO  TRANSPORTE: Asumido por Agro sense ACUERDO DE PAGO: Anticipo 50% se liquida despues de maquila CORREO FACTURACION: contabilidad@agrosensecol.com",
        "priceAfterTax": 14355000,
      },
      {
        "createdAt": "2025-05-16T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO30",
        "customer.fullName": "FRUTAYRONA S.A.S. 891700929",
        "status.description": "Aprobación del supervisor pendiente",
        "comments": "Prueba impuestos frutayrona",
        "priceAfterTax": 16000000,
      },
      {
        "createdAt": "2025-05-16T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO31",
        "customer.fullName": "FRUTAYRONA S.A.S. 891700929",
        "status.description": "Parcialmente recibida",
        "comments": "",
        "priceAfterTax": 17424000,
      },
      {
        "createdAt": "2025-05-23T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO32",
        "customer.fullName": "SERVIAGRO 7438470",
        "status.description": "Aprobación del supervisor pendiente",
        "comments": "TEST",
        "priceAfterTax": 952000,
      },
      {
        "createdAt": "2025-06-05T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO33",
        "customer.fullName": "GENESYSAGTECH SAS 901656195",
        "status.description": "Aprobación del supervisor pendiente",
        "comments": "REPUESTO ADICIONAL PARA REPARACION DRON",
        "priceAfterTax": 6106842,
      },
      {
        "createdAt": "2025-06-20T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO08",
        "customer.fullName":
          "Ministero dell'Ambiente e della Sicurezza Energetica - Residuos Italia 1234567",
        "status.description": "Factura pendiente",
        "comments": "Test",
        "priceAfterTax": 0,
      },
      {
        "createdAt": "2025-06-25T06:41:16.000Z",
        "externalId[].value.orderNumber": "PO34",
        "customer.fullName": "ETIQUETAS DE COLOMBIA S.A.S 802002507",
        "status.description": "Aprobación del supervisor pendiente",
        "comments": "TEST CASE P2P03.1",
        "priceAfterTax": 612850,
      },
    ];
}
