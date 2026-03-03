import { PatientForm } from "./PatientForm";

export default function NewPatientPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">患者を登録</h1>
      <PatientForm />
    </div>
  );
}
