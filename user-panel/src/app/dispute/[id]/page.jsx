import Layout from '@/components/Layout/Layout'
import DisputeContents from '@/components/Dispute/DisputeContents'


export const metadata = {
    title: process.env.NEXT_PUBLIC_META_TITLE,
    description: process.env.NEXT_PUBLIC_META_DESCRIPTION,
    keywords: process.env.NEXT_PUBLIC_META_kEYWORDS,
    openGraph: {
        title: process.env.NEXT_PUBLIC_META_TITLE,
        description: process.env.NEXT_PUBLIC_META_DESCRIPTION,
        keywords: process.env.NEXT_PUBLIC_META_kEYWORDS,
    },
}
const DisputeDetailPage = () => {
    return (
        <Layout>
            <DisputeContents/>
        </Layout>
    )
}

export default DisputeDetailPage