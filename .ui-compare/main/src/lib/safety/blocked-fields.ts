/**
 * Field names blocked from outbound marketing automation (Zapier, Airtable summaries).
 */

export const BLOCKED_OUTBOUND_PAYLOAD_KEYS = new Set([
  "diagnosis",
  "diagnosis_detail",
  "medical_history",
  "medicalhistory",
  "medical_history_text",
  "clinical_notes",
  "clinicalNotes",
  "treatment_plan",
  "treatmentPlan",
  "insurance",
  "insurance_id",
  "full_dob",
  "fullDob",
  "date_of_birth",
  "dateOfBirth",
  "school_records",
  "school_records_text",
  "evaluation",
  "therapy_evaluation",
  "therapy_notes",
  "therapynotes",
  "progress_notes",
  "progressNotes",
  "progressnotes",
  "medications",
  "medication",
  "documents",
  "developmental_history",
  "medicalrecords",
  "evaluation_detail",
  "schoolrecords",
]);

export const BLOCKED_KEY_REGEX =
  /(diagnosis|medical_?history|clinical|treatment_plan|progress_note|therapy_eval|evaluation|insurance|date_of_birth|full_?dob|school_record|medicat|documents|developmental_history|phi\b)/i;
