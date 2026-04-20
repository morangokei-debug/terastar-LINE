import { PatientForm } from "./PatientForm";

export default function NewPatientPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">患者を登録</h1>
      <PatientForm />
    </div>
  );
}
