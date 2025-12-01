interface Props {
  icon: string;
  number: number;
  label: string;
}

export default function StatsCard({ icon, number, label }: Props) {
  return (
    <div className="bg-white text-gray-800 w-52 p-6 rounded-xl text-center shadow">
      <div className="text-4xl">{icon}</div>
      <h2 className="text-3xl font-bold mt-2">{number}</h2>
      <p className="text-sm mt-1">{label}</p>
    </div>
  );
}
