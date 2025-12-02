'use client'
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsLoggedIn } from '@/redux/reuducer/authSlice';
import { t } from '@/utils';
import {
    getOrderApi, acceptOrderApi, rejectOrderApi,getdisputeFeeApi,payDisputeFeeApi,
    deliveryOrderApi, shipOrderApi, putDisputApi
} from '@/utils/api';
import { Table, Button, Space, Tooltip, Tag, message, Input, Form, Typography } from "antd";
import { EyeOutlined, ArrowRightOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import { useRouter } from "next/navigation";
import OrderDetailsModal from "@/components/Order/OrderDetailsModal";
import DeliveryModal from "@/components/Order/DeliveryModal";
import DisputeModal from "@/components/Order/DisputeModal";

const { Title } = Typography;

const ReceivedOrder = () => {
    const isLoggedIn = useSelector(getIsLoggedIn);
    const router = useRouter();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(15);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [disputeFee, setDisputeFee] = useState(0); // Add state for dispute fee

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

    const [file, setFile] = useState(null);
    const [deliveryForm] = Form.useForm();

    // Fetch Orders
    const fetchOrders = async (page) => {
        try {
            setIsLoading(true);
            const res = await getOrderApi.getOrder(page);
            if (res?.data?.error === false) {
                setData(res.data.data.data);
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
        if (isLoggedIn) fetchOrders(currentPage);
    }, [currentPage, isLoggedIn]);

    // Update milestone totals
    useEffect(() => {
        if (!selectedOrder || !selectedOrder.milestones?.length) return;
        const totalAmount = selectedOrder.milestones.reduce(
            (sum, m) => sum + Number(m.net_amount || 0),
            0
        );
        setSelectedOrder(prev => ({ ...prev, net_amount: totalAmount }));
    }, [selectedOrder?.milestones]);

    // Only reset selectedOrder when ALL modals are closed
    useEffect(() => {
        if (!isViewModalOpen && !isDeliveryModalOpen && !isDisputeModalOpen) {
            setSelectedOrder(null);
            setDisputeFee(0);
            deliveryForm.resetFields();
            setFile(null);
        }
    }, [isViewModalOpen, isDeliveryModalOpen, isDisputeModalOpen]);

    // Table Actions
    const handleView = (order) => {
        setSelectedOrder(order);
        setIsViewModalOpen(true);
    };

    const handleApprove = async () => {
        const response = await acceptOrderApi.acceptOrder(selectedOrder);
        if (response.data.data.success) {
            message.success(t("orderAccepted"));
            setData(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: "processing" } : o));
        } else message.error(t("serverError"));
        setIsViewModalOpen(false);
    };

    const handleDispute = async (order) => {
        setSelectedOrder(order);
        console.log("order",order);
        const response = await getdisputeFeeApi.getdisputeFee(selectedOrder.id);
        console.log(response.data.data.success);
        
        if (response.data.data.success) {
            setDisputeFee(response.data.data.fee || 500);
        } else{
            setDisputeFee(500); // Fallback
        } 
        setIsViewModalOpen(false);
        setIsDisputeModalOpen(true);
    };

    const handleViewDispute = async (order) => {
        console.log(order);
        router.push(`/dispute/${order.id}`);
    };

    const handlePayFee = async (method, fee) => {
        console.log("Pay fee:", method, fee);
        // TODO: Implement actual payment logic here
        // Example: Call payment API
        const response = await payDisputeFeeApi.pay({
            orderId: selectedOrder.id,
            paymentMethod: method,
            amount: fee
        });
        return response.data.success;

        
    };

    const handleSubmitDispute = async (data) => {
        try {
            const response = await putDisputApi.putDisput({
                orderId: data.orderId,
                paymentMethod: data.paymentMethod,
                description: data.description,
                issue: data.issue,
                proof: data.proof,
            });

            if (response.data.data.success) {
                message.success(t("disputeSubmittedSuccessfully"));
                await fetchOrders(currentPage);
            } else {
                message.error(t("serverError"));
            }
        } catch (error) {
            console.error("Dispute submission error:", error);
            message.error(t("serverError"));
        }
        setIsDisputeModalOpen(false);
    };

    const handleReject = async () => {
        const response = await rejectOrderApi.rejectOrder(selectedOrder);
        if (response.data.data.success) {
            message.success(t("orderRejected"));
            setData(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: "cancelled" } : o));
        } else message.error(t("serverError"));
        setIsViewModalOpen(false);
    };

    const handleDelivery = (order) => {
        setSelectedOrder(order);
        setIsDeliveryModalOpen(true);
    };

    const handleCODShip = async (values) => {
        const response = await shipOrderApi.shipOrder(selectedOrder.id, values.courier_name, values.tracking_number);
        if (response.data.data.success) {
            message.success(t("orderShipped"));
            setData(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: "shipped" } : o));
        }
        setIsDeliveryModalOpen(false);
        setFile(null);
    };

    const handleEscrowSubmit = async (values) => {
        const response = await deliveryOrderApi.deliveryOrder(
            selectedOrder.id,
            values.delivery_note,
            values.courier_name,
            values.tracking_number,
            values.delivery_link,
            values.delivery_file,
        );
        if (response.data.data.success) {
            message.success(t("orderDelivered"));
            setData(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: "delivered" } : o));
        }
        setIsDeliveryModalOpen(false);
        setFile(null);
    };

    // Table Columns
    const columns = [
        { title: t("datetime"), dataIndex: "created_at", key: "created_at", align: "center", render: text => dayjs(text).format("YYYY-MM-DD HH:mm") },
        { title: t("ProductName"), dataIndex: ["item", "name"], key: "item.name", align: "center" },
        { title: t("BuyerName"), dataIndex: ["buyer", "name"], key: "buyer.name", align: "center" },
        { title: t("PaymentType"), dataIndex: "payment_method", key: "payment_method", align: "center" },
        {
            title: t("status"), dataIndex: "status", key: "status", align: "center",
            render: status => {
                const colorMap = { completed: "green", disputed: "red", disputing: "violet", refunded: "red", processing: "orange", shipped: "blue", delivered: "blue" };
                return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
            }
        },
        {
            title: t("action"), key: "action", align: "center",
            render: (_, record) => (
                <Space>
                    <Tooltip title={t("viewDetails")}>
                        <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
                    </Tooltip>
                    <Tooltip title={t("deliveryOrder")}>
                        <Button type="text" icon={<ArrowRightOutlined />} onClick={() => handleDelivery(record)} />
                    </Tooltip>
                </Space>
            )
        }
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
                    onChange={e => {
                        const value = e.target.value;
                        setSelectedOrder(prev => {
                            const updatedMilestones = [...(prev.milestones || [])];
                            updatedMilestones[index] = { ...updatedMilestones[index], description: value };
                            return { ...prev, milestones: updatedMilestones };
                        });
                    }}
                />
            )
        },
        {
            title: t("amount"),
            dataIndex: "net_amount",
            key: "net_amount",
            render: (val, record, index) => (
                <Input
                    value={val}
                    placeholder={t("amount")}
                    onChange={e => {
                        const value = e.target.value;
                        setSelectedOrder(prev => {
                            const updatedMilestones = [...(prev.milestones || [])];
                            updatedMilestones[index] = { ...updatedMilestones[index], net_amount: value };
                            return { ...prev, milestones: updatedMilestones };
                        });
                    }}
                />
            )
        },
        { title: t("status"), dataIndex: "status", key: "status" }
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

            {/* Modals */}
            <OrderDetailsModal
                visible={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                selectedOrder={selectedOrder}
                handleApprove={handleApprove}
                handleDispute={() => handleDispute(selectedOrder)}
                handleViewDispute={() => handleViewDispute(selectedOrder)}
                handleReject={handleReject}
                milestoneColumns={milestoneColumns}
                t={t}
            />

            <DeliveryModal
                visible={isDeliveryModalOpen}
                onClose={() => setIsDeliveryModalOpen(false)}
                selectedOrder={selectedOrder}
                onHandleSubmit={handleEscrowSubmit}
                handleShip={handleCODShip}
                t={t}
            />

            <DisputeModal
                visible={isDisputeModalOpen}
                onClose={() => setIsDisputeModalOpen(false)}
                selectedOrder={selectedOrder}
                disputeFee={disputeFee}  // Now passed from state
                onPayFee={handlePayFee}
                onSubmitDispute={handleSubmitDispute}
                t={t}
            />
        </>
    );
};

export default ReceivedOrder;