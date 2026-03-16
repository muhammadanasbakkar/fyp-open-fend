export default async function TreatmentPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (<div>
      <h1>Treatment Plan for Appointment ID: {id}</h1>
      {/* Additional content related to the treatment plan can be added here */}
    </div>
  );
}