
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToolsDashboard } from './views/ToolsDashboard';
import { PdfToolkit } from './views/PdfToolkit';
import { CadViewer } from './views/CadViewer';

export const ToolsModuleEntry: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ToolsDashboard />} />
      <Route path="pdf" element={<PdfToolkit />} />
      <Route path="cad" element={<CadViewer />} />
    </Routes>
  );
};
