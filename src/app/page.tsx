import { HomeExperience } from "@/components/home-3d/HomeExperience";
import { getHomePageData } from "@/server/home/getHomePageData";

export default async function HomePage() {
  const data = await getHomePageData();

  return <HomeExperience data={data} />;
}
