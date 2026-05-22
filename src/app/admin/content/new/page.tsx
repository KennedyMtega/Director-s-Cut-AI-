import { Header } from '@/components/admin/Header'
import { ContentGenerateForm } from '@/components/admin/ContentGenerateForm'

export default function NewContentPage() {
  return (
    <div>
      <Header
        title="Generate Content"
        description="AI will create a text overlay and caption based on your inspiration board"
      />
      <ContentGenerateForm />
    </div>
  )
}
