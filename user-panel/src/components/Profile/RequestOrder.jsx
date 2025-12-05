'use client'
import { t } from '@/utils';
import { approveOrderApi, deliveryOrderApi, getRequestOrderApi, putDisputApi, approveMilestoneApi } from '@/utils/api';
import {
    Modal, Descriptions, Table, Button, Tag, Tooltip, Popconfirm,
    Divider, Space, Typography, message,
} from "antd";
import {
    EyeOutlined, CheckCircleOutlined
} from "@ant-design/icons";
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsLoggedIn } from '@/redux/reuducer/authSlice';
import dayjs from "dayjs";
import OrderRelease from "@/components/Order/OrderRelease";
import DisputeModal from "@/components/Order/DisputeModal";
import { useRouter } from "next/navigation";
const { Title, Text, Link } = Typography;

const RequestOrder = () => {
    const isLoggedIn = useSelector(getIsLoggedIn);
    const router = useRouter();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(15);
    const [file, setFile] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

    // Fetch Orders
    const fetchOrders = async (page) => {
        try {
            setIsLoading(true);
            const res = await getRequestOrderApi.getOrder(page);
            if (res?.data?.error === false) {
                setData(res?.data?.data?.data);
                setCurrentPage(res?.data?.data?.current_page);
                setPerPage(res?.data?.data?.per_page);
                setTotalItems(res?.data?.data?.total);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isLoggedIn) fetchOrders(currentPage);
    }, [currentPage, isLoggedIn]);


    const handleViewDispute = async (order) => {
        console.log(order);
        router.push(`/dispute/${order.id}`);
    };


    // Table Actions
    const handleView = (record) => {
        setSelectedOrder(record);
        console.log(record);

        setIsViewModalOpen(true);
    };
    const handleApprove = async () => {        
        const response = await approveOrderApi.approveOrder(selectedOrder.id);
        if (response.data.data.success) {
            message.success(t("orderApproved"));
            setData((prev) =>
                prev.map((order) =>
                    order.id === selectedOrder.id
                        ? { ...order, status: "completed" } // update whatever fields changed
                        : order
                )
            );
        }
        else message.error(t("serverError"));
        setIsViewModalOpen(false);

    };
    const handleDispute = async (order) => {
        //setSelectedOrder(order);          // make sure order is set
        setIsViewModalOpen(false);        // close view modal
        setIsDisputeModalOpen(true);      // open dispute modal
    };
    const handleSubmitDispute = async (data) => {
        console.log("Submit dispute:", data);
        const response = await putDisputApi.putDisput({
            orderId: selectedOrder.id,
            paymentMethod: data.paymentMethod,
            description: data.description,
            issue: data.issue,
            proof: data.proof,
        });
        if (response.data.data.success) {
            message.success(t("disputeSubmittedSuccessfully"));
            await fetchOrders(currentPage);
        } else message.error(t("serverError"));
        setIsDisputeModalOpen(false);
    };
    const handleApproveMilestone = async (record) => {
        if (!record) record = selectedOrder;
        console.log(record);
        const response = await approveMilestoneApi.approveMilestone(record.id);
        if (response.data.data.success) {
            message.success(t("orderApproved"));
            await fetchOrders(currentPage);
        }
        else message.error(t("serverError"));
        setIsViewModalOpen(false);

    }
   

    // Table Columns
    const columns = [
        {
            title: t("datetime"), dataIndex: "created_at", key: "created_at", align: "center",
            render: (text) => dayjs(text).format("YYYY-MM-DD HH:mm")
        },
        { title: t("ProductName"), dataIndex: ["item", "name"], key: "item.name", align: "center" },
        { title: t("SellerName"), dataIndex: ["seller", "name"], key: "seller.name", align: "center" },
        { title: t("PaymentType"), dataIndex: "payment_method", key: "payment_method", align: "center" },
        {
            title: t("status"), dataIndex: "status", key: "status", align: "center",
            render: (status) => {
                const colorMap = { completed: "green", disputed: "red", refunded: "red", disputing: "violet", processing: "orange", shipped: "blue", delivered: "blue" };
                return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
            }
        },
        {
            title: t("action"),
            key: "action",
            align: "center",
            render: (_, record) => (
                <Space>
                    <Tooltip title={t("viewDetails")}>
                        <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const milestoneColumns = [
        {
            title: t("milestoneTitle"),
            dataIndex: "description",
            key: "description",
        },
        {
            title: t("amount"),
            dataIndex: "net_amount",
            key: "net_amount",
            render: (val) => `${val}`,
        },
        {
            title: t("status"),
            dataIndex: "status",
            key: "status",
            render: (text) => {
                const color =
                    text === "completed"
                        ? "green"
                        : text === "pending"
                            ? "orange"
                            : text === "disputed"
                                ? "red"
                                : "gray";
                return <span style={{ color, fontWeight: 600 }}>{text.toUpperCase()}</span>;
            },
        },
        {
            title: t("action"),
            key: "action",
            align: "center",
            render: (_, record) => (
                record.status !== "completed" && (
                    <Tooltip title={t("approveMilestone")}>
                        <Popconfirm
                            title={t("confirmApproveMilestone")}
                            description={t("areYouSureApprove")}
                            okText={t("yes")}
                            cancelText={t("no")}
                            onConfirm={() => handleApproveMilestone(record)}
                        >
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                shape="round"
                                size="small"
                                hidden={record?.status !== "delivered"}
                                style={{
                                    background: "linear-gradient(90deg, #52c41a, #73d13d)",
                                    border: "none",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                }}
                            >
                                {t("approve")}
                            </Button>
                        </Popconfirm>
                    </Tooltip>
                )
            ),
        },
    ];

    return (
        <>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                expandable={{
                    expandedRowRender: (record) =>
                        record.milestones && record.milestones.length > 0 ? (
                            <Table
                                columns={milestoneColumns}
                                dataSource={record.milestones}
                                pagination={false}
                                rowKey="id"
                            />
                        ) : <i>{t("noMilestones")}</i>,
                    rowExpandable: (record) => record.milestones?.length > 0,
                }}
                pagination={{
                    current: currentPage,
                    pageSize: perPage,
                    total: totalItems,
                    showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total}`,
                    onChange: (page) => setCurrentPage(page),
                    showSizeChanger: false,
                }}
            />

            {/* View Modal */}
            <OrderRelease
                visible={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                selectedOrder={selectedOrder}
                handleApprove={handleApprove}
                handleDispute={handleDispute}
                handleViewDispute={() => handleViewDispute(selectedOrder)}
                milestoneColumns={milestoneColumns}
                t={t}
            />

            <DisputeModal
                visible={isDisputeModalOpen}
                onClose={() => setIsDisputeModalOpen(false)}
                selectedOrder={selectedOrder}
                disputeFee={selectedOrder?.disputeFee || 0}
               
                onSubmitDispute={handleSubmitDispute}
                t={t}
            />


        </>
    );
};

export default RequestOrder;
