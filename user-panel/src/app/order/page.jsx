import Layout from '@/components/Layout/Layout'
import Order from '@/components/PagesComponent/Order/Order'


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
const OrderPage = () => {
    return (
        <Layout>
                <Order/>
        </Layout>
    )
}

export default OrderPage