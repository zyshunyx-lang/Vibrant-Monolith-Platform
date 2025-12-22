
import React, { useRef } from 'react';
import { Button } from '../basic/Button';
import { Icon } from '../basic/Icon';
import * as XLSX from 'xlsx';

interface ExcelIOProps {
  mode?: 'import' | 'export_template';
  onImport?: (data: any[]) => void;
  templateData?: any[];
  templateFileName?: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const ExcelIO: React.FC<ExcelIOProps> = ({
  mode = 'import',
  onImport,
  templateData = [],
  templateFileName = '数据模版.xlsx',
  label = mode === 'import' ? '导入 Excel' : '下载模版',
  variant = 'secondary'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImport) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        onImport(json);
      } catch (err) {
        alert("无法解析 Excel 文件。请确保文件格式为有效的 .xlsx 或 .xls 格式。");
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, templateFileName);
  };

  return (
    <div className="inline-block">
      {mode === 'import' ? (
        <>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
          />
          <Button variant={variant} onClick={() => fileInputRef.current?.click()}>
            <Icon name="Upload" size={18} className="mr-2" />
            {label}
          </Button>
        </>
      ) : (
        <Button variant={variant} onClick={downloadTemplate}>
          <Icon name="Download" size={18} className="mr-2" />
          {label}
        </Button>
      )}
    </div>
  );
};
