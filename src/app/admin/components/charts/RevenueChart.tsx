// adminPanel/components/charts/RevenueChart.tsx
import { Line } from 'react-chartjs-2';

export const RevenueChart = () => {
  const data = {
    labels: ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze'],
    datasets: [
      {
        label: 'Przychód',
        data: [30000, 35000, 32000, 37500, 39000, 42000],
        borderColor: '#4F46E5',
        tension: 0.4,
      }
    ]
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Przychód miesięczny</h3>
      <Line data={data} options={{ responsive: true }} />
    </div>
  );
};