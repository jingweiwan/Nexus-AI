import { Chart } from '@/app/ui/dashboard/chart';

async function fetchDashboardData() {
  // 可以直接使用 fetch，Next.js 会自动处理缓存
  try {
    const res = await fetch('https://api.example.com/dashboard', {
      // 可选：控制缓存行为
      cache: 'no-store', // 或使用 next: { revalidate: 60 } 进行增量静态再生成
    });

    return res.json();
  } catch (error) {
    console.error('获取数据失败', error);
  }
}

export default async function Page() {
  // 在服务器组件中可以直接使用 async/await
  // const data = await fetchDashboardData();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="">
        <Chart />
      </div>
    </div>
  );
}