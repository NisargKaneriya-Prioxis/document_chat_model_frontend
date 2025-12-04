import Link from "next/link";
 
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Welcome</h1>
      <Link
        href="/chat"
        className="text-blue-500 underline text-xl"
      >
        Go to Chatbot
      </Link>
    </main>
  );
}
 