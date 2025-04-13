import { Suspense } from "react";
import Home from "@/components/pages/Home";
import LoadingScreen from "@/components/loading";

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Home />
    </Suspense>
  );
}
