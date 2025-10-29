'use client'
import { t } from '@/utils';
import { getOrderApi, acceptOrderApi, rejectOrderApi, deliveryOrderApi, shipOrderApi } from '@/utils/api';
import {
    Modal, Descriptions, Table, Button, Tag, Tooltip, Skeleton,
    Divider, Space, Typography, message, Input, Upload, Form
} from "antd";
import {
    EyeOutlined, CloseCircleOutlined, CheckCircleOutlined,
    ClockCircleOutlined, RocketOutlined, ArrowRightOutlined, UploadOutlined
} from "@ant-design/icons";
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsLoggedIn } from '@/redux/reuducer/authSlice';
import dayjs from "dayjs";
import { width } from '@mui/system';

const { Title, Text } = Typography;

const ReceivedOrder = () => {
    const isLoggedIn = useSelector(getIsLoggedIn);
    const [deliveryForm] = Form.useForm(); // 👈 initialize form instance
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
            const res = await getOrderApi.getOrder({ page });
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

    useEffect(() => {
        if (!selectedOrder || selectedOrder.milestones.length == 0) return;
        const totalAmount = (selectedOrder.milestones || []).reduce(
            (sum, m) => sum + Number(m.amount || 0),
            0
        );
        setSelectedOrder((prev) => ({
            ...prev,
            amount: totalAmount,
        }));
    }, [selectedOrder?.milestones]);

    useEffect(() => {
        if (!selectedOrder) return;
        setData((prevData) =>
            prevData.map((order) =>
                order.id === selectedOrder.id ? selectedOrder : order
            )
        );
    }, [selectedOrder])
    // Update milestone field
    const updateMilestone = (index, key, value) => {
        setSelectedOrder((prev) => {
            const updatedMilestones = [...(prev.milestones || [])];
            updatedMilestones[index] = { ...updatedMilestones[index], [key]: value };
            return { ...prev, milestones: updatedMilestones };
        });
    };
    useEffect(() => {
        if (isViewModalOpen == false) {
            setSelectedOrder(null);
        }
    }, [isViewModalOpen]);

    useEffect(() => {
        if (isDeliveryModalOpen == false) {
            setSelectedOrder(null);
            deliveryForm.resetFields();
        }
    }, [isDeliveryModalOpen]);
    // Table Actions
    const handleView = (record) => {
        setSelectedOrder(record);
        setIsViewModalOpen(true);
    };
    const handleApprove = async (record) => {
        if (!record) record = selectedOrder;
        console.log(record);
        const response = await acceptOrderApi.acceptOrder(record);
        if (response.data.data.success) {
            message.success(t("orderAccepted"));

            setData((prev) =>
                prev.map((order) =>
                    order.id === selectedOrder.id
                        ? { ...order, status: "processing" } // update whatever fields changed
                        : order
                )
            );
        }

        else message.error(t("serverError"));
        setIsViewModalOpen(false);

    };
    const handleReject = async (record) => {
        if (!record) record = selectedOrder;
        console.log(record);
        const response = await rejectOrderApi.rejectOrder(record);
        if (response.data.data.success) {
            message.success(t("orderRejected"));

            setData((prev) =>
                prev.map((order) =>
                    order.id === selectedOrder.id
                        ? { ...order, status: "cancelled" } // update whatever fields changed
                        : order
                )
            );
        }

        else message.error(t("serverError"));
        setIsViewModalOpen(false);
    };
    const handleShip = async (values) => {
        const response = await shipOrderApi.shipOrder(selectedOrder.id, values.courier_name, values.tracking_number);
        if (response.data.data.success) {
            message.success(t("orderShipped"));
            setData((prev) =>
                prev.map((order) =>
                    order.id === selectedOrder.id
                        ? { ...order, status: "shipped" } // update whatever fields changed
                        : order
                )
            );
            setFile(null);
        }

        setIsDeliveryModalOpen(false);
    }
    const handleDelivery = (record) => {
        setSelectedOrder(record);
        setIsDeliveryModalOpen(true);
    }
    const handleSubmit = async (values) => {
        const response = await deliveryOrderApi.deliveryOrder(selectedOrder.id, values.delivery_note, values.courier_name, values.tracking_number, values.delivery_link, file);
        if (response.data.data.success) {
            message.success(t("orderDelivered"));
            setData((prev) =>
                prev.map((order) =>
                    order.id === selectedOrder.id
                        ? { ...order, status: "delivered" } // update whatever fields changed
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
            title: t("datetime"), dataIndex: "created_at", key: "created_at", align: "center",
            render: (text) => dayjs(text).format("YYYY-MM-DD HH:mm")
        },
        { title: t("ProductName"), dataIndex: ["item", "name"], key: "item.name", align: "center" },
        { title: t("BuyerName"), dataIndex: ["buyer", "name"], key: "buyer.name", align: "center" },
        { title: t("PaymentType"), dataIndex: "payment_method", key: "payment_method", align: "center" },
        {
            title: t("status"), dataIndex: "status", key: "status", align: "center",
            render: (status) => {
                const colorMap = { completed: "green", refunded: "red", processing: "orange", shipped: "blue", delivered: "blue" };
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

                    <Tooltip title={t("deliveryOrder")}>
                        <Button type="text" icon={<ArrowRightOutlined />} onClick={() => handleDelivery(record)} />
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
            render: (text, record, index) => (
                <Input
                    value={record.description}
                    placeholder={t("milestoneTitle")}
                    onChange={(e) => updateMilestone(index, "description", e.target.value)}
                />
            ),
        },
        {
            title: t("amount"),
            dataIndex: "amount",
            key: "amount",
            width: 200,
            render: (val, record, index) => (<Input value={val} placeholder={t("amount")} onChange={(e) => { updateMilestone(index, "amount", e.target.value) }} />),
        },

        {
            title: t("status"),
            dataIndex: "status",
            key: "status",
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
                    <Button key="accept" disabled={selectedOrder?.status !== "new"} type="primary" onClick={() => handleApprove()}>{t("accept")}</Button>,
                    <Button key="reject" disabled={selectedOrder?.status !== "new"} danger onClick={() => handleReject()}>{t("reject")}</Button>,
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
                                                selectedOrder.status === "shipped" ? "blue" : "default"
                                }
                                style={{ fontWeight: "bold", fontSize: 14, padding: "4px 4px", margin: '30px' }}
                            >
                                {selectedOrder.status.toUpperCase()}
                            </Tag>
                        </div>

                        <Descriptions bordered column={2} size="middle" labelStyle={{ fontWeight: 600 }}>
                            <Descriptions.Item label={t("product")}>{selectedOrder.item?.name || "-"}</Descriptions.Item>
                            <Descriptions.Item label={t("buyer")}>{selectedOrder.buyer?.name || "-"}</Descriptions.Item>
                            <Descriptions.Item label={t("paymentMethod")}>{selectedOrder?.payment_method}</Descriptions.Item>
                            <Descriptions.Item label={t("amount")}>
                                <Input
                                    value={selectedOrder?.amount}
                                    type="number"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSelectedOrder((prev) => ({
                                            ...prev,
                                            amount: value
                                        }));
                                    }}
                                />
                            </Descriptions.Item>
                            <Descriptions.Item label={t("date")}>
                                {dayjs(selectedOrder?.created_at).format("YYYY-MM-DD HH:mm")}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("shippingAddress")} span={2}>
                                {selectedOrder?.shipping_address || "-"}
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
            {/* Delivery Modal */}
            <Modal
                title={t("orderDetails")}
                centered
                open={isDeliveryModalOpen}
                onCancel={() => setIsDeliveryModalOpen(false)}
                width={900}
                footer={null}
            >
                {selectedOrder && (
                    <>
                        {selectedOrder && selectedOrder.payment_method === "escrow" ? (
                            // Escrow form
                            <Form layout="vertical" onFinish={handleSubmit} form={deliveryForm}>
                                <Form.Item
                                    label={t("deliveryNote")}
                                    name="delivery_note"
                                    rules={[{ required: true, message: t("pleaseEnterDeliveryNote") }]}
                                >
                                    <Input.TextArea rows={4} placeholder={t("deliveryNote")} />
                                </Form.Item>                               

                                <Form.Item
                                    label={t("courierName")}
                                    name="courier_name"
                                    rules={[{ required: true, message: t("pleaseEnterCourierName") }]}
                                >
                                    <Input placeholder={t("courierName")} />
                                </Form.Item>
                                <Form.Item
                                    label={t("trackingNumber")}
                                    name="tracking_number"
                                    rules={[{ required: true, message: t("pleaseEnterTrackingNumber") }]}
                                >
                                    <Input placeholder={t("trackingNumber")} />
                                </Form.Item>

                                <Form.Item label={t("deliveryLink")} name="delivery_link">
                                    <Input type="url" placeholder={t("deliveryLinkOptional")} />
                                </Form.Item>

                                <Form.Item label={t("attachFile")} name="delivery_file">
                                    <Upload
                                        beforeUpload={(file) => {
                                            setFile(file);
                                            return false; // prevent auto upload
                                        }}
                                        maxCount={1}
                                    >
                                        <Button icon={<UploadOutlined />}>{t("uploadFile")}</Button>
                                    </Upload>
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" disabled={selectedOrder?.status !== "processing"}>
                                        {t("submitDelivery")}
                                    </Button>
                                </Form.Item>
                            </Form>
                        ) : (
                            // COD / Non-escrow form
                            <Form layout="vertical" onFinish={handleShip} form={deliveryForm}>
                                <Form.Item
                                    label={t("courierName")}
                                    name="courier_name"
                                    rules={[{ required: true, message: t("pleaseEnterCourierName") }]}
                                >
                                    <Input placeholder={t("courierName")} />
                                </Form.Item>
                                <Form.Item
                                    label={t("trackingNumber")}
                                    name="tracking_number"
                                    rules={[{ required: true, message: t("pleaseEnterTrackingNumber") }]}
                                >
                                    <Input placeholder={t("trackingNumber")} />
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" disabled={selectedOrder?.status !== "processing"}>
                                        {t("markAsShipped")}
                                    </Button>
                                </Form.Item>
                            </Form>
                        )}
                        <Divider />
                    </>
                )}
            </Modal>
        </>
    );
};

export default ReceivedOrder;
