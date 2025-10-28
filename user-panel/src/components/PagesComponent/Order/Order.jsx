'use client'
import BreadcrumbComponent from "@/components/Breadcrumb/BreadcrumbComponent"
import ProfileSidebar from "@/components/Profile/ProfileSidebar"
import ReceivedOrder from "@/components/Profile/ReceivedOrder"
import RequestOrder from "@/components/Profile/RequestOrder"

import { t } from "@/utils"
import { useState } from "react"
import { Tabs, Typography } from "antd"

const { TabPane } = Tabs
const { Text } = Typography

const Order = () => {
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("1")

    if (loading) return <p>Loading order...</p>

    return (
        <>
            <BreadcrumbComponent title2={t('order')} />
            <div className="container">
                <div className="row my_prop_title_spacing">
                    <h4 className="pop_cat_head">{t('myOrder')}</h4>
                </div>

                <div className="row profile_sidebar">
                    <ProfileSidebar />

                    <div className="col-lg-9 p-0">
                        <div className="notif_cont">
                            <Tabs
                                activeKey={activeTab}
                                onChange={(key) => setActiveTab(key)}
                                type="card"
                            >
                                <TabPane tab={t('ReceivedOrder')} key="1">
                                    <ReceivedOrder />
                                </TabPane>

                                <TabPane tab={t('RequestOrder')} key="2">
                                    <RequestOrder />
                                </TabPane>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Order
