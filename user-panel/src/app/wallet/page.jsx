import Layout from '@/components/Layout/Layout'
import Wallet from '@/components/PagesComponent/Wallet/Wallet'


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
const WalletPage = () => {
    return (
        <Layout>
            <Wallet />
        </Layout>
    )
}

export default WalletPage