'use client'
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsLoggedIn } from '@/redux/reuducer/authSlice';
import { t } from '@/utils';
import {getDisputeApi} from '@/utils/api';
import { Table, Button, Space, Tooltip, Tag, message, Input, Form, Typography } from "antd";
import { EyeOutlined, } from "@ant-design/icons";
import dayjs from 'dayjs';
import { useRouter } from "next/navigation";


const { Title } = Typography;

const DisputeList = () => {
    const isLoggedIn = useSelector(getIsLoggedIn);
    const router = useRouter();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(15);   
    // Fetch Disputes
    const fetchDisputes = async (page) => {
        try {
            setIsLoading(true);
            const res = await getDisputeApi.getDispute(page);
            if (res?.data?.error === false) {

                console.log(res.data.data.disputes.data);                
                setData(res.data.data.disputes.data);
                setCurrentPage(page);
                setPerPage(res.data.data.per_page);
                setTotalItems(res.data.data.total);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (isLoggedIn) fetchDisputes(currentPage);
    }, [currentPage, isLoggedIn]);  

    const handleViewDispute = async (dispute) => {        
        router.push(`/dispute/${dispute.order_id}`);
    };
  
    // Table Columns
    const columns = [
        { title: t("ProductName"), dataIndex: ["order", "item",'name'], key: "product_name", align: "center" },
        { title: t("OrderNumber"), dataIndex: ["order", "id"], key: "order_id", align: "center",render: (value) => `#${value}`,},
        { title: t("OpposerName"), dataIndex: ["opposer", "name"], key: "opposer_name", align: "center" },        
        {
            title: t("status"), dataIndex: "status", key: "status", align: "center",
            render: status => {
                const colorMap = { resolved: "green", open: "orange", view: "blue"};
                return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
            }
        },
        { title: t("datetime"), dataIndex: "created_at", key: "created_at", align: "center", render: text => dayjs(text).format("YYYY-MM-DD HH:mm") },
        {
            title: t("action"), key: "action", align: "center",
            render: (_, record) => (
                <Space>
                    <Tooltip title={t("viewDetails")}>
                        <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDispute(record)} />
                    </Tooltip>
                </Space>
            )
        }
    ];

    

    return (
        <>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={isLoading}
                pagination={{
                    current: currentPage,
                    pageSize: perPage,
                    total: totalItems,
                    onChange: page => setCurrentPage(page),
                    showSizeChanger: false
                }}
            />   
               
        </>
    );
};

export default DisputeList;