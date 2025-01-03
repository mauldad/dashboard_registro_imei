import * as XLSX from 'xlsx';
import { IImei } from '@/types/client';

export const handleFileUpload = async (file: File, uploadFunction: (file: File) => Promise<string | undefined>) => {
    try {
        const url = await uploadFunction(file);
        return url;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Error al subir el archivo');
    }
};

export const processExcelFile = async (file: File): Promise<IImei[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData: any[] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                // Skip header row and process data
                const imeis: IImei[] = jsonData.slice(1).map((row) => ({
                    imei_number: row[0]?.toString() || '',
                    brand: row[1]?.toString() || '',
                    model: row[2]?.toString() || '',
                    type: row[3]?.toString() || '',
                    imei_image: ''
                }));

                resolve(imeis);
            } catch (error) {
                reject(new Error('Error al procesar el archivo Excel'));
            }
        };
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsArrayBuffer(file);
    });
};

export const createExcelFromImeis = (imeis: IImei[]): File => {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Transform IMEIs to rows
    const rows = imeis.map(imei => ({
        'Número IMEI': imei.imei_number,
        'Marca': imei.brand,
        'Modelo': imei.model,
        'Tipo': imei.type
    }));

    // Create worksheet from rows
    const ws = XLSX.utils.json_to_sheet(rows);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'IMEIs');

    // Generate buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Convert buffer to Blob
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Create File object
    const timestamp = new Date().getTime();
    const file = new File([blob], `imeis-${timestamp}.xlsx`, { type: blob.type });

    return file;
};
