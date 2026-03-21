export const PdfTemplateSelect = {
  id: true,
  name: true,
  type: true,
  htmlContent: true,
  isDefault: true,
  active: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
} as const;

export type PdfTemplateType = {
  id: string;
  name: string;
  type: string;
  htmlContent: string;
  isDefault: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string | null;
};
