import CodeSubmitForm from "../components/contest/CodeSubmitForm";
import SubmissionList from "../components/contest/SubmissionList";

export default function Contest() {
  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">🧪 Contest Submission Dashboard</h1>
      <CodeSubmitForm />
      <hr />
      <SubmissionList />
    </div>
  );
}
