'use client'
import BreadcrumbComponent from "@/components/Breadcrumb/BreadcrumbComponent"
import ProfileSidebar from "@/components/Profile/ProfileSidebar"
import DisputeList from "@/components/Dispute/DisputeList"


import { t } from "@/utils"
import { useState } from "react"
import { Tabs, Typography } from "antd"

const { TabPane } = Tabs
const { Text } = Typography

const Dispute = () => {
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("1")

    if (loading) return <p>Loading dispute...</p>

    return (
        <>
            <BreadcrumbComponent title2={t('dispute')} />
            <div className="container">
                <div className="row my_prop_title_spacing">
                    <h4 className="pop_cat_head">{t('myOrder')}</h4>
                </div>

                <div className="row profile_sidebar">
                    <ProfileSidebar />
                    <div className="col-lg-9 p-0">
                         <DisputeList />
                    </div>

                </div>
            </div>
        </>
    )
}

export default Dispute
