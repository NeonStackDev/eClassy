'use client'
import { t } from '@/utils';
import { approveOrderApi, deliveryOrderApi, getRequestOrderApi, disputeOrderApi, approveMilestoneApi } from '@/utils/api';
import {
    Modal, Descriptions, Table, Button, Tag, Tooltip, Popconfirm,
    Divider, Space, Typography, message,
} from "antd";
import {
    EyeOutlined, CloseCircleOutlined, CheckCircleOutlined,
    ClockCircleOutlined, RocketOutlined, DownloadOutlined,ExportOutlined 
} from "@ant-design/icons";
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsLoggedIn } from '@/redux/reuducer/authSlice';
import dayjs from "dayjs";


const { Title, Text,Link } = Typography;

const RequestOrder = () => {
    const isLoggedIn = useSelector(getIsLoggedIn);

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(15);
    const [file, setFile] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

    // Fetch Orders
    const fetchOrders = async (page) => {
        try {
            setIsLoading(true);
            const res = await getRequestOrderApi.getOrder({ page });
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





    // Table Actions
    const handleView = (record) => {
        setSelectedOrder(record);
        setIsViewModalOpen(true);
    };
    const handleApprove = async (record) => {
        if (!record) record = selectedOrder;
        console.log(record);
        const response = await approveOrderApi.approveOrder(record.id);
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
    const handleDispute = async (record) => {
        if (!record) record = selectedOrder;
        console.log(record);
        const response = await disputeOrderApi.disputeOrder(record.id);
        if (response.data.data.success) {
            message.success(t("orderDisputed"));
            setData((prev) =>
                prev.map((order) =>
                    order.id === selectedOrder.id
                        ? { ...order, status: "disputed" } // update whatever fields changed
                        : order
                )
            );
        }

        else message.error(t("serverError"));
        setIsViewModalOpen(false);
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
    const handleDelivery = (record) => {
        setSelectedOrder(record);
        setIsDeliveryModalOpen(true);
    }
    const handleSubmit = async (values) => {
        const response = await deliveryOrderApi.deliveryOrder(selectedOrder.id, values.delivery_note, values.delivery_link, file);
        if (response.data.data.success) {
            message.success(t("orderCompleted"));
            setData((prev) =>
                prev.map((order) =>
                    order.id === selectedOrder.id
                        ? { ...order, status: "completed" } // update whatever fields changed
                        : order
                )
            );
            setFile(null);
        }

        setIsDeliveryModalOpen(false);

    }

    // Table Columns
    const columns = [
        {
            title: t("date"), dataIndex: "created_at", key: "created_at", align: "center",
            render: (text) => dayjs(text).format("YYYY-MM-DD HH:mm")
        },
        { title: t("product"), dataIndex: ["item", "name"], key: "item.name", align: "center" },
        { title: t("seller"), dataIndex: ["seller", "name"], key: "seller.name", align: "center" },
        { title: t("paymentMethod"), dataIndex: "payment_method", key: "payment_method", align: "center" },
        {
            title: t("status"), dataIndex: "status", key: "status", align: "center",
            render: (status) => {
                const colorMap = { completed: "green", disputed: "red", refunded: "red", processing: "orange", shipped: "blue", delivered: "blue" };
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
            dataIndex: "amount",
            key: "amount",
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
            <Modal
                title={t("orderDetails")}
                centered
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                width={900}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalOpen(false)}>{t("close")}</Button>,
                    <Button key="approve" disabled={selectedOrder?.status !== "delivered"}
                        type="primary"
                        hidden={selectedOrder?.milestone_type == "multiple"}
                        onClick={() => handleApprove()}>{t("approve")}</Button>,
                    <Button key="dispute" disabled={selectedOrder?.status !== "delivered"} danger onClick={() => handleDispute()}>{t("dispute")}</Button>,
                ]}
            >
                {selectedOrder && (
                    <>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                            <Title level={4}>{t("order")} #{selectedOrder.id}</Title>
                            <Tag
                                icon={
                                    selectedOrder.status === "completed" ? <CheckCircleOutlined /> :
                                        selectedOrder.status === "refunded" ? <CloseCircleOutlined /> :
                                            selectedOrder.status === "processing" ? <ClockCircleOutlined /> :
                                                selectedOrder.status === "shipped" ? <RocketOutlined /> : null
                                }
                                color={
                                    selectedOrder.status === "completed" ? "green" :
                                        selectedOrder.status === "refunded" ? "red" :
                                            selectedOrder.status === "processing" ? "orange" :
                                                selectedOrder.status === "shipped" ? "blue" :
                                                    selectedOrder.status === "delivered" ? "blue" : "default"
                                }
                                style={{ fontWeight: "bold", fontSize: 14, padding: "4px 4px", margin: '30px' }}
                            >
                                {selectedOrder.status.toUpperCase()}
                            </Tag>
                        </div>

                        <Descriptions bordered column={2} size="middle" labelStyle={{ fontWeight: 600 }}>
                            <Descriptions.Item label={t("product")}>{selectedOrder.item?.name || "-"}</Descriptions.Item>
                            <Descriptions.Item label={t("seller")}>{selectedOrder.seller?.name || "-"}</Descriptions.Item>
                            <Descriptions.Item label={t("paymentMethod")}>{selectedOrder.payment_method}</Descriptions.Item>
                            <Descriptions.Item label={t("amount")}>
                                <Text strong style={{ color: "#1677ff" }}>{selectedOrder.amount}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={t("date")}>
                                {dayjs(selectedOrder.created_at).format("YYYY-MM-DD HH:mm")}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("deliveryNote")}>
                                {selectedOrder.delivery_note}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("deliveryLink")}>
                                {selectedOrder?.delivery_link ? (
                                    <Link
                                        href={selectedOrder.delivery_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExportOutlined />
                                    </Link>
                                ) : (
                                    ''
                                )}
                            </Descriptions.Item>

                            <Descriptions.Item label={t("deliveryFile")}>
                                {selectedOrder.delivery_file ? (
                                    <Tooltip title={t("downloadFile")}>
                                        <Button
                                            type="link"
                                            icon={<DownloadOutlined />}
                                            href={selectedOrder.delivery_file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                color: "#1677ff",
                                                fontWeight: 500,
                                                padding: 0,
                                            }}
                                        >
                                            {t("download")}
                                        </Button>
                                    </Tooltip>
                                ) : (
                                    <span style={{ color: "#999" }}>{t("noFileAttached")}</span>
                                )}
                            </Descriptions.Item>

                            <Descriptions.Item label={t("shippingAddress")} span={2}>
                                {selectedOrder.shipping_address || "-"}
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedOrder.milestones?.length > 0 && (
                            <>
                                <Divider />
                                <Title level={5}>{t("milestones")}</Title>
                                <Table
                                    size="small"
                                    pagination={false}
                                    dataSource={selectedOrder.milestones}
                                    columns={milestoneColumns}
                                    rowKey="id"
                                />
                            </>
                        )}
                        <Divider />
                    </>
                )}
            </Modal>

        </>
    );
};

export default RequestOrder;
