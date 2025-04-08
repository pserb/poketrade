import Layout from "@/components/Layout"
import AuthenticatedContent from "@/components/AuthenticatedContent"

export default function Home() {
  return (
    <Layout>
      <AuthenticatedContent />
    </Layout>
  )
}