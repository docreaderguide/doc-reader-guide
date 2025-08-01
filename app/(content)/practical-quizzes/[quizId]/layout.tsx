import Layout from "@/components/Layout";

export default function LinksPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Layout title="Practical" updateable>
      {children}
    </Layout>
  );
}
