// types/formBuilder.ts
export interface ValidationRule {
  required?: boolean;
  pattern?: string;
  message?: string;
}

export interface FormOption {
  value: string;
  label: string;
  isDefault?: boolean;
}

export interface BaseField {
  fieldId: string;
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  order: number;
  validation?: ValidationRule;
  isActive: boolean;
}

export interface FixedField extends BaseField {
  isFixed: true;
}

export interface CustomQuestion extends BaseField {
  isFixed: false;
  options?: FormOption[];
}

export interface EventData {
  id: string;
  title: string;
  description?: string | null;
  eventDate: string;
  location: string;
  bannerUrl?: string | null;
  status: string;
  slug: string;
}

export interface FormBuilderData {
  event: EventData;
  eventId: string;
  version: number;
  publishedAt: null | string;
  fixedFields: FixedField[];
  customQuestions: CustomQuestion[];
}

export interface FormBuilderResponse {
  success: boolean;
  message: string;
  data: FormBuilderData;
}

export type Field = FixedField | CustomQuestion;
